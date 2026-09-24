import { fail, redirect } from '@sveltejs/kit';
import {
	obtenerPerfilNegocio,
	guardarPerfilRestaurante,
	normalizarSlug
} from '$lib/server/businessProfile.js';
import { urlPublica, subirImagen, eliminarImagen } from '$lib/server/r2.js';

const MAX_NOMBRE = 60;
const MAX_DESC = 300;
const MAX_DIRECCION = 120;
const MAX_IMAGEN = 5 * 1024 * 1024;

const recortar = (valor, max) =>
	String(valor ?? '')
		.trim()
		.slice(0, max);

export async function load({ locals }) {
	if (!locals.user) {
		redirect(303, '/better-auth/login');
	}

	const perfil = await obtenerPerfilNegocio(locals.user.id);

	return {
		perfil: {
			nombre: perfil?.nombre ?? '',
			slug: perfil?.slug ?? '',
			descripcion: perfil?.descripcion ?? '',
			telefono: perfil?.telefono ?? '',
			direccion: perfil?.direccion ?? '',
			deliveryEnabled: perfil?.deliveryEnabled !== false,
			heroImageUrl: urlPublica(perfil?.heroImageKey)
		}
	};
}

export const actions = {
	guardar: async ({ request, locals }) => {
		const form = await request.formData();

		const nombre = recortar(form.get('nombre'), MAX_NOMBRE);
		const slug = normalizarSlug(form.get('slug'));
		const descripcion = recortar(form.get('descripcion'), MAX_DESC);
		const telefono = recortar(form.get('telefono'), 20);
		const direccion = recortar(form.get('direccion'), MAX_DIRECCION);
		const deliveryEnabled = form.get('deliveryEnabled') !== null;
		const heroFile = form.get('hero');

		if (nombre.length < 2) {
			return fail(400, { error: 'El nombre público es requerido.' });
		}

		const perfilActual = await obtenerPerfilNegocio(locals.user.id);
		let heroImageKey = perfilActual?.heroImageKey ?? null;

		// Primero se sube la imagen nueva; si el guardado falla (p.ej. slug ocupado)
		// se borra para no dejar archivos huérfanos en R2.
		if (heroFile instanceof File && heroFile.size > 0) {
			if (!heroFile.type.startsWith('image/')) {
				return fail(400, { error: 'La imagen debe ser un archivo de imagen.' });
			}
			if (heroFile.size > MAX_IMAGEN) {
				return fail(400, { error: 'La imagen no puede pasar de 5 MB.' });
			}

			const key = `hero/${locals.user.id}/${crypto.randomUUID()}-${heroFile.name.replace(/\s+/g, '-')}`;
			try {
				await subirImagen(key, Buffer.from(await heroFile.arrayBuffer()), heroFile.type);
				heroImageKey = key;
			} catch (error) {
				console.error('Error al subir imagen a R2:', error);
				return fail(500, { error: 'No se pudo subir la imagen.' });
			}
		}

		try {
			await guardarPerfilRestaurante(locals.user.id, {
				nombre,
				slug,
				descripcion,
				telefono,
				direccion,
				deliveryEnabled,
				heroImageKey
			});
		} catch (error) {
			if (heroImageKey && heroImageKey !== perfilActual?.heroImageKey) {
				try {
					await eliminarImagen(heroImageKey);
				} catch (limpiezaError) {
					console.error('No se pudo limpiar la imagen subida:', limpiezaError);
				}
			}
			return fail(400, { error: error.message || 'No se pudo guardar la tienda.' });
		}

		// Ya con el perfil guardado, se retira la imagen anterior (best effort).
		if (heroImageKey && perfilActual?.heroImageKey && perfilActual.heroImageKey !== heroImageKey) {
			try {
				await eliminarImagen(perfilActual.heroImageKey);
			} catch (error) {
				console.error('No se pudo eliminar la imagen anterior de R2:', error);
			}
		}

		return { success: true, slug: slug || null };
	}
};
