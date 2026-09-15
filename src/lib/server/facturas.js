import { getDb } from './db.js';
import { ObjectId } from 'mongodb';
import { parsearCfdi } from './cfdi.js';

export async function crearFacturaDesdeXml(userId, rfcNegocio, xmlTexto) {
	const db = await getDb();
	const datos = parsearCfdi(xmlTexto);

	// el RFC del negocio contra Emisor/Receptor te dice si es ingreso o gasto,
	// sin que el usuario tenga que elegirlo a mano
	let tipo;
	if (datos.rfcReceptor === rfcNegocio) {
		tipo = 'gasto'; // tú lo recibiste, es algo que compraste
	} else if (datos.rfcEmisor === rfcNegocio) {
		tipo = 'ingreso'; // tú lo emitiste, es algo que vendiste
	} else {
		throw new Error('Este CFDI no corresponde al RFC de tu negocio');
	}

	const factura = {
		userId,
		tipo,
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
		fecha: f.fecha.toISOString().slice(0, 10),
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

export async function resumenFiscal(userId, anio) {
	const db = await getDb();

	const inicio = new Date(`${anio}-01-01`);
	const fin = new Date(`${anio + 1}-01-01`);

	const resultado = await db
		.collection('facturas')
		.aggregate([
			{ $match: { userId, fecha: { $gte: inicio, $lt: fin } } },
			{
				$group: {
					_id: '$tipo',
					total: { $sum: '$total' },
					iva: { $sum: '$iva' },
					cantidad: { $sum: 1 }
				}
			}
		])
		.toArray();

	const ingresos = resultado.find((r) => r._id === 'ingreso') || { total: 0, iva: 0, cantidad: 0 };
	const gastos = resultado.find((r) => r._id === 'gasto') || { total: 0, iva: 0, cantidad: 0 };

	const utilidad = ingresos.total - gastos.total;
	const ivaTrasladado = ingresos.iva;
	const ivaAcreditable = gastos.iva;
	const ivaAPagar = Math.max(ivaTrasladado - ivaAcreditable, 0);

	return {
		ingresos: ingresos.total,
		gastos: gastos.total,
		utilidad,
		ivaTrasladado,
		ivaAcreditable,
		ivaAPagar,
		numFacturas: ingresos.cantidad + gastos.cantidad
	};
}

// Ejecutar una sola vez (script de setup, no en cada request) para que Mongo
// rechace por sí mismo un uuid repetido, en vez de depender solo del try/catch de arriba
export async function crearIndices() {
	const db = await getDb();
	await db.collection('facturas').createIndex({ uuid: 1 }, { unique: true });
	await db.collection('facturas').createIndex({ userId: 1, fecha: -1 });
}
