import {
	crearFacturaDesdeXml,
	crearGastoManual,
	listarFacturas,
	eliminarFactura
} from '$lib/server/facturas.js';
import { obtenerPerfilNegocio } from '$lib/server/businessProfile.js';
import { fail } from '@sveltejs/kit';

export async function load({ locals }) {
	const userId = locals.user.id;
	const facturas = await listarFacturas(userId);

	const totalGastos = facturas.reduce((sum, f) => sum + Number(f.total ?? 0), 0);
	const totalFacturados = facturas
		.filter((f) => f.tieneCfdi)
		.reduce((sum, f) => sum + Number(f.total ?? 0), 0);
	const totalManuales = facturas
		.filter((f) => !f.tieneCfdi)
		.reduce((sum, f) => sum + Number(f.total ?? 0), 0);

	return {
		facturas,
		resumen: {
			total: totalGastos,
			conFactura: totalFacturados,
			sinFactura: totalManuales,
			cantidad: facturas.length
		}
	};
}

export const actions = {
	crearManual: async ({ request, locals }) => {
		const userId = locals.user.id;
		const datos = await request.formData();

		const concepto = datos.get('concepto')?.toString().trim();
		const total = datos.get('total');
		const categoria = datos.get('categoria')?.toString().trim() || 'Insumos';
		const proveedor = datos.get('proveedor')?.toString().trim() || 'Compra local';
		const metodoPago = datos.get('metodoPago')?.toString().trim() || 'cash';
		const fecha = datos.get('fecha')?.toString().trim();

		if (!concepto) {
			return fail(400, { error: 'El concepto del gasto es obligatorio (ej. Limones y verdura).' });
		}
		if (!total) {
			return fail(400, { error: 'El importe del gasto es obligatorio.' });
		}

		try {
			await crearGastoManual(userId, {
				concepto,
				total,
				categoria,
				proveedor,
				metodoPago,
				fecha
			});
			return { successManual: true };
		} catch (error) {
			return fail(400, { error: error.message || 'No se pudo guardar el gasto.' });
		}
	},

	subir: async ({ request, locals }) => {
		const userId = locals.user.id;
		const perfil = await obtenerPerfilNegocio(userId);

		if (!perfil?.rfc) {
			return fail(400, {
				errores: ['Primero registra el RFC de tu negocio en tu Ficha Fiscal para validar tus CFDI.']
			});
		}

		const rfcNegocio = perfil.rfc;
		const datos = await request.formData();
		const archivos = datos.getAll('xmls');

		const errores = [];
		let subidas = 0;

		for (const archivo of archivos) {
			if (archivo.size === 0) continue;

			try {
				const xmlTexto = await archivo.text();
				await crearFacturaDesdeXml(userId, rfcNegocio, xmlTexto);
				subidas++;
			} catch (err) {
				errores.push(`${archivo.name}: ${err.message}`);
			}
		}

		if (errores.length > 0) {
			return fail(400, { errores, subidas });
		}

		return { successXml: true, subidas };
	},

	eliminar: async ({ request, locals }) => {
		const userId = locals.user.id;
		const datos = await request.formData();
		await eliminarFactura(userId, datos.get('id'));
		return { success: true };
	}
};
