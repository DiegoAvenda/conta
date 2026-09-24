<script>
	import { resolve } from '$app/paths';

	let { restaurante } = $props();

	const year = new Date().getFullYear();
	const base = $derived(`/${restaurante.slug}`);
</script>

<footer class="footer bg-neutral p-10 text-neutral-content sm:footer-horizontal">
	<aside class="max-w-xs">
		<p>
			<strong>{restaurante.nombre}</strong><br />
			Pedidos en línea con contaco
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
		<a href={resolve(base)} class="link link-hover">Inicio</a>
		<a href={resolve(`${base}/menu`)} class="link link-hover">Menú</a>
		<a href={resolve(`${base}/profile`)} class="link link-hover">Mis pedidos</a>
	</nav>
	<nav>
		<h6 class="footer-title">contaco</h6>
		<p class="text-sm opacity-70">© {year} {restaurante.nombre}</p>
		<p class="text-sm opacity-70">Todo tu restaurante en un solo ticket.</p>
	</nav>
</footer>
