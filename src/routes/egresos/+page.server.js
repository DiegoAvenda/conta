import { crearFacturaDesdeXml, listarFacturas, eliminarFactura } from '$lib/server/facturas.js';
import { obtenerPerfilNegocio } from '$lib/server/businessProfile.js';
import { fail } from '@sveltejs/kit';

export async function load({ locals }) {
	const userId = locals.user.id;
	const facturas = await listarFacturas(userId);
	return { facturas };
}

export const actions = {
	subir: async ({ request, locals }) => {
		const userId = locals.user.id;
		const perfil = await obtenerPerfilNegocio(userId);

		if (!perfil?.rfc) {
			return fail(400, { errores: ['Primero registra el RFC de tu negocio en tu ficha fiscal'] });
		}

		const rfcNegocio = perfil.rfc;
		const datos = await request.formData();
		const archivos = datos.getAll('xmls'); // input con multiple, puede subir varios CFDI a la vez

		const errores = [];
		let subidas = 0;

		for (const archivo of archivos) {
			if (archivo.size === 0) continue; // input vacío en algunos navegadores manda un File fantasma

			try {
				const xmlTexto = await archivo.text();
				await crearFacturaDesdeXml(userId, rfcNegocio, xmlTexto);
				subidas++;
			} catch (err) {
				errores.push(`${archivo.name}: ${err.message}`);
			}
		}

		if (errores.length > 0) {
			return fail(400, { errores, subidas });
		}

		return { success: true, subidas };
	},

	eliminar: async ({ request, locals }) => {
		const userId = locals.user.id;
		const datos = await request.formData();
		await eliminarFactura(userId, datos.get('id'));
		return { success: true };
	}
};
