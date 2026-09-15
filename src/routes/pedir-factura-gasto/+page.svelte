<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	// State de la tarjeta de datos fiscales del usuario
	let copiado = $state(false);
	let pestañaActiva = $state('tarjeta');
	let editandoRfc = $state(false);
	let guardando = $state(false);

	// el RFC viene de businessProfile (Mongo); se resetea cuando data.rfc cambia
	// (por ejemplo, justo después de guardar y que SvelteKit vuelva a correr el load)
	let rfcInput = $state(data.rfc);
	$effect(() => {
		rfcInput = data.rfc;
	});

	// TODO: el resto de estos campos siguen siendo estáticos. Si van a salir del
	// cuestionario de onboarding (ya guardado en businessProfile), hay que traerlos
	// del mismo load() de arriba en vez de dejarlos hardcodeados aquí.
	const datosFiscales = {
		razonSocial: 'DIEGO DE JESUS AVENDAÑO HERNANDEZ',
		codigoPostal: '76246',
		regimen: '612 - Personas Físicas con Actividades Empresariales y Profesionales',
		usoMercancias: 'G01 - Adquisición de mercancías (Ingredientes/Bebidas)',
		usoGastos: 'G03 - Gastos en general (Empaques/Luz/Gas)'
	};

	// Reglas educativas del esquema híbrido
	const reglasFacturacion = [
		{
			id: 1,
			titulo: 'Pide SIEMPRE bajo el Régimen 612',
			icono: '🏪',
			resumen: 'Todas las compras pertenecen a tu actividad empresarial global.',
			detalle:
				'Nunca pidas facturas bajo el Régimen 625 (Plataformas Tecnológicas). Las plataformas son solo un canal de venta y retención; tus proveedores de insumos deben facturarte bajo Actividad Empresarial.',
			tipo: 'error_comun',
			badge: 'Regla de Oro'
		},
		{
			id: 2,
			titulo: 'Misma compra para Uber Eats y WhatsApp',
			icono: '🥤',
			resumen: 'Un solo inventario alimenta ambos canales de venta.',
			detalle:
				'Aunque compres café, carne o refrescos que venderás tanto por Uber Eats como en mostrador/WhatsApp, la factura de compra se pide exactamente igual bajo el Régimen 612.',
			tipo: 'info',
			badge: 'Operación Híbrida'
		},
		{
			id: 3,
			titulo: 'Cuidado con los pagos en efectivo',
			icono: '💳',
			resumen: 'Compras mayores a $2,000 MXN en efectivo NO son deducibles.',
			detalle:
				'Si el total del ticket supera los $2,000.00 MXN, debes pagar obligatoriamente con tarjeta de débito/crédito a tu nombre, transferencia SPEI o cheque para que el SAT valide el gasto.',
			tipo: 'alerta',
			badge: 'Límite SAT'
		},
		{
			id: 4,
			titulo: 'Uso correcto del CFDI',
			icono: '🏷️',
			resumen: 'Diferencia entre materia prima y suministros de la cocina.',
			detalle:
				'Usa "G01 Adquisición de mercancías" para todo lo que se transforma o revende (alimentos, insumos, bebidas). Usa "G03 Gastos en general" para bolsas, servilletas, productos de limpieza y servicios.',
			tipo: 'info',
			badge: 'Clasificación'
		}
	];

	function copiarDatosWhatsApp() {
		const texto = `Hola, me apoyas con la factura de mi compra con los siguientes datos fiscales:

*RFC:* ${data.rfc}
*Nombre/Razón Social:* ${datosFiscales.razonSocial}
*C.P.:* ${datosFiscales.codigoPostal}
*Régimen Fiscal:* ${datosFiscales.regimen}
*Uso de CFDI:* ${datosFiscales.usoMercancias}`;

		navigator.clipboard.writeText(texto);
		copiado = true;
		setTimeout(() => (copiado = false), 3000);
	}
</script>

