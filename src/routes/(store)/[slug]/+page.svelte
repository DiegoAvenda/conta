<script>
	import { resolve } from '$app/paths';

	let { data } = $props();

	const restaurante = $derived(data.restaurante);
	const base = $derived(`/${restaurante.slug}`);
	const heroDefault = 'https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp';
</script>

<svelte:head>
	<title>{restaurante.nombre} · Pedido a domicilio</title>
	{#if restaurante.descripcion}
		<meta name="description" content={restaurante.descripcion} />
	{/if}
</svelte:head>

<div
	class="hero min-h-[70vh]"
	style:background-image={`url(${restaurante.heroImageUrl ?? heroDefault})`}
	style:background-size="cover"
	style:background-position="center"
>
	<div class="hero-overlay"></div>
	<div class="hero-content text-center text-neutral-content">
		<div class="max-w-md">
			{#if !restaurante.deliveryEnabled}
				<span class="mb-3 badge badge-warning">Atención en el local</span>
			{/if}
			<h1 class="mb-5 text-5xl font-bold drop-shadow">{restaurante.nombre}</h1>
			{#if restaurante.descripcion}
				<p class="mb-5 drop-shadow">{restaurante.descripcion}</p>
			{/if}
			<div class="flex flex-wrap justify-center gap-3">
				<a href={resolve(`${base}/menu`)} class="btn btn-primary">Ver menú</a>
				<a
					href={resolve(`${base}/profile`)}
					class="btn border-white bg-white/10 btn-outline text-white backdrop-blur"
				>
					Mis pedidos
				</a>
			</div>
		</div>
	</div>
</div>

<section class="mx-auto max-w-4xl px-6 py-10">
	<div class="grid gap-4 sm:grid-cols-3">
		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 text-center shadow-sm">
			<p class="text-2xl">🍔</p>
			<p class="mt-1 text-sm font-semibold">Menú en línea</p>
			<p class="text-xs text-base-content/60">Precios con IVA incluido</p>
		</div>
		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 text-center shadow-sm">
			<p class="text-2xl">💳</p>
			<p class="mt-1 text-sm font-semibold">Pago seguro</p>
			<p class="text-xs text-base-content/60">Tarjeta vía Stripe</p>
		</div>
		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 text-center shadow-sm">
			<p class="text-2xl">🛵</p>
			<p class="mt-1 text-sm font-semibold">
				{restaurante.deliveryEnabled ? 'A domicilio' : 'Solo en el local'}
			</p>
			<p class="text-xs text-base-content/60">{restaurante.direccion ?? 'En tu puerta'}</p>
		</div>
	</div>
</section>
