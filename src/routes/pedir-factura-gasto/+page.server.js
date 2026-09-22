import { obtenerPerfilNegocio, guardarRfc } from '$lib/server/businessProfile.js';
import { fail } from '@sveltejs/kit';

export async function load({ locals }) {
	const userId = locals.user.id;
	const perfil = await obtenerPerfilNegocio(userId);

	return {
		rfc: perfil?.rfc ?? '',
		regimenFiscal: perfil?.regimenFiscal?.codigo ?? null
	};
}

export const actions = {
	guardarRfc: async ({ request, locals }) => {
		const userId = locals.user.id;
		const datos = await request.formData();
		const rfc = datos.get('rfc');

		if (!rfc) {
			return fail(400, { error: 'El RFC es obligatorio' });
		}

		try {
			await guardarRfc(userId, rfc);
			return { success: true };
		} catch (err) {
			return fail(400, { error: err.message });
		}
	}
};
