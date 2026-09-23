import { getDb } from './db.js';
import { ObjectId } from 'mongodb';
import { registrarMovimiento, MOVIMIENTO_TIPOS } from './movimientos.js';

// La app trabaja exclusivamente bajo RESICO con ventas propias (POS, local y
// delivery propio). Toda venta registrada pertenece al negocio, así que el
// filtro base es simplemente el usuario y, opcionalmente, un rango de fechas.
export function crearFiltroVentasDirectas(userId, rangoFecha = {}) {
	return {
		userId,
		...rangoFecha
	};
}

export async function crearVenta(userId, datos) {
	const db = await getDb();

	const monto = Number(datos.amount ?? 0);
	const iva = Number(datos.iva ?? Math.round(monto * 0.16));
	const total = monto + iva;

	const venta = {
		userId,
		// Se ancla a mediodía local (igual que los gastos) para que 'YYYY-MM-DD' no
		// se interprete como medianoche UTC y se recorra al día/mes anterior.
		fecha: datos.date ? new Date(`${datos.date}T12:00:00`) : new Date(),
		metodoPago: datos.paymentMethod,
		monto,
		iva,
		total,
		creadoEn: new Date()
	};

	const resultado = await db.collection('ventas').insertOne(venta);
	await registrarMovimiento({
		userId,
		orderId: datos.orderId ?? null,
		tipo: MOVIMIENTO_TIPOS.COBRO,
		amount: monto,
		iva,
		paymentMethod: datos.paymentMethod ?? 'cash',
		metadata: { source: 'direct-sale', saleId: resultado.insertedId.toString() },
		source: 'direct-sale'
	});
	return resultado.insertedId;
}

export async function registrarVentaDesdePedido(userId, pedido) {
	const db = await getDb();
	const orderId = pedido?._id?.toString?.() ?? pedido?.orderId ?? null;
	const subtotal = Number(
		pedido?.subtotal !== undefined
			? Math.max(pedido.subtotal - (pedido.discount ?? 0), 0)
			: pedido?.totalPrice
				? Math.round(pedido.totalPrice / 1.16)
				: (pedido?.monto ?? 0)
	);
	const iva = Number(pedido?.iva ?? Math.round(subtotal * 0.16));
	const total = Number(pedido?.totalPrice ?? subtotal + iva);
	const fecha = pedido?.createdAt ?? pedido?.fecha ?? new Date();

	if (!orderId) {
		return null;
	}

	const yaExiste = await db.collection('ventas').findOne({ userId, orderId });
	if (yaExiste) {
		return yaExiste._id;
	}

	const venta = {
		userId,
		sellerId: pedido?.sellerId ?? userId,
		orderId,
		fecha: new Date(fecha),
		metodoPago: pedido?.paymentMethod ?? 'cash',
		monto: subtotal,
		iva,
		total,
		creadoEn: new Date(),
		tipo: 'POS',
		source: 'order'
	};

	const resultado = await db.collection('ventas').insertOne(venta);
	await registrarMovimiento({
		userId,
		orderId,
		tipo: MOVIMIENTO_TIPOS.COBRO,
		amount: subtotal,
		iva,
		paymentMethod: venta.metodoPago,
		metadata: { source: 'order-sale', saleId: resultado.insertedId.toString() },
		source: 'order'
	});
	return resultado.insertedId;
}

export async function listarVentas(userId) {
	const db = await getDb();
	const ventas = await db
		.collection('ventas')
		.find(crearFiltroVentasDirectas(userId))
		.sort({ fecha: -1 })
		.toArray();

	return ventas.map((v) => ({
		...v,
		_id: v._id.toString(),
		metodoPago: v.metodoPago ?? 'Sin especificar',
		fecha: v.fecha.toISOString().slice(0, 10)
	}));
}

export async function eliminarVenta(userId, ventaId) {
	const db = await getDb();
	await db.collection('ventas').deleteOne({
		_id: new ObjectId(ventaId),
		userId
	});
}

// Resumen anual de ventas propias. Todo lo vendido suma al ingreso para RESICO.
export async function resumenVentas(userId, anio) {
	const db = await getDb();

	const inicio = new Date(`${anio}-01-01`);
	const fin = new Date(`${anio + 1}-01-01`);

	const [resultado] = await db
		.collection('ventas')
		.aggregate([
			{ $match: crearFiltroVentasDirectas(userId, { fecha: { $gte: inicio, $lt: fin } }) },
			{
				$group: {
					_id: null,
					total: { $sum: '$monto' },
					iva: { $sum: '$iva' },
					cantidad: { $sum: 1 }
				}
			}
		])
		.toArray();

	return resultado
		? { total: resultado.total, iva: resultado.iva, cantidad: resultado.cantidad }
		: { total: 0, iva: 0, cantidad: 0 };
}

export async function crearIndices() {
	const db = await getDb();
	await db.collection('ventas').createIndex({ userId: 1, fecha: -1 });
}
