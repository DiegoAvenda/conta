import { crearVenta, listarVentas, eliminarVenta } from '$lib/server/ventas.js';
import { parseMoneyToCents } from '$lib/server/money.js';
import { fail } from '@sveltejs/kit';

export async function load({ locals }) {
	const userId = locals.user.id;
	const ventas = await listarVentas(userId);
	return { ventas };
}

export const actions = {
	crear: async ({ request, locals }) => {
		const userId = locals.user.id;
		const datos = await request.formData();
		const amount = datos.get('amount');
		const date = datos.get('date');
		const paymentMethod = datos.get('paymentMethod')?.toString().trim();
		const iva = datos.get('iva');

		if (!date) {
			return fail(400, { error: 'La fecha es obligatoria.' });
		}

		let amountCents;
		let ivaCents = null;
		try {
			amountCents = parseMoneyToCents(amount, { field: 'Ventas del periodo', min: 0 });
			if (iva !== null && iva !== undefined && iva !== '') {
				ivaCents = parseMoneyToCents(iva, { field: 'IVA', min: 0 });
			}
		} catch (error) {
			return fail(400, { error: error.message });
		}

		if (!paymentMethod) {
			return fail(400, { error: 'Selecciona un método de cobro.' });
		}

		await crearVenta(userId, {
			amount: amountCents,
			iva: ivaCents ?? amountCents * 0.16,
			date,
			paymentMethod
		});
		return { success: true };
	},

	eliminar: async ({ request, locals }) => {
		const userId = locals.user.id;
		const datos = await request.formData();
		await eliminarVenta(userId, datos.get('id'));
		return { success: true };
	}
};
