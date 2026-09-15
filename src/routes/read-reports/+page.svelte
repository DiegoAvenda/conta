<script>
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<main class="mx-auto mt-8 max-w-2xl rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-6 text-2xl font-bold text-gray-800">Cargar Reporte de Ventas PDF</h1>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
		class="space-y-4"
	>
		<div>
			<label for="reporte" class="mb-1 block text-sm font-medium text-gray-700">
				Selecciona el reporte PDF (Uber, DiDi, Etsy, etc.):
			</label>
			<input
				type="file"
				id="reporte"
				name="reporte"
				accept="application/pdf"
				required
				class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
		>
			{loading ? 'Procesando PDF con Groq...' : 'Extraer Datos Contables'}
		</button>
	</form>

	{#if form?.error}
		<div class="mt-4 rounded border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
			<p class="font-medium">Error</p>
			<p class="text-sm">{form.error}</p>
		</div>
	{/if}

	{#if form?.success && form?.data}
		<div class="mt-6 overflow-hidden rounded-lg border bg-gray-50 p-4">
			<h2 class="mb-3 text-lg font-bold text-gray-800">
				Resumen: {form.data.plataforma || 'Plataforma'} ({form.data.periodo || 'Periodo N/A'})
			</h2>

			<div class="space-y-2 text-sm text-gray-700">
				<div class="flex justify-between border-b pb-1">
					<span>Ventas Brutas:</span>
					<span class="font-semibold">${form.data.ventas_brutas ?? 0}</span>
				</div>
				<div class="flex justify-between border-b pb-1">
					<span>Comisiones Plataforma:</span>
					<span class="text-red-600">-${form.data.comisiones_plataforma ?? 0}</span>
				</div>
				<div class="flex justify-between border-b pb-1">
					<span>IVA Retenido:</span>
					<span class="text-red-600">-${form.data.iva_retenido ?? 0}</span>
				</div>
				<div class="flex justify-between border-b pb-1">
					<span>ISR Retenido:</span>
					<span class="text-red-600">-${form.data.isr_retenido ?? 0}</span>
				</div>
				<div class="flex justify-between pt-2 text-base font-bold text-gray-900">
					<span>Ganancia Neta:</span>
					<span class="text-green-600">${form.data.ganancia_neta ?? 0}</span>
				</div>
			</div>
		</div>
	{/if}
</main>
