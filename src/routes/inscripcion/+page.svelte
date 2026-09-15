<script>
	import inscripcion1 from '$lib/assets/images/inscripcion/inscripcion-sat1.png';
	import inscripcion2 from '$lib/assets/images/inscripcion/inscripcion-sat2.png';
	import inscripcion3 from '$lib/assets/images/inscripcion/inscripcion-sat3.png';
	import inscripcion4 from '$lib/assets/images/inscripcion/inscripcion-sat4.png';
	import inscripcion5 from '$lib/assets/images/inscripcion/inscripcion-sat5.png';
	import inscripcion6 from '$lib/assets/images/inscripcion/inscripcion-sat6.png';
	import inscripcion7 from '$lib/assets/images/inscripcion/inscripcion-sat7.png';
	import inscripcion8 from '$lib/assets/images/inscripcion/inscripcion-sat8.png';
	import inscripcion9 from '$lib/assets/images/inscripcion/inscripcion-sat9.png';
	import inscripcion10 from '$lib/assets/images/inscripcion/inscripcion-sat10.png';
	import inscripcion11 from '$lib/assets/images/inscripcion/inscripcion-sat11.png';

	const pasos = [
		{
			numero: 1,
			titulo: 'Selección del trámite en el Portal del SAT',
			texto:
				'Entra al portal del SAT (sat.gob.mx) en la sección "Inscripción y avisos al RFC para Personas".',
			acciones: ['Haz clic en la opción "Actualiza tu actividad económica y obligaciones".'],
			imagen: inscripcion1
		},
		{
			numero: 2,
			titulo: 'Requisitos e inicio del proceso',
			texto:
				'Revisa los requisitos para realizar el trámite. Necesitarás tu Contraseña o e.firma vigente.',
			acciones: ['Haz clic en el botón "Iniciar" para abrir el formulario de actualización.'],
			imagen: inscripcion2
		},
		{
			numero: 3,
			titulo: 'Inicio de sesión (Autenticación)',
			texto: 'Ingresa tus credenciales de acceso.',
			acciones: [
				'Escribe tu RFC, Contraseña y el código Captcha que se muestra en pantalla (o selecciona la opción de acceso con e.firma) y haz clic en "Enviar".'
			],
			imagen: inscripcion3
		},
		{
			numero: 4,
			titulo: 'Fecha de actualización de actividades',
			texto: 'Indica la fecha en la que realizas o iniciarás el cambio de actividades.',
			acciones: [
				'Selecciona la "Fecha de movimiento" en el calendario.',
				'Si estás realizando el trámite a título personal, ignora los campos de representante legal y haz clic en "Continuar".'
			],
			imagen: inscripcion4
		},
		{
			numero: 5,
			titulo: 'Selección del tipo de ingreso',
			texto: 'Marca el origen de los ingresos de tu negocio.',
			acciones: [
				'Selecciona únicamente estas dos casillas: "Realizas actividades empresariales (comerciales, industriales, agrícolas...)" y "Actividades empresariales con ingresos por la enajenación de bienes o la prestación de servicios a través de internet, plataformas, aplicaciones informáticas y similares".',
				'Haz clic en "Continuar".'
			],
			nota: 'No marques la casilla de RESICO para evitar inconsistencias con plataformas.',
			imagen: inscripcion5
		},
		{
			numero: 6,
			titulo: 'Selección del grupo de actividad económica',
			texto: 'Identifica los grupos a los que pertenecen tus actividades.',
			acciones: [
				'Selecciona el icono correspondiente a "Actividades empresariales" y el grupo de "Actividades a través de Internet/Plataformas".',
				'Haz clic en "Continuar".'
			],
			imagen: inscripcion6
		},
		{
			numero: 7,
			titulo: 'Ubicar las actividades específicas (giro de comida)',
			texto: 'Busca el giro específico de alimentos en ambas modalidades.',
			acciones: [
				'En Actividades empresariales: ve al grupo "Alimentos y bebidas" y selecciona "Restaurantes de comida para llevar".',
				'En Plataformas tecnológicas: ve a "Alimentos y bebidas" y selecciona "Servicio de entrega de alimentos preparados a través de Internet, aplicaciones informáticas y similares".',
				'Haz clic en "Continuar".'
			],
			imagen: inscripcion7
		},
		{
			numero: 8,
			titulo: 'Asignación de porcentajes y forma de trabajo',
			texto: 'Especifica el porcentaje de ingresos de cada actividad y cómo realizas tu trabajo.',
			acciones: [
				'Selecciona la opción "Por cuenta propia" para ambas actividades.',
				'Asigna el porcentaje estimado de ingresos a cada una, de manera que el total sume exactamente 100% (por ejemplo: 51% y 49%).',
				'En la ventana emergente de plataformas, responde si tus ingresos excederán los $300,000 pesos anuales (por ejemplo, selecciona "pagos provisionales") y haz clic en "Listo".',
				'Haz clic en "Continuar".'
			],
			imagen: inscripcion8
		},
		{
			numero: 9,
			titulo: 'Preguntas complementarias sobre trabajadores',
			texto: 'Responde la pregunta sobre la contratación de personal.',
			acciones: [
				'Si vas a operar por tu cuenta sin empleados en nómina formal, selecciona "No tendrás trabajadores o asimilados a salarios".',
				'Haz clic en "Aceptar" y luego en "Continuar".'
			],
			imagen: inscripcion9
		},
		{
			numero: 10,
			titulo: 'Relación de retenedores (opcional)',
			texto: 'Captura el RFC de las plataformas tecnológicas con las que trabajarás.',
			acciones: [
				'Si cuentas con el RFC de la plataforma con la que vas a vender, puedes registrarlo en esta sección.',
				'Si no dispones del dato en este momento, déjalo en blanco y haz clic directamente en "Continuar".'
			],
			imagen: inscripcion10
		},
		{
			numero: 11,
			titulo: 'Resumen y confirmación final',
			texto: 'Revisión general de las actividades y obligaciones asignadas.',
			acciones: [
				'Confirma que aparezcan de alta el Régimen 612 (Actividades Empresariales) y el Régimen 625 (Plataformas Tecnológicas).',
				'Haz clic en el botón azul "Guardar datos del cuestionario" para generar y descargar tu acuse definitivo en PDF.'
			],
			imagen: inscripcion11
		}
	];

	let indice = $state(0);

	let paso = $derived(pasos[indice]);
	let esPrimero = $derived(indice === 0);
	let esUltimo = $derived(indice === pasos.length - 1);

	function anterior() {
		if (!esPrimero) indice -= 1;
	}

	function siguiente() {
		if (!esUltimo) indice += 1;
	}

	function irAPaso(i) {
		indice = i;
	}

	function manejarErrorImagen(evento) {
		evento.target.style.display = 'none';
		evento.target.nextElementSibling.style.display = 'flex';
	}
