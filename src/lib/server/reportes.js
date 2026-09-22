import { getDb } from './db.js';
import { crearFiltroVentasDirectas } from './ventas.js';

// Resume las ventas directas y los CFDI de gastos de un periodo. El MVP no
// incorpora ventas ni retenciones de plataformas; esa integración queda aislada
// hasta que se habilite nuevamente su flujo de importación.
export async function resumenMensual(userId, anio, mes) {
	const db = await getDb();

	const inicio = new Date(anio, mes - 1, 1);
	const fin = new Date(anio, mes, 1);
	const ventasFiltro = crearFiltroVentasDirectas(userId, { fecha: { $gte: inicio, $lt: fin } });

	const [facturasAgg, ventasAgg, metodosPagoAgg] = await Promise.all([
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
				{ $match: ventasFiltro },
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
				{ $match: ventasFiltro },
				{ $group: { _id: { $ifNull: ['$metodoPago', '$canal'] }, total: { $sum: '$monto' } } },
				{ $sort: { total: -1 } }
			])
			.toArray()
	]);

	const facturas = facturasAgg[0] || { total: 0, iva: 0, cantidad: 0 };
	const ventas = ventasAgg[0] || { total: 0, iva: 0, cantidad: 0 };
	const ventasTotales = ventas.total;
	const gastosTotales = facturas.total;
	const ivaTrasladado = ventas.iva;
	const ivaAcreditable = facturas.iva;

	return {
		ventas: {
			total: ventasTotales,
			registros: ventas.cantidad
		},
		gastos: {
			total: gastosTotales,
			registros: facturas.cantidad
		},
		iva: {
			trasladado: ivaTrasladado,
			acreditable: ivaAcreditable,
			estimado: Math.max(ivaTrasladado - ivaAcreditable, 0)
		},
		utilidad: ventasTotales - gastosTotales,
		metodosPago: metodosPagoAgg.map((metodo) => ({
			metodoPago: metodo._id ?? 'Sin especificar',
			total: metodo.total
		}))
	};
}

export async function ultimosMovimientos(userId, anio, mes, limite = 8) {
	const db = await getDb();

	const inicio = new Date(anio, mes - 1, 1);
	const fin = new Date(anio, mes, 1);
	const filtro = { userId, fecha: { $gte: inicio, $lt: fin } };
	const ventasFiltro = crearFiltroVentasDirectas(userId, { fecha: { $gte: inicio, $lt: fin } });

	const [facturas, ventas] = await Promise.all([
		db.collection('facturas').find(filtro).sort({ fecha: -1 }).limit(limite).toArray(),
		db.collection('ventas').find(ventasFiltro).sort({ fecha: -1 }).limit(limite).toArray()
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
			descripcion: `Venta ${v.metodoPago ?? v.canal ?? 'directa'}`,
			tipo: 'Venta',
			monto: v.monto
		}))
	];

	return movimientos
		.sort((a, b) => b.fecha - a.fecha)
		.slice(0, limite)
		.map((m) => ({ ...m, fecha: m.fecha.toISOString().slice(0, 10) }));
}
