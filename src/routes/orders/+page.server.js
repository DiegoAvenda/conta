import { getDb } from '$lib/server/db.js';
import { ObjectId } from 'mongodb';

const formatTime = (value) => {
	if (!value) return null;
	return new Date(value).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
};

export const load = async ({ url }) => {
	// 1. Extraemos todos los posibles filtros de la URL
	const status = url.searchParams.get('status') ?? 'pending';
	const channel = url.searchParams.get('channel');
	const orderType = url.searchParams.get('orderType');
	const paymentStatus = url.searchParams.get('paymentStatus');

	// 2. Construimos la query dinámicamente
	// Si el frontend no manda un parámetro, simplemente no lo añadimos a la búsqueda
	const query = {};

	if (status !== 'all') query.status = status;
	if (channel) query.channel = channel; // 'delivery' o 'restaurant'
	if (orderType) query.orderType = orderType; // 'dine-in' o 'takeout'
	if (paymentStatus) query.paymentStatus = paymentStatus; // 'paid' o 'unpaid'

	try {
		const db = await getDb();
		const ordersCollection = db.collection('orders');
		const rawOrders = await ordersCollection.find(query, { sort: { createdAt: -1 } }).toArray();

		const orders = rawOrders.map((order) => ({
			...order,
			_id: order._id.toString(),
			customerId: order.customerId?.toString?.() ?? order.customerId,
			createdAt: formatTime(order.createdAt),
			preparingAt: formatTime(order.preparingAt),
			readyAt: formatTime(order.readyAt),
			completedAt: formatTime(order.completedAt)
		}));

		return {
			orders,
			// Regresamos los filtros activos para que la UI sepa qué botones pintar como "activos"
			filters: { status, channel, orderType, paymentStatus }
		};
	} catch (e) {
		console.log(e);
		return { orders: [], filters: {} };
	}
};

export const actions = {
	updateStatus: async ({ request }) => {
		const data = await request.formData();
		const orderId = data.get('orderId');
		const nextStatus = data.get('status');

		if (!orderId || !nextStatus || typeof orderId !== 'string' || typeof nextStatus !== 'string') {
			return { success: false };
		}

		const db = await getDb();
		const orders = db.collection('orders');
		const update = {
			status: nextStatus,
			prepared: nextStatus === 'completed' || nextStatus === 'ready',
			delivered: nextStatus === 'completed'
		};

		if (nextStatus === 'preparing') {
			update.preparingAt = new Date();
		}
		if (nextStatus === 'ready') {
			update.readyAt = new Date();
		}
		if (nextStatus === 'completed') {
			update.completedAt = new Date();
		}

		await orders.updateOne({ _id: new ObjectId(orderId) }, { $set: update });
		return { success: true };
	},
	markPaid: async ({ request }) => {
		const data = await request.formData();
		const orderId = data.get('orderId');
		const paymentMethod = data.get('paymentMethod') ?? 'card';

		if (!orderId || typeof orderId !== 'string') {
			return { success: false };
		}

		const db = await getDb();
		const orders = db.collection('orders');
		await orders.updateOne(
			{ _id: new ObjectId(orderId) },
			{
				$set: {
					paymentStatus: 'paid',
					paymentMethod,
					paidAt: new Date(),
					updatedAt: new Date()
				}
			}
		);

		return { success: true };
	}
};
