<script>
	import { enhance } from '$app/forms';

	let step = $state(1);
	let montoAnual = $state(null);
	let guardando = $state(false);
	let guardado = $state(false);
	let errorGuardado = $state(null);

	const resultado = $derived(
		montoAnual === 'alto'
			? {
					regimen: 'Actividad Empresarial y Profesional',
					codigo: '612',
					texto:
						'Tu estimación rebasa el límite anual de RESICO. El siguiente paso es confirmar tus obligaciones con un contador y tu Constancia de Situación Fiscal.'
				}
			: {
					regimen: 'RESICO para personas físicas',
					codigo: '626',
					texto:
						'Por tu estimación, RESICO puede ser una opción. Confírmalo antes de usarlo con tu Constancia de Situación Fiscal y, si tienes otras actividades o impedimentos, con un contador.'
				}
	);

	function continuar(monto) {
		montoAnual = monto;
		step = 2;
	}

	function guardar() {
		guardando = true;
		errorGuardado = null;
		return async ({ result, update }) => {
			guardando = false;
			if (result.type === 'success') {
				guardado = true;
			} else {
				errorGuardado = result.data?.mensaje ?? 'No se pudo guardar tu perfil. Intenta de nuevo.';
			}
			await update({ reset: false });
		};
	}
</script>

<main class="mx-auto max-w-2xl p-6 sm:p-10">
	<section class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-10">
		<p class="mb-3 font-mono text-xs font-bold tracking-widest text-primary">
			CONFIGURACIÓN FISCAL INICIAL
		</p>
		<h1 class="text-3xl font-black tracking-tight">Ventas directas, sin plataformas</h1>
		<p class="mt-3 leading-relaxed text-base-content/70">
			Este MVP contempla ventas en mostrador, por WhatsApp o entrega propia. No incluye ventas ni
			retenciones de plataformas digitales.
		</p>

		{#if step === 1}
			<div class="mt-8 rounded-2xl bg-base-200 p-5">
				<h2 class="font-bold">¿Cuánto esperas facturar al año por ventas directas?</h2>
				<div class="mt-4 grid gap-3 sm:grid-cols-2">
					<button class="btn h-auto justify-start py-4 text-left" onclick={() => continuar('bajo')}>
						<span>
							<span class="block font-bold">Hasta $3,500,000 MXN</span>
							<span class="mt-1 block text-xs font-normal opacity-70"
								>Revisaremos si RESICO puede aplicar.</span
							>
						</span>
					</button>
					<button class="btn h-auto justify-start py-4 text-left" onclick={() => continuar('alto')}>
						<span>
							<span class="block font-bold">Más de $3,500,000 MXN</span>
							<span class="mt-1 block text-xs font-normal opacity-70"
								>Usaremos Actividad Empresarial como referencia inicial.</span
							>
						</span>
					</button>
				</div>
			</div>
		{:else}
			<div class="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
				<p class="text-xs font-bold tracking-wider text-primary">RESULTADO PRELIMINAR</p>
				<h2 class="mt-2 text-xl font-black">{resultado.regimen} · {resultado.codigo}</h2>
				<p class="mt-2 text-sm leading-relaxed text-base-content/75">{resultado.texto}</p>
			</div>

			<p class="mt-5 text-xs leading-relaxed text-base-content/60">
				Esta guía no sustituye la Constancia de Situación Fiscal ni asesoría contable. Contaco usará
				el resultado únicamente para personalizar la experiencia inicial.
			</p>

			{#if guardado}
				<p class="mt-5 font-semibold text-success">✓ Perfil guardado.</p>
			{:else}
				<form method="POST" action="?/guardarPerfil" use:enhance={guardar} class="mt-6 flex gap-3">
					<input type="hidden" name="montoAnual" value={montoAnual} />
					<button class="btn btn-primary" type="submit" disabled={guardando}>
						{guardando ? 'Guardando…' : 'Guardar mi perfil'}
					</button>
					<button class="btn btn-ghost" type="button" onclick={() => (step = 1)}>Cambiar</button>
				</form>
			{/if}

			{#if errorGuardado}
				<p class="mt-3 text-sm text-error">{errorGuardado}</p>
			{/if}
		{/if}
	</section>
</main>
