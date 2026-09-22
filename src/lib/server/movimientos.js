export const MOVIMIENTO_TIPOS = Object.freeze({
	COBRO: 'cobro',
	DEVOLUCION: 'devolucion',
	CANCELACION: 'cancelacion'
});

const SIGNOS = Object.freeze({
	[MOVIMIENTO_TIPOS.COBRO]: 1,
	[MOVIMIENTO_TIPOS.DEVOLUCION]: -1,
	[MOVIMIENTO_TIPOS.CANCELACION]: -1
});

export function crearMovimientoBase({
	userId,
	orderId = null,
	tipo,
	amount = 0,
	iva = 0,
	paymentMethod = 'cash',
	metadata = {},
	source = 'order'
} = {}) {
	const tipoNormalizado = String(tipo ?? '')
		.trim()
		.toLowerCase();
	if (!Object.values(MOVIMIENTO_TIPOS).includes(tipoNormalizado)) {
		throw new Error(`Tipo de movimiento inválido: ${tipo}`);
	}

	const monto = Math.abs(Number(amount ?? 0));
	const ivaMonto = Math.abs(Number(iva ?? 0));

	return {
		userId,
		orderId,
		tipo: tipoNormalizado,
		signo: SIGNOS[tipoNormalizado] ?? 1,
		monto,
		iva: ivaMonto,
		paymentMethod,
		metadata,
		source,
		createdAt: new Date(),
		isImmutable: true
	};
}

export function crearMovimientoKey({ userId, orderId = null, tipo }) {
	return `${userId}:${orderId ?? 'manual'}:${tipo}`;
}

export async function registrarMovimiento({
	userId,
	orderId = null,
	tipo,
	amount = 0,
	iva = 0,
	paymentMethod = 'cash',
	metadata = {},
	source = 'order'
} = {}) {
	const { getDb } = await import('./db.js');
	const db = await getDb();
	const movimiento = crearMovimientoBase({
		userId,
		orderId,
		tipo,
		amount,
		iva,
		paymentMethod,
		metadata,
		source
	});

	const idempotencyKey = crearMovimientoKey({
		userId,
		orderId,
		tipo: movimiento.tipo
	});

	const existente = await db.collection('movimientos').findOne({
		userId,
		orderId,
		tipo: movimiento.tipo,
		idempotencyKey
	});

	if (existente) {
		return existente._id;
	}

	const resultado = await db.collection('movimientos').insertOne({
		...movimiento,
		idempotencyKey
	});

	return resultado.insertedId;
}
