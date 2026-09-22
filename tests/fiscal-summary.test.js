import test from 'node:test';
import assert from 'node:assert/strict';

import {
	buildMonthlyFiscalSummary,
	buildLedgerEntries,
	obtenerTasaResicoMensual
} from '../src/lib/server/fiscal.js';

test('obtenerTasaResicoMensual devuelve la tasa progresiva correcta según Art. 113-E LISR', () => {
	// Hasta $25,000 MXN -> 1.00%
	assert.equal(obtenerTasaResicoMensual(1000000).tasa, 0.01);
	assert.equal(obtenerTasaResicoMensual(2500000).tasa, 0.01);

	// Hasta $50,000 MXN -> 1.10%
	assert.equal(obtenerTasaResicoMensual(2500001).tasa, 0.011);
	assert.equal(obtenerTasaResicoMensual(5000000).tasa, 0.011);

	// Hasta $83,333.33 MXN -> 1.50%
	assert.equal(obtenerTasaResicoMensual(5000001).tasa, 0.015);
	assert.equal(obtenerTasaResicoMensual(8333333).tasa, 0.015);

	// Hasta $208,333.33 MXN -> 2.00%
	assert.equal(obtenerTasaResicoMensual(8333334).tasa, 0.02);
	assert.equal(obtenerTasaResicoMensual(20833333).tasa, 0.02);

	// Más de $208,333.33 MXN -> 2.50%
	assert.equal(obtenerTasaResicoMensual(20833334).tasa, 0.025);
	assert.equal(obtenerTasaResicoMensual(29166667).tasa, 0.025);
});

test('buildMonthlyFiscalSummary calcula ventas, gastos, IVA e ISR RESICO para SAT', () => {
	// Valores en centavos (ej. 100,000 cents = $1,000.00 MXN)
	const summary = buildMonthlyFiscalSummary({
		ventas: [
			{ monto: 100000, iva: 16000 },
			{ monto: 200000, iva: 32000 },
			{ monto: 50000, iva: 8000 },
			{ monto: 30000, iva: 4800 }
		],
		facturas: [
			{ total: 80000, iva: 12800 },
			{ total: 20000, iva: 3200 }
		],
		movimientos: [
			{ tipo: 'devolucion', monto: 15000, createdAt: new Date('2026-09-10T10:00:00Z') },
			{ tipo: 'cancelacion', monto: 10000, createdAt: new Date('2026-09-12T10:00:00Z') }
		]
	});

	assert.equal(summary.ventas.total, 380000);
	assert.equal(summary.gastos.total, 100000);
	assert.equal(summary.iva.trasladado, 60800);
	assert.equal(summary.iva.acreditable, 16000);
	assert.equal(summary.iva.estimado, 44800);
	assert.equal(summary.utilidad, 255000);
	assert.equal(summary.sat.ingresosEfectivamenteCobrados, 355000);
	assert.equal(summary.sat.tasaIsr, 0.01); // $3,550 MXN está en el primer rango (<= $25,000 MXN -> 1%)
	assert.equal(summary.sat.isrEstimado, 3550); // 1% de $3,550 MXN = $35.50 (3550 cents)
	assert.equal(summary.sat.ivaEstimado, 44800);
	assert.equal(summary.sat.totalEstimadoPagar, 3550 + 44800);
	assert.equal(summary.sat.montoParaDeclarar, 355000);
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

test('buildMonthlyFiscalSummary separa gastos con CFDI y gastos manuales sin CFDI para IVA y utilidad', () => {
	const summary = buildMonthlyFiscalSummary({
		ventas: [
			{ monto: 500000, iva: 80000 } // $5,000 MXN en ventas (800 IVA)
		],
		facturas: [
			// Gasto con factura CFDI: deduce IVA ante el SAT
			{ total: 100000, iva: 16000, tieneCfdi: true, tipo: 'gasto' },
			// Gasto en efectivo del mercado sin factura: costo real, 0 IVA acreditable
			{ total: 50000, iva: 0, tieneCfdi: false, tipo: 'gasto_manual' }
		]
	});

	// Gastos totales reflejan el costo real del restaurante ($1,000 + $500 = $1,500)
	assert.equal(summary.gastos.total, 150000);
	assert.equal(summary.gastos.conFactura, 100000);
	assert.equal(summary.gastos.sinFactura, 50000);

	// IVA acreditable ante el SAT solo incluye la factura con CFDI ($160.00 MXN)
	assert.equal(summary.iva.acreditable, 16000);
	// IVA a pagar = $800 - $160 = $640 (64000 cents)
	assert.equal(summary.iva.estimado, 64000);

	// Utilidad operativa real = $5,000 - $1,500 = $3,500 (350000 cents)
	assert.equal(summary.utilidad, 350000);
});
