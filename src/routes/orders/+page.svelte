<script>
	import { resolve } from '$app/paths';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let { data } = $props();

	// Extraemos los filtros actuales que nos mandó el backend
	const currentStatus = $derived(data.filters?.status ?? 'pending');
	const currentChannel = $derived(data.filters?.channel ?? 'all'); // 'all', 'delivery', 'restaurant'

	// Nuevas opciones de estado (textos en lugar de booleanos)
	const statuses = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'preparing', label: 'Preparing' },
		{ value: 'ready', label: 'Ready' },
		{ value: 'completed', label: 'Completed' }
	];

	// Opciones para filtrar por canal
	const channels = [
		{ value: 'all', label: 'All Orders' },
		{ value: 'delivery', label: 'Delivery' },
		{ value: 'restaurant', label: 'POS / Local' }
	];

	const emptyMessages = {
		pending: "You don't have pending orders",
		preparing: 'No orders are currently being prepared',
		ready: 'No orders ready to be delivered or served',
		completed: "You don't have completed orders"
	};

	const statusLabel = $derived(statuses.find((s) => s.value === currentStatus)?.label ?? 'Pending');

	// Función para construir la URL combinando ambos filtros
	const createFilterQuery = (channelVal, statusVal) => {
		const params = new SvelteURLSearchParams();
		if (statusVal && statusVal !== 'all') params.set('status', statusVal);
		if (channelVal && channelVal !== 'all') params.set('channel', channelVal);
		return params.toString();
	};
</script>

<div class="mt-6 flex flex-col items-center">
	<h1 class="flex justify-center text-3xl font-bold">{statusLabel} Orders</h1>

	<!-- Filtro 1: Por Canal (Delivery vs Restaurante) -->
	<div class="join mt-6">
		{#each channels as channel (channel.value)}
			<a
				href={resolve(`/orders?${createFilterQuery(channel.value, currentStatus)}`)}
				class="btn join-item {currentChannel === channel.value ? 'btn-neutral' : ''}"
			>
				{channel.label}
			</a>
		{/each}
	</div>

	<!-- Filtro 2: Por Estado de preparación -->
	<div class="join mt-2 mb-6">
		{#each statuses as status (status.value)}
			<a
				href={resolve(`/orders?${createFilterQuery(currentChannel, status.value)}`)}
				class="btn join-item {currentStatus === status.value ? 'btn-primary' : ''}"
			>
				{status.label}
			</a>
		{/each}
	</div>

	<div class="my-6 flex flex-col items-center gap-4">
		{#each data.orders as order (order._id)}
			<div class="card-bordered card-compact card w-96 bg-base-100 shadow-xl">
				<div class="card-body">
					<!-- ENCABEZADO DE LA ORDEN -->
					<div class="flex items-start justify-between">
						<h2 class="card-title">
							{order.customerName || 'Walk-in Customer'}
						</h2>
						<!-- Badges dinámicos para identificar rápido qué tipo de orden es -->
						<div class="flex flex-col items-end gap-1">
							<span
								class="badge badge-sm {order.channel === 'delivery'
									? 'badge-secondary'
									: 'badge-primary'}"
							>
								{order.channel}
							</span>
							{#if order.channel === 'restaurant' && order.orderType}
								<span class="badge badge-outline badge-sm">
									{order.orderType === 'dine-in' ? 'Dine-in' : 'Takeout'}
									{order.tableNumber ? `(Table ${order.tableNumber})` : ''}
								</span>
							{/if}
						</div>
					</div>

					<!-- TIMESTAMPS -->
					<div class="my-1 text-xs text-gray-500">
						<p>Created: {order.createdAt}</p>
						{#if order.preparingAt}
							<p>Prep started: {order.preparingAt}</p>
						{/if}
						{#if order.readyAt}
							<p>Ready at: {order.readyAt}</p>
						{/if}
						{#if order.completedAt}
							<p>Completed: {order.completedAt}</p>
						{/if}
					</div>

					<!-- TABLA DE ITEMS -->
					<table class="table mt-2 table-sm">
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

					<!-- TOTAL Y PAGO -->
					<div class="mt-2 flex items-center justify-between">
						<p class="font-bold">Total price ${order.totalPrice}</p>
						{#if order.paymentStatus === 'paid'}
							<span class="badge text-white badge-success">Paid</span>
						{:else}
							<span class="badge badge-warning">Unpaid</span>
						{/if}
					</div>

					<!-- BOTONES DE ACCIÓN -->
					<div class="mt-2 card-actions flex justify-end gap-2">
						{#if order.paymentStatus !== 'paid' && order.paymentStatus !== 'refunded'}
							<form method="post" action="?/markPaid" class="flex items-center gap-2">
								<input type="hidden" name="orderId" value={order._id} />
								<select name="paymentMethod" class="select-bordered select select-xs">
									<option value="card" selected={order.channel === 'delivery'}>Card</option>
									<option value="cash" selected={order.channel !== 'delivery'}>Cash</option>
								</select>
								<button class="btn btn-sm btn-success">Mark Paid</button>
							</form>
						{/if}

						{#if order.paymentStatus === 'paid'}
							<form method="post" action="?/refundOrder">
								<input type="hidden" name="orderId" value={order._id} />
								<button class="btn btn-sm btn-warning">Refund</button>
							</form>
						{/if}

						{#if order.status !== 'completed' && order.paymentStatus !== 'cancelled'}
							<form method="post" action="?/cancelOrder">
								<input type="hidden" name="orderId" value={order._id} />
								<button class="btn btn-error btn-sm">Cancel</button>
							</form>
						{/if}

						{#if order.status !== 'completed'}
							<form method="post" action="?/updateStatus">
								<input type="hidden" name="orderId" value={order._id} />

								{#if order.status === 'pending'}
									<input type="hidden" name="status" value="preparing" />
									<button class="btn btn-primary btn-sm">Start Preparing</button>
								{:else if order.status === 'preparing'}
									<input type="hidden" name="status" value="ready" />
									<button class="btn btn-primary btn-sm">Mark as Ready</button>
								{:else if order.status === 'ready'}
									<input type="hidden" name="status" value="completed" />
									<button class="btn btn-primary btn-sm">
										{order.channel === 'delivery' ? 'Mark Delivered' : 'Complete Order'}
									</button>
								{/if}
							</form>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if data.orders?.length === 0}
		<p class="mt-4 text-gray-500">{emptyMessages[currentStatus]}</p>
	{/if}
</div>
