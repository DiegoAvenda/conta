export function parseMoneyToCents(value, { field = 'monto', min = 0, max = null } = {}) {
	if (value === null || value === undefined || value === '') {
		throw new Error(`${field} es obligatorio.`);
	}

	const raw = String(value).trim().replace(/\s+/g, '').replace(',', '.');
	if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
		throw new Error(`${field} debe ser un número válido.`);
	}

	const [whole, fraction = ''] = raw.split('.');
	const fractionCents = (fraction + '00').slice(0, 2);
	const cents = Number(whole || '0') * 100 + Number(fractionCents);

	if (!Number.isFinite(cents) || cents < min * 100) {
		throw new Error(`${field} debe ser mayor o igual a ${min}.`);
	}

	if (max !== null && cents > max * 100) {
		throw new Error(`${field} debe ser menor o igual a ${max}.`);
	}

	return cents;
}

export function centsToNumber(cents) {
	return Number(cents) / 100;
}
