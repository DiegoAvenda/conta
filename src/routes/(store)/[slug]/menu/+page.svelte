<script>
	import { SvelteMap } from 'svelte/reactivity';
	import { addToStoreCart, itemsForStore } from '$lib/utils/storeCart.svelte.js';
	import { formatCents, precioFinalConIva } from '$lib/utils/money.js';

	let { data } = $props();

	const enCarrito = $derived(itemsForStore(data.restaurante.slug));

	// Agrupa por categoría conservando el orden en que llegaron del servidor.
	const grupos = $derived.by(() => {
		const mapa = new SvelteMap();
		for (const item of data.items) {
			const categoria = item.category || 'General';
			if (!mapa.has(categoria)) mapa.set(categoria, []);
			mapa.get(categoria).push(item);
		}
		return [...mapa.entries()];
	});

	const cantidadEnCarrito = (itemId) => enCarrito.find((item) => item.id === itemId)?.quantity ?? 0;
</script>

<svelte:head>
	<title>Menú · {data.restaurante.nombre}</title>
</svelte:head>

<div class="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
	<header class="mb-6">
		<h1 class="text-3xl font-black tracking-tight">Menú</h1>
		<p class="text-sm text-base-content/70">
			{data.restaurante.nombre} · Precios con IVA incluido
		</p>
	</header>

	{#if !data.restaurante.deliveryEnabled}
		<div class="mb-6 alert text-sm alert-warning shadow-sm">
			<span>Este restaurante no está aceptando pedidos a domicilio en este momento.</span>
		</div>
	{/if}

	{#if data.items.length === 0}
		<div class="rounded-3xl border-2 border-dashed border-base-300 bg-base-200/50 p-12 text-center">
			<p class="text-base text-base-content/70">
				Este restaurante aún no tiene platillos en su menú.
			</p>
		</div>
	{:else}
		{#each grupos as [categoria, productos] (categoria)}
			<section class="mb-10">
				<h2 class="mb-4 text-xl font-black tracking-tight">{categoria}</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{#each productos as product (product._id)}
						<div
							class="card border border-base-300 bg-base-100 shadow-sm transition hover:shadow-md"
						>
							{#if product.imageUrl}
								<figure class="h-40 overflow-hidden bg-base-200">
									<img
										src={product.imageUrl}
										alt={product.name}
										class="h-full w-full object-cover"
									/>
								</figure>
							{/if}
							<div class="card-body p-4">
								<h3 class="card-title text-base leading-tight font-bold">{product.name}</h3>
								{#if product.description}
									<p class="line-clamp-2 text-xs text-base-content/60">{product.description}</p>
								{/if}
								<div class="mt-2 flex items-center justify-between">
									<div>
										<p class="font-black text-primary">
											{formatCents(precioFinalConIva(product.price))}
										</p>
										<p class="text-[11px] text-base-content/50">IVA incluido</p>
									</div>
									<button
										class="btn btn-primary btn-sm"
										disabled={!data.restaurante.deliveryEnabled}
										onclick={() => addToStoreCart(data.restaurante.slug, product)}
									>
										{#if cantidadEnCarrito(product._id) > 0}
											En carrito ({cantidadEnCarrito(product._id)})
										{:else}
											Agregar
										{/if}
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>
