export let cart = $state([]);

export function addToCart(productOrId, optionalProduct) {
	const product = optionalProduct ?? (typeof productOrId === 'object' ? productOrId : null);
	const id = String(product?._id ?? product?.id ?? productOrId ?? '');

	if (!id) return;

	const existing = cart.find((item) => item.id === id || item._id === id);
	if (existing) {
		existing.quantity += 1;
		return;
	}

	if (product) {
		cart.push({
			...product,
			id,
			_id: id,
			quantity: 1
		});
	}
}

export function removeFromCart(productId) {
	const id = String(productId);
	const index = cart.findIndex((item) => item.id === id || item._id === id);
	if (index !== -1) {
		cart.splice(index, 1);
	}
}

export function substractFromCart(productId) {
	const id = String(productId);
	const existing = cart.find((item) => item.id === id || item._id === id);
	if (existing) {
		existing.quantity -= 1;
		if (existing.quantity <= 0) {
			removeFromCart(id);
		}
	}
}

export function clearCart() {
	cart.length = 0;
}
