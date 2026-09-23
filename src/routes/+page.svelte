<script>
	import { resolve } from '$app/paths';

	const features = [
		{
			id: 'pos-speed',
			title: 'POS pensado para trabajar rápido',
			description:
				'Registra ventas, mesas y comandas desde una interfaz diseñada para el ritmo real de un restaurante.'
		},
		{
			id: 'omnichannel-orders',
			title: 'Pedidos directos, sin comisiones',
			description:
				'Recibe pedidos para llevar y delivery propio en el mismo sistema, junto con las ventas de tu local.'
		},
		{
			id: 'sat-automation',
			title: 'Tus números listos para el SAT',
			description:
				'Contaco organiza tus ventas y movimientos para mostrarte la información que necesitas al momento de preparar tu declaración.'
		},
		{
			id: 'financial-metrics',
			title: 'Entiende realmente tu negocio',
			description:
				'Controla ingresos, gastos, insumos y utilidad sin convertir Excel en el quinto empleado del restaurante.'
		}
	];

	const ticketItems = ['Punto de venta', 'Pedidos WhatsApp', 'Módulo SAT', 'Panel financiero'];

	const today = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

	const pricingPlans = [
		{
			id: 'plan-monthly',
			name: 'Mensual',
			description: 'Para empezar sin compromiso.',
			price: '599.00',
			billing: 'MXN / mes',
			isPopular: false,
			targetRoute: '/better-auth',
			lineItems: [
				'Punto de venta ilimitado',
				'Pedidos online',
				'Módulo fiscal y guía SAT',
				'Control de gastos',
				'Soporte técnico prioritario'
			]
		},
		{
			id: 'plan-yearly',
			name: 'Anual Pro',
			description: 'Más ahorro y más acompañamiento.',
			price: '479.00',
			billing: 'MXN / mes, cobrado anualmente',
			isPopular: true,
			targetRoute: '/better-auth',
			lineItems: [
				'Todo lo del plan Mensual',
				'2 meses gratis al año',
				'Importación inicial de menú',
				'Capacitación personalizada',
				'Acompañamiento en configuración fiscal'
			]
		}
	];
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="font-body min-h-screen overflow-x-hidden bg-base-100 text-base-content">
	<!-- Hero -->
	<header class="border-b border-base-300">
		<div class="mx-auto max-w-7xl px-6 pt-16 lg:px-8 lg:pt-20">
			<div
				class="grid gap-16 pt-16 pb-24 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-20 lg:pb-32"
			>
				<div class="lg:col-span-6">
					<h1
						class="font-display text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
					>
						Todo tu restaurante en un solo ticket.
					</h1>

					<p class="mt-6 max-w-md text-base leading-7 text-base-content/60 sm:text-lg sm:leading-8">
						Contaco conecta tu punto de venta, pedidos directos, gastos e información fiscal en un
						solo lugar, para que dejes de saltar entre cinco sistemas distintos.
					</p>

					<div class="mt-9 flex flex-col gap-3 sm:flex-row">
						<a
							href={resolve('/better-auth')}
							class="btn rounded-md px-7 py-3.5 text-center text-sm font-semibold btn-primary"
						>
							Entrar a la app
						</a>
						<a
							href={resolve('/inscripcion')}
							class="rounded-md border border-base-300 px-7 py-3.5 text-center text-sm font-semibold text-base-content transition hover:border-base-content/30"
						>
							Guía SAT
						</a>
					</div>

					<p class="mt-5 max-w-sm text-xs leading-5 text-base-content/50">
						Sin contrato, sin comisiones por venta y cancelas cuando quieras.
					</p>
				</div>

				<div class="lg:col-span-6">
					<div class="mx-auto max-w-xs rotate-2 lg:mx-0">
						<div
							class="receipt relative bg-base-100 px-7 py-8 text-base-content shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)] ring-1 ring-base-300"
						>
							<div
								class="flex items-baseline justify-between font-mono text-[11px] text-base-content/40"
							>
								<span>No. 0842</span>
								<span>{today}</span>
							</div>
							<p class="mt-3 text-center font-mono text-xs tracking-[0.15em]">NOTA DE VENTA</p>

							<div class="my-4 border-t border-dashed border-base-content/20"></div>

							<ul class="space-y-2.5 font-mono text-sm">
								{#each ticketItems as item, i (item)}
									<li
										class="ticket-line flex items-baseline justify-between gap-4"
										style="animation-delay: {i * 140}ms"
									>
										<span>{item}</span>
										<span class="text-primary">✓</span>
									</li>
								{/each}
							</ul>

							<div class="my-4 border-t border-dashed border-base-content/20"></div>

							<div class="flex items-baseline justify-between font-mono text-sm font-semibold">
								<span>TOTAL</span>
								<span>1 sistema</span>
							</div>

							<p class="mt-6 text-center font-mono text-[10px] text-base-content/35">
								* gracias por su visita *
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Features -->
	<section class="border-b border-base-300 bg-base-200 py-24 sm:py-28">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="max-w-2xl">
				<h2 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Construido para cómo trabaja un restaurante, no al revés.
				</h2>
				<p class="mt-5 text-base leading-7 text-base-content/60">
					No necesitas una colección de herramientas que apenas se hablan entre sí. Contaco conecta
					la operación diaria con la información financiera.
				</p>
			</div>

			<dl
				class="mt-16 divide-y divide-dashed divide-base-content/15 border-y border-dashed border-base-content/15"
			>
				{#each features as feature (feature.id)}
					<div class="grid gap-2 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-10">
						<dt class="font-display text-lg font-semibold">{feature.title}</dt>
						<dd class="text-sm leading-6 text-base-content/60 sm:text-base sm:leading-7">
							{feature.description}
						</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>

	<!-- CTA -->
	<section class="relative overflow-hidden border-b border-base-300 py-24 sm:py-28">
		<div class="mx-auto max-w-3xl px-6 text-center lg:px-8">
			<h2 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
				Tu tiempo debería estar en tu restaurante, no en una hoja de cálculo.
			</h2>
			<p class="mx-auto mt-5 max-w-xl text-sm leading-6 text-base-content/60 sm:text-base">
				Empieza con 14 días gratis y descubre cómo se siente tener la operación y los números en el
				mismo lugar.
			</p>
			<a
				href={resolve('/better-auth')}
				class="btn mt-9 inline-flex rounded-md px-7 py-3.5 text-sm font-semibold btn-primary"
			>
				Entrar a la app
			</a>
		</div>

		<div
			class="pointer-events-none absolute top-1/2 right-[8%] hidden -translate-y-1/2 sm:block"
			aria-hidden="true"
		>
			<div
				class="font-display flex h-28 w-28 -rotate-12 items-center justify-center rounded-full border-2 border-dashed border-error/40 text-center text-[10px] font-semibold tracking-widest text-error/60 uppercase"
			>
				al día<br />con el<br />SAT
			</div>
		</div>
	</section>

	<!-- Pricing -->
	<section class="bg-base-200 py-24 sm:py-28">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="max-w-2xl">
				<h2 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Un precio, todo incluido.
				</h2>
				<p class="mt-4 text-sm leading-6 text-base-content/60 sm:text-base">
					Los mismos módulos en los dos planes. La diferencia está en el compromiso y el
					acompañamiento.
				</p>
			</div>

			<div class="mt-14 grid gap-6 sm:grid-cols-2">
				{#each pricingPlans as plan (plan.id)}
					<div
						class="flex flex-col border p-8 {plan.isPopular
							? 'border-primary/40 bg-base-100'
							: 'border-base-300'}"
					>
						<div class="flex items-baseline justify-between">
							<h3 class="font-display text-lg font-semibold">{plan.name}</h3>
							{#if plan.isPopular}
								<span class="text-xs font-semibold text-primary">recomendado</span>
							{/if}
						</div>
						<p class="mt-1 text-sm text-base-content/60">{plan.description}</p>

						<p class="mt-8 font-mono text-4xl font-semibold">${plan.price}</p>
						<p class="font-mono text-xs text-base-content/50">{plan.billing}</p>

						<ul
							class="mt-8 flex-1 space-y-3 border-t border-dashed border-base-content/15 pt-6 font-mono text-sm"
						>
							{#each plan.lineItems as item (item)}
								<li class="text-base-content/80">{item}</li>
							{/each}
						</ul>

						<a
							href={resolve(plan.targetRoute)}
							class="mt-8 rounded-md py-3 text-center text-sm font-semibold transition {plan.isPopular
								? 'bg-primary text-primary-content hover:opacity-90'
								: 'border border-base-300 text-base-content hover:bg-base-200'}"
						>
							{plan.isPopular ? 'Elegir plan anual' : 'Elegir plan mensual'}
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>
</div>

<style>
	.font-body {
		font-family: 'Inter', system-ui, sans-serif;
	}

	:global(.font-display) {
		font-family: 'Space Grotesk', system-ui, sans-serif;
	}

	:global(.font-mono) {
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
	}

	.ticket-line {
		opacity: 0;
		animation: ticket-print 420ms ease-out forwards;
	}

	@keyframes ticket-print {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(a:focus-visible),
	:global(button:focus-visible) {
		outline: 2px solid oklch(15.906% 0 0);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.ticket-line {
			animation: none;
			opacity: 1;
		}
	}
</style>
