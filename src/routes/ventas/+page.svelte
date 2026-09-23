<script>
	import { enhance } from '$app/forms';

	let { data } = $props();

	let activeView = $state('home');

	let totalSales = $derived(data.ventas.reduce((total, venta) => total + venta.monto, 0));
	let totalIva = $derived(data.ventas.reduce((total, venta) => total + venta.iva, 0));

	function formatMoney(value) {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format((Number(value) || 0) / 100);
	}
</script>

<svelte:head>
	<title>Contaco - Ventas directas</title>
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<header
		class="flex h-18 items-center justify-between border-b border-base-300 bg-base-100 px-8 max-[600px]:px-4.5"
	>
		<div class="flex items-center gap-5">
			<div class="text-2xl font-extrabold tracking-[-1px]">Contaco</div>

			<span class="border-l border-base-300 pl-5 text-sm text-base-content/50 max-[600px]:hidden">
				Ventas directas
			</span>
		</div>

		<div class="flex flex-col items-end gap-0.75 text-xs text-base-content/50">
			<span>Periodo</span>
			<strong class="text-[13px] text-base-content">Septiembre 2026</strong>
		</div>
	</header>

	<main
		class="mx-auto w-[min(720px,calc(100%-32px))] py-16 pb-25 max-[600px]:w-[calc(100%-20px)] max-[600px]:py-8.75 max-[600px]:pb-17.5"
	>
		{#if activeView === 'home'}
			<section class="mb-10">
				<div class="mb-3.5 text-[11px] font-extrabold tracking-[0.14em] text-base-content/50">
					VENTAS DIRECTAS
				</div>

				<h1
					class="m-0 text-[40px] leading-[1.08] font-bold tracking-[-1.8px] max-[600px]:text-[31px]"
				>
					Todo queda<br />
					registrado automáticamente.
				</h1>

				<p class="mt-4.5 max-w-145 text-base leading-[1.6] text-base-content/60">
					Contaco recopila y organiza tus ventas sin que tengas que capturarlas manualmente, para
					que puedas revisar el estado real de tu negocio en cualquier momento.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<button
					class="flex w-full items-center gap-4.5 rounded-[15px] border border-base-300 bg-base-100 p-5.5 text-left transition duration-150 hover:-translate-y-px hover:border-base-content/30 max-[600px]:p-4.5"
					onclick={() => (activeView = 'sales')}
				>
					<div
						class="flex h-10.5 w-10.5 shrink-0 basis-10.5 items-center justify-center rounded-[10px] bg-base-200 text-[21px] max-[600px]:h-9 max-[600px]:w-9 max-[600px]:basis-9"
					>
						≡
					</div>

					<div class="flex flex-1 flex-col gap-1.25">
						<strong class="text-base">Ver mis ventas</strong>

						<span class="text-sm text-base-content/60">
							Consulta y revisa los datos registrados automáticamente.
						</span>
					</div>

					<div class="text-xl text-base-content/40">→</div>
				</button>
			</section>

			<section class="mt-7 rounded-xl bg-base-300/50 px-5 py-4.5">
				<strong class="text-[13px]">💡 Todo queda registrado de forma automática.</strong>

				<p class="mt-1.5 text-[13px] leading-[1.5] text-base-content/60">
					Puedes revisar tus registros y confirmar el estado real de tu negocio sin entrar a un
					flujo manual de captura.
				</p>
			</section>
		{:else}
			<section class="mb-8">
				<button
					class="mb-10 border-0 bg-transparent p-0 text-[13px] font-semibold text-base-content/60"
					onclick={() => (activeView = 'home')}
				>
					← Ventas
				</button>

				<div class="mb-3.5 text-[11px] font-extrabold tracking-[0.14em] text-base-content/50">
					SEPTIEMBRE 2026
				</div>

				<h1
					class="m-0 text-[40px] leading-[1.08] font-bold tracking-[-1.8px] max-[600px]:text-[31px]"
				>
					Mis ventas
				</h1>

				<p class="mt-4.5 max-w-145 text-base leading-[1.6] text-base-content/60">
					Esta es la información que Contaco utilizará para preparar tu cierre fiscal.
				</p>
			</section>

			<section class="mb-4.5 grid grid-cols-3 gap-3 max-[600px]:grid-cols-1">
				<div class="rounded-[14px] border border-base-300 bg-base-100 p-5">
					<span class="mb-2 block text-xs text-base-content/50">Ventas</span>
					<strong class="text-xl tracking-[-0.5px]">{formatMoney(totalSales)}</strong>
				</div>

				<div class="rounded-[14px] border border-base-300 bg-base-100 p-5">
					<span class="mb-2 block text-xs text-base-content/50">IVA identificado</span>
					<strong class="text-xl tracking-[-0.5px]">{formatMoney(totalIva)}</strong>
				</div>

				<div class="rounded-[14px] border border-base-300 bg-base-100 p-5">
					<span class="mb-2 block text-xs text-base-content/50">Registros</span>
					<strong class="text-xl tracking-[-0.5px]">{data.ventas.length}</strong>
				</div>
			</section>

			<section class="rounded-2xl border border-base-300 bg-base-100 p-7 max-[600px]:p-5">
				<div class="mb-4.5 flex items-center justify-between">
					<strong>Registros</strong>
				</div>

				<div class="overflow-x-auto">
					<div
						class="grid min-w-145 grid-cols-[1fr_1.2fr_1fr_1fr_30px] items-center gap-3 border-b border-base-200 py-[14px] pt-0 text-[11px] font-bold text-base-content/50"
					>
						<span>Fecha</span>
						<span>Método de cobro</span>
						<span>Ventas</span>
						<span>IVA</span>
						<span></span>
					</div>

					{#each data.ventas as venta (venta._id)}
						<div
							class="grid min-w-145 grid-cols-[1fr_1.2fr_1fr_1fr_30px] items-center gap-3 border-b border-base-200 py-[14px] text-[13px]"
						>
							<span>
								{new Date(venta.fecha + 'T12:00:00').toLocaleDateString('es-MX')}
							</span>

							<span>{venta.metodoPago}</span>

							<strong>{formatMoney(venta.monto)}</strong>

							<span>{formatMoney(venta.iva)}</span>

							<form method="POST" action="?/eliminar" use:enhance>
								<input type="hidden" name="id" value={venta._id} />

								<button
									class="border-0 bg-transparent text-lg text-base-content/30 hover:text-base-content"
									type="submit"
									aria-label="Eliminar venta"
								>
									×
								</button>
							</form>
						</div>
					{/each}
				</div>
			</section>

			<section
				class="mt-4.5 flex items-center justify-between gap-5 rounded-[14px] bg-neutral p-5 text-neutral-content max-[600px]:flex-col max-[600px]:items-start"
			>
				<div>
					<strong class="text-sm">¿Terminaste de registrar tus ventas?</strong>

					<p class="mt-1.25 max-w-112.5 text-xs leading-normal text-neutral-content/60">
						Contaco combinará estas ventas directas con tus gastos para preparar tu cierre mensual.
					</p>
				</div>

				<button
					class="btn flex-[0_0_auto] rounded-lg border-0 bg-base-100 text-xs font-bold text-neutral btn-sm max-[600px]:w-full"
				>
					Continuar →
				</button>
			</section>
		{/if}
	</main>
</div>
