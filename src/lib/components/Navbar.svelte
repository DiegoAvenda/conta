<script>
	import { resolve } from '$app/paths';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import { t, i18n } from '$lib/i18n/locale.svelte.js';

	let { user = null } = $props();
	// Se lee para que el componente se re-renderice al cambiar el idioma.
	void i18n.locale;
</script>

<header class="navbar sticky top-0 z-50 border-b border-base-300 bg-white px-4 shadow-sm sm:px-6">
	<!-- Navbar Start: Logo + Menú Móvil -->
	<div class="navbar-start gap-2">
		<div class="dropdown">
			<div
				tabindex="0"
				role="button"
				class="btn btn-ghost btn-sm lg:hidden"
				aria-label={t('nav.openMenu')}
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
				{#if user}
					<li class="menu-title text-xs font-bold tracking-wider text-primary uppercase">
						{t('nav.opRestaurant')}
					</li>
					<li><a href={resolve('/pos')}>{t('nav.posFull')}</a></li>
					<li><a href={resolve('/orders')}>{t('nav.ordersFull')}</a></li>
					<li><a href={resolve('/configure-menu')}>{t('nav.menuFull')}</a></li>
					<li><a href={resolve('/mi-restaurante')}>{t('nav.myStoreFull')}</a></li>

					<li class="mt-2 menu-title text-xs font-bold tracking-wider text-primary uppercase">
						{t('nav.financeTitle')}
					</li>
					<li><a href={resolve('/dashboard')}>{t('nav.dashboardFull')}</a></li>
					<li><a href={resolve('/egresos')}>{t('nav.expensesFull')}</a></li>
					<li><a href={resolve('/sat-monthly')}>{t('nav.satCloseFull')}</a></li>
				{:else}
					<li><a href={resolve('/')}>{t('nav.home')}</a></li>
					<li><a href={resolve('/inscripcion')}>{t('nav.satGuideFull')}</a></li>
				{/if}
				<li class="mt-2 flex items-center px-3 py-1 lg:hidden"><LanguageToggle compacto /></li>
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
				<li><a href={resolve('/pos')} class="rounded-xl">{t('nav.pos')}</a></li>
				<li><a href={resolve('/orders')} class="rounded-xl">{t('nav.orders')}</a></li>
				<li><a href={resolve('/configure-menu')} class="rounded-xl">{t('nav.menu')}</a></li>
				<li><a href={resolve('/mi-restaurante')} class="rounded-xl">{t('nav.myStore')}</a></li>

				<li>
					<details>
						<summary class="rounded-xl">{t('nav.financeSat')}</summary>
						<ul
							class="z-50 w-56 rounded-2xl border border-base-200 bg-white p-2 shadow-lg ring-1 ring-slate-200/80"
						>
							<li><a href={resolve('/dashboard')}>{t('nav.dashboard')}</a></li>
							<li><a href={resolve('/egresos')}>{t('nav.expenses')}</a></li>
							<li>
								<a href={resolve('/sat-monthly')} class="font-bold text-primary"
									>{t('nav.satClose')}</a
								>
							</li>
						</ul>
					</details>
				</li>
			{:else}
				<li><a href={resolve('/')} class="rounded-xl">{t('nav.home')}</a></li>
				<li><a href={resolve('/inscripcion')} class="rounded-xl">{t('nav.satGuide')}</a></li>
			{/if}
		</ul>
	</div>

	<!-- Navbar End: Autenticación / Perfil -->
	<div class="navbar-end gap-2">
		<div class="hidden lg:block"><LanguageToggle /></div>
		{#if user}
			<div class="flex items-center gap-2">
				<span
					class="hidden max-w-35 truncate font-mono text-xs text-base-content/60 sm:inline-block"
				>
					{user.name || user.email}
				</span>
				<a href={resolve('/better-auth')} class="btn rounded-xl btn-ghost btn-sm">
					{t('nav.account')}
				</a>
			</div>
		{:else}
			<a href={resolve('/better-auth/login')} class="btn rounded-xl px-4 btn-primary btn-sm">
				{t('nav.login')}
			</a>
		{/if}
	</div>
</header>
