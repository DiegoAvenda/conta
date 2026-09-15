import { crearVenta, listarVentas, eliminarVenta } from '$lib/server/ventas.js';
import { fail } from '@sveltejs/kit';

export async function load({ locals }) {
	const userId = locals.user.id;
	const ventas = await listarVentas(userId);
	return { ventas };
}

export const actions = {
	crear: async ({ request, locals }) => {
		const userId = locals.user.id;
		const datos = Object.fromEntries(await request.formData());

		if (!datos.amount || !datos.date) {
			return fail(400, { error: 'Faltan datos obligatorios' });
		}

		await crearVenta(userId, datos);
		return { success: true };
	},

	eliminar: async ({ request, locals }) => {
		const userId = locals.user.id;
		const datos = await request.formData();
		await eliminarVenta(userId, datos.get('id'));
		return { success: true };
	}
};
