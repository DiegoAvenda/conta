import { getDb } from '$lib/server/db.js';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const rawCart = data.get('cart');
		const items = rawCart ? JSON.parse(rawCart) : [];
		const totalPrice = data.get('totalPrice');

		try {
			const db = await getDb();
			const orders = db.collection('orders');
			await orders.insertOne({
				//meseroId TODO
				items,
				totalPrice,
				createdAt: new Date(),
				delivered: false,
				prepared: false
			});
		} catch (error) {
			console.log(error);
		}
	}
};
