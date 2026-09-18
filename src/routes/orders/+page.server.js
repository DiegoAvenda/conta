import { getDb } from '$lib/server/db.js';
import { ObjectId } from 'mongodb';

export const load = async () => {
	try {
		const db = await getDb();
		const ordersCollection = db.collection('orders');
		const rawOrders = await ordersCollection
			.find({ prepared: false }, { sort: { createdAt: -1 } })
			.toArray();

		const orders = rawOrders.map((order) => ({
			...order,
			_id: order._id.toString(),
			customerId: order.customerId.toString(),
			createdAt: order.createdAt.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			})
		}));

		return {
			orders
		};
	} catch (e) {
		console.log(e);
	}
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const orderId = data.get('orderId');
		console.log('order id: ', orderId);
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
	}
};
