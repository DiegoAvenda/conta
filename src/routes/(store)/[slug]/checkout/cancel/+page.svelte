<script>
	import { resolve } from '$app/paths';

	let { data } = $props();

	const base = $derived(`/${data.restaurante.slug}`);
</script>

<svelte:head>
	<title>Pago cancelado · {data.restaurante.nombre}</title>
</svelte:head>

<div class="mx-auto flex max-w-lg flex-col items-center p-8 text-center">
	<h1 class="text-3xl font-black tracking-tight">Pago cancelado</h1>
	<p class="mt-2 text-sm text-base-content/70">
		No se realizó ningún cargo. Tu carrito sigue guardado por si quieres intentarlo de nuevo.
	</p>
	<div class="mt-6 flex flex-wrap justify-center gap-3">
		<a href={resolve(`${base}/checkout`)} class="btn btn-primary">Volver al checkout</a>
		<a href={resolve(`${base}/menu`)} class="btn btn-outline">Seguir viendo el menú</a>
	</div>
</div>
