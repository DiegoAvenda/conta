<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data } = $props();

	const nombresMes = [
		'Enero',
		'Febrero',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Agosto',
		'Septiembre',
		'Octubre',
		'Noviembre',
		'Diciembre'
	];

	function cambiarPeriodo(event) {
		const [anio, mes] = event.target.value.split('-');
		goto(resolve(`/dashboard?anio=${anio}&mes=${mes}`));
	}

	// profit-bar necesita un divisor > 0 para no romperse en un mes sin ventas
	let profitPct = $derived(
		data.resumen.ventas.total > 0
			? Math.min((data.resumen.utilidad / data.resumen.ventas.total) * 100, 100)
			: 0
	);

	function formatMoney(value) {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN',
			maximumFractionDigits: 0
		}).format(value);
	}

	function getTransactionClass(tipo) {
		return tipo === 'Venta' ? 'positive' : 'negative';
	}
</script>

<svelte:head>
	<title>Fondi · Dashboard</title>
</svelte:head>

<div class="app">
	<header class="topbar">
		<div>
			<div class="brand">Fondi</div>
			<div class="subtitle">Tu situación fiscal, sin hablar en idioma SAT.</div>
		</div>

		<div class="month-selector">
			<span>Periodo</span>

			<select value={`${data.anio}-${data.mes}`} onchange={cambiarPeriodo}>
				{#each nombresMes as nombre, i (nombre)}
					<option value={`${data.anio}-${i + 1}`}>{nombre} {data.anio}</option>
				{/each}
			</select>
		</div>
	</header>

	<main>
		<section class="welcome">
			<div>
				<p class="eyebrow">RESUMEN DEL MES</p>
				<h1>Así va tu negocio</h1>
				<p class="description">
					Este es el resultado de tus ventas y gastos antes de preparar tu información fiscal.
				</p>
			</div>

			<div class="status">
				<span class="status-dot"></span>
				Información actualizada
			</div>
		</section>

		<section class="main-result">
			<div class="result-card">
				<div class="result-header">
					<div>
						<p class="card-label">IVA ESTIMADO</p>
						<h2>Podrías pagar de IVA</h2>
					</div>

					<div class="question">?</div>
				</div>

				<div class="tax-amount">
					{formatMoney(data.resumen.iva.estimado)}
				</div>

				<p class="tax-note">Estimación basada en la información registrada hasta ahora.</p>

				<div class="tax-breakdown">
					<div class="tax-row">
						<span>IVA trasladado (cobrado)</span>
						<strong>{formatMoney(data.resumen.iva.trasladado)}</strong>
					</div>

					<div class="tax-row deduction">
						<span>IVA acreditable (pagado)</span>
						<strong>-{formatMoney(data.resumen.iva.acreditable)}</strong>
					</div>
				</div>

				<div class="result-warning">
					<span>ⓘ</span>
					<div>
						<strong>El ISR y las retenciones todavía no están incluidos.</strong>
						<p>
							Esto solo cubre IVA. El cálculo de ISR y la lectura de retenciones de plataformas
							(Uber Eats, Rappi) están pendientes de construir.
						</p>
					</div>
				</div>
			</div>

			<div class="profit-card">
				<div class="card-top">
					<div>
						<p class="card-label">RESULTADO DEL NEGOCIO</p>
						<h3>Ganancia estimada</h3>
					</div>

					<div class="trend">Este mes</div>
				</div>

				<div class="profit-value">
					{formatMoney(data.resumen.utilidad)}
				</div>

				<div class="profit-bar">
					<div class="profit-fill" style={`width: ${profitPct}%`}></div>
				</div>

				<div class="profit-details">
					<div>
						<span>Ventas</span>
						<strong>{formatMoney(data.resumen.ventas.total)}</strong>
					</div>

					<div>
						<span>Gastos</span>
						<strong>-{formatMoney(data.resumen.gastos.total)}</strong>
					</div>
				</div>
			</div>
		</section>

		<section class="metrics">
			<div class="metric-card">
				<div class="metric-icon sales">↗</div>

				<div>
					<span>Ventas</span>
					<strong>{formatMoney(data.resumen.ventas.total)}</strong>
					<small>{data.resumen.ventas.registros} registros</small>
				</div>
			</div>

			<div class="metric-card">
				<div class="metric-icon expenses">↘</div>

				<div>
					<span>Gastos</span>
					<strong>{formatMoney(data.resumen.gastos.total)}</strong>
					<small>{data.resumen.gastos.registros} facturas</small>
				</div>
			</div>

			<div class="metric-card">
				<div class="metric-icon iva">IVA</div>

				<div>
					<span>IVA identificado</span>
					<strong>{formatMoney(data.resumen.iva.estimado)}</strong>
					<small>Trasladado - acreditable</small>
				</div>
			</div>
		</section>

		<section class="grid">
			<div class="panel">
				<div class="panel-header">
					<div>
						<h2>Estado de tu información</h2>
						<p>Lo que Fondi ha recibido este mes.</p>
					</div>
				</div>

				<!-- "por revisar" / "canceladas" se quitaron: requieren validación
				     de CFDI cancelado (webservice del SAT) que no existe todavía -->
				<div class="check-list">
					<div class="check-item">
						<div class="check-circle complete">✓</div>

						<div class="check-content">
							<strong>Ventas</strong>
							<span
								>{data.resumen.ventas.registros} registros ({data.resumen.ventas.facturadas} facturadas,
								{data.resumen.ventas.manuales} manuales)</span
							>
						</div>

						<span class="complete-label">Listo</span>
					</div>

					<div class="check-item">
						<div class="check-content">
							<strong>Facturas de gastos</strong>
							<span>{data.resumen.gastos.registros} CFDI procesados</span>
						</div>

						<span class="complete-label">Listo</span>
					</div>
				</div>
			</div>

			<div class="panel">
				<div class="panel-header">
					<div>
						<h2>¿De dónde viene tu dinero?</h2>
						<p>Solo ventas registradas manualmente — los CFDI de venta no traen canal.</p>
					</div>
				</div>

				<div class="channels">
					{#each data.resumen.canales as canal (canal.canal)}
						<div class="channel">
							<div class="channel-info">
								<strong>{canal.canal}</strong>
								<span>{formatMoney(canal.total)}</span>
							</div>

							<div class="channel-bar">
								<div
									style={`width: ${data.resumen.ventas.total > 0 ? (canal.total / data.resumen.ventas.total) * 100 : 0}%`}
								></div>
							</div>

							<small>
								{data.resumen.ventas.total > 0
									? Math.round((canal.total / data.resumen.ventas.total) * 100)
									: 0}%
							</small>
						</div>
					{:else}
						<p style="color: #858991; font-size: 12px;">
							Sin ventas manuales registradas este mes.
						</p>
					{/each}
				</div>
			</div>
		</section>

		<section class="activity panel">
			<div class="panel-header">
				<div>
					<h2>Últimos movimientos</h2>
					<p>Ventas y gastos registrados recientemente.</p>
				</div>
			</div>

			<div class="table">
				<div class="table-head">
					<span>Fecha</span>
					<span>Descripción</span>
					<span>Tipo</span>
					<span>Importe</span>
				</div>

				{#each data.movimientos as movimiento (movimiento.fecha + movimiento.descripcion)}
					<div class="table-row">
						<span
							>{new Date(movimiento.fecha + 'T12:00:00').toLocaleDateString('es-MX', {
								day: '2-digit',
								month: 'short'
							})}</span
						>

						<strong>{movimiento.descripcion}</strong>

						<span class={getTransactionClass(movimiento.tipo)}>
							{movimiento.tipo}
						</span>

						<span class={getTransactionClass(movimiento.tipo)}>
							{movimiento.monto > 0 ? '+' : ''}
							{formatMoney(movimiento.monto)}
						</span>
					</div>
				{:else}
					<p style="padding: 20px 22px; color: #858991; font-size: 12px;">
						Sin movimientos este mes.
					</p>
				{/each}
			</div>
		</section>
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: #f5f6f8;
		color: #17191d;
		font-family:
			Inter,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	button,
	select {
		font: inherit;
	}

	.app {
		min-height: 100vh;
	}

	.topbar {
		height: 76px;
		padding: 0 42px;
		background: white;
		border-bottom: 1px solid #e7e8eb;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		font-size: 25px;
		font-weight: 800;
		letter-spacing: -1px;
	}

	.subtitle {
		color: #777b83;
		font-size: 12px;
		margin-top: 2px;
	}

	.month-selector {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.month-selector span {
		font-size: 12px;
		color: #777b83;
	}

	select {
		border: 1px solid #dddfe3;
		background: white;
		border-radius: 9px;
		padding: 9px 12px;
		color: #292c31;
		cursor: pointer;
	}

	main {
		max-width: 1220px;
		margin: auto;
		padding: 38px 28px 60px;
	}

	.welcome {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		margin-bottom: 28px;
	}

	.eyebrow {
		margin: 0 0 7px;
		font-size: 11px;
		font-weight: 700;
		color: #7b8089;
		letter-spacing: 0.09em;
	}

	h1 {
		font-size: 32px;
		margin: 0;
		letter-spacing: -1.2px;
	}

	.description {
		color: #777b83;
		margin: 8px 0 0;
		font-size: 14px;
	}

	.status {
		background: #eef8f0;
		color: #28743b;
		border-radius: 20px;
		padding: 8px 13px;
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #3c9b53;
	}

	.main-result {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 18px;
	}

	.result-card,
	.profit-card {
		background: white;
		border: 1px solid #e6e7ea;
		border-radius: 16px;
		padding: 25px;
	}

	.result-card {
		background: #181a1f;
		color: white;
		border-color: #181a1f;
	}

	.result-header,
	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.card-label {
		margin: 0 0 7px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		opacity: 0.6;
	}

	h2,
	h3 {
		margin: 0;
	}

	.result-header h2 {
		font-size: 19px;
	}

	.question {
		width: 25px;
		height: 25px;
		border: 1px solid #4b4e54;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 12px;
		color: #a8abb1;
	}

	.tax-amount {
		font-size: 42px;
		font-weight: 750;
		letter-spacing: -1.8px;
		margin: 21px 0 3px;
	}

	.tax-note {
		margin: 0;
		color: #999da5;
		font-size: 12px;
	}

	.tax-breakdown {
		margin-top: 23px;
		padding-top: 17px;
		border-top: 1px solid #34373d;
	}

	.tax-row {
		display: flex;
		justify-content: space-between;
		padding: 6px 0;
		font-size: 13px;
		color: #c5c7cc;
	}

	.tax-row strong {
		color: white;
	}

	.tax-row.deduction strong {
		color: #7fc68e;
	}

	.result-warning {
		display: flex;
		gap: 10px;
		background: #24272d;
		border-radius: 10px;
		padding: 12px;
		margin-top: 17px;
		color: #c4c7cc;
		font-size: 11px;
	}

	.result-warning span {
		color: #d2a84e;
		font-size: 15px;
	}

	.result-warning strong {
		color: white;
	}

	.result-warning p {
		margin: 3px 0 0;
		line-height: 1.4;
	}

	.profit-card h3 {
		font-size: 19px;
	}

	.trend {
		font-size: 11px;
		color: #777b83;
	}

	.profit-value {
		font-size: 40px;
		font-weight: 750;
		letter-spacing: -1.5px;
		margin-top: 30px;
	}

	.profit-bar {
		height: 8px;
		background: #eceef0;
		border-radius: 10px;
		margin: 19px 0 22px;
		overflow: hidden;
	}

	.profit-fill {
		height: 100%;
		background: #25282d;
		border-radius: inherit;
	}

	.profit-details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 15px;
	}

	.profit-details div {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.profit-details span {
		color: #858991;
		font-size: 11px;
	}

	.profit-details strong {
		font-size: 15px;
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
		margin: 18px 0;
	}

	.metric-card {
		background: white;
		border: 1px solid #e6e7ea;
		border-radius: 13px;
		padding: 17px;
		display: flex;
		align-items: center;
		gap: 13px;
	}

	.metric-icon {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		background: #f0f1f3;
		display: grid;
		place-items: center;
		font-size: 13px;
		font-weight: 700;
	}

	.metric-card span {
		display: block;
		color: #777b83;
		font-size: 11px;
		margin-bottom: 3px;
	}

	.metric-card strong {
		display: block;
		font-size: 17px;
	}

	.metric-card small {
		display: block;
		margin-top: 3px;
		font-size: 10px;
		color: #999da5;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
	}

	.panel {
		background: white;
		border: 1px solid #e6e7ea;
		border-radius: 15px;
		overflow: hidden;
	}

	.panel-header {
		padding: 21px 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #eceef0;
	}

	.panel-header h2 {
		font-size: 16px;
	}

	.panel-header p {
		color: #858991;
		font-size: 11px;
		margin: 4px 0 0;
	}

	.check-list {
		padding: 5px 20px 12px;
	}

	.check-item {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 13px 2px;
		border-bottom: 1px solid #f0f1f2;
	}

	.check-item:last-child {
		border-bottom: 0;
	}

	.check-circle {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 12px;
		font-weight: 700;
		background: #f0f1f2;
	}

	.check-circle.complete {
		color: #347843;
		background: #edf7ef;
	}

	.check-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.check-content strong {
		font-size: 12px;
	}

	.check-content span {
		color: #858991;
		font-size: 10px;
	}

	.complete-label {
		font-size: 10px;
		font-weight: 600;
		color: #347843;
	}

	.channels {
		padding: 19px 22px;
	}

	.channel {
		display: grid;
		grid-template-columns: 1fr 130px 35px;
		align-items: center;
		gap: 12px;
		margin-bottom: 21px;
	}

	.channel:last-child {
		margin-bottom: 0;
	}

	.channel-info {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
	}

	.channel-info strong {
		font-weight: 600;
	}

	.channel-info span {
		color: #777b83;
	}

	.channel-bar {
		height: 7px;
		background: #eceef0;
		border-radius: 10px;
		overflow: hidden;
	}

	.channel-bar div {
		height: 100%;
		background: #292c31;
		border-radius: inherit;
	}

	.channel small {
		color: #777b83;
		font-size: 10px;
		text-align: right;
	}

	.activity {
		margin-top: 18px;
	}

	.table {
		width: 100%;
	}

	.table-head,
	.table-row {
		display: grid;
		grid-template-columns: 100px 1fr 100px 130px;
		align-items: center;
		padding: 13px 22px;
		gap: 15px;
	}

	.table-head {
		background: #fafafa;
		color: #858991;
		font-size: 10px;
	}

	.table-row {
		border-top: 1px solid #f0f1f2;
		font-size: 11px;
	}

	.table-row strong {
		font-weight: 600;
	}

	.positive {
		color: #347843;
	}

	.negative {
		color: #9a3e3e;
	}

	@media (max-width: 850px) {
		.topbar {
			padding: 0 20px;
		}

		main {
			padding: 28px 16px 45px;
		}

		.main-result,
		.grid {
			grid-template-columns: 1fr;
		}

		.metrics {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.topbar {
			height: auto;
			padding: 16px;
			gap: 15px;
			align-items: flex-start;
			flex-direction: column;
		}

		.welcome {
			align-items: flex-start;
			flex-direction: column;
			gap: 15px;
		}

		h1 {
			font-size: 27px;
		}

		.metrics {
			grid-template-columns: 1fr;
		}

		.tax-amount,
		.profit-value {
			font-size: 34px;
		}

		.table {
			overflow-x: auto;
		}

		.table-head,
		.table-row {
			min-width: 550px;
		}
	}
</style>
