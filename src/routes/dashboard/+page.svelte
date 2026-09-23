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
		return tipo === 'Venta' ? 'text-[#347843]' : 'text-[#9a3e3e]';
	}
</script>

<svelte:head>
	<title>Contaco · Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-[#f5f6f8] font-sans text-[#17191d]">
	<header
		class="flex h-19 items-center justify-between border-b border-[#e7e8eb] bg-white px-10.5 max-[850px]:px-5 max-[600px]:h-auto max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3.75 max-[600px]:p-4"
	>
		<div>
			<div class="text-[25px] font-extrabold tracking-[-1px]">Contaco</div>
			<div class="mt-px text-xs text-[#777b83]">Tu situación fiscal, sin hablar en idioma SAT.</div>
		</div>

		<div class="flex items-center gap-3">
			<span class="text-[12px] text-[#777b83]">Periodo</span>

			<select
				class="font-inherit cursor-pointer rounded-[9px] border border-[#dddfe3] bg-white px-3 py-[9px] text-[#292c31]"
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
		class="mx-auto max-w-[1220px] px-7 pt-9.5 pb-15 max-[850px]:px-4 max-[850px]:pt-7 max-[850px]:pb-11.25"
	>
		<section
			class="mb-7 flex items-end justify-between gap-7.5 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3.75"
		>
			<div>
				<p class="mt-0 mb-1.75 text-[11px] font-bold tracking-[0.09em] text-[#7b8089]">
					RESUMEN DEL MES
				</p>
				<h1
					class="m-0 text-[32px] leading-tight font-bold tracking-[-1.2px] max-[600px]:text-[27px]"
				>
					Así va tu negocio
				</h1>
				<p class="mt-2 mb-0 text-sm text-[#777b83]">
					Este es el resultado de tus ventas y gastos antes de preparar tu información fiscal.
				</p>
			</div>

			<div class="flex shrink-0 flex-nowrap items-center gap-3">
				<div
					class="flex shrink-0 items-center gap-1.75 rounded-full bg-[#eef8f0] px-3.25 py-2 text-xs whitespace-nowrap text-[#28743b]"
				>
					<span class="h-1.75 w-1.75 rounded-full bg-[#3c9b53]"></span>
					Información actualizada
				</div>
				<a
					class="inline-flex shrink-0 items-center justify-center rounded-full bg-[#0f172a] px-3.5 py-2.25 text-xs font-bold whitespace-nowrap text-white no-underline"
					href={resolve(`/sat-monthly?anio=${data.anio}&mes=${data.mes}`)}
				>
					Ver resumen SAT
				</a>
			</div>
		</section>

		<section class="grid grid-cols-[1.15fr_0.85fr] gap-4.5 max-[850px]:grid-cols-1">
			<div class="rounded-2xl border border-[#181a1f] bg-[#181a1f] p-6.25 text-white">
				<div class="flex items-start justify-between">
					<div>
						<p class="mt-0 mb-1.75 text-[10px] font-bold tracking-[0.08em] uppercase opacity-60">
							IVA ESTIMADO
						</p>
						<h2 class="m-0 text-[19px] font-bold">Podrías pagar de IVA</h2>
					</div>

					<div
						class="grid h-6.25 w-6.25 place-items-center rounded-full border border-[#4b4e54] text-xs text-[#a8abb1]"
					>
						?
					</div>
				</div>

				<div
					class="mt-5.25 mb-0.75 text-[42px] font-bold tracking-[-1.8px] max-[600px]:text-[34px]"
				>
					{formatMoney(data.resumen.iva.estimado)}
				</div>

				<p class="m-0 text-xs text-[#999da5]">
					Estimación basada en la información registrada hasta ahora.
				</p>

				<div class="mt-5.75 border-t border-[#34373d] pt-4.25">
					<div class="flex justify-between py-1.5 text-[13px] text-[#c5c7cc]">
						<span>IVA trasladado</span>
						<strong class="text-white">{formatMoney(data.resumen.iva.trasladado)}</strong>
					</div>

					<div class="flex justify-between py-1.5 text-[13px] text-[#c5c7cc]">
						<span>IVA acreditable (gastos)</span>
						<strong class="text-[#7fc68e]">-{formatMoney(data.resumen.iva.acreditable)}</strong>
					</div>
				</div>
			</div>

			<div class="rounded-2xl border border-[#e6e7ea] bg-white p-6.25">
				<div class="flex items-start justify-between">
					<div>
						<p class="mt-0 mb-1.75 text-[10px] font-bold tracking-[0.08em] uppercase opacity-60">
							RESULTADO DEL NEGOCIO
						</p>
						<h3 class="m-0 text-[19px] font-bold">Ganancia estimada</h3>
					</div>

					<div class="text-[11px] text-[#777b83]">Este mes</div>
				</div>

				<div class="mt-7.5 text-[42px] font-bold tracking-[-1.8px] max-[600px]:text-[34px]">
					{formatMoney(data.resumen.utilidad)}
				</div>

				<div class="my-4.75 h-2 overflow-hidden rounded-full bg-[#eceef0]">
					<div class="h-full rounded-[inherit] bg-[#25282d]" style={`width: ${profitPct}%`}></div>
				</div>

				<div class="grid grid-cols-2 gap-3.75">
					<div class="flex flex-col gap-1">
						<span class="text-[11px] text-[#858991]">Ventas</span>
						<strong class="text-[15px] font-bold">{formatMoney(data.resumen.ventas.total)}</strong>
					</div>

					<div class="flex flex-col gap-1">
						<span class="text-[11px] text-[#858991]">Gastos</span>
						<strong class="text-[15px] font-bold">-{formatMoney(data.resumen.gastos.total)}</strong>
					</div>
				</div>
			</div>
		</section>

		<section
			class="my-4.5 grid grid-cols-3 gap-3.5 max-[850px]:grid-cols-2 max-[600px]:grid-cols-1"
		>
			<div
				class="flex items-center gap-3.25 rounded-[13px] border border-[#e6e7ea] bg-white p-4.25"
			>
				<div
					class="grid h-9.5 w-9.5 place-items-center rounded-[10px] bg-[#f0f1f3] text-[13px] font-bold"
				>
					↗
				</div>

				<div>
					<span class="mb-0.75 block text-[11px] text-[#777b83]">Ventas</span>
					<strong class="block text-[17px] font-bold"
						>{formatMoney(data.resumen.ventas.total)}</strong
					>
					<small class="mt-0.75 block text-[10px] text-[#999da5]"
						>{data.resumen.ventas.registros} registros</small
					>
				</div>
			</div>

			<div
				class="flex items-center gap-3.25 rounded-[13px] border border-[#e6e7ea] bg-white p-4.25"
			>
				<div
					class="grid h-9.5 w-9.5 place-items-center rounded-[10px] bg-[#f0f1f3] text-[13px] font-bold"
				>
					↘
				</div>

				<div>
					<span class="mb-0.75 block text-[11px] text-[#777b83]">Gastos</span>
					<strong class="block text-[17px] font-bold"
						>{formatMoney(data.resumen.gastos.total)}</strong
					>
					<small class="mt-0.75 block text-[10px] text-[#999da5]"
						>{data.resumen.gastos.registros} facturas</small
					>
				</div>
			</div>

			<div
				class="flex items-center gap-3.25 rounded-[13px] border border-[#e6e7ea] bg-white p-4.25"
			>
				<div
					class="grid h-9.5 w-9.5 place-items-center rounded-[10px] bg-[#f0f1f3] text-[13px] font-bold"
				>
					IVA
				</div>

				<div>
					<span class="mb-0.75 block text-[11px] text-[#777b83]">IVA identificado</span>
					<strong class="block text-[17px] font-bold"
						>{formatMoney(data.resumen.iva.estimado)}</strong
					>
					<small class="mt-0.75 block text-[10px] text-[#999da5]">Trasladado - acreditable</small>
				</div>
			</div>
		</section>

		<section class="grid grid-cols-2 gap-4.5 max-[850px]:grid-cols-1">
			<div class="overflow-hidden rounded-[15px] border border-[#e6e7ea] bg-white">
				<div class="flex items-center justify-between border-b border-[#eceef0] px-5.5 py-5.25">
					<div>
						<h2 class="m-0 text-base font-bold">Estado de tu información</h2>
						<p class="mt-1 mb-0 text-[11px] text-[#858991]">Lo que Contaco ha recibido este mes.</p>
					</div>
				</div>

				<div class="px-5 pt-1.25 pb-3">
					<div
						class="flex items-center gap-2.75 border-b border-[#f0f1f2] px-0.5 py-3.25 last:border-b-0"
					>
						<div
							class="grid h-6.5 w-6.5 place-items-center rounded-full bg-[#edf7ef] text-xs font-bold text-[#347843]"
						>
							✓
						</div>

						<div class="flex flex-1 flex-col gap-px">
							<strong class="text-xs font-bold">Ventas</strong>
							<span class="text-[10px] text-[#858991]"
								>{data.resumen.ventas.registros} registros</span
							>
						</div>

						<span class="text-[10px] font-semibold text-[#347843]">Listo</span>
					</div>

					<div
						class="flex items-center gap-2.75 border-b border-[#f0f1f2] px-0.5 py-3.25 last:border-b-0"
					>
						<!-- Espacio reservado para icono cuando se requiera validar -->
						<div class="flex flex-1 flex-col gap-px">
							<strong class="text-xs font-bold">Facturas de gastos</strong>
							<span class="text-[10px] text-[#858991]"
								>{data.resumen.gastos.registros} CFDI registrados</span
							>
						</div>

						<span class="text-[10px] font-semibold text-[#347843]">Listo</span>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-[15px] border border-[#e6e7ea] bg-white">
				<div class="flex items-center justify-between border-b border-[#eceef0] px-5.5 py-5.25">
					<div>
						<h2 class="m-0 text-base font-bold">¿Cómo cobraron tus ventas?</h2>
						<p class="mt-1 mb-0 text-[11px] text-[#858991]">
							Desglose de tus ventas directas por método de cobro.
						</p>
					</div>
				</div>

				<div class="px-5.5 py-4.75">
					{#each data.resumen.metodosPago as metodo (metodo.metodoPago)}
						<div class="mb-5.25 grid grid-cols-[1fr_130px_35px] items-center gap-3 last:mb-0">
							<div class="flex justify-between text-[11px]">
								<strong class="font-semibold">{metodo.metodoPago}</strong>
								<span class="text-[#777b83]">{formatMoney(metodo.total)}</span>
							</div>

							<div class="h-1.75 overflow-hidden rounded-full bg-[#eceef0]">
								<div
									class="h-full rounded-[inherit] bg-[#292c31]"
									style={`width: ${data.resumen.ventas.total > 0 ? (metodo.total / data.resumen.ventas.total) * 100 : 0}%`}
								></div>
							</div>

							<small class="text-right text-[10px] text-[#777b83]">
								{data.resumen.ventas.total > 0
									? Math.round((metodo.total / data.resumen.ventas.total) * 100)
									: 0}%
							</small>
						</div>
					{:else}
						<p class="m-0 text-xs text-[#858991]">Sin ventas registradas este mes.</p>
					{/each}
				</div>
			</div>
		</section>

		<section class="mt-4.5 overflow-hidden rounded-[15px] border border-[#e6e7ea] bg-white">
			<div class="flex items-center justify-between border-b border-[#eceef0] px-5.5 py-5.25">
				<div>
					<h2 class="m-0 text-base font-bold">Últimos movimientos</h2>
					<p class="mt-1 mb-0 text-[11px] text-[#858991]">
						Ventas y gastos registrados recientemente.
					</p>
				</div>
			</div>

			<div class="w-full max-[600px]:overflow-x-auto">
				<div
					class="grid grid-cols-[100px_1fr_100px_130px] items-center gap-3.75 bg-[#fafafa] px-5.5 py-3.25 text-[10px] text-[#858991] max-[600px]:min-w-[550px]"
				>
					<span>Fecha</span>
					<span>Descripción</span>
					<span>Tipo</span>
					<span>Importe</span>
				</div>

				{#each data.movimientos as movimiento (movimiento.fecha + movimiento.descripcion)}
					<div
						class="grid grid-cols-[100px_1fr_100px_130px] items-center gap-3.75 border-t border-[#f0f1f2] px-5.5 py-3.25 text-[11px] max-[600px]:min-w-[550px]"
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
					<p class="m-0 px-5.5 py-5 text-xs text-[#858991]">Sin movimientos este mes.</p>
				{/each}
			</div>
		</section>
	</main>
</div>
