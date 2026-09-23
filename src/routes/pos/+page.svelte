<script>
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import {
		cart,
		addToCart,
		substractFromCart,
		removeFromCart,
		clearCart
	} from '$lib/utils/cart.svelte.js';

	let { data, form } = $props();

	let tableNumber = $state('');
	let customerName = $state('');
	let orderType = $state('dine-in'); // 'dine-in' = en mesa; 'takeout' = para llevar
	let paymentMethod = $state('cash');
	let procesando = $state(false);
	let mensajeExito = $state('');

	let subtotalCents = $derived(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
	let ivaCents = $derived(Math.round(subtotalCents * 0.16));
	let totalCents = $derived(subtotalCents + ivaCents);

	const formatMoney = (cents) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2
		}).format((cents ?? 0) / 100);
</script>

<svelte:head>
	<title>Contaco · Punto de Venta (POS)</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
	<!-- Encabezado -->
	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-black tracking-tight">Punto de Venta</h1>
			<p class="text-sm text-base-content/70">
				Registra pedidos de comensales en el restaurante y cocina.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<a href={resolve('/configure-menu')} class="btn btn-outline btn-sm"> Configurar Menú </a>
			<a href={resolve('/orders')} class="btn btn-neutral btn-sm"> Ver Comandas / Cocina </a>
		</div>
	</div>

	{#if form?.error}
		<div class="mb-4 alert text-sm alert-error shadow-sm">
			<span>{form.error}</span>
		</div>
	{/if}

	{#if mensajeExito}
		<div class="mb-4 alert text-sm alert-success shadow-sm">
			<span>{mensajeExito}</span>
		</div>
	{/if}

	<!-- Layout: Menú a la izquierda (o arriba) y Comanda/Ticket a la derecha -->
	<div class="grid items-start gap-6 lg:grid-cols-12">
		<!-- Catálogo del Menú (8 cols) -->
		<section class="space-y-4 lg:col-span-7 xl:col-span-8">
			{#if data.items.length === 0}
				<div
					class="rounded-3xl border-2 border-dashed border-base-300 bg-base-200/50 p-12 text-center"
				>
					<p class="text-base text-base-content/70">No hay productos registrados en el menú aún.</p>
					<a href={resolve('/configure-menu')} class="btn mt-4 btn-primary btn-sm">
						+ Agregar tu primer platillo
					</a>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{#each data.items as product (product._id)}
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
								<div class="flex items-start justify-between gap-2">
									<h2 class="card-title text-base leading-tight font-bold">{product.name}</h2>
									{#if product.category}
										<span class="badge badge-ghost badge-sm text-[11px]">{product.category}</span>
									{/if}
								</div>
								{#if product.description}
									<p class="line-clamp-2 text-xs text-base-content/60">{product.description}</p>
								{/if}
								<div class="mt-3 card-actions items-center justify-between">
									<span class="text-lg font-black text-primary">
										{formatMoney(product.price)}
									</span>
									<button
										type="button"
										onclick={() => addToCart(product)}
										class="btn btn-primary btn-sm"
									>
										+ Agregar
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Ticket / Comanda / Carrito (5 cols en lg) -->
		<aside class="sticky top-6 lg:col-span-5 xl:col-span-4">
			<div class="space-y-5 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-lg">
				<div class="flex items-center justify-between border-b border-base-200 pb-3">
					<div class="flex items-center gap-2">
						<span class="text-xl">🧾</span>
						<h2 class="text-lg font-black">Comanda Actual</h2>
					</div>
					{#if cart.length > 0}
						<button
							type="button"
							onclick={() => clearCart()}
							class="cursor-pointer text-xs text-error hover:underline"
						>
							Vaciar comanda
						</button>
					{/if}
				</div>

				{#if cart.length === 0}
					<div class="py-12 text-center text-sm text-base-content/50">
						<p>No has agregado ningún platillo a esta comanda.</p>
						<p class="mt-1 text-xs">
							Haz clic en <strong>+ Agregar</strong> en cualquiera de los productos.
						</p>
					</div>
				{:else}
					<!-- Lista de productos en comanda -->
					<div class="max-h-72 space-y-3 overflow-y-auto pr-1">
						{#each cart as item (item.id)}
							<div
								class="flex items-center justify-between gap-3 rounded-2xl bg-base-200/60 p-3 text-sm"
							>
								<div class="min-w-0 flex-1">
									<p class="truncate leading-tight font-bold">{item.name}</p>
									<p class="text-xs text-base-content/60">
										{formatMoney(item.price)} c/u
									</p>
								</div>
								<div class="flex items-center gap-2">
									<button
										type="button"
										onclick={() => substractFromCart(item.id)}
										class="btn btn-circle border border-base-300 btn-ghost btn-xs"
										aria-label="Restar uno"
									>
										-
									</button>
									<span class="w-6 text-center font-bold">{item.quantity}</span>
									<button
										type="button"
										onclick={() => addToCart(item)}
										class="btn btn-circle border border-base-300 btn-ghost btn-xs"
										aria-label="Sumar uno"
									>
										+
									</button>
									<span class="ml-2 w-16 text-right text-xs font-black">
										{formatMoney(item.price * item.quantity)}
									</span>
									<button
										type="button"
										onclick={() => removeFromCart(item.id)}
										class="btn btn-circle btn-ghost text-error/60 btn-xs hover:text-error"
										aria-label="Eliminar producto"
									>
										✕
									</button>
								</div>
							</div>
						{/each}
					</div>

					<!-- Formulario de Pedido / Cobro -->
					<form
						method="POST"
						use:enhance={() => {
							procesando = true;
							mensajeExito = '';
							return async ({ result, update }) => {
								await update();
								procesando = false;
								if (result.type === 'success') {
									clearCart();
									tableNumber = '';
									customerName = '';
									orderType = 'dine-in';
									mensajeExito = '¡Orden registrada y enviada a cocina!';
									setTimeout(() => (mensajeExito = ''), 4000);
								}
							};
						}}
						class="space-y-4 border-t border-base-200 pt-4"
					>
						<input name="cart" type="hidden" value={JSON.stringify(cart)} />
						<input name="discount" type="hidden" value="0" />
						<input name="taxRate" type="hidden" value="16" />

						<div class="flex gap-2">
							<button
								type="button"
								onclick={() => (orderType = 'dine-in')}
								class="btn flex-1 btn-sm {orderType === 'dine-in' ? 'btn-primary' : 'btn-outline'}"
							>
								🍽️ En mesa
							</button>
							<button
								type="button"
								onclick={() => (orderType = 'takeout')}
								class="btn flex-1 btn-sm {orderType === 'takeout' ? 'btn-primary' : 'btn-outline'}"
							>
								🥡 Para llevar
							</button>
						</div>
						<input name="orderType" type="hidden" value={orderType} />

						<div class="grid grid-cols-2 gap-3">
							<label class="form-control">
								<span class="label-text mb-1 text-xs font-semibold">Mesa (opcional)</span>
								<input
									name="tableNumber"
									type="number"
									min="1"
									placeholder="Ej. 4"
									bind:value={tableNumber}
									class="input-bordered input w-full input-sm"
								/>
							</label>

							<label class="form-control">
								<span class="label-text mb-1 text-xs font-semibold">Cliente / Comensal</span>
								<input
									name="customerName"
									type="text"
									placeholder="Comensal local"
									bind:value={customerName}
									class="input-bordered input w-full input-sm"
								/>
							</label>
						</div>

						<label class="form-control">
							<span class="label-text mb-1 text-xs font-semibold">Método de Cobro</span>
							<select
								name="paymentMethod"
								bind:value={paymentMethod}
								class="select-bordered select w-full select-sm"
							>
								<option value="cash">Efectivo</option>
								<option value="card">Tarjeta / Terminal</option>
							</select>
						</label>

						<!-- Resumen de Totales -->
						<div class="space-y-1.5 rounded-2xl bg-base-200/80 p-4 font-mono text-xs">
							<div class="flex justify-between">
								<span>Subtotal (sin IVA):</span>
								<span>{formatMoney(subtotalCents)}</span>
							</div>
							<div class="flex justify-between text-base-content/70">
								<span>IVA (16%):</span>
								<span>{formatMoney(ivaCents)}</span>
							</div>
							<div
								class="flex justify-between border-t border-base-300 pt-2 text-sm font-black text-primary"
							>
								<span>TOTAL:</span>
								<span>{formatMoney(totalCents)}</span>
							</div>
						</div>

						<button
							type="submit"
							disabled={procesando || cart.length === 0}
							class="btn btn-block shadow-md btn-primary"
						>
							{procesando ? 'Guardando pedido...' : `Cobrar ${formatMoney(totalCents)}`}
						</button>
					</form>
				{/if}
			</div>
		</aside>
	</div>
</div>