</script>

<div class="tutorial">
	<p class="contador">Paso {paso.numero} de {pasos.length}</p>

	<div class="puntos">
		{#each pasos as p, i (p.numero)}
			<button
				class="punto"
				class:activo={i === indice}
				onclick={() => irAPaso(i)}
				aria-label={`Ir al paso ${p.numero}`}
			></button>
		{/each}
	</div>

	<h2>{paso.titulo}</h2>
	<p class="texto-pantalla">{paso.texto}</p>

	<div class="imagen-wrapper">
		<img
			src={paso.imagen}
			alt={`Captura de pantalla del SAT — ${paso.titulo}`}
			onerror={manejarErrorImagen}
		/>
		<div class="imagen-placeholder">📸 Captura de pantalla del paso {paso.numero}</div>
	</div>

	{#if paso.nota}
		<p class="nota">⚠️ {paso.nota}</p>
	{/if}

	<ul class="acciones">
		{#each paso.acciones as accion (accion)}
			<li>{accion}</li>
		{/each}
	</ul>

	<div class="navegacion">
		<button onclick={anterior} disabled={esPrimero}>← Anterior</button>
		<button onclick={siguiente} disabled={esUltimo}>Siguiente →</button>
	</div>
</div>

<style>
	.tutorial {
		max-width: 560px;
		margin: 0 auto;
		padding: 1.5rem;
		font-family: system-ui, sans-serif;
	}

	.contador {
		margin: 0 0 0.5rem;
		font-size: 0.85rem;
		color: #666;
	}

	.puntos {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 1.25rem;
	}

	.punto {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: none;
		background: #ddd;
		cursor: pointer;
		padding: 0;
	}

	.punto.activo {
		background: #333;
	}

	h2 {
		margin: 0 0 0.5rem;
		font-size: 1.15rem;
	}

	.texto-pantalla {
		margin: 0 0 1rem;
		color: #444;
	}

	.imagen-wrapper {
		margin-bottom: 1rem;
	}

	.imagen-wrapper img {
		width: 100%;
		border: 1px solid #ccc;
		border-radius: 4px;
		display: block;
	}

	.imagen-placeholder {
		display: none;
		width: 100%;
		aspect-ratio: 16 / 9;
		align-items: center;
		justify-content: center;
		border: 1px dashed #ccc;
		border-radius: 4px;
		color: #888;
		text-align: center;
		padding: 1rem;
	}

	.nota {
		background: #fff8e1;
		border-left: 3px solid #f5b942;
		padding: 0.6rem 0.8rem;
		margin: 0 0 1rem;
		font-size: 0.9rem;
	}

	.acciones {
		margin: 0 0 1.5rem;
		padding-left: 1.2rem;
	}

	.acciones li {
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.navegacion {
		display: flex;
		justify-content: space-between;
	}

	.navegacion button {
		padding: 0.5rem 1rem;
		border: 1px solid #333;
		border-radius: 4px;
		background: white;
		cursor: pointer;
	}

	.navegacion button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
