import { resumenMensual, ultimosMovimientos } from '$lib/server/reportes.js';

export async function load({ locals, url }) {
	const userId = locals.user.id;
	const ahora = new Date();
	const anio = Number(url.searchParams.get('anio')) || ahora.getFullYear();
	const mes = Number(url.searchParams.get('mes')) || ahora.getMonth() + 1;

	const [resumen, movimientos] = await Promise.all([
		resumenMensual(userId, anio, mes),
		ultimosMovimientos(userId, anio, mes)
	]);

	return { resumen, movimientos, anio, mes };
}
