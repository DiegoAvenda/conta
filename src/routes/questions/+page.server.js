import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

const VERSION_REGLAS = 2;

function calcularRegimenDirecto(montoAnual) {
	if (montoAnual === 'alto') {
		return {
			codigo: 'actividad_empresarial',
			regimenesSat: [612],
			requiereContador: true,
			esPreliminar: true
		};
	}

	return {
		codigo: 'resico',
		regimenesSat: [626],
		requiereContador: false,
		esPreliminar: true
	};
}

export const actions = {
	guardarPerfil: async ({ request, locals }) => {
		const usuario = locals.user;

		if (!usuario) {
			return fail(401, { mensaje: 'Necesitas iniciar sesión para guardar tu perfil.' });
		}

		const datos = await request.formData();
		const montoAnual = datos.get('montoAnual');

		if (!['bajo', 'alto'].includes(montoAnual)) {
			return fail(400, { mensaje: 'Indica una estimación de facturación anual.' });
		}

		const regimenFiscal = calcularRegimenDirecto(montoAnual);
		const db = await getDb();
		const ahora = new Date();

		await db.collection('businessProfile').updateOne(
			{ userId: usuario.id },
			{
				$set: {
					userId: usuario.id,
					onboarding: {
						ventaDirecta: true,
						facturacionDirectaAnual: montoAnual,
						completadoEn: ahora,
						versionReglas: VERSION_REGLAS
					},
					regimenFiscal,
					monetizacion: 'suscripcion',
					updatedAt: ahora
				},
				$setOnInsert: { createdAt: ahora }
			},
			{ upsert: true }
		);

		return { exito: true };
	}
};
