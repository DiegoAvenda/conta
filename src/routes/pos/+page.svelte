<script>
	import { products } from '$lib/utils/products';
	import { cart, addToCart, substractFromCart } from '$lib/utils/cart.svelte.js';

	let totalPrice = $derived(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
</script>

<div class="m-8">
	<div class="flex justify-center">
		<h1 class="text-4xl font-bold">Menu</h1>
	</div>
	<div
		class="m-9 flex flex-col items-center gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 lg:justify-center"
	>
		{#each products as product, i (product.name)}
			<div class="card-bordered card-compact card w-96 border-base-content bg-base-100 shadow-xl">
				<figure>
					<img alt={product.name} src={product.image} />
				</figure>
				<div class="card-body">
					<h2 class="card-title">
						{product.name}
					</h2>
					<p>${product.price}</p>
					<div class="card-actions justify-end">
						<button onclick={() => addToCart(i, product)} class="btn btn-primary"
							>Add to cart</button
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<div tabindex="-1" class="dropdown-content card z-1 mt-3 w-52 bg-base-100 shadow card-sm">
	<div class="card-body">
		<span class="text-lg font-bold">{cart?.length | 0} Items</span>
		{#if cart}
			{#each cart as item (item.name)}
				<div class="card-compact card bg-base-100 shadow-xl">
					<figure>
						<img width="75" src={item.image} alt={item.name} />
					</figure>
					<div class="card-body">
						<h2 class="card-title">{item.name}</h2>
						<div class="card-actions justify-end">
							<p>{item.quantity}</p>
							<button
								aria-label="remove"
								onclick={() => substractFromCart(item.id)}
								class="btn btn-xs">-</button
							>
							<button aria-label="remove" onclick={() => addToCart(item.id)} class="btn btn-xs"
								>+</button
							>
						</div>
					</div>
				</div>
			{/each}
		{/if}
		<span class="text-info">Subtotal: ${totalPrice}</span>
		{#if cart.length > 0}
			<div class="card-actions">
				<form method="POST">
					<input name="cart" type="hidden" value={JSON.stringify(cart)} />
					<input name="totalPrice" type="hidden" value={totalPrice} />
					<label class="form-control w-full">
						<span class="label-text mb-1 text-xs">Payment</span>
						<select name="paymentMethod" class="select-bordered select w-full select-sm">
							<option value="cash">Cash</option>
							<option value="card">Card / Terminal</option>
						</select>
					</label>
					<button class="btn mt-3 btn-block btn-primary">Confirm order</button>
				</form>
			</div>
		{/if}
	</div>
</div>
