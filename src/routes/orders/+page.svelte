<script>
	import { resolve } from '$app/paths';

	let { data } = $props();

	const statusOptions = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'prepared', label: 'Prepared' },
		{ value: 'delivered', label: 'Delivered' }
	];

	const emptyMessages = {
		pending: "You don't have pending orders",
		prepared: 'No prepared orders to deliver.',
		delivered: "You don't have delivered orders"
	};

	const selectedStatus = $derived(data.selectedStatus ?? 'pending');
	const statusLabel = $derived(
		statusOptions.find((option) => option.value === selectedStatus)?.label ?? 'Pending'
	);
</script>

<div class="mt-6 flex flex-col items-center">
	<h1 class="flex justify-center text-3xl font-bold">{statusLabel} orders</h1>

	<div class="join my-6">
		{#each statusOptions as option (option.value)}
			<a
				href={option.value === 'pending'
					? resolve('/orders')
					: resolve(`/orders?status=${option.value}`)}
				class:btn-primary={selectedStatus === option.value}
				class="btn join-item"
			>
				{option.label}
			</a>
		{/each}
	</div>

	<div class="my-6 flex flex-col items-center gap-1">
		{#each data.orders as order (order._id)}
			<div class="card-bordered card-compact card w-96 bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">{order.customerName}</h2>
					{#if selectedStatus === 'pending'}
						<p>Created at: {order.createdAt}</p>
					{:else if selectedStatus === 'prepared'}
						<p>Created at: {order.createdAt}</p>
						<p>Prepared at: {order.preparedAt}</p>
					{:else}
						<p>Created at: {order.createdAt}</p>
						<p>Delivered at: {order.deliveredAt}</p>
					{/if}

					<table class="table">
						<thead>
							<tr>
								<th>Dish</th>
								<th>Qty</th>
							</tr>
						</thead>
						<tbody>
							{#each order.items as item (item.name)}
								<tr>
									<th>{item.name}</th>
									<td>{item.quantity}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<p class="font-bold">Total price ${order.totalPrice}</p>
					<div class="card-a-ctions flex justify-end gap-1">
						<a href={resolve(`/orders/${order._id}`)}><button class="btn">See location</button></a>
						{#if selectedStatus === 'pending'}
							<form method="post" action="?/markPrepared">
								<input type="hidden" name="orderId" value={order._id} />
								<button class="btn btn-primary">Mark as prepared</button>
							</form>
						{:else if selectedStatus === 'prepared'}
							<form method="post" action="?/markDelivered">
								<input type="hidden" name="orderId" value={order._id} />
								<button class="btn btn-primary">Mark as delivered</button>
							</form>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if data.orders?.length === 0}
		<p>{emptyMessages[selectedStatus]}</p>
	{/if}
</div>
