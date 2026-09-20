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

<div class="tutorial">
	<p class="contador">Paso {paso.numero} de {pasos.length}</p>

	<div class="puntos">
		{#each pasos as p, i (p.numero)}
			<button
				class="punto"
				class:activo={i === indice}
				onclick={() => irAPaso(i)}
				aria-label={`Ir al paso ${p.numero}`}
			></button>
		{/each}
	</div>

	<h2>{paso.titulo}</h2>
	<p class="texto-pantalla">{paso.texto}</p>

	<div class="imagen-wrapper">
		<img
			src={paso.imagen}
			alt={`Captura de pantalla del SAT — ${paso.titulo}`}
			onerror={manejarErrorImagen}
		/>
		<div class="imagen-placeholder">📸 Captura de pantalla del paso {paso.numero}</div>
	</div>

	{#if paso.nota}
		<p class="nota">⚠️ {paso.nota}</p>
	{/if}

	<ul class="acciones">
		{#each paso.acciones as accion (accion)}
			<li>{accion}</li>
		{/each}
	</ul>

	<div class="navegacion">
		<button onclick={anterior} disabled={esPrimero}>← Anterior</button>
		<button onclick={siguiente} disabled={esUltimo}>Siguiente →</button>
	</div>
</div>

<style>
	.tutorial {
		max-width: 560px;
		margin: 0 auto;
		padding: 1.5rem;
		font-family: system-ui, sans-serif;
	}

	.contador {
		margin: 0 0 0.5rem;
		font-size: 0.85rem;
		color: #666;
	}

	.puntos {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 1.25rem;
	}

	.punto {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: none;
		background: #ddd;
		cursor: pointer;
		padding: 0;
	}

	.punto.activo {
		background: #333;
	}

	h2 {
		margin: 0 0 0.5rem;
		font-size: 1.15rem;
	}

	.texto-pantalla {
		margin: 0 0 1rem;
		color: #444;
	}

	.imagen-wrapper {
		margin-bottom: 1rem;
	}

	.imagen-wrapper img {
		width: 100%;
		border: 1px solid #ccc;
		border-radius: 4px;
		display: block;
	}

	.imagen-placeholder {
		display: none;
		width: 100%;
		aspect-ratio: 16 / 9;
		align-items: center;
		justify-content: center;
		border: 1px dashed #ccc;
		border-radius: 4px;
		color: #888;
		text-align: center;
		padding: 1rem;
	}

	.nota {
		background: #fff8e1;
		border-left: 3px solid #f5b942;
		padding: 0.6rem 0.8rem;
		margin: 0 0 1rem;
		font-size: 0.9rem;
	}

	.acciones {
		margin: 0 0 1.5rem;
		padding-left: 1.2rem;
	}

	.acciones li {
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.navegacion {
		display: flex;
		justify-content: space-between;
	}

	.navegacion button {
		padding: 0.5rem 1rem;
		border: 1px solid #333;
		border-radius: 4px;
		background: white;
		cursor: pointer;
	}

	.navegacion button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
