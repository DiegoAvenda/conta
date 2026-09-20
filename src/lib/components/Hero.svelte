<script>
	import { resolve } from '$app/paths';
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Contaco</h1>
			<p class="py-6">
				Te llevamos de la mano para que tengas tu contabilidad en orden y pagos tus impuestos en
				tiempo y forma.
			</p>
			<button class="btn btn-primary"><a href={resolve('/questions')}>Get started</a></button>
		</div>
	</div>
</div>
