<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let uploading = $state(false);
</script>

<h1>Menú del negocio</h1>

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}

<form
	method="POST"
	action="?/create"
	enctype="multipart/form-data"
	use:enhance={() => {
		uploading = true;
		return async ({ update }) => {
			uploading = false;
			await update();
		};
	}}
>
	<label>
		Categoría
		<input name="category" maxlength="24" required />
	</label>

	<label>
		Nombre del platillo
		<input name="name" maxlength="24" required />
	</label>

	<label>
		Descripción corta
		<textarea name="description" maxlength="72"></textarea>
	</label>

	<label>
		Precio
		<input name="price" type="number" step="0.01" min="0" required />
	</label>

	<label>
		Imagen
		<input name="image" type="file" accept="image/*" />
	</label>

	<button type="submit" disabled={uploading}>
		{uploading ? 'Subiendo...' : 'Agregar al menú'}
	</button>
</form>

<ul class="menu-list">
	{#each data.items as item (item._id)}
		<li>
			{#if item.imageUrl}
				<img src={item.imageUrl} alt={item.name} width="80" />
			{/if}
			<div>
				<strong>{item.category}</strong> — {item.name} (${item.price})
				<p>{item.description}</p>
			</div>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={item._id} />
				<button type="submit">Eliminar</button>
			</form>
		</li>
	{/each}
</ul>
