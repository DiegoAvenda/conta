import { getDb } from '$lib/server/db.js';
import { buildMonthlyFiscalSummary } from '$lib/server/fiscal.js';
import { crearFiltroVentasDirectas } from '$lib/server/ventas.js';

export async function load({ locals, url }) {
	if (!locals.user) {
		throw new Error('Usuario no autenticado');
	}

	const anio = Number(url.searchParams.get('anio')) || new Date().getFullYear();
	const mes = Number(url.searchParams.get('mes')) || new Date().getMonth() + 1;
	const inicio = new Date(anio, mes - 1, 1);
	const fin = new Date(anio, mes, 1);
	const db = await getDb();

	const ventasFiltro = crearFiltroVentasDirectas(locals.user.id, {
		fecha: { $gte: inicio, $lt: fin }
	});

	const [ventas, facturas, movimientos] = await Promise.all([
		db.collection('ventas').find(ventasFiltro).toArray(),
		db
			.collection('facturas')
			.find({ userId: locals.user.id, fecha: { $gte: inicio, $lt: fin } })
			.toArray(),
		db
			.collection('movimientos')
			.find({ userId: locals.user.id, createdAt: { $gte: inicio, $lt: fin } })
			.toArray()
	]);

	const summary = buildMonthlyFiscalSummary({ ventas, facturas, movimientos });

	return {
		anio,
		mes,
		summary,
		message:
			'Este resumen representa una estimación útil y debe validarse con el portal del SAT y la documentación fiscal del negocio.'
	};
}
