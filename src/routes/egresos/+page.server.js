import { crearGastoManual, listarFacturas, eliminarFactura } from '$lib/server/facturas.js';
import { fail } from '@sveltejs/kit';
import { demoEgresos } from '$lib/demo/data.js';

export async function load({ locals }) {
	if (!locals.user) {
		return { facturas: demoEgresos.facturas, resumen: demoEgresos.resumen };
	}

	const userId = locals.user.id;
	const facturas = await listarFacturas(userId);
	const totalGastos = facturas.reduce((sum, f) => sum + Number(f.total ?? 0), 0);

	return {
		facturas,
		resumen: {
			total: totalGastos,
			cantidad: facturas.length
		}
	};
}

export const actions = {
	crearManual: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Inicia sesión para registrar gastos reales.' });
		}

		const userId = locals.user.id;
		const datos = await request.formData();

		const concepto = datos.get('concepto')?.toString().trim();
		const total = datos.get('total');
		const categoria = datos.get('categoria')?.toString().trim() || 'Insumos';
		const proveedor = datos.get('proveedor')?.toString().trim() || 'Compra local';
		const metodoPago = datos.get('metodoPago')?.toString().trim() || 'cash';
		const fecha = datos.get('fecha')?.toString().trim();

		if (!concepto) {
			return fail(400, { error: 'El concepto del gasto es obligatorio.' });
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

	eliminar: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'No autorizado.' });
		}

		const userId = locals.user.id;
		const datos = await request.formData();
		await eliminarFactura(userId, datos.get('id'));
		return { success: true };
	}
};
