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
			descripcion: factura.nombreEmisor ?? 'Factura de gasto',
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
	const ivaAcreditable = facturas.reduce((sum, factura) => sum + Number(factura.iva ?? 0), 0);
	const devolucionesTotal = movimientos
		.filter((m) => String(m.tipo).toLowerCase() === 'devolucion')
		.reduce((sum, m) => sum + Number(m.monto ?? 0), 0);
	const cancelacionesTotal = movimientos
		.filter((m) => String(m.tipo).toLowerCase() === 'cancelacion')
		.reduce((sum, m) => sum + Number(m.monto ?? 0), 0);

	const ventasNetas = Math.max(ventasTotal - devolucionesTotal - cancelacionesTotal, 0);
	const ivaEstimado = Math.max(ivaTrasladado - ivaAcreditable, 0);
	const utilidad = ventasNetas - gastosTotal;

	return {
		ventas: {
			total: ventasTotal,
			registros: ventas.length,
			netas: ventasNetas
		},
		gastos: {
			total: gastosTotal,
			registros: facturas.length
		},
		iva: {
			trasladado: ivaTrasladado,
			acreditable: ivaAcreditable,
			estimado: ivaEstimado
		},
		utilidad,
		sat: {
			ventasNetas,
			ivaEstimado: ivaEstimado,
			montoParaDeclarar: utilidad
		},
		movimientos: buildLedgerEntries({ ventas, facturas, movimientos })
	};
}
