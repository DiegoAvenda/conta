import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMonthlyFiscalSummary, buildLedgerEntries } from '../src/lib/server/fiscal.js';

test('buildMonthlyFiscalSummary calcula ventas, gastos y IVA estimado para SAT', () => {
	const summary = buildMonthlyFiscalSummary({
		ventas: [
			{ monto: 1000, iva: 160 },
			{ monto: 2000, iva: 320 },
			{ monto: 500, iva: 80 },
			{ monto: 300, iva: 48 }
		],
		facturas: [
			{ total: 800, iva: 128 },
			{ total: 200, iva: 32 }
		],
		movimientos: [
			{ tipo: 'devolucion', monto: 150, createdAt: new Date('2026-09-10T10:00:00Z') },
			{ tipo: 'cancelacion', monto: 100, createdAt: new Date('2026-09-12T10:00:00Z') }
		]
	});

	assert.equal(summary.ventas.total, 3800);
	assert.equal(summary.gastos.total, 1000);
	assert.equal(summary.iva.trasladado, 608);
	assert.equal(summary.iva.acreditable, 160);
	assert.equal(summary.iva.estimado, 448);
	assert.equal(summary.utilidad, 2550);
	assert.equal(summary.sat.ventasNetas, 3550);
	assert.equal(summary.sat.ivaEstimado, 448);
	assert.equal(summary.sat.montoParaDeclarar, 2550);
});

test('buildLedgerEntries incluye ventas, gastos y devoluciones con signo correcto', () => {
	const entries = buildLedgerEntries({
		ventas: [
			{ monto: 2000, iva: 320, metodoPago: 'cash', fecha: new Date('2026-09-05T10:00:00Z') }
		],
		facturas: [
			{ total: 500, iva: 80, nombreEmisor: 'Proveedor', fecha: new Date('2026-09-08T10:00:00Z') }
		],
		movimientos: [{ tipo: 'devolucion', monto: 250, createdAt: new Date('2026-09-10T10:00:00Z') }]
	});

	assert.equal(entries.length, 3);
	assert.equal(entries[0].tipo, 'Devolución');
	assert.equal(entries[0].monto, -250);
	assert.equal(entries[1].tipo, 'Gasto');
	assert.equal(entries[1].monto, -500);
	assert.equal(entries[2].tipo, 'Venta');
	assert.equal(entries[2].monto, 2000);
});
