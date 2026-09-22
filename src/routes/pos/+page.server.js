import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import { registrarVentaDesdePedido } from '$lib/server/ventas.js';
import { parseMoneyToCents } from '$lib/server/money.js';
import { R2_PUBLIC_URL } from '$env/static/private';

export async function load({ locals }) {
	if (!locals.user) {
		return redirect(302, '/better-auth/login');
	}

	const db = await getDb();

	const items = await db
		.collection('menuItems')
		.find({ userId: locals.user.id })
		.sort({ category: 1, createdAt: 1 })
		.toArray();

	return {
		items: items.map((item) => ({
			...item,
			_id: item._id.toString(),
			imageUrl: item.imageKey ? `${R2_PUBLIC_URL}/${item.imageKey}` : null
		}))
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false };
		}

		const data = await request.formData();
		const rawCart = data.get('cart');
		const paymentMethod = data.get('paymentMethod')?.toString() ?? 'cash';
		const customerName = data.get('customerName')?.toString().trim() ?? 'Walk-in Customer';
		const tableNumber = data.get('tableNumber');
		const customerPhone = data.get('customerPhone')?.toString().trim() ?? null;
		const rawDiscount = data.get('discount') ?? '0';
		const rawTaxRate = data.get('taxRate') ?? '16';

		if (!['cash', 'card'].includes(paymentMethod)) {
			return fail(400, { error: 'Método de pago inválido.' });
		}

		let discountCents;
		let taxRate;
		try {
			discountCents = parseMoneyToCents(rawDiscount, { field: 'Descuento', min: 0 });
			taxRate = Number(rawTaxRate);
			if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
				throw new Error('La tasa de IVA debe estar entre 0 y 100.');
			}
		} catch (error) {
			return fail(400, { error: error.message });
		}
		if (tableNumber !== null && tableNumber !== undefined && tableNumber !== '') {
			const parsedTable = Number(tableNumber);
			if (!Number.isInteger(parsedTable) || parsedTable <= 0) {
				return fail(400, { error: 'Número de mesa inválido.' });
			}
		}

		let cart;
		try {
			cart = rawCart ? JSON.parse(rawCart) : [];
		} catch {
			return fail(400, { error: 'El carrito no es válido.' });
		}

		if (!Array.isArray(cart) || cart.length === 0) {
			return fail(400, { error: 'Debes agregar al menos un producto.' });
		}

		try {
			const db = await getDb();
			const menuItems = await db.collection('menuItems').find({ userId: locals.user.id }).toArray();
			const menuById = new Map(menuItems.map((item) => [item._id.toString(), item]));

			const normalizedItems = cart
				.map((entry) => {
					const itemId = entry.id ?? entry._id?.toString?.() ?? entry.menuItemId;
					const product = menuById.get(String(itemId));
					if (!product) {
						throw new Error(`Producto no encontrado en el menú: ${itemId}`);
					}

					const quantity = Number(entry.quantity ?? 1);
					if (!Number.isInteger(quantity) || quantity <= 0) {
						throw new Error(`Cantidad inválida para ${product.name}`);
					}

					const unitPrice = Number(product.price ?? 0);
					if (!Number.isInteger(unitPrice) || unitPrice < 0) {
						throw new Error(`Precio inválido para ${product.name}`);
					}
					const subtotal = unitPrice * quantity;

					return {
						menuItemId: product._id,
						itemId: product._id.toString(),
						name: product.name,
						quantity,
						price: unitPrice,
						subtotal,
						category: product.category ?? null
					};
				})
				.filter(Boolean);

			const subtotalCents = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
			const discountableSubtotal = Math.max(subtotalCents - discountCents, 0);
			const ivaCents = Math.round((discountableSubtotal * taxRate) / 100);
			const totalPrice = discountableSubtotal + ivaCents;
			const order = {
				userId: locals.user.id,
				sellerId: locals.user.id,
				buyer: {
					kind: 'guest',
					userId: null,
					name: customerName,
					phone: customerPhone ?? null,
					tableNumber: tableNumber ?? null,
					deliveryAddress: null
				},
				items: normalizedItems,
				subtotal: subtotalCents,
				discount: discountCents,
				taxRate,
				iva: ivaCents,
				totalPrice,
				status: 'pending',
				channel: 'restaurant',
				orderType: 'dine-in',
				paymentStatus: paymentMethod === 'card' ? 'paid' : 'unpaid',
				paymentMethod,
				customerName,
				tableNumber,
				createdAt: new Date(),
				preparingAt: null,
				readyAt: null,
				completedAt: null,
				delivered: false,
				prepared: false
			};

			const inserted = await db.collection('orders').insertOne(order);
			order._id = inserted.insertedId;

			if (order.paymentStatus === 'paid') {
				await registrarVentaDesdePedido(locals.user.id, order);
			}

			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(400, { error: error.message || 'No se pudo crear la orden.' });
		}
	}
};
