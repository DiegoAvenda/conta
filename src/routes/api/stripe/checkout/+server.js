import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { getDb } from '$lib/server/db.js';
import { obtenerRestaurantePorSlug } from '$lib/server/businessProfile.js';

const TAX_RATE = 16;
const MAX_CANTIDAD = 50;

const soloTexto = (valor, { campo, min = 1, max = 80 }) => {
	const texto = String(valor ?? '').trim();
	if (texto.length < min || texto.length > max) {
		throw new Error(`${campo} debe tener entre ${min} y ${max} caracteres.`);
	}
	return texto;
};

export async function POST({ request, locals }) {
	if (!locals.user) {
		return json({ error: 'Inicia sesión para continuar con tu pedido.' }, { status: 401 });
	}
	if (!env.STRIPE_SECRET_KEY) {
		return json(
			{ error: 'Los pagos con tarjeta aún no están configurados en esta tienda.' },
			{ status: 503 }
		);
	}

	let payload;
	try {
		payload = await request.json();
	} catch {
		return json({ error: 'La solicitud no es válida.' }, { status: 400 });
	}

	const slug = String(payload.slug ?? '');
	const rawItems = Array.isArray(payload.items) ? payload.items : [];

	if (rawItems.length === 0) {
		return json({ error: 'Tu carrito está vacío.' }, { status: 400 });
	}

	let entrega;
	try {
		entrega = {
			nombre: soloTexto(payload.entrega?.nombre, { campo: 'El nombre', min: 2, max: 80 }),
			telefono: soloTexto(payload.entrega?.telefono, { campo: 'El teléfono', min: 7, max: 20 }),
			calle: soloTexto(payload.entrega?.calle, { campo: 'La calle', min: 3, max: 120 }),
			numero: soloTexto(payload.entrega?.numero, { campo: 'El número', min: 1, max: 20 }),
			colonia: soloTexto(payload.entrega?.colonia, { campo: 'La colonia', min: 2, max: 80 }),
			referencias: String(payload.entrega?.referencias ?? '')
				.trim()
				.slice(0, 240)
		};
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}

	const restaurante = await obtenerRestaurantePorSlug(slug);
	if (!restaurante) {
		return json({ error: 'No encontramos ese restaurante.' }, { status: 404 });
	}
	if (restaurante.deliveryEnabled === false) {
		return json(
			{ error: 'Este restaurante no está aceptando pedidos a domicilio en este momento.' },
			{ status: 409 }
		);
	}

	try {
		const db = await getDb();
		const menuItems = await db
			.collection('menuItems')
			.find({ userId: restaurante.userId })
			.toArray();
		const menuById = new Map(menuItems.map((item) => [item._id.toString(), item]));

		// Los precios NUNCA se toman del cliente: se recalculan desde el menú del dueño.
		const items = [];
		for (const entry of rawItems) {
			const id = String(entry?.id ?? '');
			const producto = menuById.get(id);
			if (!producto) {
				return json(
					{ error: 'Uno de los productos de tu carrito ya no está disponible.' },
					{ status: 400 }
				);
			}

			const quantity = Number(entry?.quantity);
			if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CANTIDAD) {
				return json({ error: `Cantidad inválida para ${producto.name}.` }, { status: 400 });
			}

			const base = Number(producto.price ?? 0);
			if (!Number.isInteger(base) || base < 0) {
				return json({ error: `Precio inválido para ${producto.name}.` }, { status: 400 });
			}

			// El comensal paga el precio final CON IVA incluido (es lo que se muestra).
			const unitPrice = Math.round(base * (1 + TAX_RATE / 100));
			items.push({
				menuItemId: producto._id,
				itemId: id,
				name: producto.name,
				category: producto.category ?? null,
				imageUrl: producto.imageKey ? `${env.R2_PUBLIC_URL}/${producto.imageKey}` : null,
				quantity,
				price: base,
				unitPrice,
				subtotal: base * quantity
			});
		}

		const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
		const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
		const iva = totalPrice - subtotal;

		const stripe = new Stripe(env.STRIPE_SECRET_KEY);
		const origen = dev ? env.ORIGIN : env.PROD_ORIGIN;

		// Borrador del pedido: se crea antes que la sesión de Stripe para que el
		// webhook siempre encuentre los datos aunque falle la actualización final.
		const { insertedId: draftId } = await db.collection('pendingCheckouts').insertOne({
			restaurantUserId: restaurante.userId,
			restaurantSlug: slug,
			customerId: locals.user.id,
			items,
			subtotal,
			iva,
			totalPrice,
			taxRate: TAX_RATE,
			entrega,
			sessionId: null,
			createdAt: new Date()
		});

		let session;
		try {
			session = await stripe.checkout.sessions.create({
				line_items: items.map((item) => ({
					price_data: {
						currency: 'mxn',
						product_data: {
							name: item.name,
							...(item.imageUrl ? { images: [item.imageUrl] } : {})
						},
						unit_amount: item.unitPrice
					},
					quantity: item.quantity
				})),
				mode: 'payment',
				locale: 'es',
				metadata: {
					draftId: draftId.toString(),
					restaurantSlug: slug,
					customerId: locals.user.id
				},
				success_url: `${origen}/${slug}/profile?from_stripe=yes`,
				cancel_url: `${origen}/${slug}/checkout?cancelled=1`
			});
		} catch (error) {
			console.error('Error creando sesión de Stripe:', error);
			await db.collection('pendingCheckouts').deleteOne({ _id: draftId });
			return json({ error: 'No se pudo iniciar el pago. Intenta de nuevo.' }, { status: 500 });
		}

		await db
			.collection('pendingCheckouts')
			.updateOne({ _id: draftId }, { $set: { sessionId: session.id } });

		return json({ url: session.url });
	} catch (error) {
		console.error(error);
		return json({ error: 'No se pudo procesar tu pedido.' }, { status: 500 });
	}
}
