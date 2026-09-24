<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { itemsForStore, subtotalForStore } from '$lib/utils/storeCart.svelte.js';
	import { formatCents, precioFinalConIva } from '$lib/utils/money.js';

	let { data } = $props();

	const slug = $derived(data.restaurante.slug);
	const base = $derived(`/${slug}`);
	const items = $derived(itemsForStore(slug));
	const subtotal = $derived(subtotalForStore(slug));
	const total = $derived(
		items.reduce((sum, item) => sum + precioFinalConIva(item.price) * item.quantity, 0)
	);
	const iva = $derived(total - subtotal);
	const cancelado = $derived(page.url.searchParams.get('cancelled') === '1');
	const loginUrl = $derived(
		`/better-auth/login?callback=${encodeURIComponent(`${base}/checkout`)}`
	);

	let nombre = $state('');
	let telefono = $state('');
	let calle = $state('');
	let numero = $state('');
	let colonia = $state('');
	let referencias = $state('');
	let procesando = $state(false);
	let errorMensaje = $state('');

	$effect(() => {
		if (data.user?.name && !nombre) nombre = data.user.name;
	});

	async function pagar() {
		errorMensaje = '';
		procesando = true;
		try {
			const response = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slug,
					items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
					entrega: { nombre, telefono, calle, numero, colonia, referencias }
				})
			});
			const resultado = await response.json().catch(() => ({}));
			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = loginUrl;
					return;
				}
				errorMensaje = resultado.error ?? 'No se pudo iniciar el pago.';
				return;
			}
			// El carrito NO se limpia aquí: si el pago se cancela en Stripe, el
			// comensal vuelve a /checkout con sus platillos. Se limpia en /profile
			// después del pago exitoso (?from_stripe=yes).
			window.location.replace(resultado.url);
		} catch {
			errorMensaje = 'No se pudo conectar. Revisa tu conexión e intenta de nuevo.';
		} finally {
			procesando = false;
		}
	}
</script>

<svelte:head>
	<title>Checkout · {data.restaurante.nombre}</title>
</svelte:head>

<div class="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
	<h1 class="text-3xl font-black tracking-tight">Finalizar pedido</h1>
	<p class="text-sm text-base-content/70">
		{data.restaurante.nombre} · Entrega a domicilio
	</p>

	{#if cancelado}
		<div class="mt-4 alert text-sm alert-warning shadow-sm">
			<span>Pago cancelado. Tu carrito sigue guardado por si quieres intentarlo de nuevo.</span>
		</div>
	{/if}

	{#if errorMensaje}
		<div class="mt-4 alert text-sm alert-error shadow-sm">
			<span>{errorMensaje}</span>
		</div>
	{/if}

	{#if !data.user}
		<div class="card mt-6 border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body items-center text-center">
				<h2 class="card-title">Inicia sesión para continuar</h2>
				<p class="text-sm text-base-content/70">
					Tu carrito queda guardado; regresas aquí en un momento.
				</p>
				<div class="mt-2 flex gap-3">
					<a href={resolve(loginUrl)} class="btn btn-primary">Iniciar sesión</a>
					<a href={resolve(`${base}/menu`)} class="btn btn-ghost">Seguir viendo el menú</a>
				</div>
			</div>
		</div>
	{:else if items.length === 0}
		<div
			class="mt-6 rounded-3xl border-2 border-dashed border-base-300 bg-base-200/50 p-12 text-center"
		>
			<p class="text-base text-base-content/70">Tu carrito está vacío.</p>
			<a href={resolve(`${base}/menu`)} class="btn mt-4 btn-primary btn-sm">Ver menú</a>
		</div>
	{:else}
		<div class="mt-6 grid items-start gap-6 lg:grid-cols-2">
			<!-- Resumen del pedido -->
			<section class="card border border-base-300 bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-base">Tu pedido</h2>
					<table class="table table-sm">
						<thead>
							<tr>
								<th>Platillo</th>
								<th class="text-right">Importe</th>
							</tr>
						</thead>
						<tbody>
							{#each items as item (item.id)}
								<tr>
									<th>
										<span class="font-normal">{item.quantity} ×</span>
										{item.name}
									</th>
									<td class="text-right">
										{formatCents(precioFinalConIva(item.price) * item.quantity)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<div class="space-y-1.5 border-t border-base-200 pt-3 font-mono text-xs">
						<div class="flex justify-between">
							<span>Subtotal (sin IVA):</span>
							<span>{formatCents(subtotal)}</span>
						</div>
						<div class="flex justify-between text-base-content/70">
							<span>IVA (16%):</span>
							<span>{formatCents(iva)}</span>
						</div>
						<div
							class="flex justify-between border-t border-base-300 pt-2 text-sm font-black text-primary"
						>
							<span>TOTAL (IVA incluido):</span>
							<span>{formatCents(total)}</span>
						</div>
					</div>
				</div>
			</section>

			<!-- Datos de entrega -->
			<section class="card border border-base-300 bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-base">Datos de entrega</h2>
					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold">Nombre</span>
						<input
							type="text"
							bind:value={nombre}
							maxlength="80"
							required
							class="input-bordered input w-full input-sm"
							placeholder="Quién recibe"
						/>
					</label>
					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold">Teléfono</span>
						<input
							type="tel"
							bind:value={telefono}
							maxlength="20"
							required
							class="input-bordered input w-full input-sm"
							placeholder="55 1234 5678"
						/>
					</label>
					<div class="grid grid-cols-3 gap-3">
						<label class="form-control col-span-2">
							<span class="label-text mb-1 text-xs font-semibold">Calle</span>
							<input
								type="text"
								bind:value={calle}
								maxlength="120"
								required
								class="input-bordered input w-full input-sm"
								placeholder="Av. Revolución"
							/>
						</label>
						<label class="form-control">
							<span class="label-text mb-1 text-xs font-semibold">Número</span>
							<input
								type="text"
								bind:value={numero}
								maxlength="20"
								required
								class="input-bordered input w-full input-sm"
								placeholder="123"
							/>
						</label>
					</div>
					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold">Colonia</span>
						<input
							type="text"
							bind:value={colonia}
							maxlength="80"
							required
							class="input-bordered input w-full input-sm"
							placeholder="Centro"
						/>
					</label>
					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold">Referencias (opcional)</span>
						<textarea
							bind:value={referencias}
							maxlength="200"
							rows="2"
							class="textarea-bordered textarea w-full textarea-sm"
							placeholder="Portón negro, entre panadería y farmacia…"></textarea>
					</label>

					<button
						class="btn mt-2 btn-block shadow-md btn-primary"
						onclick={pagar}
						disabled={procesando}
					>
						{procesando ? 'Redirigiendo a Stripe…' : `Pagar ${formatCents(total)}`}
					</button>
					<p class="text-center text-[11px] text-base-content/50">
						Pago seguro con tarjeta vía Stripe · Precios con IVA incluido
					</p>
				</div>
			</section>
		</div>
	{/if}
</div>
