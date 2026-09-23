<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let activeView = $state('home');
	let guardando = $state(false);

	let newSale = $state({
		date: new Date().toISOString().split('T')[0],
		paymentMethod: 'Efectivo',
		amount: '',
		iva: ''
	});

	let totalSales = $derived(data.ventas.reduce((total, venta) => total + venta.monto, 0));
	let totalIva = $derived(data.ventas.reduce((total, venta) => total + venta.iva, 0));

	function formatMoney(value) {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format((Number(value) || 0) / 100);
	}
</script>

<svelte:head>
	<title>Contaco - Ventas directas</title>
</svelte:head>

<div class="min-h-screen bg-[#f7f7f5] font-sans text-[#171717]">
	<header
		class="flex h-[72px] items-center justify-between border-b border-[#e5e5e5] bg-white px-8 max-[600px]:px-[18px]"
	>
		<div class="flex items-center gap-5">
			<div class="text-2xl font-extrabold tracking-[-1px]">Contaco</div>

			<span class="border-l border-[#ddd] pl-5 text-sm text-[#737373] max-[600px]:hidden">
				Ventas directas
			</span>
		</div>

		<div class="flex flex-col items-end gap-[3px] text-xs text-[#737373]">
			<span>Periodo</span>
			<strong class="text-[13px] text-[#171717]">Septiembre 2026</strong>
		</div>
	</header>

	<main
		class="mx-auto w-[min(720px,calc(100%-32px))] py-16 pb-[100px] max-[600px]:w-[calc(100%-20px)] max-[600px]:py-[35px] max-[600px]:pb-[70px]"
	>
		{#if activeView === 'home'}
			<section class="mb-10">
				<div class="mb-[14px] text-[11px] font-extrabold tracking-[0.14em] text-[#737373]">
					VENTAS DIRECTAS
				</div>

				<h1
					class="m-0 text-[40px] leading-[1.08] font-bold tracking-[-1.8px] max-[600px]:text-[31px]"
				>
					Ahora necesitamos<br />
					conocer tus ventas.
				</h1>

				<p class="mt-[18px] max-w-[580px] text-base leading-[1.6] text-[#666]">
					Registra las ventas de tu local, WhatsApp o entrega propia para llevar el control
					operativo de tu negocio.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<button
					class="flex w-full items-center gap-[18px] rounded-[15px] border border-[#171717] bg-white p-[22px] text-left transition duration-150 hover:-translate-y-px hover:border-[#999] max-[600px]:p-[18px]"
					onclick={() => (activeView = 'add')}
				>
					<div
						class="flex h-[42px] w-[42px] flex-[0_0_42px] items-center justify-center rounded-[10px] bg-[#f1f1ef] text-[21px] max-[600px]:h-9 max-[600px]:w-9 max-[600px]:basis-9"
					>
						+
					</div>

					<div class="flex flex-1 flex-col gap-[5px]">
						<strong class="text-base">Registrar un corte de ventas</strong>

						<span class="text-sm text-[#444]">
							Registra las ventas de un día, semana o periodo.
						</span>

						<small class="text-xs leading-[1.4] text-[#888] max-[600px]:hidden">
							Distingue efectivo, terminal, transferencia u otro cobro directo.
						</small>
					</div>

					<div class="text-xl text-[#888]">→</div>
				</button>

				<button
					class="flex w-full items-center gap-[18px] rounded-[15px] border border-[#dedede] bg-white p-[22px] text-left transition duration-150 hover:-translate-y-px hover:border-[#999] max-[600px]:p-[18px]"
					onclick={() => (activeView = 'sales')}
				>
					<div
						class="flex h-[42px] w-[42px] flex-[0_0_42px] items-center justify-center rounded-[10px] bg-[#f1f1ef] text-[21px] max-[600px]:h-9 max-[600px]:w-9 max-[600px]:basis-9"
					>
						≡
					</div>

					<div class="flex flex-1 flex-col gap-[5px]">
						<strong class="text-base">Ver mis ventas</strong>

						<span class="text-sm text-[#444]">
							Consulta, revisa y corrige los datos registrados.
						</span>
					</div>

					<div class="text-xl text-[#888]">→</div>
				</button>
			</section>

			<section class="mt-7 rounded-xl bg-[#efefed] px-5 py-[18px]">
				<strong class="text-[13px]">💡 No necesitas cambiar tu forma de trabajar.</strong>

				<p class="mt-[6px] text-[13px] leading-[1.5] text-[#666]">
					Puedes registrar un resumen del periodo para mantener el control de ingresos y revisar tu
					movimiento del negocio.
				</p>
			</section>
		{:else if activeView === 'add'}
			<section class="mb-8">
				<button
					class="mb-10 border-0 bg-transparent p-0 text-[13px] font-semibold text-[#555]"
					onclick={() => (activeView = 'home')}
				>
					← Ventas
				</button>

				<div class="mb-[14px] text-[11px] font-extrabold tracking-[0.14em] text-[#737373]">
					REGISTRO DIRECTO
				</div>

				<h1
					class="m-0 text-[40px] leading-[1.08] font-bold tracking-[-1.8px] max-[600px]:text-[31px]"
				>
					Agrega tus ventas
				</h1>

				<p class="mt-[18px] max-w-[580px] text-base leading-[1.6] text-[#666]">
					No necesitas registrar cada ticket. Puedes registrar un resumen del día, semana o periodo.
				</p>
			</section>

			<form
				method="POST"
				action="?/crear"
				class="flex flex-col gap-6 rounded-2xl border border-[#dedede] bg-white p-7 max-[600px]:p-5"
				use:enhance={() => {
					guardando = true;
					return async ({ update }) => {
						await update();
						guardando = false;

						if (!form?.error) {
							newSale = {
								date: new Date().toISOString().split('T')[0],
								paymentMethod: 'Efectivo',
								amount: '',
								iva: ''
							};

							activeView = 'sales';
						}
					};
				}}
			>
				<label class="flex flex-col gap-2">
					<span class="text-[13px] font-bold">Fecha</span>

					<input
						type="date"
						name="date"
						bind:value={newSale.date}
						required
						class="h-[46px] w-full rounded-[9px] border border-[#d8d8d8] bg-white px-[13px] outline-none focus:border-[#171717]"
					/>
				</label>

				<label class="flex flex-col gap-2">
					<span class="text-[13px] font-bold">Método de cobro</span>

					<select
						name="paymentMethod"
						bind:value={newSale.paymentMethod}
						class="h-[46px] w-full rounded-[9px] border border-[#d8d8d8] bg-white px-[13px] outline-none focus:border-[#171717]"
					>
						<option value="Efectivo">Efectivo</option>
						<option value="Terminal">Terminal</option>
						<option value="Transferencia">Transferencia</option>
						<option value="Otro">Otro</option>
					</select>
				</label>

				<label class="flex flex-col gap-2">
					<span class="text-[13px] font-bold">Ventas del periodo</span>

					<div
						class="flex items-center overflow-hidden rounded-[9px] border border-[#d8d8d8] focus-within:border-[#171717]"
					>
						<span class="pl-[13px] text-[#888]">$</span>

						<input
							type="number"
							name="amount"
							min="0"
							step="0.01"
							placeholder="0.00"
							bind:value={newSale.amount}
							required
							class="h-[46px] w-full border-0 bg-white px-[13px] outline-none"
						/>
					</div>
				</label>

				<label class="flex flex-col gap-2">
					<span class="text-[13px] font-bold">IVA</span>

					<div
						class="flex items-center overflow-hidden rounded-[9px] border border-[#d8d8d8] focus-within:border-[#171717]"
					>
						<span class="pl-[13px] text-[#888]">$</span>

						<input
							type="number"
							name="iva"
							min="0"
							step="0.01"
							placeholder="Calculado automáticamente"
							bind:value={newSale.iva}
							class="h-[46px] w-full border-0 bg-white px-[13px] outline-none"
						/>
					</div>

					<small class="text-[11px] leading-[1.4] text-[#888]">
						Si lo dejas en blanco, Contaco lo calcula automáticamente al 16%.
					</small>
				</label>

				{#if form?.error}
					<p class="m-0 text-[13px] text-[#c0392b]">{form.error}</p>
				{/if}

				<div class="mt-2 flex justify-end gap-[10px]">
					<button
						type="button"
						class="rounded-[9px] border border-[#ddd] bg-white px-[18px] py-3 text-[13px] font-bold text-[#444]"
						onclick={() => (activeView = 'home')}
					>
						Cancelar
					</button>

					<button
						class="rounded-[9px] border-0 bg-[#171717] px-[18px] py-3 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-30"
						type="submit"
						disabled={!newSale.amount || guardando}
					>
						{guardando ? 'Guardando...' : 'Guardar venta'}
					</button>
				</div>
			</form>
		{:else}
			<section class="mb-8">
				<button
					class="mb-10 border-0 bg-transparent p-0 text-[13px] font-semibold text-[#555]"
					onclick={() => (activeView = 'home')}
				>
					← Ventas
				</button>

				<div class="mb-[14px] text-[11px] font-extrabold tracking-[0.14em] text-[#737373]">
					SEPTIEMBRE 2026
				</div>

				<h1
					class="m-0 text-[40px] leading-[1.08] font-bold tracking-[-1.8px] max-[600px]:text-[31px]"
				>
					Mis ventas
				</h1>

				<p class="mt-[18px] max-w-[580px] text-base leading-[1.6] text-[#666]">
					Esta es la información que Contaco utilizará para preparar tu cierre fiscal.
				</p>
			</section>

			<section class="mb-[18px] grid grid-cols-3 gap-3 max-[600px]:grid-cols-1">
				<div class="rounded-[14px] border border-[#dedede] bg-white p-5">
					<span class="mb-2 block text-xs text-[#737373]">Ventas</span>
					<strong class="text-xl tracking-[-0.5px]">{formatMoney(totalSales)}</strong>
				</div>

				<div class="rounded-[14px] border border-[#dedede] bg-white p-5">
					<span class="mb-2 block text-xs text-[#737373]">IVA identificado</span>
					<strong class="text-xl tracking-[-0.5px]">{formatMoney(totalIva)}</strong>
				</div>

				<div class="rounded-[14px] border border-[#dedede] bg-white p-5">
					<span class="mb-2 block text-xs text-[#737373]">Registros</span>
					<strong class="text-xl tracking-[-0.5px]">{data.ventas.length}</strong>
				</div>
			</section>

			<section class="rounded-2xl border border-[#dedede] bg-white p-7 max-[600px]:p-5">
				<div class="mb-[18px] flex items-center justify-between">
					<strong>Registros</strong>

					<button
						class="rounded-lg border-0 bg-[#171717] px-[13px] py-[9px] text-xs font-bold text-white"
						onclick={() => (activeView = 'add')}
					>
						+ Agregar
					</button>
				</div>

				<div class="overflow-x-auto">
					<div
						class="grid min-w-[580px] grid-cols-[1fr_1.2fr_1fr_1fr_30px] items-center gap-3 border-b border-[#eee] py-[14px] pt-0 text-[11px] font-bold text-[#888]"
					>
						<span>Fecha</span>
						<span>Método de cobro</span>
						<span>Ventas</span>
						<span>IVA</span>
						<span></span>
					</div>

					{#each data.ventas as venta (venta._id)}
						<div
							class="grid min-w-[580px] grid-cols-[1fr_1.2fr_1fr_1fr_30px] items-center gap-3 border-b border-[#eee] py-[14px] text-[13px]"
						>
							<span>
								{new Date(venta.fecha + 'T12:00:00').toLocaleDateString('es-MX')}
							</span>

							<span>{venta.metodoPago}</span>

							<strong>{formatMoney(venta.monto)}</strong>

							<span>{formatMoney(venta.iva)}</span>

							<form method="POST" action="?/eliminar" use:enhance>
								<input type="hidden" name="id" value={venta._id} />

								<button
									class="border-0 bg-transparent text-lg text-[#aaa] hover:text-[#171717]"
									type="submit"
									aria-label="Eliminar venta"
								>
									×
								</button>
							</form>
						</div>
					{/each}
				</div>
			</section>

			<section
				class="mt-[18px] flex items-center justify-between gap-5 rounded-[14px] bg-[#171717] p-5 text-white max-[600px]:flex-col max-[600px]:items-start"
			>
				<div>
					<strong class="text-sm">¿Terminaste de registrar tus ventas?</strong>

					<p class="mt-[5px] max-w-[450px] text-xs leading-[1.5] text-[#bbb]">
						Contaco combinará estas ventas directas con tus gastos para preparar tu cierre mensual.
					</p>
				</div>

				<button
					class="flex-[0_0_auto] rounded-lg border-0 bg-white px-[15px] py-[11px] text-xs font-bold text-[#171717] max-[600px]:w-full"
				>
					Continuar →
				</button>
			</section>
		{/if}
	</main>
</div>
