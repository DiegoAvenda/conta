<script>
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

	const formatMoney = (value) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(Number(value ?? 0) / 100);

	let copiadoId = $state(null);

	function copiarMonto(id, valor) {
		const texto = (Number(valor ?? 0) / 100).toFixed(2);
		navigator.clipboard.writeText(texto);
		copiadoId = id;
		setTimeout(() => {
			if (copiadoId === id) copiadoId = null;
		}, 2000);
	}
</script>

<svelte:head>
	<title>Resumen SAT mensual (RESICO) · Contaco</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
	<!-- Encabezado -->
	<div class="rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<p class="font-mono text-xs tracking-widest text-emerald-400 uppercase">
					DECLARACIÓN PROVISIONAL MENSUAL · RESICO PERSONAS FÍSICAS
				</p>
				<h1 class="mt-2 text-3xl font-black">Cierre Fiscal para el SAT</h1>
				<p class="mt-1 text-sm text-slate-300">
					Periodo: <strong>{nombresMes[data.mes - 1]} {data.anio}</strong> · Tasa RESICO calculada:
					<span
						class="inline-block rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-emerald-300"
					>
						{data.summary.sat.tasaIsrPorcentaje}
					</span>
				</p>
			</div>
			<div class="flex flex-col items-end gap-3 text-right">
				<div class="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
					<p class="text-xs text-slate-400">Total estimado a pagar al SAT</p>
					<p class="text-3xl font-black text-emerald-400">
						{formatMoney(data.summary.sat.totalEstimadoPagar)}
					</p>
				</div>
				<button
					type="button"
					onclick={() => window.print()}
					class="no-print btn border-white/30 btn-outline text-white btn-sm hover:bg-white hover:text-slate-900"
				>
					🖨️ Imprimir / Guardar Ficha SAT (PDF)
				</button>
			</div>
		</div>
	</div>

	<!-- Métricas Rápidas Clave -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
			<p class="font-mono text-xs tracking-wider text-base-content/60 uppercase">
				Ingresos Cobrados
			</p>
			<h2 class="mt-2 text-2xl font-black">
				{formatMoney(data.summary.sat.ingresosEfectivamenteCobrados)}
			</h2>
			<p class="mt-1 text-xs text-base-content/60">Base para cálculo de ISR</p>
		</div>

		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
			<p class="font-mono text-xs tracking-wider text-base-content/60 uppercase">
				ISR a Pagar ({data.summary.sat.tasaIsrPorcentaje})
			</p>
			<h2 class="mt-2 text-2xl font-black text-primary">
				{formatMoney(data.summary.sat.isrEstimado)}
			</h2>
			<p class="mt-1 text-xs text-base-content/60">Art. 113-E LISR</p>
		</div>

		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
			<p class="font-mono text-xs tracking-wider text-base-content/60 uppercase">IVA a Pagar</p>
			<h2 class="mt-2 text-2xl font-black text-primary">
				{formatMoney(data.summary.sat.ivaEstimado)}
			</h2>
			<p class="mt-1 text-xs text-base-content/60">Cobrado menos Acreditable</p>
		</div>

		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
			<p class="font-mono text-xs tracking-wider text-base-content/60 uppercase">
				Utilidad Operativa
			</p>
			<h2
				class="mt-2 text-2xl font-black {data.summary.utilidad >= 0
					? 'text-emerald-600'
					: 'text-rose-600'}"
			>
				{formatMoney(data.summary.utilidad)}
			</h2>
			<p class="mt-1 text-xs text-base-content/60">Control interno del restaurante</p>
		</div>
	</div>

	<!-- 2 Columnas: Guía SAT vs Control Interno -->
	<div class="grid items-start gap-6 lg:grid-cols-12">
		<!-- Columna Izquierda: Casillas Exactas del Portal del SAT (7 cols) -->
		<section
			class="space-y-6 rounded-3xl border border-primary/20 bg-base-100 p-6 shadow-md lg:col-span-7"
		>
			<div>
				<div class="flex items-center gap-2">
					<span class="badge font-mono text-xs badge-primary">PASO A PASO</span>
					<h2 class="text-xl font-black">Qué ingresar en el portal del SAT</h2>
				</div>
				<p class="mt-1 text-xs text-base-content/70">
					Copia estos valores directamente en los campos del formulario de tu declaración mensual de
					RESICO.
				</p>
			</div>

			<div class="space-y-4">
				<!-- Sección ISR -->
				<div class="space-y-3 rounded-2xl border border-base-200 bg-base-200/40 p-4">
					<p class="text-xs font-bold tracking-wider text-primary uppercase">
						1. Módulo ISR (Régimen Simplificado de Confianza)
					</p>

					<div class="flex items-center justify-between border-b border-base-200 py-1 text-sm">
						<div>
							<p class="font-medium">Total de ingresos efectivamente cobrados</p>
							<p class="text-xs text-base-content/60">
								Ventas netas sin IVA (después de devoluciones)
							</p>
						</div>
						<div class="flex items-center gap-2">
							<strong class="font-mono text-base"
								>{formatMoney(data.summary.sat.ingresosEfectivamenteCobrados)}</strong
							>
							<button
								type="button"
								onclick={() =>
									copiarMonto('isr_ingresos', data.summary.sat.ingresosEfectivamenteCobrados)}
								class="btn btn-ghost btn-xs"
							>
								{copiadoId === 'isr_ingresos' ? '✓ Copiado' : 'Copiar'}
							</button>
						</div>
					</div>

					<div class="flex items-center justify-between border-b border-base-200 py-1 text-sm">
						<div>
							<p class="font-medium">Tasa aplicable</p>
							<p class="text-xs text-base-content/60">Se selecciona o calcula automáticamente</p>
						</div>
						<span class="badge font-mono badge-neutral">{data.summary.sat.tasaIsrPorcentaje}</span>
					</div>

					<div class="flex items-center justify-between py-1 text-sm">
						<div>
							<p class="font-medium">Impuesto a cargo (ISR causado)</p>
							<p class="text-xs text-base-content/60">Total a pagar de ISR</p>
						</div>
						<div class="flex items-center gap-2">
							<strong class="font-mono text-base text-primary"
								>{formatMoney(data.summary.sat.isrEstimado)}</strong
							>
							<button
								type="button"
								onclick={() => copiarMonto('isr_total', data.summary.sat.isrEstimado)}
								class="btn btn-ghost btn-xs"
							>
								{copiadoId === 'isr_total' ? '✓ Copiado' : 'Copiar'}
							</button>
						</div>
					</div>
				</div>

				<!-- Sección IVA -->
				<div class="space-y-3 rounded-2xl border border-base-200 bg-base-200/40 p-4">
					<p class="text-xs font-bold tracking-wider text-primary uppercase">
						2. Módulo IVA (Impuesto al Valor Agregado)
					</p>

					<div class="flex items-center justify-between border-b border-base-200 py-1 text-sm">
						<div>
							<p class="font-medium">Actividades gravadas a la tasa del 16%</p>
							<p class="text-xs text-base-content/60">Base de alimentos preparados vendidos</p>
						</div>
						<div class="flex items-center gap-2">
							<strong class="font-mono text-base"
								>{formatMoney(data.summary.sat.ingresosEfectivamenteCobrados)}</strong
							>
							<button
								type="button"
								onclick={() =>
									copiarMonto('iva_base', data.summary.sat.ingresosEfectivamenteCobrados)}
								class="btn btn-ghost btn-xs"
							>
								{copiadoId === 'iva_base' ? '✓ Copiado' : 'Copiar'}
							</button>
						</div>
					</div>

					<div class="flex items-center justify-between border-b border-base-200 py-1 text-sm">
						<div>
							<p class="font-medium">IVA trasladado cobrado (16%)</p>
							<p class="text-xs text-base-content/60">Impuesto cobrado a los clientes</p>
						</div>
						<div class="flex items-center gap-2">
							<strong class="font-mono text-base">{formatMoney(data.summary.iva.trasladado)}</strong
							>
							<button
								type="button"
								onclick={() => copiarMonto('iva_trasladado', data.summary.iva.trasladado)}
								class="btn btn-ghost btn-xs"
							>
								{copiadoId === 'iva_trasladado' ? '✓ Copiado' : 'Copiar'}
							</button>
						</div>
					</div>

					<div class="flex items-center justify-between border-b border-base-200 py-1 text-sm">
						<div>
							<p class="font-medium">Gastos operativos del periodo</p>
							<p class="text-xs text-base-content/60">
								Registro interno del negocio sin deducción por CFDI
							</p>
						</div>
						<div class="flex items-center gap-2">
							<strong class="font-mono text-base"
								>{formatMoney(data.summary.iva.acreditable)}</strong
							>
							<button
								type="button"
								onclick={() => copiarMonto('iva_acreditable', data.summary.iva.acreditable)}
								class="btn btn-ghost btn-xs"
							>
								{copiadoId === 'iva_acreditable' ? '✓ Copiado' : 'Copiar'}
							</button>
						</div>
					</div>

					<div class="flex items-center justify-between py-1 text-sm">
						<div>
							<p class="font-medium">IVA a cargo / a pagar</p>
							<p class="text-xs text-base-content/60">Diferencia neta a liquidar</p>
						</div>
						<div class="flex items-center gap-2">
							<strong class="font-mono text-base text-primary"
								>{formatMoney(data.summary.iva.estimado)}</strong
							>
							<button
								type="button"
								onclick={() => copiarMonto('iva_total', data.summary.iva.estimado)}
								class="btn btn-ghost btn-xs"
							>
								{copiadoId === 'iva_total' ? '✓ Copiado' : 'Copiar'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Columna Derecha: Resumen de Control Interno (5 cols) -->
		<aside class="space-y-6 lg:col-span-5">
			<section class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
				<h2 class="text-lg font-black">Control Operativo del Negocio</h2>
				<p class="mt-1 text-xs text-base-content/60">
					Diferencia entre lo que ingresó y lo que gastó el restaurante este mes.
				</p>

				<div class="mt-4 space-y-3 font-mono text-sm">
					<div class="flex justify-between">
						<span class="text-base-content/70">Ventas brutas:</span>
						<strong>{formatMoney(data.summary.ventas.total)}</strong>
					</div>
					<div class="flex justify-between text-rose-600">
						<span>(-) Devoluciones/Cancelaciones:</span>
						<strong
							>-{formatMoney(
								data.summary.ventas.total - data.summary.sat.ingresosEfectivamenteCobrados
							)}</strong
						>
					</div>
					<div class="flex justify-between border-t border-base-200 pt-2 font-bold">
						<span>Ventas netas:</span>
						<span>{formatMoney(data.summary.sat.ingresosEfectivamenteCobrados)}</span>
					</div>
					<div class="flex justify-between text-base-content/80">
						<span>(-) Gastos del negocio:</span>
						<strong>-{formatMoney(data.summary.gastos.total)}</strong>
					</div>
					{#if data.summary.gastos.sinFactura > 0}
						<div class="flex justify-between text-amber-600">
							<span>(-) Insumos sin factura:</span>
							<strong>-{formatMoney(data.summary.gastos.sinFactura)}</strong>
						</div>
					{/if}
					<div class="flex justify-between border-t-2 border-base-300 pt-3 text-base font-black">
						<span>Utilidad operativa:</span>
						<span class={data.summary.utilidad >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
							{formatMoney(data.summary.utilidad)}
						</span>
					</div>
				</div>

				<div class="mt-6 space-y-2 rounded-2xl bg-base-200/60 p-4 text-xs text-base-content/70">
					<p class="font-bold text-base-content">💡 Recuerda sobre RESICO:</p>
					<p>
						Los gastos de proveedores <strong>no restan el pago de ISR</strong>, pero son
						indispensables para
						<strong>reducir el IVA</strong> que debes entregar al SAT cada mes.
					</p>
				</div>
			</section>
		</aside>
	</div>

	<!-- Ledger de Movimientos del Mes -->
	<section class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
		<h2 class="text-lg font-black">Movimientos registrados en el mes</h2>
		<p class="text-xs text-base-content/60">
			Historial cronológico de ventas, compras y cancelaciones.
		</p>

		<div class="mt-4 divide-y divide-base-200">
			{#each data.summary.movimientos as movimiento (movimiento.tipo + movimiento.fecha + movimiento.descripcion)}
				<div class="flex items-center justify-between py-3 text-sm">
					<div>
						<div class="flex items-center gap-2">
							<span
								class="badge badge-xs {movimiento.tipo === 'Venta'
									? 'badge-success'
									: movimiento.tipo === 'Gasto'
										? 'badge-error'
										: 'badge-warning'}"
							>
								{movimiento.tipo}
							</span>
							<p class="font-medium">{movimiento.descripcion}</p>
						</div>
						<p class="text-xs text-base-content/50">
							{new Date(movimiento.fecha).toLocaleDateString('es-MX')}
						</p>
					</div>
					<span
						class="font-mono font-bold {movimiento.monto > 0
							? 'text-emerald-600'
							: 'text-rose-600'}"
					>
						{movimiento.monto > 0 ? '+' : ''}{formatMoney(movimiento.monto)}
					</span>
				</div>
			{:else}
				<p class="py-6 text-center text-sm text-base-content/50">
					Sin movimientos registrados para este periodo.
				</p>
			{/each}
		</div>
	</section>

	<div
		class="no-print rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900"
	>
		<strong>Aviso Fiscal:</strong>
		{data.message}
	</div>
</div>

<style>
	@media print {
		:global(header.navbar),
		:global(footer),
		:global(.no-print),
		button,
		.no-print {
			display: none !important;
		}

		:global(body) {
			background: white !important;
			color: black !important;
			font-size: 11pt;
		}

		div {
			box-shadow: none !important;
		}
	}
</style>
