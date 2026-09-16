import { getDb } from './db.js';

function normalizarImporte(valor) {
	if (valor === null || valor === undefined || valor === '') return null;
	if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
	if (typeof valor !== 'string') return null;

	const numero = Number(valor.replace(/[$,\s]/g, ''));
	return Number.isFinite(numero) ? numero : null;
}

export async function guardarReportePlataforma(userId, datos, nombreArchivo) {
	const db = await getDb();
	const periodoAnio = Number(datos.periodo_anio);
	const periodoMes = Number(datos.periodo_mes);
	const ventasBrutas = normalizarImporte(datos.ventas_brutas);

	if (
		!Number.isInteger(periodoAnio) ||
		!Number.isInteger(periodoMes) ||
		periodoMes < 1 ||
		periodoMes > 12 ||
		ventasBrutas === null ||
		ventasBrutas < 0
	) {
		const error = new Error('El reporte no contiene un periodo válido.');
		error.code = 'REPORT_DATA_INVALID';
		throw error;
	}

	const reporte = {
		userId,
		plataforma: datos.plataforma ?? 'Desconocida',
		periodo: datos.periodo ?? null,
		periodoAnio,
		periodoMes,
		ventasBrutas,
		comisiones: normalizarImporte(datos.comisiones_plataforma) ?? 0,
		ivaRetenido: normalizarImporte(datos.iva_retenido) ?? 0,
		isrRetenido: normalizarImporte(datos.isr_retenido) ?? 0,
		gananciaNeta: normalizarImporte(datos.ganancia_neta) ?? 0,
		nombreArchivo,
		creadoEn: new Date()
	};

	const resultado = await db.collection('reportesPlataforma').updateOne(
		{
			userId,
			plataforma: reporte.plataforma,
			periodoAnio,
			periodoMes
		},
		{ $set: reporte },
		{ upsert: true }
	);
	return resultado.upsertedId;
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
