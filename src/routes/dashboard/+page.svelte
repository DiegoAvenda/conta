<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data } = $props();

	const nombresMes = [
		'Enero',
		'Febrero',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Agosto',
		'Septiembre',
		'Octubre',
		'Noviembre',
		'Diciembre'
	];

	function cambiarPeriodo(event) {
		const [anio, mes] = event.target.value.split('-');
		goto(resolve(`/dashboard?anio=${anio}&mes=${mes}`));
	}

	// profit-bar necesita un divisor > 0 para no romperse en un mes sin ventas
	let profitPct = $derived(
		data.resumen.ventas.total > 0
			? Math.min((data.resumen.utilidad / data.resumen.ventas.total) * 100, 100)
			: 0
	);

	function formatMoney(value) {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			maximumFractionDigits: 0
		}).format((Number(value) || 0) / 100);
	}

	function getTransactionClass(tipo) {
		return tipo === 'Venta' ? 'text-success' : 'text-error';
	}
</script>

<svelte:head>
	<title>Contaco · Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<header
		class="flex h-19 items-center justify-between border-b border-base-300 bg-base-100 px-10.5 max-[850px]:px-5 max-[600px]:h-auto max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3.75 max-[600px]:p-4"
	>
		<div>
			<div class="text-[25px] font-extrabold tracking-[-1px]">Contaco</div>
			<div class="mt-px text-xs text-base-content/50">
				Tu situación fiscal, sin hablar en idioma SAT.
			</div>
		</div>

		<div class="flex items-center gap-3">
			<span class="text-[12px] text-base-content/50">Periodo</span>

			<select
				class="select-bordered select cursor-pointer select-sm"
				value={`${data.anio}-${data.mes}`}
				onchange={cambiarPeriodo}
			>
				{#each nombresMes as nombre, i (nombre)}
					<option value={`${data.anio}-${i + 1}`}>{nombre} {data.anio}</option>
				{/each}
			</select>
		</div>
	</header>

	<main
		class="mx-auto max-w-305 px-7 pt-9.5 pb-15 max-[850px]:px-4 max-[850px]:pt-7 max-[850px]:pb-11.25"
	>
		<section
			class="mb-7 flex items-end justify-between gap-7.5 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3.75"
		>
			<div>
				<p class="mt-0 mb-1.75 text-[11px] font-bold tracking-[0.09em] text-base-content/50">
					RESUMEN DEL MES
				</p>
				<h1
					class="m-0 text-[32px] leading-tight font-bold tracking-[-1.2px] max-[600px]:text-[27px]"
				>
					Así va tu negocio
				</h1>
				<p class="mt-2 mb-0 text-sm text-base-content/60">
					Este es el resultado de tus ventas y gastos antes de preparar tu información fiscal.
				</p>
			</div>

			<div class="flex shrink-0 flex-nowrap items-center gap-3">
				<div
					class="flex shrink-0 items-center gap-1.75 rounded-full bg-success/15 px-3.25 py-2 text-xs whitespace-nowrap text-success"
				>
					<span class="h-1.75 w-1.75 rounded-full bg-success"></span>
					Información actualizada
				</div>
				<a
					class="btn rounded-full whitespace-nowrap btn-primary btn-sm"
					href={resolve(`/sat-monthly?anio=${data.anio}&mes=${data.mes}`)}
				>
					Ver resumen SAT
				</a>
			</div>
		</section>

		<section class="grid grid-cols-[1.15fr_0.85fr] gap-4.5 max-[850px]:grid-cols-1">
			<!-- Card oscura: IVA estimado -->
			<div class="rounded-2xl border border-neutral bg-neutral p-6.25 text-neutral-content">
				<div class="flex items-start justify-between">
					<div>
						<p class="mt-0 mb-1.75 text-[10px] font-bold tracking-[0.08em] uppercase opacity-60">
							IVA ESTIMADO
						</p>
						<h2 class="m-0 text-[19px] font-bold">Podrías pagar de IVA</h2>
					</div>

					<div
						class="grid h-6.25 w-6.25 place-items-center rounded-full border border-neutral-content/30 text-xs text-neutral-content/60"
					>
						?
					</div>
				</div>

				<div
					class="mt-5.25 mb-0.75 text-[42px] font-bold tracking-[-1.8px] max-[600px]:text-[34px]"
				>
					{formatMoney(data.resumen.iva.estimado)}
				</div>

				<p class="m-0 text-xs text-neutral-content/60">
					Estimación basada en la información registrada hasta ahora.
				</p>

				<div class="mt-5.75 border-t border-neutral-content/20 pt-4.25">
					<div class="flex justify-between py-1.5 text-[13px] text-neutral-content/70">
						<span>IVA trasladado</span>
						<strong class="text-neutral-content">{formatMoney(data.resumen.iva.trasladado)}</strong>
					</div>

					<div class="flex justify-between py-1.5 text-[13px] text-neutral-content/70">
						<span>IVA acreditable (gastos)</span>
						<strong class="text-success">-{formatMoney(data.resumen.iva.acreditable)}</strong>
					</div>
				</div>
			</div>

			<!-- Card clara: Ganancia -->
			<div class="rounded-2xl border border-base-300 bg-base-100 p-6.25">
				<div class="flex items-start justify-between">
					<div>
						<p class="mt-0 mb-1.75 text-[10px] font-bold tracking-[0.08em] uppercase opacity-60">
							RESULTADO DEL NEGOCIO
						</p>
						<h3 class="m-0 text-[19px] font-bold">Ganancia estimada</h3>
					</div>

					<div class="text-[11px] text-base-content/50">Este mes</div>
				</div>

				<div class="mt-7.5 text-[42px] font-bold tracking-[-1.8px] max-[600px]:text-[34px]">
					{formatMoney(data.resumen.utilidad)}
				</div>

				<div class="my-4.75 h-2 overflow-hidden rounded-full bg-base-300">
					<div class="h-full rounded-[inherit] bg-primary" style={`width: ${profitPct}%`}></div>
				</div>

				<div class="grid grid-cols-2 gap-3.75">
					<div class="flex flex-col gap-1">
						<span class="text-[11px] text-base-content/50">Ventas</span>
						<strong class="text-[15px] font-bold">{formatMoney(data.resumen.ventas.total)}</strong>
					</div>

					<div class="flex flex-col gap-1">
						<span class="text-[11px] text-base-content/50">Gastos</span>
						<strong class="text-[15px] font-bold">-{formatMoney(data.resumen.gastos.total)}</strong>
					</div>
				</div>
			</div>
		</section>

		<section
			class="my-4.5 grid grid-cols-3 gap-3.5 max-[850px]:grid-cols-2 max-[600px]:grid-cols-1"
		>
			<div
				class="flex items-center gap-3.25 rounded-[13px] border border-base-300 bg-base-100 p-4.25"
			>
				<div
					class="grid h-9.5 w-9.5 place-items-center rounded-[10px] bg-base-200 text-[13px] font-bold"
				>
					↗
				</div>

				<div>
					<span class="mb-0.75 block text-[11px] text-base-content/50">Ventas</span>
					<strong class="block text-[17px] font-bold"
						>{formatMoney(data.resumen.ventas.total)}</strong
					>
					<small class="mt-0.75 block text-[10px] text-base-content/40"
						>{data.resumen.ventas.registros} registros</small
					>
				</div>
			</div>

			<div
				class="flex items-center gap-3.25 rounded-[13px] border border-base-300 bg-base-100 p-4.25"
			>
				<div
					class="grid h-9.5 w-9.5 place-items-center rounded-[10px] bg-base-200 text-[13px] font-bold"
				>
					↘
				</div>

				<div>
					<span class="mb-0.75 block text-[11px] text-base-content/50">Gastos</span>
					<strong class="block text-[17px] font-bold"
						>{formatMoney(data.resumen.gastos.total)}</strong
					>
					<small class="mt-0.75 block text-[10px] text-base-content/40"
						>{data.resumen.gastos.registros} facturas</small
					>
				</div>
			</div>

			<div
				class="flex items-center gap-3.25 rounded-[13px] border border-base-300 bg-base-100 p-4.25"
			>
				<div
					class="grid h-9.5 w-9.5 place-items-center rounded-[10px] bg-base-200 text-[13px] font-bold"
				>
					IVA
				</div>

				<div>
					<span class="mb-0.75 block text-[11px] text-base-content/50">IVA identificado</span>
					<strong class="block text-[17px] font-bold"
						>{formatMoney(data.resumen.iva.estimado)}</strong
					>
					<small class="mt-0.75 block text-[10px] text-base-content/40"
						>Trasladado - acreditable</small
					>
				</div>
			</div>
		</section>

		<section class="grid grid-cols-2 gap-4.5 max-[850px]:grid-cols-1">
			<div class="overflow-hidden rounded-[15px] border border-base-300 bg-base-100">
				<div class="flex items-center justify-between border-b border-base-300 px-5.5 py-5.25">
					<div>
						<h2 class="m-0 text-base font-bold">Estado de tu información</h2>
						<p class="mt-1 mb-0 text-[11px] text-base-content/50">
							Lo que Contaco ha recibido este mes.
						</p>
					</div>
				</div>

				<div class="px-5 pt-1.25 pb-3">
					<div
						class="flex items-center gap-2.75 border-b border-base-200 px-0.5 py-3.25 last:border-b-0"
					>
						<div
							class="grid h-6.5 w-6.5 place-items-center rounded-full bg-success/15 text-xs font-bold text-success"
						>
							✓
						</div>

						<div class="flex flex-1 flex-col gap-px">
							<strong class="text-xs font-bold">Ventas</strong>
							<span class="text-[10px] text-base-content/50"
								>{data.resumen.ventas.registros} registros</span
							>
						</div>

						<span class="text-[10px] font-semibold text-success">Listo</span>
					</div>

					<div
						class="flex items-center gap-2.75 border-b border-base-200 px-0.5 py-3.25 last:border-b-0"
					>
						<!-- Espacio reservado para icono cuando se requiera validar -->
						<div class="flex flex-1 flex-col gap-px">
							<strong class="text-xs font-bold">Facturas de gastos</strong>
							<span class="text-[10px] text-base-content/50"
								>{data.resumen.gastos.registros} CFDI registrados</span
							>
						</div>

						<span class="text-[10px] font-semibold text-success">Listo</span>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-[15px] border border-base-300 bg-base-100">
				<div class="flex items-center justify-between border-b border-base-300 px-5.5 py-5.25">
					<div>
						<h2 class="m-0 text-base font-bold">¿Cómo cobraron tus ventas?</h2>
						<p class="mt-1 mb-0 text-[11px] text-base-content/50">
							Desglose de tus ventas directas por método de cobro.
						</p>
					</div>
				</div>

				<div class="px-5.5 py-4.75">
					{#each data.resumen.metodosPago as metodo (metodo.metodoPago)}
						<div class="mb-5.25 grid grid-cols-[1fr_130px_35px] items-center gap-3 last:mb-0">
							<div class="flex justify-between text-[11px]">
								<strong class="font-semibold">{metodo.metodoPago}</strong>
								<span class="text-base-content/50">{formatMoney(metodo.total)}</span>
							</div>

							<div class="h-1.75 overflow-hidden rounded-full bg-base-300">
								<div
									class="h-full rounded-[inherit] bg-primary"
									style={`width: ${data.resumen.ventas.total > 0 ? (metodo.total / data.resumen.ventas.total) * 100 : 0}%`}
								></div>
							</div>

							<small class="text-right text-[10px] text-base-content/50">
								{data.resumen.ventas.total > 0
									? Math.round((metodo.total / data.resumen.ventas.total) * 100)
									: 0}%
							</small>
						</div>
					{:else}
						<p class="m-0 text-xs text-base-content/50">Sin ventas registradas este mes.</p>
					{/each}
				</div>
			</div>
		</section>

		<section class="mt-4.5 overflow-hidden rounded-[15px] border border-base-300 bg-base-100">
			<div class="flex items-center justify-between border-b border-base-300 px-5.5 py-5.25">
				<div>
					<h2 class="m-0 text-base font-bold">Últimos movimientos</h2>
					<p class="mt-1 mb-0 text-[11px] text-base-content/50">
						Ventas y gastos registrados recientemente.
					</p>
				</div>
			</div>

			<div class="w-full max-[600px]:overflow-x-auto">
				<div
					class="grid grid-cols-[100px_1fr_100px_130px] items-center gap-3.75 bg-base-200 px-5.5 py-3.25 text-[10px] text-base-content/50 max-[600px]:min-w-137.5"
				>
					<span>Fecha</span>
					<span>Descripción</span>
					<span>Tipo</span>
					<span>Importe</span>
				</div>

				{#each data.movimientos as movimiento (movimiento.fecha + movimiento.descripcion)}
					<div
						class="grid grid-cols-[100px_1fr_100px_130px] items-center gap-3.75 border-t border-base-200 px-5.5 py-3.25 text-[11px] max-[600px]:min-w-137.5"
					>
						<span>
							{new Date(movimiento.fecha + 'T12:00:00').toLocaleDateString('es-MX', {
								day: '2-digit',
								month: 'short'
							})}
						</span>

						<strong class="font-semibold">{movimiento.descripcion}</strong>

						<span class={getTransactionClass(movimiento.tipo)}>
							{movimiento.tipo}
						</span>

						<span class={getTransactionClass(movimiento.tipo)}>
							{movimiento.monto > 0 ? '+' : ''}
							{formatMoney(movimiento.monto)}
						</span>
					</div>
				{:else}
					<p class="m-0 px-5.5 py-5 text-xs text-base-content/50">Sin movimientos este mes.</p>
				{/each}
			</div>
		</section>
	</main>
</div>
