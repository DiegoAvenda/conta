// Formato y cálculos compartidos por la tienda pública del comensal.
// Vive en lib/server NO es posible: los componentes del cliente no pueden
// importar desde $lib/server, así que este módulo es seguro para el navegador.

export function formatCents(cents, locale = 'es-MX') {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'MXN',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(Number(cents ?? 0) / 100);
}

// Precio final CON IVA 16% incluido: es lo que ve y paga el comensal.
// La base guardada en Mongo sigue siendo el precio sin IVA (igual que el POS).
export function precioFinalConIva(cents) {
	return Math.round(Number(cents ?? 0) * 1.16);
}
