<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let uploading = $state(false);
</script>

<div class="mx-auto max-w-4xl p-4 font-sans text-gray-800 md:p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
			Menú del negocio
		</h1>
		<p class="mt-2 text-gray-500">Administra los platillos y categorías de tu catálogo.</p>
	</div>

	<!-- Mensaje de Error -->
	{#if form?.error}
		<div
			class="mb-6 rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700 shadow-sm"
			role="alert"
		>
			<p class="font-medium">{form.error}</p>
		</div>
	{/if}

	<!-- Formulario de Creación -->
	<form
		method="POST"
		action="?/create"
		enctype="multipart/form-data"
		class="mb-12 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg md:p-8"
		use:enhance={() => {
			uploading = true;
			return async ({ update }) => {
				uploading = false;
				await update();
			};
		}}
	>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<label class="block">
				<span class="text-sm font-semibold text-gray-700">Categoría</span>
				<input
					name="category"
					maxlength="24"
					required
					class="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
					placeholder="Ej. Bebidas, Postres"
				/>
			</label>

			<label class="block">
				<span class="text-sm font-semibold text-gray-700">Nombre del platillo</span>
				<input
					name="name"
					maxlength="24"
					required
					class="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
					placeholder="Ej. Tacos al Pastor"
				/>
			</label>
		</div>

		<label class="block">
			<span class="text-sm font-semibold text-gray-700">Descripción corta</span>
			<textarea
				name="description"
				maxlength="72"
				rows="2"
				class="mt-1.5 block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
				placeholder="Ingredientes principales o descripción breve..."></textarea>
		</label>

		<div class="grid grid-cols-1 items-end gap-6 md:grid-cols-2">
			<label class="block">
				<span class="text-sm font-semibold text-gray-700">Precio ($)</span>
				<input
					name="price"
					type="number"
					step="0.01"
					min="0"
					required
					class="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
					placeholder="0.00"
				/>
			</label>

			<label class="block">
				<span class="mb-1.5 block text-sm font-semibold text-gray-700">Imagen</span>
				<input
					name="image"
					type="file"
					accept="image/*"
					class="block w-full cursor-pointer text-sm
                    text-gray-500 file:mr-4 file:cursor-pointer
                    file:rounded-xl file:border-0
                    file:bg-indigo-50 file:px-4
                    file:py-2.5 file:text-sm
                    file:font-semibold file:text-indigo-700 file:transition-colors hover:file:bg-indigo-100"
				/>
			</label>
		</div>

		<div class="pt-2">
			<button
				type="submit"
				disabled={uploading}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
			>
				{#if uploading}
					<svg
						class="h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span>Subiendo...</span>
				{:else}
					<span>Agregar al menú</span>
				{/if}
			</button>
		</div>
	</form>

	<!-- Lista de Platillos -->
	<div class="space-y-4">
		<h2 class="mb-4 border-b pb-2 text-2xl font-bold text-gray-900">Platillos Actuales</h2>

		{#if data.items.length === 0}
			<div class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
				<p class="text-gray-500">No hay platillos en el menú todavía.</p>
			</div>
		{/if}

		<ul class="grid grid-cols-1 gap-4">
			{#each data.items as item (item._id)}
				<li
					class="group flex flex-col items-start gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
				>
					<!-- Imagen del platillo -->
					<div class="shrink-0">
						{#if item.imageUrl}
							<img
								src={item.imageUrl}
								alt={item.name}
								class="h-24 w-24 rounded-xl object-cover shadow-sm sm:h-20 sm:w-20"
							/>
						{:else}
							<div
								class="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-gray-400 sm:h-20 sm:w-20"
							>
								<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									></path></svg
								>
							</div>
						{/if}
					</div>

					<!-- Información -->
					<div class="min-w-0 flex-1">
						<div class="mb-1 flex items-center gap-2">
							<span
								class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold tracking-wide text-indigo-700 uppercase"
							>
								{item.category}
							</span>
							<span class="text-lg font-bold text-emerald-600"
								>${((Number(item.price) || 0) / 100).toFixed(2)}</span
							>
						</div>
						<h3 class="truncate text-xl font-bold text-gray-900">{item.name}</h3>
						{#if item.description}
							<p class="mt-1 line-clamp-2 text-sm text-gray-500">{item.description}</p>
						{/if}
					</div>

					<!-- Acción (Eliminar) -->
					<form
						method="POST"
						action="?/delete"
						use:enhance
						class="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto"
					>
						<input type="hidden" name="id" value={item._id} />
						<button
							type="submit"
							class="w-full rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors outline-none hover:bg-red-100 hover:text-red-700 focus:ring-2 focus:ring-red-200 sm:w-auto"
						>
							Eliminar
						</button>
					</form>
				</li>
			{/each}
		</ul>
	</div>
</div>
