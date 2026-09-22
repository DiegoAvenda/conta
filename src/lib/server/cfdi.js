import { XMLParser } from 'fast-xml-parser';
import { pesosToCents } from './money.js';

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '',
	removeNSPrefix: true // el CFDI usa prefijos de namespace (cfdi:, tfd:) que aquí no aportan nada, se quitan
});

export function parsearCfdi(xmlTexto) {
	const doc = parser.parse(xmlTexto);
	const comprobante = doc.Comprobante;

	if (!comprobante) {
		throw new Error('El archivo no parece ser un CFDI válido');
	}

	const emisor = comprobante.Emisor;
	const receptor = comprobante.Receptor;

	// Traslados es un objeto si hay una sola tasa de IVA, o un array si hay varias (ej. tasa 0% y 16% mezcladas)
	const traslados = comprobante.Impuestos?.Traslados?.Traslado;
	const ivaTotal = Array.isArray(traslados)
		? traslados.reduce((suma, t) => suma + Number(t.Importe || 0), 0)
		: Number(traslados?.Importe || 0);

	// El folio fiscal (UUID) no vive en el nodo raíz, vive dentro del complemento de timbrado
	const uuid = comprobante.Complemento?.TimbreFiscalDigital?.UUID;

	if (!uuid) {
		throw new Error('El XML no tiene timbre fiscal (UUID) — no es un CFDI timbrado');
	}

	return {
		uuid,
		fecha: comprobante.Fecha,
		subtotal: pesosToCents(comprobante.SubTotal),
		total: pesosToCents(comprobante.Total),
		iva: pesosToCents(ivaTotal),
		rfcEmisor: emisor.Rfc,
		nombreEmisor: emisor.Nombre,
		rfcReceptor: receptor.Rfc,
		conceptos: normalizarConceptos(comprobante.Conceptos?.Concepto)
	};
}

function normalizarConceptos(conceptos) {
	// Un CFDI puede traer un solo concepto (objeto) o varios (array) — se normaliza siempre a array
	if (!conceptos) return [];
	const lista = Array.isArray(conceptos) ? conceptos : [conceptos];
	return lista.map((c) => c.Descripcion);
}
