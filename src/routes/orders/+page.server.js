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
	const status = url.searchParams.get('status') ?? 'pending';
	const query =
		status === 'prepared'
			? { prepared: true, delivered: false }
			: status === 'delivered'
				? { delivered: true }
				: { prepared: false, delivered: false };

	try {
		const db = await getDb();
		const ordersCollection = db.collection('orders');
		const rawOrders = await ordersCollection.find(query, { sort: { createdAt: -1 } }).toArray();

		const orders = rawOrders.map((order) => ({
			...order,
			_id: order._id.toString(),
			customerId: order.customerId?.toString?.() ?? order.customerId,
			createdAt: formatTime(order.createdAt),
			preparedAt: formatTime(order.preparedAt),
			deliveredAt: formatTime(order.deliveredAt)
		}));

		return {
			orders,
			selectedStatus: status
		};
	} catch (e) {
		console.log(e);
		return {
			orders: [],
			selectedStatus: status
		};
	}
};

export const actions = {
	markPrepared: async ({ request }) => {
		const data = await request.formData();
		const orderId = data.get('orderId');
		const objectId = new ObjectId(orderId);

		try {
			const db = await getDb();
			const orders = db.collection('orders');
			const filter = { _id: objectId };
			const updateDoc = {
				$set: {
					prepared: true,
					preparedAt: new Date()
				}
			};

			await orders.updateOne(filter, updateDoc);
		} catch (error) {
			console.log(error);
		}
	},
	markDelivered: async ({ request }) => {
		const data = await request.formData();
		const orderId = data.get('orderId');
		const objectId = new ObjectId(orderId);

		try {
			const db = await getDb();
			const orders = db.collection('orders');
			const filter = { _id: objectId };
			const updateDoc = {
				$set: {
					delivered: true,
					deliveredAt: new Date()
				}
			};

			await orders.updateOne(filter, updateDoc);
		} catch (error) {
			console.log(error);
		}
	}
};
