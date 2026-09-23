export const TABLA_RESICO_MENSUAL = Object.freeze([
	{ limiteSuperiorCents: 2500000, tasa: 0.01, porcentajeTexto: '1.00%' }, // Hasta $25,000 MXN
	{ limiteSuperiorCents: 5000000, tasa: 0.011, porcentajeTexto: '1.10%' }, // Hasta $50,000 MXN
	{ limiteSuperiorCents: 8333333, tasa: 0.015, porcentajeTexto: '1.50%' }, // Hasta $83,333.33 MXN
	{ limiteSuperiorCents: 20833333, tasa: 0.02, porcentajeTexto: '2.00%' }, // Hasta $208,333.33 MXN
	{ limiteSuperiorCents: 29166667, tasa: 0.025, porcentajeTexto: '2.50%' }, // Hasta $291,666.67 MXN (~$3.5M anual)
	{ limiteSuperiorCents: Infinity, tasa: 0.025, porcentajeTexto: '2.50%' }
]);

export function obtenerTasaResicoMensual(ingresosCents) {
	const ingresos = Math.max(Number(ingresosCents ?? 0), 0);
	for (const rango of TABLA_RESICO_MENSUAL) {
		if (ingresos <= rango.limiteSuperiorCents) {
			return rango;
		}
	}
	return TABLA_RESICO_MENSUAL[TABLA_RESICO_MENSUAL.length - 1];
}

export function buildLedgerEntries({ ventas = [], facturas = [], movimientos = [] } = {}) {
	const entries = [];

	for (const venta of ventas) {
		entries.push({
			tipo: 'Venta',
			monto: Number(venta.monto ?? 0),
			iva: Number(venta.iva ?? 0),
			fecha: venta.fecha ?? new Date(),
			descripcion: `Venta ${venta.metodoPago ?? 'directa'}`,
			source: 'venta'
		});
	}

	for (const factura of facturas) {
		entries.push({
			tipo: 'Gasto',
			monto: -Math.abs(Number(factura.total ?? 0)),
			iva: -Math.abs(Number(factura.iva ?? 0)),
			fecha: factura.fecha ?? new Date(),
			descripcion: factura.conceptos?.[0] ?? factura.nombreEmisor ?? 'Gasto de operación',
			source: 'gasto'
		});
	}

	for (const movimiento of movimientos) {
		const tipo = String(movimiento.tipo ?? '').toLowerCase();
		if (tipo === 'devolucion' || tipo === 'cancelacion') {
			entries.push({
				tipo: tipo === 'devolucion' ? 'Devolución' : 'Cancelación',
				monto: -Math.abs(Number(movimiento.monto ?? 0)),
				iva: -Math.abs(Number(movimiento.iva ?? 0)),
				fecha: movimiento.createdAt ?? movimiento.fecha ?? new Date(),
				descripcion: tipo === 'devolucion' ? 'Devolución' : 'Cancelación',
				source: 'movimiento'
			});
		}
	}

	return entries.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

export function buildMonthlyFiscalSummary({ ventas = [], facturas = [], movimientos = [] } = {}) {
	const ventasTotal = ventas.reduce((sum, venta) => sum + Number(venta.monto ?? 0), 0);
	const gastosTotal = facturas.reduce((sum, factura) => sum + Number(factura.total ?? 0), 0);

	const ivaTrasladado = ventas.reduce((sum, venta) => sum + Number(venta.iva ?? 0), 0);
	const ivaAcreditable = 0;
	const devolucionesTotal = movimientos
		.filter((m) => String(m.tipo).toLowerCase() === 'devolucion')
		.reduce((sum, m) => sum + Number(m.monto ?? 0), 0);
	const cancelacionesTotal = movimientos
		.filter((m) => String(m.tipo).toLowerCase() === 'cancelacion')
		.reduce((sum, m) => sum + Number(m.monto ?? 0), 0);

	const deduccionesMovimientos = devolucionesTotal + cancelacionesTotal;
	const ventasNetas = Math.max(ventasTotal - deduccionesMovimientos, 0);

	// IVA
	const ivaEstimado = Math.max(ivaTrasladado - ivaAcreditable, 0);
	const ivaAFavor = Math.max(ivaAcreditable - ivaTrasladado, 0);

	// ISR RESICO: se calcula sobre ingresos cobrados (sin IVA) a tasa progresiva
	const rangoResico = obtenerTasaResicoMensual(ventasNetas);
	const isrEstimado = Math.round(ventasNetas * rangoResico.tasa);

	// Utilidad operativa interna del restaurante
	const utilidad = ventasNetas - gastosTotal;

	return {
		ventas: {
			total: ventasTotal,
			registros: ventas.length,
			netas: ventasNetas,
			devoluciones: devolucionesTotal,
			cancelaciones: cancelacionesTotal
		},
		gastos: {
			total: gastosTotal,
			registros: facturas.length
		},
		iva: {
			trasladado: ivaTrasladado,
			acreditable: ivaAcreditable,
			estimado: ivaEstimado,
			aFavor: ivaAFavor
		},
		utilidad,
		sat: {
			ingresosEfectivamenteCobrados: ventasNetas,
			ingresosBrutos: ventasTotal,
			ingresosDisminuciones: deduccionesMovimientos,
			tasaIsr: rangoResico.tasa,
			tasaIsrPorcentaje: rangoResico.porcentajeTexto,
			isrEstimado,
			ivaTrasladado,
			ivaAcreditable,
			ivaEstimado,
			ivaAFavor,
			totalEstimadoPagar: isrEstimado + ivaEstimado,
			montoParaDeclarar: ventasNetas
		},
		movimientos: buildLedgerEntries({ ventas, facturas, movimientos })
	};
}
