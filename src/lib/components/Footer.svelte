<script>
	import { resolve } from '$app/paths';
</script>

<footer class="footer bg-neutral p-10 text-neutral-content sm:footer-horizontal">
	<nav>
		<h6 class="footer-title">Onboarding</h6>
		<a href={resolve('/better-auth')} class="link link-hover">Login</a>
		<a href={resolve('/questions')} class="link link-hover">Questions</a>
		<a href={resolve('/inscripcion')} class="link link-hover">Inscripcion</a>
	</nav>
	<nav>
		<h6 class="footer-title">Regitro de actividad</h6>
		<a href={resolve('/egresos')} class="link link-hover">Egresos</a>
		<a href={resolve('/ventas')} class="link link-hover">Ventas</a>
		<a href={resolve('/')} class="link link-hover">Jobs</a>
		<a href={resolve('/')} class="link link-hover">Press kit</a>
	</nav>
	<nav>
		<h6 class="footer-title">Resultados</h6>
		<a href={resolve('/dashboard')} class="link link-hover">Dashboard</a>
		<a href={resolve('/orders')} class="link link-hover">Orders</a>
		<a href={resolve('/pos')} class="link link-hover">POS</a>
		<a href={resolve('/configure-menu')} class="link link-hover">Menu</a>
	</nav>
</footer>
