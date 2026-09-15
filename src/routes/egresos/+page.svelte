<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();
	let subiendo = $state(false);

	// TODO: capturar gastos sin CFDI (efectivo, tianguis, mercado — no dan factura).
	// No son deducibles de impuestos, así que no entran al resumenFiscal por ahora,
	// pero sí importan para ver el gasto real del negocio (control interno).
	// No hay XML de dónde parsear, así que ese flujo sí sería captura manual.
</script>

<h1 class="mb-4 font-['Press_Start_2P'] text-lg text-[#ffd23f]">⚔ Mis Facturas</h1>

<a
	href={resolve('/dashboard')}
	class="border-b-2 border-[#ffd23f] pb-0.5 font-['Press_Start_2P'] text-xs text-[#ffd23f]"
>
	› Ver resumen fiscal
</a>

<div class="mt-6 border-4 border-[#4ecdc4] bg-[#1a1a3e] p-5 shadow-[6px_6px_0_#000]">
	<form
		method="POST"
		action="?/subir"
		enctype="multipart/form-data"
		use:enhance={() => {
			subiendo = true;
			return async ({ update }) => {
				await update();
				subiendo = false;
			};
		}}
	>
		<label for="xmls" class="mb-2 block font-['VT323'] text-xl">
			Sube los XML de tus CFDI (puedes seleccionar varios)
		</label>
		<input id="xmls" name="xmls" type="file" accept=".xml" multiple required class="mb-3 block" />

		<button
			type="submit"
			disabled={subiendo}
			class="cursor-pointer border-[3px] border-black bg-[#ffd23f] px-4 py-3 font-['Press_Start_2P'] text-xs text-black shadow-[4px_4px_0_#000] transition-transform duration-75 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
		>
			{subiendo ? 'CARGANDO...' : '⬆ SUBIR'}
		</button>

		{#if form?.success}
			<p class="mt-2 font-['VT323'] text-xl text-[#5cdb95]">
				+{form.subidas} factura(s) agregada(s) al inventario
			</p>
		{/if}

		{#if form?.errores}
			<ul class="mt-2 font-['VT323'] text-xl text-[#ff4d6d]">
				{#each form.errores as error (error)}
					<li>{error}</li>
				{/each}
			</ul>
		{/if}
	</form>
</div>

<div class="mt-6 border-4 border-[#4ecdc4] bg-[#1a1a3e] p-5 shadow-[6px_6px_0_#000]">
	{#each data.facturas as factura (factura._id)}
		<div
			class="grid grid-cols-[1fr_1fr_2fr_1fr_auto] items-center gap-4 border-b-2 border-dashed border-gray-700 py-2 font-['VT323'] text-xl"
		>
			<span>{factura.fecha}</span>
			<span
				class="w-fit px-2 py-1 font-['Press_Start_2P'] text-[0.55rem] {factura.tipo === 'gasto'
					? 'bg-[#ff4d6d] text-white'
					: 'bg-[#5cdb95] text-black'}"
			>
				{factura.tipo}
			</span>
			<span>{factura.nombreEmisor}</span>
			<span>${factura.total.toFixed(2)}</span>

			<form method="POST" action="?/eliminar" use:enhance>
				<input type="hidden" name="id" value={factura._id} />
				<button
					type="submit"
					class="cursor-pointer border-[3px] border-black bg-[#ff4d6d] px-4 py-3 font-['Press_Start_2P'] text-xs text-white shadow-[4px_4px_0_#000] transition-transform duration-75 active:translate-x-1 active:translate-y-1 active:shadow-none"
				>
					✕
				</button>
			</form>
		</div>
	{/each}
</div>
