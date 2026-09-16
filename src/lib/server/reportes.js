import { getDb } from './db.js';

// Combina facturas (CFDI: ingresos y gastos) + ventas (captura manual) en un
// solo resumen mensual. Es la única función que debería alimentar el dashboard —
// cualquier otra pantalla que necesite "el número real" debería llamar aquí,
// no reimplementar la suma.
export async function resumenCombinado(userId, anio, mes) {
	const db = await getDb();

	const inicio = new Date(anio, mes - 1, 1);
	const fin = new Date(anio, mes, 1);
	const numeroMongo = (campo) => ({
		$convert: { input: campo, to: 'double', onError: 0, onNull: 0 }
	});
	const filtroReporte = {
		userId,
		$or: [
			{
				$expr: {
					$and: [
						{ $eq: [numeroMongo('$periodoAnio'), anio] },
						{ $eq: [numeroMongo('$periodoMes'), mes] }
					]
				}
			},
			{
				$expr: {
					$and: [
						{ $eq: [numeroMongo('$periodo_anio'), anio] },
						{ $eq: [numeroMongo('$periodo_mes'), mes] }
					]
				}
			}
		]
	};

	const [facturasAgg, ventasAgg, canalesVentasAgg, reportesAgg, canalesReporteAgg] =
		await Promise.all([
			// todo lo que vive en "facturas" es gasto (ver facturas.js) — no hace
			// falta agrupar por tipo, solo sumar
			db
				.collection('facturas')
				.aggregate([
					{ $match: { userId, fecha: { $gte: inicio, $lt: fin } } },
					{
						$group: {
							_id: null,
							total: { $sum: '$total' },
							iva: { $sum: '$iva' },
							cantidad: { $sum: 1 }
						}
					}
				])
				.toArray(),

			db
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
				.toArray(),

			db
				.collection('ventas')
				.aggregate([
					{ $match: { userId, fecha: { $gte: inicio, $lt: fin } } },
					{ $group: { _id: '$canal', total: { $sum: '$monto' } } },
					{ $sort: { total: -1 } }
				])
				.toArray(),

			// los reportes de plataforma se filtran por periodoAnio/periodoMes (que
			// la IA extrajo), no por "fecha" — el reporte no tiene un día específico,
			// cubre el mes completo
			db
				.collection('reportesPlataforma')
				.aggregate([
					{ $match: filtroReporte },
					{
						$group: {
							_id: null,
							ventasBrutas: { $sum: numeroMongo('$ventasBrutas') },
							comisiones: { $sum: numeroMongo('$comisiones') },
							ivaRetenido: { $sum: numeroMongo('$ivaRetenido') },
							isrRetenido: { $sum: numeroMongo('$isrRetenido') },
							cantidad: { $sum: 1 }
						}
					}
				])
				.toArray(),

			// mismo periodo, ahora agrupado por plataforma para el desglose de canales
			db
				.collection('reportesPlataforma')
				.aggregate([
					{ $match: filtroReporte },
					{
						$group: { _id: '$plataforma', total: { $sum: numeroMongo('$ventasBrutas') } }
					},
					{ $sort: { total: -1 } }
				])
				.toArray()
		]);

	const facturas = facturasAgg[0] || { total: 0, iva: 0, cantidad: 0 };
	const ventas = ventasAgg[0] || { total: 0, iva: 0, cantidad: 0 };
	const reportes = reportesAgg[0] || {
		ventasBrutas: 0,
		comisiones: 0,
		ivaRetenido: 0,
		isrRetenido: 0,
		cantidad: 0
	};

	const ventasTotales = ventas.total + reportes.ventasBrutas;
	const gastosTotales = facturas.total + reportes.comisiones;
	const ivaTrasladado = ventas.iva; // IVA identificado solo de ventas directas —
	// el reporte de plataforma trae lo YA retenido, no el IVA trasladado total de esa venta
	const ivaAcreditable = facturas.iva;

	// comisiones de la plataforma NO se restan aquí de utilidad/gastos: si Uber/DiDi
	// también te emite un CFDI por su comisión y lo subes en /facturas, restarlo
	// aquí otra vez lo contaría doble. Se muestra aparte hasta que se decida
	// una sola fuente de verdad para ese gasto.
	const canales = [
		...canalesVentasAgg.map((c) => ({ canal: c._id, total: c.total })),
		...canalesReporteAgg.map((c) => ({ canal: c._id ?? 'Plataforma sin nombre', total: c.total }))
	].sort((a, b) => b.total - a.total);

	return {
		ventas: {
			total: ventasTotales,
			registros: ventas.cantidad + reportes.cantidad,
			manuales: ventas.cantidad,
			deReportes: reportes.ventasBrutas,
			reportesCantidad: reportes.cantidad
		},
		gastos: {
			total: gastosTotales,
			registros: facturas.cantidad,
			comisionesPlataforma: reportes.comisiones
		},
		comisionesPlataforma: reportes.comisiones,
		iva: {
			trasladado: ivaTrasladado,
			acreditable: ivaAcreditable,
			retenidoPlataformas: reportes.ivaRetenido,
			estimado: Math.max(ivaTrasladado - ivaAcreditable - reportes.ivaRetenido, 0)
		},
		isrRetenidoPlataformas: reportes.isrRetenido,
		utilidad: ventasTotales - gastosTotales,
		canales
	};
}

export async function ultimosMovimientos(userId, anio, mes, limite = 8) {
	const db = await getDb();

	const inicio = new Date(anio, mes - 1, 1);
	const fin = new Date(anio, mes, 1);
	const filtro = { userId, fecha: { $gte: inicio, $lt: fin } };

	const [facturas, ventas] = await Promise.all([
		db.collection('facturas').find(filtro).sort({ fecha: -1 }).limit(limite).toArray(),
		db.collection('ventas').find(filtro).sort({ fecha: -1 }).limit(limite).toArray()
	]);

	const movimientos = [
		...facturas.map((f) => ({
			fecha: f.fecha,
			descripcion: f.nombreEmisor,
			tipo: 'Gasto',
			monto: -f.total
		})),
		...ventas.map((v) => ({
			fecha: v.fecha,
			descripcion: `Venta ${v.canal}`,
			tipo: 'Venta',
			monto: v.monto
		}))
	];

	return movimientos
		.sort((a, b) => b.fecha - a.fecha)
		.slice(0, limite)
		.map((m) => ({ ...m, fecha: m.fecha.toISOString().slice(0, 10) }));
}
