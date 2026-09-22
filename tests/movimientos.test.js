import test from 'node:test';
import assert from 'node:assert/strict';

import {
	MOVIMIENTO_TIPOS,
	crearMovimientoBase,
	crearMovimientoKey
} from '../src/lib/server/movimientos.js';

test('crea movimientos con el signo y clave correctos para cada evento financiero', () => {
	const cobro = crearMovimientoBase({
		userId: 'user-1',
		orderId: 'order-1',
		tipo: MOVIMIENTO_TIPOS.COBRO,
		amount: 1500,
		iva: 240,
		paymentMethod: 'card'
	});

	const devolucion = crearMovimientoBase({
		userId: 'user-1',
		orderId: 'order-1',
		tipo: MOVIMIENTO_TIPOS.DEVOLUCION,
		amount: 1500,
		iva: 240,
		paymentMethod: 'card'
	});

	assert.equal(cobro.tipo, MOVIMIENTO_TIPOS.COBRO);
	assert.equal(cobro.signo, 1);
	assert.equal(cobro.monto, 1500);
	assert.equal(cobro.iva, 240);
	assert.equal(cobro.paymentMethod, 'card');

	assert.equal(devolucion.tipo, MOVIMIENTO_TIPOS.DEVOLUCION);
	assert.equal(devolucion.signo, -1);
	assert.equal(devolucion.monto, 1500);
	assert.equal(
		crearMovimientoKey({ userId: 'user-1', orderId: 'order-1', tipo: MOVIMIENTO_TIPOS.COBRO }),
		'user-1:order-1:cobro'
	);
});
