import { getDb } from './db.js';
import { buildLedgerEntries, buildMonthlyFiscalSummary } from './fiscal.js';
import { crearFiltroVentasDirectas } from './ventas.js';

// Resume las ventas directas, los CFDI de gastos y los movimientos del ledger
// del periodo para alimentar el dashboard y la vista SAT mensual con una única
// fuente de verdad financiera.
export async function resumenMensual(userId, anio, mes) {
	const db = await getDb();

	const inicio = new Date(anio, mes - 1, 1);
	const fin = new Date(anio, mes, 1);
	const ventasFiltro = crearFiltroVentasDirectas(userId, { fecha: { $gte: inicio, $lt: fin } });

	const [facturas, ventas, movimientos, metodosPagoAgg] = await Promise.all([
		db
			.collection('facturas')
			.find({ userId, fecha: { $gte: inicio, $lt: fin } })
			.toArray(),
		db.collection('ventas').find(ventasFiltro).toArray(),
		db
			.collection('movimientos')
			.find({ userId, createdAt: { $gte: inicio, $lt: fin } })
			.toArray(),
		db
			.collection('ventas')
			.aggregate([
				{ $match: ventasFiltro },
				{
					$group: {
						_id: { $ifNull: ['$metodoPago', 'Sin especificar'] },
						total: { $sum: '$monto' }
					}
				},
				{ $sort: { total: -1 } }
			])
			.toArray()
	]);

	const summary = buildMonthlyFiscalSummary({ ventas, facturas, movimientos });

	return {
		ventas: {
			total: summary.ventas.total,
			registros: summary.ventas.registros,
			netas: summary.ventas.netas
		},
		gastos: {
			total: summary.gastos.total,
			registros: summary.gastos.registros
		},
		iva: {
			trasladado: summary.iva.trasladado,
			acreditable: summary.iva.acreditable,
			estimado: summary.iva.estimado
		},
		utilidad: summary.utilidad,
		metodosPago: metodosPagoAgg.map((metodo) => ({
			metodoPago: metodo._id ?? 'Sin especificar',
			total: metodo.total
		})),
		sat: summary.sat,
		ledger: summary.movimientos
	};
}

export async function ultimosMovimientos(userId, anio, mes, limite = 8) {
	const db = await getDb();

	const inicio = new Date(anio, mes - 1, 1);
	const fin = new Date(anio, mes, 1);
	const ventasFiltro = crearFiltroVentasDirectas(userId, { fecha: { $gte: inicio, $lt: fin } });

	const [facturas, ventas, movimientos] = await Promise.all([
		db
			.collection('facturas')
			.find({ userId, fecha: { $gte: inicio, $lt: fin } })
			.sort({ fecha: -1 })
			.limit(limite)
			.toArray(),
		db.collection('ventas').find(ventasFiltro).sort({ fecha: -1 }).limit(limite).toArray(),
		db
			.collection('movimientos')
			.find({ userId, createdAt: { $gte: inicio, $lt: fin } })
			.sort({ createdAt: -1 })
			.limit(limite)
			.toArray()
	]);

	const ledger = buildLedgerEntries({ ventas, facturas, movimientos });

	return ledger.slice(0, limite).map((m) => ({
		fecha: new Date(m.fecha).toISOString().slice(0, 10),
		descripcion: m.descripcion,
		tipo: m.tipo,
		monto: m.monto
	}));
}
