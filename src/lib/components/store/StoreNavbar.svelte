<script>
	import {
		itemsForStore,
		substractFromStoreCart,
		addToStoreCart
	} from '$lib/utils/storeCart.svelte.js';
	import { resolve } from '$app/paths';
	import { formatCents, precioFinalConIva } from '$lib/utils/money.js';

	let { restaurante, user = null } = $props();

	const base = $derived(`/${restaurante.slug}`);
	const items = $derived(itemsForStore(restaurante.slug));
	const total = $derived(
		items.reduce((sum, item) => sum + precioFinalConIva(item.price) * item.quantity, 0)
	);
	const cantidad = $derived(items.reduce((sum, item) => sum + item.quantity, 0));

	async function cerrarSesion() {
		try {
			await fetch('/api/sign-out', { method: 'POST' });
		} finally {
			window.location.href = base;
		}
	}
</script>

<header class="navbar sticky top-0 z-50 border-b border-base-300 bg-white px-4 shadow-sm sm:px-6">
	<!-- Navbar Start: Logo + menú móvil -->
	<div class="navbar-start gap-2">
		<div class="dropdown">
			<div
				tabindex="0"
				role="button"
				class="btn btn-ghost btn-sm lg:hidden"
				aria-label="Abrir menú"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
			<ul
				tabindex="-1"
				class="menu dropdown-content z-50 mt-3 w-64 menu-sm rounded-2xl border border-base-200 bg-white p-3 shadow-xl ring-1 ring-slate-200/80"
			>
				<li><a href={resolve(base)}>Inicio</a></li>
				<li><a href={resolve(`${base}/menu`)}>🍔 Menú</a></li>
				{#if user}
					<li><a href={resolve(`${base}/profile`)}>📦 Mis pedidos</a></li>
				{/if}
			</ul>
		</div>

		<a
			href={resolve(base)}
			class="flex min-w-0 items-center gap-1 text-xl font-bold tracking-tight"
		>
			<span class="truncate">{restaurante.nombre}</span>
			<span class="font-black text-primary">.</span>
		</a>
	</div>

	<!-- Navbar Center: navegación desktop -->
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal gap-1 px-1 text-sm font-medium">
			<li><a href={resolve(base)} class="rounded-xl">Inicio</a></li>
			<li><a href={resolve(`${base}/menu`)} class="rounded-xl">Menú</a></li>
			{#if user}
				<li><a href={resolve(`${base}/profile`)} class="rounded-xl">Mis pedidos</a></li>
			{/if}
		</ul>
	</div>

	<!-- Navbar End: carrito + sesión -->
	<div class="navbar-end gap-2">
		<!-- Carrito -->
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-circle btn-ghost" aria-label="Ver carrito">
				<div class="indicator">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					{#if cantidad > 0}
						<span class="indicator-item badge badge-sm badge-primary">{cantidad}</span>
					{/if}
				</div>
			</div>
			<div
				tabindex="-1"
				class="dropdown-content card z-50 mt-3 w-80 border border-base-200 bg-base-100 p-4 shadow-xl"
			>
				{#if items.length === 0}
					<p class="py-2 text-center text-sm text-base-content/60">Tu carrito está vacío.</p>
				{:else}
					<div class="max-h-72 space-y-3 overflow-y-auto">
						{#each items as item (item.id)}
							<div class="flex items-center gap-3">
								{#if item.imageUrl}
									<img
										src={item.imageUrl}
										alt={item.name}
										class="h-12 w-12 rounded-xl object-cover"
									/>
								{/if}
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-semibold">{item.name}</p>
									<p class="text-xs text-base-content/60">
										{formatCents(precioFinalConIva(item.price))}
									</p>
								</div>
								<div class="flex items-center gap-1">
									<button
										aria-label="Quitar uno"
										class="btn btn-xs"
										onclick={() => substractFromStoreCart(item.id)}>-</button
									>
									<span class="w-5 text-center text-sm">{item.quantity}</span>
									<button
										aria-label="Agregar uno"
										class="btn btn-xs"
										onclick={() =>
											addToStoreCart(restaurante.slug, {
												_id: item.id,
												name: item.name,
												price: item.price,
												imageUrl: item.imageUrl
											})}>+</button
									>
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-3 flex items-center justify-between border-t border-base-200 pt-3">
						<span class="text-sm font-semibold">Subtotal</span>
						<span class="font-black text-primary">{formatCents(total)}</span>
					</div>
					<p class="mt-1 text-[11px] text-base-content/50">IVA incluido</p>
					<a href={resolve(`${base}/checkout`)} class="btn mt-3 btn-block btn-primary">
						Ir a pagar ({formatCents(total)})
					</a>
				{/if}
			</div>
		</div>

		<!-- Cuenta -->
		{#if user}
			<div class="dropdown dropdown-end">
				<div
					tabindex="0"
					role="button"
					class="btn max-w-40 truncate btn-ghost font-mono text-xs text-base-content/60 btn-sm"
				>
					{user.name || user.email}
				</div>
				<ul
					tabindex="-1"
					class="menu dropdown-content z-50 mt-3 w-52 menu-sm rounded-2xl border border-base-200 bg-white p-3 shadow-xl ring-1 ring-slate-200/80"
				>
					<li><a href={resolve(`${base}/profile`)}>📦 Mis pedidos</a></li>
					<li>
						<button onclick={cerrarSesion}>Cerrar sesión</button>
					</li>
				</ul>
			</div>
		{:else}
			<a
				href={resolve(`/better-auth/login?callback=${encodeURIComponent(base)}`)}
				class="btn rounded-xl px-4 btn-primary btn-sm"
			>
				Iniciar sesión
			</a>
		{/if}
	</div>
</header>
