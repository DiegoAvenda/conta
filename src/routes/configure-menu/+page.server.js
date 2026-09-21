import { fail } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db'; // ajusta al import real de tu conexión Mongo (mismo patrón que usas en el webhook de WhatsApp)

// Límites impuestos por los List Messages de WhatsApp, porque cada item de
// menú termina siendo una fila dentro de una sección de una lista estructurada.
const MAX_TITLE = 24;
const MAX_DESC = 72;

export async function load({ params }) {
	const items = await db
		.collection('menuItems')
		.find({ businessId: params.businessId })
		.sort({ category: 1, createdAt: 1 })
		.toArray();

	return {
		items: items.map((i) => ({ ...i, _id: i._id.toString() }))
	};
}

export const actions = {
	create: async ({ request, params }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const description = form.get('description')?.toString().trim() ?? '';
		const category = form.get('category')?.toString().trim();
		const price = Number(form.get('price'));
		const imageFile = form.get('image');

		if (!name || !category || Number.isNaN(price)) {
			return fail(400, { error: 'Nombre, categoría y precio son requeridos.' });
		}
		if (name.length > MAX_TITLE || category.length > MAX_TITLE) {
			return fail(400, {
				error: `Nombre y categoría no pueden pasar de ${MAX_TITLE} caracteres (límite de listas de WhatsApp).`
			});
		}
		if (description.length > MAX_DESC) {
			return fail(400, { error: `La descripción no puede pasar de ${MAX_DESC} caracteres.` });
		}

		let imageUrl = null;
		if (imageFile && imageFile.size > 0) {
			const blob = await put(
				`menu/${params.businessId}/${crypto.randomUUID()}-${imageFile.name}`,
				imageFile,
				{ access: 'public' }
			);
			imageUrl = blob.url;
		}

		await db.collection('menuItems').insertOne({
			businessId: params.businessId,
			name,
			description,
			category,
			price,
			imageUrl,
			createdAt: new Date()
		});

		return { success: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Falta el id.' });

		await db.collection('menuItems').deleteOne({ _id: new ObjectId(id) });
		return { success: true };
	}
};
