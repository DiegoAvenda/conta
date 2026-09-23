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

<div class="app">
	<header>
		<div class="brand">
			<div class="logo">Contaco</div>
			<span>Ventas directas</span>
		</div>

		<div class="period">
			<span>Periodo</span>
			<strong>Septiembre 2026</strong>
		</div>
	</header>

	<main>
		{#if activeView === 'home'}
			<section class="intro">
				<div class="eyebrow">VENTAS DIRECTAS</div>

				<h1>
					Ahora necesitamos<br />
					conocer tus ventas.
				</h1>

				<p>
					Registra las ventas de tu local, WhatsApp o entrega propia para llevar el control
					operativo de tu negocio.
				</p>
			</section>

			<section class="options">
				<button class="option featured" onclick={() => (activeView = 'add')}>
					<div class="option-icon">+</div>

					<div class="option-body">
						<strong>Registrar un corte de ventas</strong>

						<span> Registra las ventas de un día, semana o periodo. </span>

						<small> Distingue efectivo, terminal, transferencia u otro cobro directo. </small>
					</div>

					<div class="arrow">→</div>
				</button>

				<button class="option" onclick={() => (activeView = 'sales')}>
					<div class="option-icon">≡</div>

					<div class="option-body">
						<strong>Ver mis ventas</strong>

						<span> Consulta, revisa y corrige los datos registrados. </span>
					</div>

					<div class="arrow">→</div>
				</button>
			</section>

			<section class="tip">
				<strong>💡 No necesitas cambiar tu forma de trabajar.</strong>

				<p>
					Puedes registrar un resumen del periodo para mantener el control de ingresos y revisar tu
					movimiento del negocio.
				</p>
			</section>
		{:else if activeView === 'add'}
			<section class="page-header">
				<button class="back" onclick={() => (activeView = 'home')}> ← Ventas </button>

				<div class="eyebrow">REGISTRO DIRECTO</div>

				<h1>Agrega tus ventas</h1>

				<p>
					No necesitas registrar cada ticket. Puedes registrar un resumen del día, semana o periodo.
				</p>
			</section>

			<form
				method="POST"
				action="?/crear"
				class="form-card"
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
				<label>
					<span>Fecha</span>

					<input type="date" name="date" bind:value={newSale.date} required />
				</label>

				<label>
					<span>Método de cobro</span>

					<select name="paymentMethod" bind:value={newSale.paymentMethod}>
						<option value="Efectivo">Efectivo</option>
						<option value="Terminal">Terminal</option>
						<option value="Transferencia">Transferencia</option>
						<option value="Otro">Otro</option>
					</select>
				</label>

				<label>
					<span>Ventas del periodo</span>

					<div class="money-input">
						<span>$</span>

						<input
							type="number"
							name="amount"
							min="0"
							step="0.01"
							placeholder="0.00"
							bind:value={newSale.amount}
							required
						/>
					</div>
				</label>

				<label>
					<span>IVA</span>

					<div class="money-input">
						<span>$</span>

						<input
							type="number"
							name="iva"
							min="0"
							step="0.01"
							placeholder="Calculado automáticamente"
							bind:value={newSale.iva}
						/>
					</div>

					<small> Si lo dejas en blanco, Contaco lo calcula automáticamente al 16%. </small>
				</label>

				{#if form?.error}
					<p class="error-text">{form.error}</p>
				{/if}

				<div class="form-actions">
					<button type="button" class="secondary" onclick={() => (activeView = 'home')}>
						Cancelar
					</button>

					<button class="primary" type="submit" disabled={!newSale.amount || guardando}>
						{guardando ? 'Guardando...' : 'Guardar venta'}
					</button>
				</div>
			</form>
		{:else}
			<section class="page-header">
				<button class="back" onclick={() => (activeView = 'home')}> ← Ventas </button>

				<div class="eyebrow">SEPTIEMBRE 2026</div>

				<h1>Mis ventas</h1>

				<p>Esta es la información que Contaco utilizará para preparar tu cierre fiscal.</p>
			</section>

			<section class="stats">
				<div>
					<span>Ventas</span>
					<strong>{formatMoney(totalSales)}</strong>
				</div>

				<div>
					<span>IVA identificado</span>
					<strong>{formatMoney(totalIva)}</strong>
				</div>

				<div>
					<span>Registros</span>
					<strong>{data.ventas.length}</strong>
				</div>
			</section>

			<section class="table-card">
				<div class="table-header">
					<strong>Registros</strong>

					<button class="add-button" onclick={() => (activeView = 'add')}> + Agregar </button>
				</div>

				<div class="table">
					<div class="table-head table-row">
						<span>Fecha</span>
						<span>Método de cobro</span>
						<span>Ventas</span>
						<span>IVA</span>
						<span></span>
					</div>

					{#each data.ventas as venta (venta._id)}
						<div class="table-row">
							<span>
								{new Date(venta.fecha + 'T12:00:00').toLocaleDateString('es-MX')}
							</span>

							<span>
								{venta.metodoPago}
							</span>

							<strong>
								{formatMoney(venta.monto)}
							</strong>

							<span>
								{formatMoney(venta.iva)}
							</span>

							<form method="POST" action="?/eliminar" use:enhance>
								<input type="hidden" name="id" value={venta._id} />
								<button class="delete" type="submit" aria-label="Eliminar venta"> × </button>
							</form>
						</div>
					{/each}
				</div>
			</section>

			<section class="ready">
				<div>
					<strong>¿Terminaste de registrar tus ventas?</strong>

					<p>
						Contaco combinará estas ventas directas con tus gastos para preparar tu cierre mensual.
					</p>
				</div>

				<button> Continuar → </button>
			</section>
		{/if}
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: #f7f7f5;
		color: #171717;
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	button,
	input,
	select {
		font: inherit;
	}

	button {
		cursor: pointer;
	}

	.app {
		min-height: 100vh;
	}

	header {
		height: 72px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 32px;
		background: white;
		border-bottom: 1px solid #e5e5e5;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.logo {
		font-size: 24px;
		font-weight: 800;
		letter-spacing: -1px;
	}

	.brand > span {
		padding-left: 20px;
		border-left: 1px solid #ddd;
		color: #737373;
		font-size: 14px;
	}

	.period {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 3px;
		font-size: 12px;
		color: #737373;
	}

	.period strong {
		color: #171717;
		font-size: 13px;
	}

	main {
		width: min(720px, calc(100% - 32px));
		margin: auto;
		padding: 64px 0 100px;
	}

	.intro {
		margin-bottom: 40px;
	}

	.eyebrow {
		margin-bottom: 14px;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.14em;
		color: #737373;
	}

	h1 {
		margin: 0;
		font-size: 40px;
		line-height: 1.08;
		letter-spacing: -1.8px;
	}

	.intro p,
	.page-header p {
		max-width: 580px;
		margin: 18px 0 0;
		color: #666;
		font-size: 16px;
		line-height: 1.6;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.option {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 22px;
		border: 1px solid #dedede;
		border-radius: 15px;
		background: white;
		text-align: left;
		transition: 0.15s;
	}

	.option:hover {
		border-color: #999;
		transform: translateY(-1px);
	}

	.option.featured {
		border-color: #171717;
	}

	.option-icon {
		width: 42px;
		height: 42px;
		flex: 0 0 42px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		background: #f1f1ef;
		font-size: 21px;
	}

	.option-body {
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex: 1;
	}

	.option-body strong {
		font-size: 16px;
	}

	.option-body span {
		color: #444;
		font-size: 14px;
	}

	.option-body small {
		color: #888;
		font-size: 12px;
		line-height: 1.4;
	}

	.arrow {
		font-size: 20px;
		color: #888;
	}

	.tip {
		margin-top: 28px;
		padding: 18px 20px;
		border-radius: 12px;
		background: #efefed;
	}

	.tip strong {
		font-size: 13px;
	}

	.tip p {
		margin: 6px 0 0;
		color: #666;
		font-size: 13px;
		line-height: 1.5;
	}

	.page-header {
		margin-bottom: 32px;
	}

	.back {
		border: 0;
		background: transparent;
		padding: 0;
		margin-bottom: 40px;
		color: #555;
		font-size: 13px;
		font-weight: 600;
	}

	.form-card,
	.table-card {
		background: white;
		border: 1px solid #dedede;
		border-radius: 16px;
		padding: 28px;
	}

	.form-card {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.error-text {
		margin: 0;
		color: #c0392b;
		font-size: 13px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label > span {
		font-size: 13px;
		font-weight: 700;
	}

	label small {
		color: #888;
		font-size: 11px;
		line-height: 1.4;
	}

	input,
	select {
		width: 100%;
		height: 46px;
		border: 1px solid #d8d8d8;
		border-radius: 9px;
		background: white;
		padding: 0 13px;
		outline: none;
	}

	input:focus,
	select:focus {
		border-color: #171717;
	}

	.money-input {
		display: flex;
		align-items: center;
		border: 1px solid #d8d8d8;
		border-radius: 9px;
		overflow: hidden;
	}

	.money-input:focus-within {
		border-color: #171717;
	}

	.money-input span {
		padding-left: 13px;
		color: #888;
	}

	.money-input input {
		border: 0;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 8px;
	}

	.primary,
	.secondary {
		padding: 12px 18px;
		border-radius: 9px;
		font-size: 13px;
		font-weight: 700;
	}

	.primary {
		border: 0;
		background: #171717;
		color: white;
	}

	.primary:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.secondary {
		border: 1px solid #ddd;
		background: white;
		color: #444;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 18px;
	}

	.stats > div {
		padding: 20px;
		background: white;
		border: 1px solid #dedede;
		border-radius: 14px;
	}

	.stats span {
		display: block;
		margin-bottom: 8px;
		color: #737373;
		font-size: 12px;
	}

	.stats strong {
		font-size: 20px;
		letter-spacing: -0.5px;
	}

	.table-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18px;
	}

	.add-button {
		border: 0;
		border-radius: 8px;
		background: #171717;
		color: white;
		padding: 9px 13px;
		font-size: 12px;
		font-weight: 700;
	}

	.table {
		overflow-x: auto;
	}

	.table-row {
		min-width: 580px;
		display: grid;
		grid-template-columns: 1fr 1.2fr 1fr 1fr 30px;
		align-items: center;
		gap: 12px;
		padding: 14px 0;
		border-bottom: 1px solid #eee;
		font-size: 13px;
	}

	.table-head {
		padding-top: 0;
		color: #888;
		font-size: 11px;
		font-weight: 700;
	}

	.delete {
		border: 0;
		background: transparent;
		color: #aaa;
		font-size: 18px;
	}

	.delete:hover {
		color: #171717;
	}

	.ready {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		margin-top: 18px;
		padding: 20px;
		border-radius: 14px;
		background: #171717;
		color: white;
	}

	.ready strong {
		font-size: 14px;
	}

	.ready p {
		max-width: 450px;
		margin: 5px 0 0;
		color: #bbb;
		font-size: 12px;
		line-height: 1.5;
	}

	.ready button {
		flex: 0 0 auto;
		border: 0;
		border-radius: 8px;
		background: white;
		color: #171717;
		padding: 11px 15px;
		font-size: 12px;
		font-weight: 700;
	}

	@media (max-width: 600px) {
		header {
			padding: 0 18px;
		}

		.brand > span {
			display: none;
		}

		.period {
			align-items: flex-end;
		}

		main {
			width: calc(100% - 20px);
			padding: 35px 0 70px;
		}

		h1 {
			font-size: 31px;
		}

		.option {
			padding: 18px;
		}

		.option-icon {
			width: 36px;
			height: 36px;
			flex-basis: 36px;
		}

		.option-body small {
			display: none;
		}

		.form-card,
		.table-card {
			padding: 20px;
		}

		.stats {
			grid-template-columns: 1fr;
		}

		.ready {
			align-items: flex-start;
			flex-direction: column;
		}

		.ready button {
			width: 100%;
		}
	}
</style>
