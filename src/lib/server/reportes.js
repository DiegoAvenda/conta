import { getDb } from './db.js';

// Combina facturas (CFDI: ingresos y gastos) + ventas (captura manual) en un
// solo resumen mensual. Es la única función que debería alimentar el dashboard —
// cualquier otra pantalla que necesite "el número real" debería llamar aquí,
// no reimplementar la suma.
export async function resumenCombinado(userId, anio, mes) {
	const db = await getDb();

	const inicio = new Date(anio, mes - 1, 1);
	const fin = new Date(anio, mes, 1);

	const [facturasPorTipo, ventasAgg, canalesAgg] = await Promise.all([
		db
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

		// solo ventas manuales tienen canal — un CFDI de ingreso no lo trae,
		// así que esta distribución no representa el 100% de las ventas todavía
		db
			.collection('ventas')
			.aggregate([
				{ $match: { userId, fecha: { $gte: inicio, $lt: fin } } },
				{ $group: { _id: '$canal', total: { $sum: '$monto' } } },
				{ $sort: { total: -1 } }
			])
			.toArray()
	]);

	const facturasIngreso = facturasPorTipo.find((f) => f._id === 'ingreso') || {
		total: 0,
		iva: 0,
		cantidad: 0
	};
	const facturasGasto = facturasPorTipo.find((f) => f._id === 'gasto') || {
		total: 0,
		iva: 0,
		cantidad: 0
	};
	const ventas = ventasAgg[0] || { total: 0, iva: 0, cantidad: 0 };

	const ventasTotales = facturasIngreso.total + ventas.total;
	const ivaTrasladado = facturasIngreso.iva + ventas.iva;
	const ivaAcreditable = facturasGasto.iva;
	const gastos = facturasGasto.total;

	return {
		ventas: {
			total: ventasTotales,
			registros: facturasIngreso.cantidad + ventas.cantidad,
			manuales: ventas.cantidad,
			facturadas: facturasIngreso.cantidad
		},
		gastos: {
			total: gastos,
			registros: facturasGasto.cantidad
		},
		iva: {
			trasladado: ivaTrasladado,
			acreditable: ivaAcreditable,
			estimado: Math.max(ivaTrasladado - ivaAcreditable, 0)
		},
		utilidad: ventasTotales - gastos,
		canales: canalesAgg.map((c) => ({ canal: c._id, total: c.total }))
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
			descripcion: f.tipo === 'gasto' ? f.nombreEmisor : `Venta facturada — ${f.nombreEmisor}`,
			tipo: f.tipo === 'gasto' ? 'Gasto' : 'Venta',
			monto: f.tipo === 'gasto' ? -f.total : f.total
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
