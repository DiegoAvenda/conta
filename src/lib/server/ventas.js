import { getDb } from './db.js';
import { ObjectId } from 'mongodb';
import { registrarMovimiento, MOVIMIENTO_TIPOS } from './movimientos.js';

const CANALES_DIRECTOS_LEGADOS = ['Local', 'Transferencia', 'Efectivo', 'Terminal', 'Otro'];

// Los registros nuevos usan metodoPago. Los registros antiguos conservan canal,
// por lo que solo se incluyen los valores que correspondían a ventas directas.
// Así, datos históricos de plataformas permanecen almacenados pero no contaminan
// los cierres del MVP directo.
export function crearFiltroVentasDirectas(userId, rangoFecha = {}) {
	return {
		userId,
		...rangoFecha,
		$or: [{ metodoPago: { $exists: true } }, { canal: { $in: CANALES_DIRECTOS_LEGADOS } }]
	};
}

export async function crearVenta(userId, datos) {
	const db = await getDb();

	const monto = Number(datos.amount ?? 0);
	const iva = Number(datos.iva ?? monto * 0.16);

	const venta = {
		userId,
		fecha: new Date(datos.date),
		metodoPago: datos.paymentMethod,
		monto,
		iva,
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
	const monto = Number(pedido?.totalPrice ?? pedido?.subtotal ?? pedido?.monto ?? 0);
	const iva = Number(pedido?.iva ?? monto * 0.16);
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
		monto,
		iva,
		creadoEn: new Date(),
		tipo: 'POS',
		source: 'order'
	};

	const resultado = await db.collection('ventas').insertOne(venta);
	await registrarMovimiento({
		userId,
		orderId,
		tipo: MOVIMIENTO_TIPOS.COBRO,
		amount: monto,
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
		// Conserva legibles los registros creados antes del cambio de "canal" a
		// "método de cobro", sin volver a incluir canales de plataformas en el MVP.
		metodoPago: v.metodoPago ?? v.canal ?? 'Sin especificar',
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

// NOTA: a diferencia de gastos sin CFDI (que se excluyen del cálculo de impuestos
// porque no son deducibles), estas ventas SÍ deben sumarse al ingreso total —
// el SAT cobra sobre todo lo que vendes, tengas o no factura de por medio.
// Falta decidir cómo se combina esto con resumenFiscal() de facturas.js
// (dos colecciones distintas alimentando un mismo total de ingresos).
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
