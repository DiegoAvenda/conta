<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="navbar bg-base-100 shadow-sm">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					aria-label="Menu"
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
			<ul
				tabindex="-1"
				class="menu dropdown-content z-1 mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow"
			>
				<li><a href={resolve('/questions')}>Questions</a></li>
				<li>
					<a href={resolve('/inscripcion')}>Onboarding SAT</a>
					<ul class="p-2">
						<li><a href={resolve('/egresos')}>Egresos</a></li>
						<li><a href={resolve('/ventas')}>Ingresos</a></li>
					</ul>
				</li>
				<li><a href={resolve('/dashboard')}>Dashboard</a></li>
			</ul>
		</div>
		<a href={resolve('/')} class="btn btn-ghost text-xl">daisyUI</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href={resolve('/questions')}>Questions</a></li>
			<li>
				<details>
					<summary>Parent</summary>
					<ul class="z-1 w-40 bg-base-100 p-2">
						<li><a href={resolve('/egresos')}>Egresos</a></li>
						<li><a href={resolve('/ventas')}>Ventas</a></li>
					</ul>
				</details>
			</li>
			<li><a href={resolve('/dashboard')}>Dasboard</a></li>
		</ul>
	</div>
	<div class="navbar-end">
		<a href={resolve('/pedir-factura-gasto')} class="btn">Pedir factura gasto</a>
	</div>
</div>
