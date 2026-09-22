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
				'Recibe pedidos para llevar y delivery en el mismo sistema, sin depender de plataformas que se quedan con una parte de cada venta.'
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
			targetRoute: '/register?plan=monthly',
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
			targetRoute: '/register?plan=yearly',
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

<div class="font-body min-h-screen overflow-x-hidden bg-(--contaco-pizarra) text-(--contaco-tiza)">
	<!-- Nav + Hero -->
	<header class="border-b border-(--contaco-tiza)/10">
		<div class="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
			<nav class="flex items-center justify-between">
				<a href={resolve('/')} class="font-display text-xl font-bold tracking-tight">
					contaco<span class="text-(--contaco-marigold)">.</span>
				</a>

				<a
					href={resolve('/demo')}
					class="rounded-md border border-(--contaco-tiza)/15 px-4 py-2 text-sm font-medium text-(--contaco-muted) transition hover:border-(--contaco-tiza)/30 hover:text-(--contaco-tiza)"
				>
					Ver demo
				</a>
			</nav>

			<div
				class="grid gap-16 pt-16 pb-24 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-20 lg:pb-32"
			>
				<div class="lg:col-span-6">
					<h1
						class="font-display text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
					>
						Todo tu restaurante en un solo ticket.
					</h1>

					<p
						class="mt-6 max-w-md text-base leading-7 text-(--contaco-muted) sm:text-lg sm:leading-8"
					>
						Contaco conecta tu punto de venta, pedidos directos, gastos e información fiscal en un
						solo lugar, para que dejes de saltar entre cinco sistemas distintos.
					</p>

					<div class="mt-9 flex flex-col gap-3 sm:flex-row">
						<a
							href={resolve('/register')}
							class="rounded-md bg-(--contaco-marigold) px-7 py-3.5 text-center text-sm font-semibold text-(--contaco-pizarra) transition hover:bg-(--contaco-marigold-light)"
						>
							Prueba gratis 14 días
						</a>
						<a
							href={resolve('/demo')}
							class="rounded-md border border-(--contaco-tiza)/15 px-7 py-3.5 text-center text-sm font-semibold text-(--contaco-tiza) transition hover:border-(--contaco-tiza)/30"
						>
							Explorar demo
						</a>
					</div>

					<p class="mt-5 max-w-sm text-xs leading-5 text-(--contaco-muted)">
						Sin contrato, sin comisiones por venta y cancelas cuando quieras.
					</p>
				</div>

				<div class="lg:col-span-6">
					<div class="mx-auto max-w-xs rotate-2 lg:mx-0">
						<div
							class="receipt relative bg-(--contaco-paper) px-7 py-8 text-(--contaco-pizarra) shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
						>
							<div
								class="flex items-baseline justify-between font-mono text-[11px] text-(--contaco-pizarra)/55"
							>
								<span>No. 0842</span>
								<span>{today}</span>
							</div>
							<p class="mt-3 text-center font-mono text-xs tracking-[0.15em]">NOTA DE VENTA</p>

							<div class="my-4 border-t border-dashed border-(--contaco-pizarra)/25"></div>

							<ul class="space-y-2.5 font-mono text-sm">
								{#each ticketItems as item, i (item)}
									<li
										class="ticket-line flex items-baseline justify-between gap-4"
										style="animation-delay: {i * 140}ms"
									>
										<span>{item}</span>
										<span class="text-(--contaco-marigold)">✓</span>
									</li>
								{/each}
							</ul>

							<div class="my-4 border-t border-dashed border-(--contaco-pizarra)/25"></div>

							<div class="flex items-baseline justify-between font-mono text-sm font-semibold">
								<span>TOTAL</span>
								<span>1 sistema</span>
							</div>

							<p class="mt-6 text-center font-mono text-[10px] text-(--contaco-pizarra)/45">
								* gracias por su visita *
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Features -->
	<section class="border-b border-(--contaco-tiza)/10 bg-(--contaco-pizarra-2) py-24 sm:py-28">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="max-w-2xl">
				<h2 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Construido para cómo trabaja un restaurante, no al revés.
				</h2>
				<p class="mt-5 text-base leading-7 text-(--contaco-muted)">
					No necesitas una colección de herramientas que apenas se hablan entre sí. Contaco conecta
					la operación diaria con la información financiera.
				</p>
			</div>

			<dl
				class="mt-16 divide-y divide-dashed divide-(--contaco-tiza)/15 border-y border-dashed border-(--contaco-tiza)/15"
			>
				{#each features as feature (feature.id)}
					<div class="grid gap-2 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-10">
						<dt class="font-display text-lg font-semibold">{feature.title}</dt>
						<dd class="text-sm leading-6 text-(--contaco-muted) sm:text-base sm:leading-7">
							{feature.description}
						</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>

	<!-- CTA -->
	<section class="relative overflow-hidden border-b border-(--contaco-tiza)/10 py-24 sm:py-28">
		<div class="mx-auto max-w-3xl px-6 text-center lg:px-8">
			<h2 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
				Tu tiempo debería estar en tu restaurante, no en una hoja de cálculo.
			</h2>
			<p class="mx-auto mt-5 max-w-xl text-sm leading-6 text-(--contaco-muted) sm:text-base">
				Empieza con 14 días gratis y descubre cómo se siente tener la operación y los números en el
				mismo lugar.
			</p>
			<a
				href={resolve('/register')}
				class="mt-9 inline-flex rounded-md bg-(--contaco-marigold) px-7 py-3.5 text-sm font-semibold text-(--contaco-pizarra) transition hover:bg-(--contaco-marigold-light)"
			>
				Empezar gratis
			</a>
		</div>

		<div
			class="pointer-events-none absolute top-1/2 right-[8%] hidden -translate-y-1/2 sm:block"
			aria-hidden="true"
		>
			<div
				class="font-display flex h-28 w-28 -rotate-12 items-center justify-center rounded-full border-2 border-dashed border-(--contaco-chile)/50 text-center text-[10px] font-semibold tracking-widest text-(--contaco-chile)/70 uppercase"
			>
				al día<br />con el<br />SAT
			</div>
		</div>
	</section>

	<!-- Pricing -->
	<section class="bg-(--contaco-pizarra-2) py-24 sm:py-28">
		<div class="mx-auto max-w-5xl px-6 lg:px-8">
			<div class="max-w-2xl">
				<h2 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Un precio, todo incluido.
				</h2>
				<p class="mt-4 text-sm leading-6 text-(--contaco-muted) sm:text-base">
					Los mismos módulos en los dos planes. La diferencia está en el compromiso y el
					acompañamiento.
				</p>
			</div>

			<div class="mt-14 grid gap-6 sm:grid-cols-2">
				{#each pricingPlans as plan (plan.id)}
					<div
						class="flex flex-col border p-8 {plan.isPopular
							? 'border-(--contaco-marigold)/50'
							: 'border-(--contaco-tiza)/12'}"
					>
						<div class="flex items-baseline justify-between">
							<h3 class="font-display text-lg font-semibold">{plan.name}</h3>
							{#if plan.isPopular}
								<span class="text-xs text-(--contaco-marigold)">recomendado</span>
							{/if}
						</div>
						<p class="mt-1 text-sm text-(--contaco-muted)">{plan.description}</p>

						<p class="mt-8 font-mono text-4xl font-semibold">${plan.price}</p>
						<p class="font-mono text-xs text-(--contaco-muted)">{plan.billing}</p>

						<ul
							class="mt-8 flex-1 space-y-3 border-t border-dashed border-(--contaco-tiza)/15 pt-6 font-mono text-sm"
						>
							{#each plan.lineItems as item (item)}
								<li class="text-(--contaco-tiza)/90">{item}</li>
							{/each}
						</ul>

						<a
							href={resolve(plan.targetRoute)}
							class="mt-8 rounded-md py-3 text-center text-sm font-semibold transition {plan.isPopular
								? 'bg-(--contaco-marigold) text-(--contaco-pizarra) hover:bg-(--contaco-marigold-light)'
								: 'border border-(--contaco-tiza)/20 text-(--contaco-tiza) hover:bg-(--contaco-tiza)/5'}"
						>
							{plan.isPopular ? 'Elegir plan anual' : 'Elegir plan mensual'}
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-(--contaco-tiza)/10 py-8">
		<div
			class="mx-auto flex max-w-7xl flex-col gap-3 px-6 text-sm text-(--contaco-muted) sm:flex-row sm:items-center sm:justify-between lg:px-8"
		>
			<div>
				<span class="font-display font-semibold text-(--contaco-tiza)">contaco.</span>
				<span class="ml-2">Operación, ventas y finanzas en un solo lugar.</span>
			</div>
			<div>© 2026 Contaco</div>
		</div>
	</footer>
</div>

<style>
	:global(:root) {
		--contaco-pizarra: #161f1b;
		--contaco-pizarra-2: #1b2420;
		--contaco-tiza: #f3efe6;
		--contaco-paper: #f3efe6;
		--contaco-muted: #9ba69c;
		--contaco-marigold: #e8a23d;
		--contaco-marigold-light: #f0b25c;
		--contaco-chile: #c1432e;
	}

	.font-body {
		font-family: 'Inter', system-ui, sans-serif;
	}

	:global(.font-display) {
		font-family: 'Space Grotesk', system-ui, sans-serif;
	}

	:global(.font-mono) {
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
	}

	.receipt {
		position: relative;
	}

	.receipt::before,
	.receipt::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: 11px;
		background-image:
			linear-gradient(45deg, var(--contaco-pizarra) 8px, transparent 0),
			linear-gradient(-45deg, var(--contaco-pizarra) 8px, transparent 0);
		background-size: 16px 16px;
		background-repeat: repeat-x;
		background-position: 0 0;
	}

	.receipt::before {
		top: -10px;
		transform: rotate(180deg);
	}

	.receipt::after {
		bottom: -10px;
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
		outline: 2px solid var(--contaco-marigold);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.ticket-line {
			animation: none;
			opacity: 1;
		}
	}
</style>
