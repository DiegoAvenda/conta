import { browser } from '$app/environment';

// Carrito del comensal en la tienda pública. Va en su propio módulo para no
// tocar el carrito del POS ($lib/utils/cart.svelte.js), que es una página de uso
// interno con otra firma. El carrito se asocia a un slug: si el usuario cambia
// de restaurante, los platillos del anterior se descartan.
//
// Se persiste en sessionStorage porque "Iniciar sesión" es una navegación
// completa y el carrito debe sobrevivir el viaje al login y de vuelta.
const CLAVE = 'contaco:storeCart';

export const storeCart = $state({ slug: null, items: [] });

function persistir() {
	if (!browser) return;
	try {
		sessionStorage.setItem(CLAVE, JSON.stringify({ slug: storeCart.slug, items: storeCart.items }));
	} catch {
		// sessionStorage puede no estar disponible (modo privado estricto); el carrito
		// sigue funcionando en memoria, solo no sobrevive recargas.
	}
}

// Se llama desde el layout de la tienda (onMount) para no chocar con la
// hidratación del SSR: el servidor siempre pinta el carrito vacío.
export function hidratarStoreCart() {
	if (!browser || storeCart.slug !== null) return;
	try {
		const guardado = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null');
		if (guardado && Array.isArray(guardado.items)) {
			storeCart.slug = guardado.slug ?? null;
			storeCart.items = guardado.items;
		}
	} catch {
		// datos corruptos: se ignora y se empieza con el carrito vacío
	}
}

export function addToStoreCart(slug, product) {
	const id = String(product?._id ?? product?.id ?? '');
	if (!id || !slug) return;

	if (storeCart.slug !== slug) {
		storeCart.slug = slug;
		storeCart.items = [];
	}

	const existing = storeCart.items.find((item) => item.id === id);
	if (existing) {
		existing.quantity += 1;
		persistir();
		return;
	}

	storeCart.items.push({
		id,
		name: product.name,
		// Precio base en centavos SIN IVA (igual que en el POS); la UI muestra el final.
		price: Number(product.price ?? 0),
		imageUrl: product.imageUrl ?? null,
		quantity: 1
	});
	persistir();
}

export function substractFromStoreCart(productId) {
	const id = String(productId);
	const existing = storeCart.items.find((item) => item.id === id);
	if (!existing) return;
	existing.quantity -= 1;
	if (existing.quantity <= 0) {
		removeFromStoreCart(id);
		return;
	}
	persistir();
}

export function removeFromStoreCart(productId) {
	const index = storeCart.items.findIndex((item) => item.id === String(productId));
	if (index !== -1) {
		storeCart.items.splice(index, 1);
		persistir();
	}
}

export function clearStoreCart() {
	storeCart.items = [];
	persistir();
}

// Solo devuelve artículos si el carrito pertenece a esta tienda.
export function itemsForStore(slug) {
	return storeCart.slug === slug ? storeCart.items : [];
}

// Subtotal sin IVA en centavos.
export function subtotalForStore(slug) {
	return itemsForStore(slug).reduce((sum, item) => sum + item.price * item.quantity, 0);
}
