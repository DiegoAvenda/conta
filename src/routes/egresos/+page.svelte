<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	let pestañaActiva = $state('manual'); // 'manual' o 'xml'
	let guardando = $state(false);
	let subiendoXml = $state(false);

	let gastoManual = $state({
		concepto: '',
		categoria: 'Insumos',
		total: '',
		metodoPago: 'cash',
		proveedor: '',
		fecha: new Date().toISOString().slice(0, 10)
	});

	const formatMoney = (cents) =>
		new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(Number(cents ?? 0) / 100);

	const categorias = [
		'Insumos generales',
		'Verdulería / Mercado',
		'Carnicería / Pollería',
		'Tortillería / Panadería',
		'Bebidas y abarrotes',
		'Empaques y desechables',
		'Servicios (Gas, Luz, Agua)',
		'Mantenimiento / Limpieza',
		'Personal / Ayudantes',
		'Renta',
		'Otro'
	];
</script>

<svelte:head>
	<title>Gastos y Facturas · Contaco</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
	<!-- Encabezado -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-black tracking-tight">Gastos y Compras</h1>
			<p class="text-sm text-base-content/70">
				Registra compras del mercado en efectivo y sube tus facturas XML para tu declaración del
				SAT.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<a href={resolve('/sat-monthly')} class="btn btn-primary btn-sm"> Ver Cierre SAT → </a>
		</div>
	</div>

	<!-- Métricas Rápidas -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
			<p class="font-mono text-xs tracking-wider text-base-content/60 uppercase">Total Gastado</p>
			<h2 class="mt-2 text-2xl font-black">{formatMoney(data.resumen.total)}</h2>
			<p class="mt-1 text-xs text-base-content/60">{data.resumen.cantidad} compras registradas</p>
		</div>

		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
			<p class="font-mono text-xs tracking-wider text-emerald-600 uppercase">Con Factura (CFDI)</p>
			<h2 class="mt-2 text-2xl font-black text-emerald-600">
				{formatMoney(data.resumen.conFactura)}
			</h2>
			<p class="mt-1 text-xs text-base-content/60">Deduce IVA ante el SAT</p>
		</div>

		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
			<p class="font-mono text-xs tracking-wider text-amber-600 uppercase">
				Sin Factura (Efectivo)
			</p>
			<h2 class="mt-2 text-2xl font-black text-amber-600">
				{formatMoney(data.resumen.sinFactura)}
			</h2>
			<p class="mt-1 text-xs text-base-content/60">Costo real de insumos diarios</p>
		</div>

		<div class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
			<p class="font-mono text-xs tracking-wider text-base-content/60 uppercase">Dato Fiscal</p>
			<p class="mt-2 text-xs leading-relaxed font-medium text-base-content/75">
				En RESICO, las compras con CFDI reducen tu <strong>pago de IVA</strong> mensual.
			</p>
		</div>
	</div>

	<!-- Mensajes de feedback -->
	{#if form?.error}
		<div class="alert text-sm alert-error shadow-sm">
			<span>{form.error}</span>
		</div>
	{/if}

	{#if form?.successManual}
		<div class="alert text-sm alert-success shadow-sm">
			<span>✓ Gasto registrado exitosamente en tu historial.</span>
		</div>
	{/if}

	{#if form?.successXml}
		<div class="alert text-sm alert-success shadow-sm">
			<span>✓ Se agregaron {form.subidas} factura(s) XML deducible(s).</span>
		</div>
	{/if}

	{#if form?.errores}
		<div class="alert space-y-1 text-sm alert-warning shadow-sm">
			<p class="font-bold">Ocurrieron advertencias al procesar los archivos:</p>
			<ul class="list-disc pl-5 text-xs">
				{#each form.errores as err (err)}
					<li>{err}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Pestañas para Captura -->
	<div class="space-y-5 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
		<div class="flex gap-2 border-b border-base-200 pb-3">
			<button
				type="button"
				onclick={() => (pestañaActiva = 'manual')}
				class="btn btn-sm {pestañaActiva === 'manual' ? 'btn-primary' : 'btn-ghost'}"
			>
				💵 Registrar Compra sin Factura (Efectivo/Mercado)
			</button>
			<button
				type="button"
				onclick={() => (pestañaActiva = 'xml')}
				class="btn btn-sm {pestañaActiva === 'xml' ? 'btn-primary' : 'btn-ghost'}"
			>
				📑 Subir Facturas XML (CFDI)
			</button>
		</div>

		{#if pestañaActiva === 'manual'}
			<!-- Formulario de Gasto Manual -->
			<form
				method="POST"
				action="?/crearManual"
				use:enhance={() => {
					guardando = true;
					return async ({ update }) => {
						await update();
						guardando = false;
						if (!form?.error) {
							gastoManual.concepto = '';
							gastoManual.total = '';
							gastoManual.proveedor = '';
						}
					};
				}}
				class="space-y-4"
			>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<label class="form-control sm:col-span-2 lg:col-span-1">
						<span class="label-text mb-1 text-xs font-semibold">Concepto o Descripción</span>
						<input
							name="concepto"
							type="text"
							placeholder="Ej. Limones, aguacates y cebolla"
							bind:value={gastoManual.concepto}
							required
							class="input-bordered input w-full input-sm"
						/>
					</label>

					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold">Categoría del Gasto</span>
						<select
							name="categoria"
							bind:value={gastoManual.categoria}
							class="select-bordered select w-full select-sm"
						>
							{#each categorias as cat (cat)}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</label>

					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold">Monto Pagado ($ MXN)</span>
						<div class="relative">
							<span
								class="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-base-content/50"
								>$</span
							>
							<input
								name="total"
								type="number"
								step="0.01"
								min="0.01"
								placeholder="0.00"
								bind:value={gastoManual.total}
								required
								class="input-bordered input w-full pl-7 font-mono input-sm"
							/>
						</div>
					</label>

					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold"
							>Lugar de Compra / Proveedor (opcional)</span
						>
						<input
							name="proveedor"
							type="text"
							placeholder="Ej. Tianguis del Carmen"
							bind:value={gastoManual.proveedor}
							class="input-bordered input w-full input-sm"
						/>
					</label>

					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold">Método de Pago</span>
						<select
							name="metodoPago"
							bind:value={gastoManual.metodoPago}
							class="select-bordered select w-full select-sm"
						>
							<option value="cash">Efectivo</option>
							<option value="card">Tarjeta / Terminal</option>
							<option value="transfer">Transferencia (SPEI)</option>
						</select>
					</label>

					<label class="form-control">
						<span class="label-text mb-1 text-xs font-semibold">Fecha</span>
						<input
							name="fecha"
							type="date"
							bind:value={gastoManual.fecha}
							required
							class="input-bordered input w-full input-sm"
						/>
					</label>
				</div>

				<div class="flex justify-end pt-2">
					<button
						type="submit"
						disabled={guardando || !gastoManual.concepto || !gastoManual.total}
						class="btn btn-primary btn-sm"
					>
						{guardando ? 'Guardando...' : '✓ Guardar Gasto Operativo'}
					</button>
				</div>
			</form>
		{:else}
			<!-- Subida masiva de XML -->
			<form
				method="POST"
				action="?/subir"
				enctype="multipart/form-data"
				use:enhance={() => {
					subiendoXml = true;
					return async ({ update }) => {
						await update();
						subiendoXml = false;
					};
				}}
				class="space-y-4"
			>
				<div
					class="space-y-3 rounded-2xl border-2 border-dashed border-base-300 bg-base-200/30 p-8 text-center"
				>
					<span class="text-3xl">📁</span>
					<div>
						<p class="text-sm font-bold">Selecciona los archivos XML de tus facturas de insumos</p>
						<p class="text-xs text-base-content/60">
							Puedes seleccionar varios XML al mismo tiempo
						</p>
					</div>
					<input
						type="file"
						name="xmls"
						accept=".xml"
						multiple
						required
						class="file-input-bordered file-input w-full max-w-xs file-input-sm"
					/>
				</div>

				<div class="flex items-center justify-between pt-2">
					<a href={resolve('/pedir-factura-gasto')} class="text-xs text-primary hover:underline">
						🏷️ Ver mis datos para pedir factura (RFC)
					</a>
					<button type="submit" disabled={subiendoXml} class="btn btn-primary btn-sm">
						{subiendoXml ? 'Validando y cargando...' : '⬆ Procesar y Subir Facturas'}
					</button>
				</div>
			</form>
		{/if}
	</div>

	<!-- Tabla de Gastos Registrados -->
	<section class="space-y-4 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg font-black">Historial de Gastos y Compras</h2>
				<p class="text-xs text-base-content/60">Compras de insumos con y sin comprobante fiscal.</p>
			</div>
		</div>

		{#if data.facturas.length === 0}
			<div class="py-12 text-center text-sm text-base-content/50">
				<p>No tienes gastos registrados todavía.</p>
				<p class="mt-1 text-xs">
					Usa el formulario superior para registrar tus compras diarias de insumos.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr class="border-b border-base-200 font-mono text-xs text-base-content/60 uppercase">
							<th>Fecha</th>
							<th>Tipo</th>
							<th>Concepto / Proveedor</th>
							<th>Categoría</th>
							<th class="text-right">Monto</th>
							<th></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-base-200 text-sm">
						{#each data.facturas as factura (factura._id)}
							<tr class="hover:bg-base-200/40">
								<td class="font-mono text-xs">{factura.fecha}</td>
								<td>
									{#if factura.tieneCfdi}
										<span class="badge badge-sm text-[10px] font-bold text-white badge-success">
											CFDI Deducible
										</span>
									{:else}
										<span class="badge badge-ghost badge-sm text-[10px] font-medium">
											Sin Factura
										</span>
									{/if}
								</td>
								<td>
									<p class="font-semibold">{factura.conceptos?.[0] ?? factura.nombreEmisor}</p>
									{#if factura.nombreEmisor && factura.conceptos?.[0] && factura.nombreEmisor !== factura.conceptos?.[0]}
										<p class="text-xs text-base-content/50">{factura.nombreEmisor}</p>
									{/if}
								</td>
								<td class="text-xs text-base-content/70">{factura.categoria}</td>
								<td class="text-right font-mono font-bold">
									{formatMoney(factura.total)}
								</td>
								<td class="text-right">
									<form method="POST" action="?/eliminar" use:enhance>
										<input type="hidden" name="id" value={factura._id} />
										<button
											type="submit"
											class="btn btn-ghost text-error/60 btn-xs hover:text-error"
											aria-label="Eliminar gasto"
										>
											✕
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
