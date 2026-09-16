import { getDb } from './db.js';

export async function guardarReportePlataforma(userId, datos, nombreArchivo) {
	const db = await getDb();

	const reporte = {
		userId,
		plataforma: datos.plataforma ?? 'Desconocida',
		periodo: datos.periodo ?? null,
		periodoAnio: Number(datos.periodo_anio) || null,
		periodoMes: Number(datos.periodo_mes) || null, // 1-12
		ventasBrutas: Number(datos.ventas_brutas) || 0,
		comisiones: Number(datos.comisiones_plataforma) || 0,
		ivaRetenido: Number(datos.iva_retenido) || 0,
		isrRetenido: Number(datos.isr_retenido) || 0,
		gananciaNeta: Number(datos.ganancia_neta) || 0,
		nombreArchivo,
		creadoEn: new Date()
	};

	const resultado = await db.collection('reportesPlataforma').insertOne(reporte);
	return resultado.insertedId;
}

export async function listarReportesPlataforma(userId) {
	const db = await getDb();
	const reportes = await db
		.collection('reportesPlataforma')
		.find({ userId })
		.sort({ creadoEn: -1 })
		.toArray();

	return reportes.map((r) => ({ ...r, _id: r._id.toString() }));
}
