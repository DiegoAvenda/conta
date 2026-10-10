<script>
	import { resolve } from '$app/paths';
	import { t, i18n } from '$lib/i18n/locale.svelte.js';

	let { restaurante } = $props();

	// Se lee para re-renderizar al cambiar el idioma.
	void i18n.locale;

	const year = new Date().getFullYear();
	const base = $derived(`/${restaurante.slug}`);
</script>

<footer class="footer bg-neutral p-10 text-neutral-content sm:footer-horizontal">
	<aside class="max-w-xs">
		<p>
			<strong>{restaurante.nombre}</strong><br />
			{t('store.onlineOrders')}
		</p>
		{#if restaurante.direccion}
			<p class="mt-2 text-sm opacity-70">📍 {restaurante.direccion}</p>
		{/if}
		{#if restaurante.telefono}
			<p class="text-sm opacity-70">📞 {restaurante.telefono}</p>
		{/if}
	</aside>
	<nav>
		<h6 class="footer-title">{restaurante.nombre}</h6>
		<a href={resolve(base)} class="link link-hover">{t('store.home')}</a>
		<a href={resolve(`${base}/menu`)} class="link link-hover">{t('store.menu')}</a>
		<a href={resolve(`${base}/profile`)} class="link link-hover">{t('store.myOrders')}</a>
	</nav>
	<nav>
		<h6 class="footer-title">contaco</h6>
		<p class="text-sm opacity-70">© {year} {restaurante.nombre}</p>
		<p class="text-sm opacity-70">{t('store.tagline')}</p>
	</nav>
</footer>
