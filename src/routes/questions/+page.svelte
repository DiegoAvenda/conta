<script>
	import { enhance } from '$app/forms';

	// Estado del wizard: 1, 2, 3 o 'resultado'
	let step = $state(1);

	let guardando = $state(false);
	let guardado = $state(false);
	let errorGuardado = $state(null);

	function manejarGuardado() {
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

	let canal = $state(null); // 'apps' | 'local' | 'ambos'
	let montoLocal = $state(null); // 'bajo' | 'alto' | null
	let montoApps = $state(null); // 'bajo' | 'alto' | null

	let necesitaPreguntaLocal = $derived(canal === 'local' || canal === 'ambos');
	let necesitaPreguntaApps = $derived(canal === 'apps' || canal === 'ambos');

	let nivelActual = $derived(step === 'resultado' ? 3 : step === 1 ? 1 : step === 2 ? 2 : 3);

	function elegirCanal(valor) {
		canal = valor;
		if (valor === 'apps') montoLocal = 0;
		if (valor === 'local') montoApps = 0;
		step = necesitaPreguntaLocal ? 2 : 3;
	}

	function elegirMontoLocal(valor) {
		montoLocal = valor;
		step = necesitaPreguntaApps ? 3 : 'resultado';
	}

	function elegirMontoApps(valor) {
		montoApps = valor;
		step = 'resultado';
	}

	function reiniciar() {
		step = 1;
		canal = null;
		montoLocal = null;
		montoApps = null;
		guardando = false;
		guardado = false;
		errorGuardado = null;
	}

	let resultado = $derived.by(() => {
		if (canal === null) return null;

		if (canal === 'local') {
			if (montoLocal === 'alto') {
				return {
					emoji: '⚠️',
					regimen: 'Régimen General',
					subtitulo: 'JEFE DEMASIADO FUERTE',
					texto:
						'Facturas más de $3,500,000 al año solo en tu local. RESICO ya no te aplica; te toca Actividad Empresarial en Régimen General. Esta batalla se pone técnica — te conviene invocar a un contador.',
					rareza: 'especial'
				};
			}
			return {
				emoji: '🍲',
				regimen: 'RESICO',
				subtitulo: 'CLASE DESBLOQUEADA',
				texto:
					'Vendes directo (efectivo, transferencia, WhatsApp) y nada por apps. Te corresponde RESICO: pagas un ISR mínimo de 1% a 1.5% sobre lo que factures, más IVA.',
				rareza: 'epico'
			};
		}

		if (canal === 'apps') {
			if (montoApps === 'bajo') {
				return {
					emoji: '😈',
					regimen: 'Plataformas — Pago Definitivo',
					subtitulo: 'BOSS DERROTADO SIN PELEAR',
					texto:
						'Solo vendes por apps y facturas menos de $300,000 al año. Uber/Rappi ya te retienen y le pagan al SAT por ti. Estás libre de culpa... por ahora. Podéis ir en paz 😇',
					rareza: 'comun'
				};
			}
			return {
				emoji: '📊',
				regimen: 'Plataformas — Pago Provisional',
				subtitulo: 'CLASE DESBLOQUEADA',
				texto:
					'Solo vendes por apps pero facturas más de $300,000 al año. Ya no basta con la retención automática: hay que ajustar esos pagos contra tus gastos deducibles (carne, desechables, gas).',
				rareza: 'epico'
			};
		}

		return {
			emoji: '🚨',
			regimen: 'Plataformas + Actividad Empresarial',
			subtitulo: 'FUSIÓN DE CLASES',
			texto:
				'Vendes por apps Y directo. Esta combinación bloquea RESICO. Declaras ambas fuentes de ingreso juntas cada mes — te acompañamos casilla por casilla.',
			rareza: 'epico'
		};
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="arcade">
	<div class="ventana">
		{#if step !== 'resultado'}
			<div class="barra-nivel">
				<span class="barra-etiqueta">NIVEL {nivelActual}/3</span>
				<div class="barra-segmentos">
					{#each [1, 2, 3] as n (n)}
						<div class="segmento" class:lleno={n <= nivelActual}></div>
					{/each}
				</div>
			</div>
		{/if}

		{#if step === 1}
			<h2>ELIGE TU CLASE DE NEGOCIO</h2>
			<p class="ayuda">No hay clase incorrecta, solo definimos tu build.</p>
			<div class="menu">
				<button onclick={() => elegirCanal('apps')}>
					<span class="icono">📱</span>
					<span class="texto-btn">
						<span class="clase">CLASE: DELIVERY</span>
						<span class="nombre">Solo por apps</span>
					</span>
				</button>
				<button onclick={() => elegirCanal('local')}>
					<span class="icono">🏠</span>
					<span class="texto-btn">
						<span class="clase">CLASE: LOCAL</span>
						<span class="nombre">Solo directo</span>
					</span>
				</button>
				<button onclick={() => elegirCanal('ambos')}>
					<span class="icono">🔀</span>
					<span class="texto-btn">
						<span class="clase">CLASE: HÍBRIDO</span>
						<span class="nombre">Apps y directo</span>
					</span>
				</button>
			</div>
		{/if}

		{#if step === 2 && necesitaPreguntaLocal}
			<h2>TU FACTURACIÓN LOCAL</h2>
			<p class="ayuda">Efectivo, transferencia y WhatsApp — sin contar apps.</p>
			<div class="menu">
				<button onclick={() => elegirMontoLocal('bajo')}>
					<span class="icono">💰</span>
					<span class="texto-btn">
						<span class="nombre">Menos de $3,500,000 / año</span>
					</span>
				</button>
				<button onclick={() => elegirMontoLocal('alto')}>
					<span class="icono">💎</span>
					<span class="texto-btn">
						<span class="nombre">Más de $3,500,000 / año</span>
					</span>
				</button>
			</div>
		{/if}

		{#if step === 3 && necesitaPreguntaApps}
			<h2>TU FACTURACIÓN EN APPS</h2>
			<p class="ayuda">Suma Uber Eats, Rappi, Didi Food, etc.</p>
			<div class="menu">
				<button onclick={() => elegirMontoApps('bajo')}>
					<span class="icono">💰</span>
					<span class="texto-btn">
						<span class="nombre">Menos de $300,000 / año</span>
					</span>
				</button>
				<button onclick={() => elegirMontoApps('alto')}>
					<span class="icono">💎</span>
					<span class="texto-btn">
						<span class="nombre">Más de $300,000 / año</span>
					</span>
				</button>
			</div>
		{/if}

		{#if step === 'resultado' && resultado}
			<div class="resultado">
				<span class="resultado-subtitulo">{resultado.subtitulo}</span>
				<div class="resultado-emoji">{resultado.emoji}</div>
				<h2>{resultado.regimen}</h2>
				<p>{resultado.texto}</p>

				{#if resultado.rareza === 'comun'}
					<span class="badge-comun badge">ITEM COMÚN — Gratis con anuncios</span>
				{:else if resultado.rareza === 'epico'}
					<span class="badge-epico badge">ITEM ÉPICO — Requiere suscripción</span>
				{:else}
					<span class="badge-especial badge">MISIÓN ESPECIAL — Habla con un contador</span>
				{/if}

				{#if guardado}
					<p class="guardado-ok">✓ Perfil guardado</p>
				{:else}
					<form method="POST" action="?/guardarPerfil" use:enhance={manejarGuardado}>
						<input type="hidden" name="canal" value={canal} />
						<input type="hidden" name="montoLocal" value={montoLocal || ''} />
						<input type="hidden" name="montoApps" value={montoApps || ''} />
						<button class="guardar" type="submit" disabled={guardando}>
							{guardando ? 'Guardando...' : 'Guardar mi perfil'}
						</button>
					</form>
					{#if errorGuardado}
						<p class="error-guardado">{errorGuardado}</p>
					{/if}
				{/if}

				<button class="reiniciar" onclick={reiniciar}>↺ Volver a jugar</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.arcade {
		display: flex;
		justify-content: center;
		padding: 2rem 1rem;
		background: #1a1428;
		font-family: 'VT323', monospace;
	}

	.ventana {
		width: 100%;
		max-width: 460px;
		background: #2b2140;
		padding: 1.75rem;
		clip-path: polygon(
			0 12px,
			12px 12px,
			12px 0,
			calc(100% - 12px) 0,
			calc(100% - 12px) 12px,
			100% 12px,
			100% calc(100% - 12px),
			calc(100% - 12px) calc(100% - 12px),
			calc(100% - 12px) 100%,
			12px 100%,
			12px calc(100% - 12px),
			0 calc(100% - 12px)
		);
		box-shadow: 6px 6px 0 0 #0d0a14;
	}

	h2 {
		font-family: 'Press Start 2P', monospace;
		color: #f5b942;
		font-size: 1rem;
		line-height: 1.5;
		margin: 0 0 0.75rem;
	}

	.ayuda {
		color: #c9c1de;
		font-size: 1.15rem;
		margin: 0 0 1.5rem;
	}

	.barra-nivel {
		margin-bottom: 1.5rem;
	}

	.barra-etiqueta {
		display: block;
		font-family: 'Press Start 2P', monospace;
		font-size: 0.65rem;
		color: #f4eedd;
		margin-bottom: 0.5rem;
	}

	.barra-segmentos {
		display: flex;
		gap: 4px;
	}

	.segmento {
		flex: 1;
		height: 14px;
		background: #16121f;
		border: 2px solid #0d0a14;
	}

	.segmento.lleno {
		background: #f5b942;
	}

	.menu {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.menu button {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.75rem 0.9rem;
		background: #16121f;
		border: 3px solid #0d0a14;
		box-shadow: 4px 4px 0 0 #0d0a14;
		cursor: pointer;
		text-align: left;
		font-family: 'VT323', monospace;
		transition: transform 0.05s ease;
	}

	.menu button:hover {
		background: #3a2d59;
	}

	.menu button:active {
		transform: translate(4px, 4px);
		box-shadow: 0 0 0 0 #0d0a14;
	}

	.icono {
		font-size: 1.75rem;
		line-height: 1;
	}

	.texto-btn {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.clase {
		font-family: 'Press Start 2P', monospace;
		font-size: 0.55rem;
		color: #52c97a;
	}

	.nombre {
		font-size: 1.25rem;
		color: #f4eedd;
	}

	.resultado {
		text-align: center;
	}

	.resultado-subtitulo {
		display: inline-block;
		font-family: 'Press Start 2P', monospace;
		font-size: 0.6rem;
		color: #52c97a;
		margin-bottom: 0.75rem;
	}

	.resultado-emoji {
		font-size: 2.75rem;
		margin-bottom: 0.5rem;
	}

	.resultado h2 {
		font-size: 1.15rem;
	}

	.resultado p {
		color: #d8d2e8;
		font-size: 1.3rem;
		line-height: 1.4;
		margin: 0 0 1.25rem;
	}

	.badge {
		display: inline-block;
		font-family: 'Press Start 2P', monospace;
		font-size: 0.55rem;
		padding: 0.6rem 0.8rem;
		border: 3px solid #0d0a14;
		line-height: 1.6;
	}

	.badge-comun {
		background: #6b7280;
		color: #16121f;
	}

	.badge-epico {
		background: #9b6bff;
		color: #16121f;
	}

	.badge-especial {
		background: #e5484d;
		color: #16121f;
	}

	.guardar {
		display: block;
		margin: 0 auto;
		padding: 0.7rem 1.4rem;
		font-family: 'Press Start 2P', monospace;
		font-size: 0.6rem;
		color: #16121f;
		background: #f5b942;
		border: 3px solid #0d0a14;
		box-shadow: 4px 4px 0 0 #0d0a14;
		cursor: pointer;
	}

	.guardar:active {
		transform: translate(4px, 4px);
		box-shadow: 0 0 0 0 #0d0a14;
	}

	.guardar:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.guardado-ok {
		font-family: 'Press Start 2P', monospace;
		font-size: 0.7rem;
		color: #52c97a;
	}

	.error-guardado {
		color: #e5484d;
		font-size: 1.1rem;
		margin-top: 0.5rem;
	}

	.reiniciar {
		display: block;
		margin: 1.75rem auto 0;
		background: none;
		border: none;
		color: #c9c1de;
		font-family: 'VT323', monospace;
		font-size: 1.15rem;
		text-decoration: underline;
		cursor: pointer;
	}

	.reiniciar:hover {
		color: #f5b942;
	}
</style>
