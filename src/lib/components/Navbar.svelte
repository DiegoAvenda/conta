<script>
	import { resolve } from '$app/paths';

	let { user = null } = $props();
</script>

<header
	class="navbar sticky top-0 z-50 border-b border-base-200 bg-base-100 px-4 shadow-xs sm:px-6"
>
	<!-- Navbar Start: Logo + Menú Móvil -->
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
				class="menu dropdown-content z-50 mt-3 w-64 menu-sm rounded-2xl border border-base-200 bg-base-100 p-3 shadow-xl"
			>
				{#if user}
					<li class="menu-title text-xs font-bold tracking-wider text-primary uppercase">
						Operación Restaurante
					</li>
					<li><a href={resolve('/pos')}>🧾 Punto de Venta (POS)</a></li>
					<li><a href={resolve('/orders')}>🍳 Comandas / Cocina</a></li>
					<li><a href={resolve('/configure-menu')}>📋 Menú del Negocio</a></li>

					<li class="mt-2 menu-title text-xs font-bold tracking-wider text-primary uppercase">
						Finanzas y SAT
					</li>
					<li><a href={resolve('/dashboard')}>📊 Dashboard General</a></li>
					<li><a href={resolve('/ventas')}>💵 Registro de Ventas</a></li>
					<li><a href={resolve('/egresos')}>📑 Gastos del negocio</a></li>
					<li><a href={resolve('/sat-monthly')}>🏛️ Cierre Mensual SAT (RESICO)</a></li>
				{:else}
					<li><a href={resolve('/')}>Inicio</a></li>
					<li><a href={resolve('/inscripcion')}>Guía de Inscripción SAT</a></li>
					<li><a href={resolve('/questions')}>Cuestionario Fiscal</a></li>
				{/if}
			</ul>
		</div>

		<a
			href={resolve(user ? '/dashboard' : '/')}
			class="flex items-center gap-1 text-xl font-bold tracking-tight"
		>
			<span>contaco</span><span class="font-black text-primary">.</span>
		</a>
	</div>

	<!-- Navbar Center: Desktop Navigation -->
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal gap-1 px-1 text-sm font-medium">
			{#if user}
				<li><a href={resolve('/pos')} class="rounded-xl">POS</a></li>
				<li><a href={resolve('/orders')} class="rounded-xl">Comandas</a></li>
				<li><a href={resolve('/configure-menu')} class="rounded-xl">Menú</a></li>

				<li>
					<details>
						<summary class="rounded-xl">Finanzas & SAT</summary>
						<ul class="z-50 w-56 rounded-2xl border border-base-200 bg-base-100 p-2 shadow-lg">
							<li><a href={resolve('/dashboard')}>Dashboard</a></li>
							<li><a href={resolve('/ventas')}>Registro de Ventas</a></li>
							<li><a href={resolve('/egresos')}>Gastos del negocio</a></li>
							<li>
								<a href={resolve('/sat-monthly')} class="font-bold text-primary"
									>Cierre SAT RESICO</a
								>
							</li>
						</ul>
					</details>
				</li>
			{:else}
				<li><a href={resolve('/')} class="rounded-xl">Inicio</a></li>
				<li><a href={resolve('/inscripcion')} class="rounded-xl">Guía SAT</a></li>
				<li><a href={resolve('/questions')} class="rounded-xl">Diagnóstico Fiscal</a></li>
			{/if}
		</ul>
	</div>

	<!-- Navbar End: Autenticación / Perfil -->
	<div class="navbar-end gap-2">
		{#if user}
			<div class="flex items-center gap-2">
				<span
					class="hidden max-w-[140px] truncate font-mono text-xs text-base-content/70 sm:inline-block"
				>
					{user.name || user.email}
				</span>
				<a href={resolve('/better-auth')} class="btn rounded-xl btn-ghost btn-sm"> Mi Cuenta </a>
			</div>
		{:else}
			<a href={resolve('/better-auth/login')} class="btn rounded-xl px-4 btn-primary btn-sm">
				Iniciar Sesión
			</a>
		{/if}
	</div>
</header>
