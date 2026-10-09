<script>
	let loading = $state(false);
	let result = $state(null);
	let error = $state('');

	async function runManagementTests() {
		loading = true;
		result = null;
		error = '';

		try {
			const response = await fetch('/api/meta/test-management');

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || 'No se pudieron realizar las pruebas de Meta API');
			}

			result = data;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Meta API Test | Contaco</title>

	<meta
		name="description"
		content="Pruebas de integración de Contaco con WhatsApp Business Platform."
	/>
</svelte:head>

<div class="min-h-screen bg-slate-50 px-4 py-12">
	<div class="mx-auto max-w-3xl">
		<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<header class="mb-8">
				<p class="text-sm font-semibold text-primary">Contaco · Meta API</p>

				<h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
					WhatsApp Business Management API
				</h1>

				<p class="mt-3 max-w-2xl leading-6 text-slate-600">
					Página de pruebas técnicas para verificar la integración de Contaco con WhatsApp Business
					Platform.
				</p>
			</header>

			<div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
				<h2 class="font-semibold text-slate-900">API tests</h2>

				<p class="mt-2 text-sm leading-6 text-slate-600">
					Estas pruebas realizan llamadas directamente desde el servidor de Contaco hacia Meta Graph
					API.
				</p>

				<div class="mt-5 space-y-3 text-sm">
					<div class="flex items-center justify-between rounded-lg bg-white p-4">
						<div>
							<p class="font-medium text-slate-900">Obtener números de WhatsApp</p>

							<p class="mt-1 font-mono text-xs text-slate-500">
								GET /{'{WABA-ID}'}/phone_numbers
							</p>
						</div>

						{#if result}
							<span
								class:text-green-700={result.phoneNumbers?.ok}
								class:text-red-700={!result.phoneNumbers?.ok}
								class="font-semibold"
							>
								{result.phoneNumbers?.ok ? '✓ OK' : '✕ Error'}
							</span>
						{/if}
					</div>

					<div class="flex items-center justify-between rounded-lg bg-white p-4">
						<div>
							<p class="font-medium text-slate-900">Obtener plantillas</p>

							<p class="mt-1 font-mono text-xs text-slate-500">
								GET /{'{WABA-ID}'}/message_templates
							</p>
						</div>

						{#if result}
							<span
								class="font-semibold"
								class:text-green-700={result.templates?.ok}
								class:text-red-700={!result.templates?.ok}
							>
								{result.templates?.ok ? '✓ OK' : '✕ Error'}
							</span>
						{/if}
					</div>
				</div>
			</div>

			<button
				type="button"
				onclick={runManagementTests}
				disabled={loading}
				class="mt-6 w-full rounded-lg bg-primary px-5 py-3 font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? 'Ejecutando pruebas...' : 'Ejecutar pruebas de Meta API'}
			</button>

			{#if result}
				<div class="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
					<div class="flex items-center gap-2">
						<span class="text-lg">✓</span>

						<h2 class="font-semibold text-green-900">Pruebas completadas</h2>
					</div>

					<p class="mt-2 text-sm leading-6 text-green-800">
						Contaco realizó las llamadas de prueba a Meta Graph API correctamente.
					</p>

					{#if result.phoneNumbers?.data?.data}
						<div class="mt-5">
							<p class="text-sm font-semibold text-green-900">Números encontrados</p>

							<p class="mt-1 text-2xl font-bold text-green-900">
								{result.phoneNumbers.data.data.length}
							</p>
						</div>
					{/if}

					{#if result.templates?.data?.data}
						<div class="mt-5">
							<p class="text-sm font-semibold text-green-900">Plantillas encontradas</p>

							<p class="mt-1 text-2xl font-bold text-green-900">
								{result.templates.data.data.length}
							</p>
						</div>
					{/if}
				</div>
			{/if}

			{#if error}
				<div class="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
					<h2 class="font-semibold text-red-900">Error</h2>

					<p class="mt-2 text-sm leading-6 text-red-800">
						{error}
					</p>
				</div>
			{/if}

			<div class="mt-8 border-t border-slate-200 pt-6">
				<p class="text-xs leading-5 text-slate-500">
					Esta página es una herramienta técnica interna para verificar la integración de Contaco
					con WhatsApp Business Platform. No forma parte del flujo normal de pedidos de los
					restaurantes.
				</p>
			</div>
		</div>
	</div>
</div>
