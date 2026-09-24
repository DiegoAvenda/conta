import { redirect, error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getDb } from '$lib/server/db.js';
import { obtenerRestaurantePorSlug } from '$lib/server/businessProfile.js';

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		redirect(303, `/better-auth/login?callback=/${params.slug}/profile`);
	}

	const perfil = await obtenerRestaurantePorSlug(params.slug);
	if (!perfil) {
		error(404, 'No encontramos ese restaurante en contaco.store.');
	}

	const db = await getDb();
	const userId = locals.user.id;

	const condicionesCliente = [{ 'buyer.userId': userId }, { customerId: userId }];
	if (ObjectId.isValid(userId)) {
		// Pedidos legados de la app de comensales guardaban customerId como ObjectId
		condicionesCliente.push({ customerId: new ObjectId(userId) });
	}

	const rawOrders = await db
		.collection('orders')
		.find({
			$and: [
				{ $or: condicionesCliente },
				{
					$or: [
						{ sellerId: perfil.userId },
						// Legado: las órdenes de la app btc no traían sellerId
						// (existía una sola tienda). Tras correr migrate:legacy desaparecen.
						{ sellerId: { $exists: false } }
					]
				}
			]
		})
		.sort({ createdAt: -1 })
		.limit(50)
		.toArray();

	const orders = rawOrders.map((order) => ({
		_id: order._id.toString(),
		items: (order.items ?? []).map((item) => ({
			name: item.name ?? 'Producto',
			quantity: item.quantity ?? 1
		})),
		totalPrice: Number(order.totalPrice ?? 0),
		status: order.status ?? (order.delivered ? 'completed' : 'pending'),
		channel: order.channel ?? null,
		createdAt: order.createdAt
			? new Date(order.createdAt).toLocaleString('es-MX', {
					dateStyle: 'medium',
					timeStyle: 'short',
					timeZone: 'America/Mexico_City'
				})
			: ''
	}));

	return { orders };
};
