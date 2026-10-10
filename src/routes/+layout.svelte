<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { initLocale } from '$lib/i18n/locale.svelte.js';
	import { page } from '$app/state';

	let { children, data } = $props();

	initLocale(data.locale);

	// La tienda del comensal (contaco.store/<slug>, grupo de rutas (store)) tiene
	// su propio Navbar/Footer con carrito; el Navbar del dueño solo aplica al
	// panel de restaurantero y al sitio institucional.
	const enTienda = $derived(page.route.id?.startsWith('/(store)') ?? false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if !enTienda}
	<Navbar user={data.user} />
{/if}
{@render children()}
{#if !enTienda}
	<Footer />
{/if}
