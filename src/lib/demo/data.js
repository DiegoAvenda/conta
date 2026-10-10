// Datos de demostración para modo demo (sin autenticación)
export const demoMenuItems = [
	{ _id: 'demo1', name: 'Tacos al Pastor', category: 'Tacos', price: 4500, description: 'Con piña, cebolla y cilantro', imageUrl: null },
	{ _id: 'demo2', name: 'Burrito California', category: 'Burritos', price: 7200, description: 'Pollo, arroz, frijoles y salsa', imageUrl: null },
	{ _id: 'demo3', name: 'Quesadilla de Carne Asada', category: 'Quesadillas', price: 9500, description: 'Con guacamole y crema', imageUrl: null },
	{ _id: 'demo4', name: 'Coca-Cola 600ml', category: 'Bebidas', price: 1800, description: '-', imageUrl: null },
	{ _id: 'demo5', name: 'Agua de Jamaica', category: 'Bebidas', price: 1500, description: '-', imageUrl: null },
	{ _id: 'demo6', name: 'Enchiladas Verdes', category: 'Platos', price: 8500, description: 'Pollo deshebrado con salsa verde', imageUrl: null }
];

export const demoOrders = [
	{
		_id: 'ord1',
		customerName: 'María G.',
		tableNumber: 3,
		channel: 'restaurant',
		orderType: 'dine-in',
		status: 'preparing',
		paymentStatus: 'paid',
		items: [{ name: 'Tacos al Pastor', quantity: 2, price: 4500 }],
		subtotal: 9000,
		discount: 0,
		taxRate: 16,
		iva: 1440,
		totalPrice: 10440,
		createdAt: '10:30 AM',
		preparingAt: '10:35 AM',
		readyAt: null,
		completedAt: null
	},
	{
		_id: 'ord2',
		customerName: 'Carlos R.',
		tableNumber: null,
		channel: 'delivery',
		orderType: 'takeout',
		status: 'ready',
		paymentStatus: 'unpaid',
		items: [{ name: 'Burrito California', quantity: 1, price: 7200 }, { name: 'Coca-Cola 600ml', quantity: 1, price: 1800 }],
		subtotal: 9000,
		discount: 0,
		taxRate: 16,
		iva: 1440,
		totalPrice: 10440,
		createdAt: '11:15 AM',
		preparingAt: '11:20 AM',
		readyAt: '11:45 AM',
		completedAt: null
	},
	{
		_id: 'ord3',
		customerName: 'Lucía M.',
		tableNumber: 7,
		channel: 'restaurant',
		orderType: 'dine-in',
		status: 'pending',
		paymentStatus: 'unpaid',
		items: [{ name: 'Quesadilla de Carne Asada', quantity: 1, price: 9500 }],
		subtotal: 9500,
		discount: 0,
		taxRate: 16,
		iva: 1520,
		totalPrice: 11020,
		createdAt: '12:00 PM',
		preparingAt: null,
		readyAt: null,
		completedAt: null
	}
];

export const demoDashboard = {
	resumen: {
		ventas: { total: 324500, registros: 42 },
		gastos: { total: 128900, registros: 18 },
		utilidad: 195600,
		iva: { estimado: 51840, trasladado: 51840, acreditable: 20640 },
		metodosPago: [
			{ metodoPago: 'Efectivo', total: 124800 },
			{ metodoPago: 'Tarjeta', total: 199700 }
		]
	},
	movimientos: [
		{ fecha: '2026-10-09', descripcion: 'Venta mesa 3', tipo: 'Venta', monto: 10440 },
		{ fecha: '2026-10-09', descripcion: 'Compra insumos', tipo: 'Gasto', monto: -8450 },
		{ fecha: '2026-10-08', descripcion: 'Venta delivery', tipo: 'Venta', monto: 10440 },
		{ fecha: '2026-10-07', descripcion: 'Venta mesa 7', tipo: 'Venta', monto: 11020 },
		{ fecha: '2026-10-07', descripcion: 'Compra bebidas', tipo: 'Gasto', monto: -3200 },
		{ fecha: '2026-10-06', descripcion: 'Venta mesa 2', tipo: 'Venta', monto: 9800 }
	]
};

export const demoEgresos = {
	facturas: [
		{ _id: 'f1', fecha: '2026-10-05', concepto: 'Verdulería y mercado', categoria: 'Verdulería / Mercado', total: 8450, proveedor: 'Mercado Central' },
		{ _id: 'f2', fecha: '2026-10-03', concepto: 'Insumos generales', categoria: 'Insumos generales', total: 3200, proveedor: 'Super Max' },
		{ _id: 'f3', fecha: '2026-10-01', concepto: 'Renta local', categoria: 'Renta', total: 15000, proveedor: 'Propietario' },
		{ _id: 'f4', fecha: '2026-09-28', concepto: 'Servicios (gas, luz)', categoria: 'Servicios (Gas, Luz, Agua)', total: 4200, proveedor: 'CFE / Gas del Norte' }
	],
	resumen: { total: 30850, cantidad: 4 }
};

export const demoSatMonthly = {
	anio: 2026,
	mes: 10,
	summary: {
		ventasDirectas: { total: 324500, registros: 42, ivaTrasladado: 51840 },
		facturas: { total: 30850, registros: 4, ivaAcreditable: 20640 },
		movimientos: { total: 128900, registros: 18 },
		utilidadEstimada: 195600,
		ivaEstimado: 51840,
		ivaAcreditable: 20640,
		ivaAPagar: 31200
	},
	message: 'Resumen de demostración. Regístrate para ver tus datos reales.'
};

export const demoSteps = [
	{ label: 'Inicio', path: '/' },
	{ label: 'Punto de Venta (POS)', path: '/pos' },
	{ label: 'Comandas / Órdenes', path: '/orders' },
	{ label: 'Dashboard', path: '/dashboard' },
	{ label: 'Gastos', path: '/egresos' },
	{ label: 'Cierre SAT', path: '/sat-monthly' },
	{ label: 'Menú', path: '/configure-menu' },
	{ label: 'Mi Tienda', path: '/mi-restaurante' }
];
