import { getDb } from './db.js';
import { ObjectId } from 'mongodb';
import { parsearCfdi } from './cfdi.js';
import { parseMoneyToCents } from './money.js';

export async function crearGastoManual(userId, datos) {
	const db = await getDb();
	const totalCents = parseMoneyToCents(datos.total, { field: 'Monto del gasto', min: 0.01 });
	const concepto = String(datos.concepto ?? '').trim();
	if (!concepto) {
		throw new Error('El concepto o descripción del gasto es obligatorio.');
	}

	const categoria = String(datos.categoria ?? 'Insumos').trim();
	const proveedor = String(datos.proveedor ?? 'Compra local / Efectivo').trim();
	const metodoPago = String(datos.metodoPago ?? 'cash').trim();
	const fecha = datos.fecha ? new Date(datos.fecha + 'T12:00:00') : new Date();

	const gasto = {
		userId,
		tipo: 'gasto_manual',
		tieneCfdi: false,
		fecha,
		subtotal: totalCents,
		total: totalCents,
		iva: 0, // No es acreditable para el SAT al no tener CFDI
		categoria,
		nombreEmisor: proveedor,
		conceptos: [concepto],
		metodoPago,
		creadoEn: new Date()
	};

	const resultado = await db.collection('facturas').insertOne(gasto);
	return resultado.insertedId;
}

export async function crearFacturaDesdeXml(userId, rfcNegocio, xmlTexto) {
	const db = await getDb();
	const datos = parsearCfdi(xmlTexto);

	// esta ruta solo recibe CFDI de gastos (insumos, proveedores) — las ventas
	// entran por /ventas, nunca subiendo un CFDI propio. Por eso no se infiere
	// tipo: siempre es gasto. Lo que sí se valida es que el Receptor seas tú,
	// como candado contra subir por error el CFDI de otro negocio
	if (datos.rfcReceptor !== rfcNegocio) {
		throw new Error('Este CFDI no fue emitido a tu RFC');
	}

	const factura = {
		userId,
		tipo: 'gasto',
		tieneCfdi: true,
		categoria: 'Factura CFDI',
		uuid: datos.uuid,
		fecha: new Date(datos.fecha),
		subtotal: datos.subtotal,
		total: datos.total,
		iva: datos.iva,
		rfcEmisor: datos.rfcEmisor,
		nombreEmisor: datos.nombreEmisor,
		rfcReceptor: datos.rfcReceptor,
		conceptos: datos.conceptos,
		xmlOriginal: xmlTexto, // guardar el XML crudo: es tu respaldo ante el SAT si algo no cuadra
		creadoEn: new Date()
	};

	try {
		const resultado = await db.collection('facturas').insertOne(factura);
		return resultado.insertedId;
	} catch (err) {
		// error 11000 = choque con el índice único de uuid → ya se había subido este mismo CFDI antes
		if (err.code === 11000) {
			throw new Error(`Esta factura (UUID ${datos.uuid}) ya fue subida antes`, { cause: err });
		}
		throw err;
	}
}

export async function listarFacturas(userId) {
	const db = await getDb();
	const facturas = await db.collection('facturas').find({ userId }).sort({ fecha: -1 }).toArray();

	return facturas.map((f) => ({
		...f,
		_id: f._id.toString(),
		fecha: f.fecha ? f.fecha.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
		tieneCfdi: f.tieneCfdi !== false && f.tipo !== 'gasto_manual',
		categoria: f.categoria ?? (f.tipo === 'gasto_manual' ? 'Insumos' : 'Factura CFDI'),
		xmlOriginal: undefined // no hace falta mandar el XML completo de vuelta al listado
	}));
}

export async function eliminarFactura(userId, facturaId) {
	const db = await getDb();
	await db.collection('facturas').deleteOne({
		_id: new ObjectId(facturaId),
		userId
	});
}

// Ejecutar una sola vez (script de setup, no en cada request) para que Mongo
// rechace por sí mismo un uuid repetido, en vez de depender solo del try/catch de arriba
export async function crearIndices() {
	const db = await getDb();
	await db.collection('facturas').createIndex({ uuid: 1 }, { unique: true, sparse: true });
	await db.collection('facturas').createIndex({ userId: 1, fecha: -1 });
}
