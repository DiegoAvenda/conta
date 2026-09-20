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

export const pasos = [
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
