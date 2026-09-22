<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();
	let copiado = $state(false);
	let editandoRfc = $state(false);
	let guardando = $state(false);
	let rfcInput = $derived(data.rfc);

	$effect(() => {
		rfcInput = data.rfc;
	});

	const regimen = $derived(
		data.regimenFiscal === 'resico'
			? '626 - Régimen Simplificado de Confianza'
			: data.regimenFiscal === 'actividad_empresarial'
				? '612 - Personas Físicas con Actividades Empresariales y Profesionales'
				: 'Confirma tu régimen en la Constancia de Situación Fiscal'
	);

	function copiarDatos() {
		const texto = `Hola, ¿me apoyas con la factura de mi compra?\n\n*RFC:* ${data.rfc}\n*Nombre/Razón Social:* [como aparece en mi Constancia]\n*C.P. del domicilio fiscal:* [como aparece en mi Constancia]\n*Régimen Fiscal:* ${regimen}\n*Uso de CFDI:* [confirmar según la compra]`;
		navigator.clipboard.writeText(texto);
		copiado = true;
		setTimeout(() => (copiado = false), 3000);
	}
</script>

<main class="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
	<header class="rounded-3xl border border-base-300 bg-base-200 p-6 sm:p-8">
		<p class="font-mono text-xs font-bold tracking-widest text-primary">GASTOS DEL NEGOCIO</p>
		<h1 class="mt-2 text-3xl font-black">Pide tus facturas con datos correctos</h1>
		<p class="mt-3 max-w-2xl text-sm leading-relaxed text-base-content/70">
			Este MVP registra gastos de un restaurante con ventas directas. Revisa siempre tu Constancia
			de Situación Fiscal antes de solicitar un CFDI.
		</p>
	</header>

	<section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
		<div class="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="font-mono text-[10px] tracking-widest text-slate-400 uppercase">
						Datos fiscales
					</p>
					<h2 class="mt-1 text-lg font-black">Tu negocio</h2>
				</div>
				<span class="badge font-mono text-[10px] badge-success">VENTA DIRECTA</span>
			</div>

			<div class="mt-6 space-y-3 font-mono text-sm">
				<div class="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
					<p class="text-[10px] text-slate-400">RFC</p>
					{#if editandoRfc}
						<form
							method="POST"
							action="?/guardarRfc"
							use:enhance={() => {
								guardando = true;
								return async ({ update }) => {
									await update();
									guardando = false;
									if (!form?.error) editandoRfc = false;
								};
							}}
							class="mt-2 flex flex-wrap items-center gap-2"
						>
							<input
								name="rfc"
								bind:value={rfcInput}
								maxlength="13"
								class="input w-full bg-slate-950 uppercase input-sm sm:w-auto"
								required
							/>
							<button class="btn btn-success btn-xs" type="submit" disabled={guardando}>
								{guardando ? 'Guardando…' : 'Guardar'}
							</button>
							<button
								class="btn btn-ghost btn-xs"
								type="button"
								onclick={() => {
									editandoRfc = false;
									rfcInput = data.rfc;
								}}
							>
								Cancelar
							</button>
						</form>
						{#if form?.error}<p class="mt-2 text-xs text-red-300">{form.error}</p>{/if}
					{:else}
						<div class="mt-1 flex items-center gap-3">
							<strong class="text-base text-emerald-400">{data.rfc || 'Sin RFC registrado'}</strong>
							<button class="btn btn-ghost btn-xs" onclick={() => (editandoRfc = true)}
								>Editar</button
							>
						</div>
					{/if}
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<div class="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
						<p class="text-[10px] text-slate-400">Régimen fiscal</p>
						<p class="mt-1 text-xs leading-relaxed font-semibold">{regimen}</p>
					</div>
					<div class="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
						<p class="text-[10px] text-slate-400">Código postal</p>
						<p class="mt-1 text-xs font-semibold">Consúltalo en tu Constancia</p>
					</div>
				</div>
			</div>

			<button
				class="btn mt-6 w-full border-none bg-emerald-600 text-white hover:bg-emerald-500"
				onclick={copiarDatos}
				disabled={!data.rfc}
			>
				{copiado ? 'Datos copiados' : 'Copiar datos para proveedor'}
			</button>
		</div>

		<aside class="rounded-3xl border border-base-300 bg-base-100 p-6">
			<h2 class="font-black">Antes de pedir un CFDI</h2>
			<ol class="mt-4 space-y-4 text-sm leading-relaxed text-base-content/75">
				<li>
					<strong class="text-base-content">1. Confirma tu Constancia.</strong> Nombre, RFC, código postal
					y régimen deben coincidir.
				</li>
				<li>
					<strong class="text-base-content">2. Relaciona el gasto.</strong> Conserva el CFDI y el comprobante
					de pago de compras del restaurante.
				</li>
				<li>
					<strong class="text-base-content">3. Revisa antes de cargar.</strong> Si un dato no cuadra,
					solicita corrección al proveedor.
				</li>
			</ol>
			<div class="mt-6 alert text-xs alert-info">
				<span
					>Esta guía ayuda a organizar gastos; la deducibilidad final depende de la operación y de
					los datos fiscales correctos.</span
				>
			</div>
		</aside>
	</section>

	<footer class="flex flex-wrap justify-between gap-3 border-t border-base-300 pt-5">
		<a href={resolve('/inscripcion')} class="btn btn-ghost btn-sm">← Guía SAT</a>
		<a href={resolve('/egresos')} class="btn btn-primary btn-sm">Ir a registrar gastos →</a>
	</footer>
</main>