<div class="mx-auto max-w-4xl space-y-6 p-4 font-sans">
	<!-- Header del Módulo -->
	<header
		class="bg-base-200 border-base-300 flex flex-col items-start justify-between gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center"
	>
		<div>
			<span class="badge badge-primary mb-2 font-mono text-xs">Paso Previo a Carga de Gastos</span>
			<h1 class="text-2xl font-black">Guía para Solicitar Facturas</h1>
			<p class="text-base-content/70 mt-1 text-xs">
				Asegura que cada insumo de tu cocina sea 100% deducible ante el SAT.
			</p>
		</div>

		<!-- Selector de Vista -->
		<div class="join bg-base-100 border-base-300 rounded-xl border p-1">
			<button
				class="join-item btn btn-sm font-mono {pestañaActiva === 'tarjeta'
					? 'btn-primary'
					: 'btn-ghost'}"
				onclick={() => (pestañaActiva = 'tarjeta')}
			>
				🎴 Ficha Fiscal
			</button>
			<button
				class="join-item btn btn-sm font-mono {pestañaActiva === 'reglas'
					? 'btn-primary'
					: 'btn-ghost'}"
				onclick={() => (pestañaActiva = 'reglas')}
			>
				📖 4 Reglas SAT
			</button>
		</div>
	</header>

	{#if pestañaActiva === 'tarjeta'}
		<!-- VISTA 1: TARJETA DIGITAL DE DATOS FISCALES -->
		<section class="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
			<!-- Visualización de la Tarjeta Digital -->
			<div
				class="relative space-y-6 overflow-hidden rounded-3xl border border-slate-700 bg-linear-to-br from-slate-900 via-slate-800 to-zinc-900 p-6 text-white shadow-xl md:col-span-7"
			>
				<div
					class="bg-primary/20 absolute -right-10 -bottom-10 h-40 w-40 rounded-full blur-2xl"
				></div>

				<div class="flex items-start justify-between">
					<div>
						<span class="block font-mono text-[10px] tracking-widest text-slate-400 uppercase"
							>Datos Fiscales Deducibles</span
						>
						<h2 class="text-lg font-black tracking-tight text-white">
							{datosFiscales.razonSocial}
						</h2>
					</div>
					<span class="badge badge-success font-mono text-[10px] font-bold">RÉGIMEN 612</span>
				</div>

				<div class="space-y-3 font-mono text-xs">
					<!-- RFC: ahora editable y respaldado en businessProfile -->
					<div class="rounded-xl border border-slate-700/50 bg-slate-800/80 p-3">
						<span class="block text-[10px] text-slate-400">RFC</span>

						{#if editandoRfc}
							<form
								method="POST"
								action="?/guardarRfc"
								use:enhance={() => {
									guardando = true;
									return async ({ update }) => {
										await update();
										guardando = false;
										editandoRfc = false;
									};
								}}
								class="mt-1 flex items-center gap-2"
							>
								<input
									name="rfc"
									bind:value={rfcInput}
									maxlength="13"
									class="input input-sm input-bordered bg-slate-900 font-bold text-emerald-400 uppercase"
									required
								/>
								<button type="submit" class="btn btn-xs btn-success" disabled={guardando}>
									{guardando ? '...' : 'Guardar'}
								</button>
								<button
									type="button"
									class="btn btn-xs btn-ghost"
									onclick={() => {
										editandoRfc = false;
										rfcInput = data.rfc;
									}}
								>
									Cancelar
								</button>
							</form>

							{#if form?.error}
								<p class="mt-1 text-[10px] text-red-400">{form.error}</p>
							{/if}
						{:else}
							<div class="flex items-center gap-2">
								<span class="text-base font-bold text-emerald-400">
									{data.rfc || 'Sin RFC registrado'}
								</span>
								<button class="btn btn-xs btn-ghost" onclick={() => (editandoRfc = true)}>
									✎ Editar
								</button>
							</div>
						{/if}
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div class="rounded-xl border border-slate-700/50 bg-slate-800/80 p-2.5">
							<span class="block text-[10px] text-slate-400">Código Postal</span>
							<span class="font-bold">{datosFiscales.codigoPostal}</span>
						</div>
						<div class="rounded-xl border border-slate-700/50 bg-slate-800/80 p-2.5">
							<span class="block text-[10px] text-slate-400">Uso Preferente</span>
							<span class="font-bold text-amber-300">G01 Mercancías</span>
						</div>
					</div>

					<div class="rounded-xl border border-slate-700/50 bg-slate-800/80 p-2.5">
						<span class="block text-[10px] text-slate-400">Régimen Fiscal SAT</span>
						<span class="text-[11px] font-semibold text-slate-200">{datosFiscales.regimen}</span>
					</div>
				</div>

				<button
					onclick={copiarDatosWhatsApp}
					disabled={!data.rfc}
					class="btn btn-emerald-500 w-full gap-2 border-none bg-emerald-600 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50"
				>
					{#if copiado}
						<span>¡Copiado al Portapapeles! 📑</span>
					{:else if !data.rfc}
						<span>Primero registra tu RFC ☝️</span>
					{:else}
						<span>Copiar Texto para Proveedores / WhatsApp 📲</span>
					{/if}
				</button>
			</div>

			<!-- Instrucciones de Uso Rápido -->
			<div class="bg-base-100 border-base-200 space-y-4 rounded-2xl border p-5 md:col-span-5">
				<h3 class="flex items-center gap-2 text-base font-black">
					<span>💡</span> ¿Cómo usar esta ficha?
				</h3>

				<ol
					class="text-base-content/80 list-inside list-decimal space-y-3 text-xs leading-relaxed font-medium"
				>
					<li class="pl-1">
						<strong class="text-base-content">En el mostrador:</strong> Muestra esta pantalla al cajero
						en Central de Abastos, Sam's Club, Costco o supermercados.
					</li>
					<li class="pl-1">
						<strong class="text-base-content">Por WhatsApp:</strong> Presiona el botón verde para copiar
						el bloque de texto y enviarlo a tus proveedores de carne, verduras o refrescos.
					</li>
					<li class="pl-1">
						<strong class="text-base-content">Portales WEB:</strong> Usa el régimen
						<strong>612</strong> cuando te pida ingresar datos en portales automáticos de facturación.
					</li>
				</ol>

				<div class="alert alert-info border-info/30 rounded-xl border p-3 text-[11px]">
					<span
						>ℹ️ Muestra siempre el Uso <strong>G01</strong> para tus compras de materia prima.</span
					>
				</div>
			</div>
		</section>
	{:else}
		<!-- VISTA 2: REGLAS DE ORO SAT PARA EL GIRO DE COMIDA -->
		<section class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each reglasFacturacion as regla (regla.id)}
				<div
					class="bg-base-100 border-base-200 flex flex-col justify-between space-y-3 rounded-2xl border p-5 shadow-sm"
				>
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-2xl">{regla.icono}</span>
							<span class="badge badge-outline font-mono text-[10px]">{regla.badge}</span>
						</div>

						<h3 class="text-base font-black">{regla.titulo}</h3>
						<p class="text-primary text-xs font-semibold">{regla.resumen}</p>
						<p class="text-base-content/70 text-xs leading-relaxed">{regla.detalle}</p>
					</div>

					{#if regla.tipo === 'error_comun'}
						<div
							class="bg-error/10 border-error text-error rounded-r-lg border-l-2 p-2 text-[11px] font-semibold"
						>
							❌ Nunca solicites facturas con Régimen 625 (Plataformas).
						</div>
					{:else if regla.tipo === 'alerta'}
						<div
							class="bg-warning/10 border-warning text-warning-content rounded-r-lg border-l-2 p-2 text-[11px] font-semibold"
						>
							⚠️ Evita efectivo en compras > $2,000 MXN.
						</div>
					{/if}
				</div>
			{/each}
		</section>
	{/if}

	<!-- Footer / Siguiente Paso -->
	<footer class="border-base-200 flex items-center justify-between border-t pt-4">
		<a href={resolve('/onboarding/guia-sat')} class="btn btn-ghost btn-sm font-mono">
			&larr; Volver a Guía SAT
		</a>

		<a href={resolve('/gastos/cargar')} class="btn btn-primary btn-sm gap-2 font-bold">
			<span>Entendido, ir a Registro de Gastos</span>
			<span>&rarr;</span>
		</a>
	</footer>
</div>
