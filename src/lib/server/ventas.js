import { getDb } from './db.js';
import { ObjectId } from 'mongodb';

export async function crearVenta(userId, datos) {
	const db = await getDb();

	const monto = Number(datos.amount);
	// si el usuario no captura el IVA a mano, se asume la tasa general (16%)
	// sobre el monto — mismo comportamiento que ya tenías en el cliente
	const iva = datos.iva ? Number(datos.iva) : monto * 0.16;

	const venta = {
		userId,
		fecha: new Date(datos.date),
		canal: datos.channel,
		monto,
		iva,
		creadoEn: new Date()
	};

	const resultado = await db.collection('ventas').insertOne(venta);
	return resultado.insertedId;
}

export async function listarVentas(userId) {
	const db = await getDb();
	const ventas = await db.collection('ventas').find({ userId }).sort({ fecha: -1 }).toArray();

	return ventas.map((v) => ({
		...v,
		_id: v._id.toString(),
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
			{ $match: { userId, fecha: { $gte: inicio, $lt: fin } } },
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
