import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import { obtenerRestaurantePorSlug } from '$lib/server/businessProfile.js';
import { urlPublica } from '$lib/server/r2.js';

// El menú público NUNCA se sirve de una colección del cliente: lee los
// menuItems del dueño del restaurante, los mismos que usa el POS.
export async function load({ params }) {
	const perfil = await obtenerRestaurantePorSlug(params.slug);
	if (!perfil) {
		error(404, 'No encontramos ese restaurante en contaco.store.');
	}

	const db = await getDb();
	const items = await db
		.collection('menuItems')
		.find({ userId: perfil.userId })
		.sort({ category: 1, createdAt: 1 })
		.toArray();

	return {
		items: items.map((item) => ({
			_id: item._id.toString(),
			name: item.name,
			description: item.description ?? '',
			category: item.category ?? 'General',
			price: item.price,
			imageUrl: urlPublica(item.imageKey)
		}))
	};
}
