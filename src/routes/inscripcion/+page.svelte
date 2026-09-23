<script>
	import { pasos } from '$lib/utils/sat-registration';

	let indice = $state(0);

	let paso = $derived(pasos[indice]);
	let esPrimero = $derived(indice === 0);
	let esUltimo = $derived(indice === pasos.length - 1);

	function anterior() {
		if (!esPrimero) indice -= 1;
	}

	function siguiente() {
		if (!esUltimo) indice += 1;
	}

	function irAPaso(i) {
		indice = i;
	}

	function manejarErrorImagen(evento) {
		evento.target.style.display = 'none';
		evento.target.nextElementSibling.style.display = 'flex';
	}
</script>

<div class="mx-auto max-w-140 p-6 font-sans">
	<p class="mb-2 text-[0.85rem] text-slate-500">Paso {paso.numero} de {pasos.length}</p>

	<div class="mb-5 flex gap-1.5">
		{#each pasos as p, i (p.numero)}
			<button
				class="h-2.5 w-2.5 cursor-pointer rounded-full border-0 bg-slate-300 p-0 transition-colors"
				class:bg-slate-800={i === indice}
				onclick={() => irAPaso(i)}
				aria-label={`Ir al paso ${p.numero}`}
			></button>
		{/each}
	</div>

	<h2 class="mb-2 text-[1.15rem] font-semibold text-slate-800">{paso.titulo}</h2>
	<p class="mb-4 text-slate-600">{paso.texto}</p>

	{#if paso.imagen}
		<div class="mb-4">
			<img
				class="block w-full rounded-md border border-slate-300"
				src={paso.imagen}
				alt={`Captura de pantalla del SAT — ${paso.titulo}`}
				onerror={manejarErrorImagen}
			/>
			<div
				class="hidden aspect-video w-full items-center justify-center rounded-md border border-dashed border-slate-300 p-4 text-center text-slate-500"
			>
				📸 Captura de pantalla del paso {paso.numero}
			</div>
		</div>
	{/if}

	{#if paso.nota}
		<p class="mb-4 border-l-4 border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
			⚠️ {paso.nota}
		</p>
	{/if}

	<ul class="mb-6 list-disc pl-5 text-slate-700">
		{#each paso.acciones as accion (accion)}
			<li class="mb-2 leading-relaxed">{accion}</li>
		{/each}
	</ul>

	<div class="flex justify-between gap-3">
		<button
			onclick={anterior}
			disabled={esPrimero}
			class="rounded-md border border-slate-800 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
		>
			← Anterior
		</button>
		<button
			onclick={siguiente}
			disabled={esUltimo}
			class="rounded-md border border-slate-800 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
		>
			Siguiente →
		</button>
	</div>
</div>
