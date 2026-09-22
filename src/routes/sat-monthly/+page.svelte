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
			maximumFractionDigits: 2
		}).format(Number(value ?? 0));
</script>

<svelte:head>
	<title>Resumen SAT mensual</title>
</svelte:head>

<div class="mx-auto max-w-6xl p-6">
	<div class="mb-6 rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
		<p class="text-xs tracking-[0.2em] text-slate-300 uppercase">Declaración mensual</p>
		<h1 class="mt-2 text-3xl font-bold">Resumen fiscal para el SAT</h1>
		<p class="mt-2 text-sm text-slate-300">
			Periodo: {nombresMes[data.mes - 1]}
			{data.anio}
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-xs tracking-[0.2em] text-slate-500 uppercase">Ventas netas</p>
			<h2 class="mt-2 text-2xl font-bold">{formatMoney(data.summary.sat.ventasNetas)}</h2>
		</div>

		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-xs tracking-[0.2em] text-slate-500 uppercase">IVA trasladado</p>
			<h2 class="mt-2 text-2xl font-bold">{formatMoney(data.summary.iva.trasladado)}</h2>
		</div>

		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-xs tracking-[0.2em] text-slate-500 uppercase">IVA estimado a pagar</p>
			<h2 class="mt-2 text-2xl font-bold">{formatMoney(data.summary.iva.estimado)}</h2>
		</div>
	</div>

	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 class="text-lg font-bold">Resumen fiscal</h2>
			<div class="mt-4 space-y-3 text-sm">
				<div class="flex justify-between">
					<span>Ventas registradas</span>
					<strong>{formatMoney(data.summary.ventas.total)}</strong>
				</div>
				<div class="flex justify-between">
					<span>Devoluciones + cancelaciones</span>
					<strong>{formatMoney(data.summary.ventas.total - data.summary.sat.ventasNetas)}</strong>
				</div>
				<div class="flex justify-between">
					<span>Gastos con factura</span>
					<strong>{formatMoney(data.summary.gastos.total)}</strong>
				</div>
				<div class="flex justify-between">
					<span>IVA acreditable</span>
					<strong>{formatMoney(data.summary.iva.acreditable)}</strong>
				</div>
				<div class="flex justify-between border-t pt-3 font-semibold">
					<span>Utilidad estimada</span>
					<strong>{formatMoney(data.summary.utilidad)}</strong>
				</div>
			</div>
		</section>

		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 class="text-lg font-bold">Qué ingresar en el SAT</h2>
			<div class="mt-4 space-y-3 text-sm">
				<div class="flex justify-between">
					<span>1. Ingresos del periodo</span>
					<strong>{formatMoney(data.summary.ventas.total)}</strong>
				</div>
				<div class="flex justify-between">
					<span>2. IVA trasladado</span>
					<strong>{formatMoney(data.summary.iva.trasladado)}</strong>
				</div>
				<div class="flex justify-between">
					<span>3. IVA acreditable</span>
					<strong>{formatMoney(data.summary.iva.acreditable)}</strong>
				</div>
				<div class="flex justify-between">
					<span>4. IVA a pagar / estimado</span>
					<strong>{formatMoney(data.summary.iva.estimado)}</strong>
				</div>
				<div class="flex justify-between">
					<span>5. Egresos / gastos</span>
					<strong>{formatMoney(data.summary.gastos.total)}</strong>
				</div>
			</div>
		</section>
	</div>

	<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
		<h2 class="text-lg font-bold">Ledger del mes</h2>
		<div class="mt-4 space-y-3">
			{#each data.summary.movimientos as movimiento (movimiento.tipo + movimiento.fecha + movimiento.descripcion)}
				<div class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
					<div>
						<p class="font-medium">{movimiento.descripcion}</p>
						<p class="text-slate-500">{new Date(movimiento.fecha).toLocaleDateString('es-MX')}</p>
					</div>
					<span class={movimiento.monto > 0 ? 'text-emerald-600' : 'text-rose-600'}>
						{movimiento.monto > 0 ? '+' : ''}{formatMoney(movimiento.monto)}
					</span>
				</div>
			{:else}
				<p class="text-sm text-slate-500">Sin movimientos aún para este periodo.</p>
			{/each}
		</div>
	</section>

	<div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
		<strong>Nota:</strong>
		{data.message}
	</div>
</div>
