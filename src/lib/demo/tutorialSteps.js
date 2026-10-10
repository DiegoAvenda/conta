// Pasos del tutorial por ruta: selectores verificados contra el DOM real.
// Cada paso: selector CSS (debe existir), título y descripción.
export const tutorialSteps = {
	'/': [
		{ selector: 'header h1', title: 'Hero de la app', desc: 'Contaco conecta tu POS, pedidos y SAT en un solo lugar.' },
		{ selector: 'section dl', title: 'Features', desc: 'POS rápido, pedidos directos, módulo SAT y panel financiero.' },
		{ selector: 'header .btn-primary', title: 'Entrar al demo', desc: 'Puedes entrar al demo sin registrarte. Siguiente te lleva al POS.' }
	],
	'/pos': [
		{ selector: 'h1', title: 'Punto de Venta', desc: 'Registra ventas, mesas y comandas desde una interfaz rápida.' },
		{ selector: '.card', title: 'Menú', desc: 'Agrega productos al carrito. En demo hay platillos de ejemplo.' },
		{ selector: 'aside', title: 'Comanda', desc: 'Revisa el subtotal, IVA y total antes de cobrar.' }
	],
	'/orders': [
		{ selector: 'h1', title: 'Comandas', desc: 'Filtra por estado: pendiente, preparando, listo, completado.' },
		{ selector: '.card', title: 'Órdenes', desc: 'Cada orden muestra cliente, mesa, productos y totales.' },
		{ selector: '.card-actions', title: 'Acciones', desc: 'Marca como preparando, listo o completado.' }
	],
	'/dashboard': [
		{ selector: 'h1', title: 'Tu negocio', desc: 'Así va tu negocio: ventas y gastos antes de lo fiscal.' },
		{ selector: 'section', title: 'IVA y ganancia', desc: 'Verás IVA estimado, utilidad, ventas y gastos del mes.' },
		{ selector: 'table, .grid', title: 'Movimientos', desc: 'Ventas y gastos registrados recientemente.' }
	],
	'/egresos': [
		{ selector: 'h1', title: 'Gastos', desc: 'Registra compras de insumos, renta y servicios.' },
		{ selector: 'section, .rounded-2xl', title: 'Métricas', desc: 'Total gastado y cantidad de compras registradas.' },
		{ selector: 'table', title: 'Historial', desc: 'Cada gasto muestra fecha, concepto, categoría y monto.' }
	],
	'/sat-monthly': [
		{ selector: 'h1', title: 'Cierre SAT', desc: 'Estima tu IVA trasladado, acreditable y monto a pagar.' },
		{ selector: 'h2', title: 'Montos', desc: 'Totales listos para copiar al portal del SAT.' },
		{ selector: 'section', title: 'Detalle', desc: 'Desglose de ventas, gastos y movimientos del mes.' }
	],
	'/configure-menu': [
		{ selector: 'h1', title: 'Menú', desc: 'Configura los platillos de tu restaurante.' },
		{ selector: '.card, section', title: 'Productos', desc: 'Con categoría, precio y descripción.' },
		{ selector: 'form', title: 'Agregar', desc: 'En demo puedes ver el formulario de creación.' }
	],
	'/mi-restaurante': [
		{ selector: 'h1', title: 'Mi tienda', desc: 'Configura tu enlace público y descripción.' },
		{ selector: 'form', title: 'Guardar', desc: 'Guarda nombre, descripción, dirección y delivery.' },
		{ selector: 'a.btn-primary', title: 'Ver tienda', desc: 'Abre tu tienda pública cuando guardes tu slug.' }
	]
};

export const tutorialPageOrder = [
	'/',
	'/pos',
	'/orders',
	'/dashboard',
	'/egresos',
	'/sat-monthly',
	'/configure-menu',
	'/mi-restaurante'
];
