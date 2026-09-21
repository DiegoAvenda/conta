import { fail } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getDb } from '$lib/server/db';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// Asegúrate de tener estas variables de entorno en tu archivo .env
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

export async function load({ params }) {
	const db = await getDb();
	const items = db
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

		// --- NUEVA LÓGICA DE CLOUDFLARE R2 ---
		if (imageFile && imageFile.size > 0) {
			// Generar nombre de archivo único
			const fileName = `menu/${params.businessId}/${crypto.randomUUID()}-${imageFile.name.replace(/\s+/g, '-')}`;

			// Convertir el archivo a un Buffer que S3 pueda leer
			const arrayBuffer = await imageFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Subir a R2
			await s3Client.send(
				new PutObjectCommand({
					Bucket: R2_BUCKET_NAME,
					Key: fileName,
					Body: buffer,
					ContentType: imageFile.type
				})
			);

			// Construir la URL pública (Cloudflare te permite asignar un subdominio público gratis)
			imageUrl = `${R2_PUBLIC_URL}/${fileName}`;
		}
		// ---------------------------------------

		const db = await getDb();

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

		const db = await getDb();

		// Opcional: Aquí también podrías agregar lógica para borrar la imagen de R2
		// usando DeleteObjectCommand para ahorrar espacio, aunque con 10GB gratis
		// tomará mucho tiempo llenarlo.

		await db.collection('menuItems').deleteOne({ _id: new ObjectId(id) });
		return { success: true };
	}
};
