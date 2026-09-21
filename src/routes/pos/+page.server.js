import { getDb } from '$lib/server/db.js';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const rawCart = data.get('cart');
		const items = rawCart ? JSON.parse(rawCart) : [];
		const totalPrice = data.get('totalPrice');
		const paymentMethod = data.get('paymentMethod') ?? 'cash';

		try {
			const db = await getDb();
			const orders = db.collection('orders');
			const isPaid = paymentMethod === 'card';

			await orders.insertOne({
				//meseroId TODO
				items,
				totalPrice,
				status: 'pending',
				channel: 'restaurant',
				orderType: 'dine-in',
				paymentStatus: isPaid ? 'paid' : 'unpaid',
				paymentMethod,
				customerName: 'Walk-in Customer',
				createdAt: new Date(),
				preparingAt: null,
				readyAt: null,
				completedAt: null,
				delivered: false,
				prepared: false
			});
		} catch (error) {
			console.log(error);
		}
	}
};
