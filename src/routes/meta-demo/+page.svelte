<script>
	let loading = $state(false);
	let result = $state(null);
	let error = $state('');

	async function sendTestMessage() {
		loading = true;
		result = null;
		error = '';

		try {
			const response = await fetch('/api/meta/send-test-message', {
				method: 'POST'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'No se pudo enviar el mensaje');
			}

			result = data;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>WhatsApp API Demo | Contaco</title>

	<meta
		name="description"
		content="Demostración de la integración de Contaco con WhatsApp Cloud API."
	/>
</svelte:head>

<div class="min-h-screen bg-slate-50 px-4 py-12">
	<div class="mx-auto max-w-xl">
		<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<header class="mb-8">
				<p class="text-sm font-semibold text-primary">Contaco · Meta API Demo</p>

				<h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">WhatsApp Cloud API</h1>

				<p class="mt-3 leading-6 text-slate-600">
					Demostración de envío de una plantilla de WhatsApp mediante la API oficial de Meta.
				</p>
			</header>

			<div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
				<div class="space-y-4 text-sm">
					<div>
						<p class="font-medium text-slate-500">Plantilla</p>

						<p class="mt-1 font-mono text-slate-900">jaspers_market_order_confirmation_v1</p>
					</div>

					<div>
						<p class="font-medium text-slate-500">Tipo</p>

						<p class="mt-1 text-slate-900">Template message</p>
					</div>

					<div>
						<p class="font-medium text-slate-500">Destinatario</p>

						<p class="mt-1 text-slate-900">Número de prueba configurado en el servidor</p>
					</div>
				</div>
			</div>

			<button
				type="button"
				onclick={sendTestMessage}
				disabled={loading}
				class="mt-6 w-full rounded-lg bg-primary px-5 py-3 font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? 'Enviando mensaje...' : 'Enviar mensaje de prueba'}
			</button>
			pnpm run dev
			{#if result}
				<div class="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
					<p class="font-semibold text-green-800">Mensaje enviado correctamente</p>

					<p class="mt-1 text-sm text-green-700">
						La solicitud fue aceptada por WhatsApp Cloud API.
					</p>

					{#if result.data?.messages?.[0]?.id}
						<p class="mt-3 font-mono text-xs break-all text-green-700">
							Message ID: {result.data.messages[0].id}
						</p>
					{/if}
				</div>
			{/if}

			{#if error}
				<div class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
					<p class="font-semibold text-red-800">Error</p>

					<p class="mt-1 text-sm leading-6 text-red-700">
						{error}
					</p>
				</div>
			{/if}

			<p class="mt-6 text-center text-xs leading-5 text-slate-500">
				Esta página se utiliza para demostrar la integración de Contaco con WhatsApp Cloud API.
			</p>
		</div>
	</div>
</div>
