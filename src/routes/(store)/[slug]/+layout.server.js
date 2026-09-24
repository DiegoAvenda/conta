import { error } from '@sveltejs/kit';
import { obtenerRestaurantePorSlug, serializarRestaurante } from '$lib/server/businessProfile.js';

// Resuelve contaco.store/<slug> → restaurante publicado. Cualquier página hija
// de la tienda (menú, checkout, perfil) recibe `data.restaurante` sin volver a
// consultar. Si el slug no existe o no está publicado, 404.
export async function load({ params }) {
	const perfil = await obtenerRestaurantePorSlug(params.slug);

	if (!perfil) {
		error(404, 'No encontramos ese restaurante en contaco.store.');
	}

	return { restaurante: serializarRestaurante(perfil) };
}
