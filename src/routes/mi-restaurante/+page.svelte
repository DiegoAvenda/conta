<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	// Captura el slug guardado una sola vez como valor inicial del input editable
	// (tras guardar, la página se invalida y el componente se re-renderiza con el
	// slug ya normalizado, sin acentos ni mayúsculas).
	let slug = $state(data.perfil.slug);

	const slugPublico = $derived(slug ? `contaco.store/${slug}` : 'contaco.store/tu-enlace');
	const slugGuardado = $derived(form?.slug ?? data.perfil.slug);
</script>

<svelte:head>
	<title>Mi Tienda · contaco</title>
</svelte:head>

<div class="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
	<div class="mb-6">
		<h1 class="text-3xl font-black tracking-tight">Mi Tienda pública</h1>
		<p class="mt-2 text-sm text-base-content/70">
			Configura cómo se ve tu restaurante para tus comensales. El menú público usa los mismos
			platillos que registras en "Menú del Negocio".
		</p>
	</div>

	{#if form?.error}
		<div class="mb-4 alert text-sm alert-error shadow-sm" role="alert">
			<span>{form.error}</span>
		</div>
	{/if}

	{#if form?.success}
		<div class="mb-4 alert text-sm alert-success shadow-sm">
			<span>Tienda guardada. 🎉</span>
		</div>
	{/if}

	{#if slugGuardado}
		<div
			class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-200/60 p-4"
		>
			<div>
				<p class="text-xs font-semibold text-base-content/60">Tu tienda está en línea</p>
				<p class="font-mono text-sm font-bold">contaco.store/{slugGuardado}</p>
			</div>
			<a
				href={resolve(`/${slugGuardado}`)}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-primary btn-sm"
			>
				Ver mi tienda ↗
			</a>
		</div>
	{/if}

	<form
		method="post"
		action="?/guardar"
		use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
			};
		}}
		class="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm"
	>
		<label class="form-control">
			<span class="label-text mb-1 text-xs font-semibold">Nombre público *</span>
			<input
				type="text"
				name="nombre"
				value={data.perfil.nombre}
				maxlength="60"
				required
				class="input-bordered input w-full input-sm"
				placeholder="Hamburguesería 1"
			/>
		</label>

		<label class="form-control">
			<span class="label-text mb-1 text-xs font-semibold">Enlace de tu tienda</span>
			<div class="join w-full">
				<span
					class="join-item flex items-center border border-base-300 bg-base-200 px-3 text-sm text-base-content/60"
					>contaco.store/</span
				>
				<input
					type="text"
					name="slug"
					bind:value={slug}
					maxlength="40"
					class="input-bordered input join-item w-full input-sm"
					placeholder="hamburgueseria-1"
				/>
			</div>
			<span class="label-text mt-1 text-[11px] text-base-content/60">
				{slugPublico} · Solo minúsculas, números y guiones. Déjalo vacío para despublicar tu tienda.
			</span>
		</label>

		<label class="form-control">
			<span class="label-text mb-1 text-xs font-semibold">Descripción</span>
			<textarea
				name="descripcion"
				value={data.perfil.descripcion}
				maxlength="300"
				rows="3"
				class="textarea-bordered textarea w-full"
				placeholder="Hamburguesas artesanales hechas al momento…"></textarea>
		</label>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="form-control">
				<span class="label-text mb-1 text-xs font-semibold">Teléfono</span>
				<input
					type="tel"
					name="telefono"
					value={data.perfil.telefono}
					maxlength="20"
					class="input-bordered input w-full input-sm"
					placeholder="55 1234 5678"
				/>
			</label>
			<label class="form-control">
				<span class="label-text mb-1 text-xs font-semibold">Dirección</span>
				<input
					type="text"
					name="direccion"
					value={data.perfil.direccion}
					maxlength="120"
					class="input-bordered input w-full input-sm"
					placeholder="Calle X 123, Colonia"
				/>
			</label>
		</div>

		<label class="label cursor-pointer justify-start gap-3">
			<input
				type="checkbox"
				name="deliveryEnabled"
				checked={data.perfil.deliveryEnabled}
				class="checkbox checkbox-sm"
			/>
			<span class="label-text text-sm">Aceptar pedidos a domicilio desde mi tienda</span>
		</label>

		<label class="form-control">
			<span class="label-text mb-1 text-xs font-semibold">Imagen de portada (máx. 5 MB)</span>
			{#if data.perfil.heroImageUrl}
				<img
					src={data.perfil.heroImageUrl}
					alt="Portada actual"
					class="mb-2 h-32 w-full rounded-xl object-cover"
				/>
			{/if}
			<input
				type="file"
				name="hero"
				accept="image/*"
				class="file-input-bordered file-input w-full file-input-sm"
			/>
		</label>

		<div class="flex justify-end border-t border-base-200 pt-4">
			<button type="submit" class="btn btn-primary">Guardar tienda</button>
		</div>
	</form>
</div>
