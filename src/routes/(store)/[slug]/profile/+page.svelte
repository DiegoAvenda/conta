<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { clearStoreCart } from '$lib/utils/storeCart.svelte.js';
	import { formatCents } from '$lib/utils/money.js';

	let { data } = $props();

	const base = $derived(`/${data.restaurante.slug}`);
	const fromStripe = $derived(page.url.searchParams.get('from_stripe') === 'yes');

	const estados = {
		pending: { label: 'Pendiente', badge: 'badge-warning' },
		preparing: { label: 'En preparación', badge: 'badge-info' },
		ready: { label: 'Listo', badge: 'badge-secondary' },
		completed: { label: 'Completado', badge: 'badge-success' },
		cancelled: { label: 'Cancelado', badge: 'badge-error' }
	};

	// Tras un pago exitoso de Stripe el pedido ya está en el historial:
	// el carrito se convirtió en orden y ya no debe seguir visible.
	$effect(() => {
		if (fromStripe) clearStoreCart();
	});
</script>

<svelte:head>
	<title>Mis pedidos · {data.restaurante.nombre}</title>
</svelte:head>

<div class="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
	<h1 class="text-3xl font-black tracking-tight">Mis pedidos</h1>
	<p class="text-sm text-base-content/70">{data.restaurante.nombre}</p>

	{#if fromStripe}
		<div class="mt-4 alert text-sm alert-success shadow-sm">
			<span>¡Pago realizado! Tu pedido ya fue enviado al restaurante. 💚</span>
		</div>
	{/if}

	{#if data.orders.length === 0}
		<div
			class="mt-6 rounded-3xl border-2 border-dashed border-base-300 bg-base-200/50 p-12 text-center"
		>
			<p class="text-base text-base-content/70">
				Aún no has hecho pedidos en {data.restaurante.nombre}.
			</p>
			<a href={resolve(`${base}/menu`)} class="btn mt-4 btn-primary btn-sm">Ver menú</a>
		</div>
	{:else}
		<div class="mt-6 space-y-4">
			{#each data.orders as order (order._id)}
				{@const estado = estados[order.status] ?? estados.pending}
				<div class="card border border-base-300 bg-base-100 shadow-sm">
					<div class="card-body p-4">
						<div class="flex items-start justify-between gap-2">
							<div>
								<p class="text-sm font-bold">{order.createdAt}</p>
								<p class="text-xs text-base-content/60">
									{order.channel === 'restaurant' ? 'En el restaurante' : 'A domicilio'}
								</p>
							</div>
							<span class="badge badge-sm {estado.badge}">{estado.label}</span>
						</div>
						<table class="table table-sm">
							<thead>
								<tr>
									<th>Platillo</th>
									<th>Cant.</th>
								</tr>
							</thead>
							<tbody>
								{#each order.items as item, i (i)}
									<tr>
										<th>{item.name}</th>
										<td>{item.quantity}</td>
									</tr>
								{/each}
							</tbody>
						</table>
						<p class="text-right text-sm font-black text-primary">
							Total: {formatCents(order.totalPrice)}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
