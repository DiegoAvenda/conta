<script>
	import { onMount } from 'svelte';
	import StoreNavbar from '$lib/components/store/StoreNavbar.svelte';
	import StoreFooter from '$lib/components/store/StoreFooter.svelte';
	import { hidratarStoreCart } from '$lib/utils/storeCart.svelte.js';

	let { children, data } = $props();

	// Restaura el carrito guardado en sessionStorage después de la hidratación
	// (el SSR siempre pinta carrito vacío, así no hay mismatch).
	onMount(() => hidratarStoreCart());
</script>

<svelte:head>
	<title>{data.restaurante.nombre} · contaco</title>
</svelte:head>

<StoreNavbar restaurante={data.restaurante} user={data.user} />
{@render children()}
<StoreFooter restaurante={data.restaurante} />
