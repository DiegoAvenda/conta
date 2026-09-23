import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import { registrarVentaDesdePedido } from '$lib/server/ventas.js';
import { registrarMovimiento, MOVIMIENTO_TIPOS } from '$lib/server/movimientos.js';
import { ObjectId } from 'mongodb';

// TODO (MVP): devoluciones/cancelaciones quedan fuera del alcance por ahora —
// se asume que no hay devoluciones. Para el MVP el monto de un reembolso debe
// descontar la base SIN IVA (no el total cobrado), para no subestimar el ingreso.
const baseSinIva = (order) =>
	Math.max(Number(order?.subtotal ?? order?.totalPrice ?? 0) - Number(order?.discount ?? 0), 0);

const formatTime = (value) => {
	if (!value) return null;
	return new Date(value).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
};

export const load = async ({ url, locals }) => {
	if (!locals.user) {
		return redirect(302, '/better-auth/login');
	}

	const status = url.searchParams.get('status') ?? 'pending';
	const channel = url.searchParams.get('channel');
	const orderType = url.searchParams.get('orderType');
	const paymentStatus = url.searchParams.get('paymentStatus');

	const query = { sellerId: locals.user.id };

	if (status !== 'all') query.status = status;
	if (channel) query.channel = channel; // 'delivery' o 'restaurant'
	if (orderType) query.orderType = orderType; // 'dine-in' o 'takeout'
	if (paymentStatus) query.paymentStatus = paymentStatus; // 'paid' o 'unpaid'

	try {
		const db = await getDb();
		const ordersCollection = db.collection('orders');
		const rawOrders = await ordersCollection.find(query, { sort: { createdAt: -1 } }).toArray();

		const orders = rawOrders.map((order) => {
			const buyer = order.buyer ?? {};
			const customerName = buyer.name ?? order.customerName ?? 'Walk-in Customer';
			const tableNumber = buyer.tableNumber ?? order.tableNumber ?? null;
			const customerId = buyer.userId ?? order.customerId ?? null;

			return {
				...order,
				_id: order._id.toString(),
				customerId: customerId?.toString?.() ?? customerId,
				customerName,
				tableNumber,
				createdAt: formatTime(order.createdAt),
				preparingAt: formatTime(order.preparingAt),
				readyAt: formatTime(order.readyAt),
				completedAt: formatTime(order.completedAt)
			};
		});

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
	updateStatus: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false };
		}

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
			update.paymentStatus = 'paid';
		}

		const existingOrder = await orders.findOne({
			_id: new ObjectId(orderId),
			sellerId: locals.user.id
		});
		if (!existingOrder) {
			return { success: false };
		}

		await orders.updateOne(
			{ _id: new ObjectId(orderId), sellerId: locals.user.id },
			{ $set: update }
		);

		if (nextStatus === 'completed') {
			await registrarVentaDesdePedido(locals.user.id, {
				...existingOrder,
				...update,
				paymentMethod: existingOrder.paymentMethod ?? 'cash',
				completedAt: update.completedAt
			});
		}

		return { success: true };
	},
	markPaid: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false };
		}

		const data = await request.formData();
		const orderId = data.get('orderId');
		const paymentMethod = data.get('paymentMethod') ?? 'card';

		if (!orderId || typeof orderId !== 'string') {
			return { success: false };
		}

		const db = await getDb();
		const orders = db.collection('orders');
		const existingOrder = await orders.findOne({
			_id: new ObjectId(orderId),
			sellerId: locals.user.id
		});
		if (!existingOrder) {
			return { success: false };
		}

		await orders.updateOne(
			{ _id: new ObjectId(orderId), sellerId: locals.user.id },
			{
				$set: {
					paymentStatus: 'paid',
					paymentMethod,
					paidAt: new Date(),
					updatedAt: new Date()
				}
			}
		);

		await registrarVentaDesdePedido(locals.user.id, {
			...existingOrder,
			paymentMethod,
			paymentStatus: 'paid',
			paidAt: new Date(),
			updatedAt: new Date()
		});

		return { success: true };
	},
	refundOrder: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false };
		}

		const data = await request.formData();
		const orderId = data.get('orderId');
		if (!orderId || typeof orderId !== 'string') {
			return { success: false };
		}

		const db = await getDb();
		const orders = db.collection('orders');
		const existingOrder = await orders.findOne({
			_id: new ObjectId(orderId),
			sellerId: locals.user.id
		});
		if (!existingOrder) {
			return { success: false };
		}

		await orders.updateOne(
			{ _id: new ObjectId(orderId), sellerId: locals.user.id },
			{
				$set: {
					status: 'completed',
					paymentStatus: 'refunded',
					refundedAt: new Date(),
					updatedAt: new Date()
				}
			}
		);

		await registrarMovimiento({
			userId: locals.user.id,
			orderId,
			tipo: MOVIMIENTO_TIPOS.DEVOLUCION,
			amount: baseSinIva(existingOrder),
			iva: Number(existingOrder.iva ?? 0),
			paymentMethod: existingOrder.paymentMethod ?? 'cash',
			metadata: { source: 'refundOrder', reason: 'manual-refund' },
			source: 'order'
		});

		return { success: true };
	},
	cancelOrder: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false };
		}

		const data = await request.formData();
		const orderId = data.get('orderId');
		if (!orderId || typeof orderId !== 'string') {
			return { success: false };
		}

		const db = await getDb();
		const orders = db.collection('orders');
		const existingOrder = await orders.findOne({
			_id: new ObjectId(orderId),
			sellerId: locals.user.id
		});
		if (!existingOrder) {
			return { success: false };
		}

		await orders.updateOne(
			{ _id: new ObjectId(orderId), sellerId: locals.user.id },
			{ $set: { status: 'cancelled', paymentStatus: 'cancelled', updatedAt: new Date() } }
		);

		await registrarMovimiento({
			userId: locals.user.id,
			orderId,
			tipo: MOVIMIENTO_TIPOS.CANCELACION,
			amount: baseSinIva(existingOrder),
			iva: Number(existingOrder.iva ?? 0),
			paymentMethod: existingOrder.paymentMethod ?? 'cash',
			metadata: { source: 'cancelOrder', reason: 'manual-cancel' },
			source: 'order'
		});

		return { success: true };
	}
};
