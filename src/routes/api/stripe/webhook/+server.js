import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { ObjectId } from 'mongodb';
import { getDb } from '$lib/server/db.js';
import { registrarVentaDesdePedido } from '$lib/server/ventas.js';

// Stripe reenvía webhooks; el índice único hace imposible crear la orden dos veces
// aunque dos entregas lleguen en paralelo. Se asegura una sola vez por proceso.
let indicesPromise = null;
function asegurarIndices() {
	if (!indicesPromise) {
		indicesPromise = (async () => {
			const db = await getDb();
			await db
				.collection('orders')
				.createIndex({ stripeSessionId: 1 }, { unique: true, sparse: true });
			await db.collection('pendingCheckouts').createIndex(
				{ createdAt: 1 },
				{ expireAfterSeconds: 60 * 60 * 24 } // los borradores sin pagar se purgan solos
			);
		})().catch((error) => {
			console.error('No se pudieron crear los índices del webhook:', error);
		});
	}
	return indicesPromise;
}

async function procesarPedidoPagado(session) {
	const db = await getDb();
	await asegurarIndices();

	const yaExiste = await db.collection('orders').findOne({ stripeSessionId: session.id });
	if (yaExiste) return;

	let draft = null;
	const draftId = session.metadata?.draftId;
	if (draftId && ObjectId.isValid(draftId)) {
		draft = await db.collection('pendingCheckouts').findOne({ _id: new ObjectId(draftId) });
	}
	if (!draft) {
		draft = await db.collection('pendingCheckouts').findOne({ sessionId: session.id });
	}
	if (!draft) {
		console.error('Webhook sin borrador de pedido para la sesión:', session.id);
		return;
	}

	const direccion = [draft.entrega?.calle, draft.entrega?.numero, draft.entrega?.colonia]
		.filter(Boolean)
		.join(', ');

	// Mismo esquema que los pedidos del POS para que aparezcan en Comandas,
	// Ventas, Dashboard y el cierre del SAT sin cambios en esas pantallas.
	const order = {
		userId: draft.restaurantUserId,
		sellerId: draft.restaurantUserId,
		buyer: {
			kind: 'customer',
			userId: draft.customerId,
			name: draft.entrega?.nombre ?? 'Cliente',
			phone: draft.entrega?.telefono ?? null,
			tableNumber: null,
			deliveryAddress: direccion || null
		},
		customerName: draft.entrega?.nombre ?? 'Cliente',
		items: (draft.items ?? []).map((item) => ({
			menuItemId: item.menuItemId,
			itemId: item.itemId,
			name: item.name,
			category: item.category ?? null,
			quantity: item.quantity,
			price: item.price,
			subtotal: item.subtotal
		})),
		subtotal: draft.subtotal,
		discount: 0,
		taxRate: draft.taxRate ?? 16,
		iva: draft.iva,
		totalPrice: draft.totalPrice,
		status: 'pending',
		channel: 'delivery',
		orderType: null,
		paymentStatus: 'paid',
		paymentMethod: 'card',
		entrega: draft.entrega,
		stripeSessionId: session.id,
		createdAt: new Date(),
		preparingAt: null,
		readyAt: null,
		completedAt: null,
		delivered: false,
		prepared: false
	};

	let inserted;
	try {
		inserted = await db.collection('orders').insertOne(order);
	} catch (error) {
		// 11000 = clave duplicada: otra entrega del mismo webhook ya lo creó.
		if (error?.code === 11000) return;
		throw error;
	}
	order._id = inserted.insertedId;

	// El pedido ya está pagado con tarjeta: registra la venta y el cobro para RESICO.
	await registrarVentaDesdePedido(draft.restaurantUserId, order);

	await db.collection('pendingCheckouts').deleteOne({ _id: draft._id });
	console.log('orden de delivery creada:', inserted.insertedId.toString());
}

export async function POST({ request }) {
	if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
		return json({ error: 'Stripe no está configurado.' }, { status: 503 });
	}

	const stripe = new Stripe(env.STRIPE_SECRET_KEY);
	const rawBody = await request.arrayBuffer();

	let event;
	try {
		event = stripe.webhooks.constructEvent(
			Buffer.from(rawBody),
			request.headers.get('stripe-signature'),
			env.STRIPE_WEBHOOK_SECRET
		);
	} catch (error) {
		console.error('Firma de Stripe inválida:', error.message);
		return json({ error: 'Firma inválida.' }, { status: 400 });
	}

	if (event.type === 'checkout.session.completed') {
		try {
			await procesarPedidoPagado(event.data.object);
		} catch (error) {
			console.error('Error procesando checkout.session.completed:', error);
			// 500 para que Stripe reintente si fue un fallo transitorio de Mongo.
			return json({ error: 'No se pudo procesar el pedido.' }, { status: 500 });
		}
	}

	return json({ received: true });
}
