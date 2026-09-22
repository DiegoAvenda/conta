import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getDb } from '$lib/server/db';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import {
	R2_ACCOUNT_ID,
	R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY,
	R2_BUCKET_NAME,
	R2_PUBLIC_URL
} from '$env/static/private';

const s3Client = new S3Client({
	region: 'auto',
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY
	}
});

const MAX_TITLE = 24;
const MAX_DESC = 72;

export async function load({ locals }) {
	if (!locals.user) {
		return redirect(302, 'better-auth/login');
	}

	const db = await getDb();

	const items = await db
		.collection('menuItems')
		.find({ userId: locals.user.id })
		.sort({ category: 1, createdAt: 1 })
		.toArray();

	return {
		items: items.map((item) => ({
			...item,
			_id: item._id.toString(),
			imageUrl: item.imageKey ? `${R2_PUBLIC_URL}/${item.imageKey}` : null
		}))
	};
}

export const actions = {
	create: async ({ request, params, locals }) => {
		const userId = locals.user.id;
		const form = await request.formData();

		const name = form.get('name')?.toString().trim();
		const description = form.get('description')?.toString().trim() ?? '';
		const category = form.get('category')?.toString().trim();
		const price = Number(form.get('price'));
		const imageFile = form.get('image');

		if (!name || !category || Number.isNaN(price)) {
			return fail(400, {
				error: 'Nombre, categoría y precio son requeridos.'
			});
		}

		if (name.length > MAX_TITLE || category.length > MAX_TITLE) {
			return fail(400, {
				error: `Nombre y categoría no pueden pasar de ${MAX_TITLE} caracteres (límite de listas de WhatsApp).`
			});
		}

		if (description.length > MAX_DESC) {
			return fail(400, {
				error: `La descripción no puede pasar de ${MAX_DESC} caracteres.`
			});
		}

		let imageKey = null;

		if (imageFile instanceof File && imageFile.size > 0) {
			if (!imageFile.type.startsWith('image/')) {
				return fail(400, {
					error: 'El archivo debe ser una imagen.'
				});
			}

			const fileName = `menu/${userId}/${crypto.randomUUID()}-${imageFile.name.replace(/\s+/g, '-')}`;

			const arrayBuffer = await imageFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			try {
				await s3Client.send(
					new PutObjectCommand({
						Bucket: R2_BUCKET_NAME,
						Key: fileName,
						Body: buffer,
						ContentType: imageFile.type
					})
				);

				imageKey = fileName;
			} catch (error) {
				console.error('Error al subir imagen a R2:', error);

				return fail(500, {
					error: 'No se pudo subir la imagen.'
				});
			}
		}

		const db = await getDb();

		await db.collection('menuItems').insertOne({
			userId,
			name,
			description,
			category,
			price,
			imageKey,
			createdAt: new Date()
		});

		return {
			success: true
		};
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();

		if (!id || !ObjectId.isValid(id)) {
			return fail(400, {
				error: 'El ID del producto no es válido.'
			});
		}

		const db = await getDb();

		const item = await db.collection('menuItems').findOne({
			_id: new ObjectId(id)
		});

		if (!item) {
			return fail(404, {
				error: 'El producto no existe.'
			});
		}

		if (item.imageKey) {
			try {
				await s3Client.send(
					new DeleteObjectCommand({
						Bucket: R2_BUCKET_NAME,
						Key: item.imageKey
					})
				);
			} catch (error) {
				console.error('Error al eliminar imagen de R2:', error);
			}
		}

		await db.collection('menuItems').deleteOne({
			_id: new ObjectId(id)
		});

		return {
			success: true
		};
	}
};
