import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';

const VERSION_REGLAS = 1;

function calcularRegimen(canal, montoLocal, montoApps) {
	if (canal === 'local') {
		if (montoLocal === 'alto') {
			return {
				codigo: 'fuera_de_resico',
				regimenesSat: [],
				requiereContador: true
			};
		}
		return {
			codigo: 'resico',
			regimenesSat: [621],
			requiereContador: false
		};
	}

	if (canal === 'apps') {
		if (montoApps === 'bajo') {
			return {
				codigo: 'plataformas_pago_definitivo',
				regimenesSat: [625],
				requiereContador: false
			};
		}
		return {
			codigo: 'plataformas_pago_provisional',
			regimenesSat: [625],
			requiereContador: false
		};
	}

	return {
		codigo: 'hibrido',
		regimenesSat: [612, 625],
		requiereContador: false
	};
}

function calcularMonetizacion(codigoRegimen) {
	return codigoRegimen === 'plataformas_pago_definitivo' ? 'gratis_anuncios' : 'suscripcion';
}

export const actions = {
	guardarPerfil: async ({ request, locals }) => {
		const usuario = locals.user;

		if (!usuario) {
			return fail(401, { mensaje: 'Necesitas iniciar sesión para guardar tu perfil.' });
		}

		const datos = await request.formData();
		const canal = datos.get('canal');
		const montoLocal = datos.get('montoLocal') || null;
		const montoApps = datos.get('montoApps') || null;

		if (!['apps', 'local', 'ambos'].includes(canal)) {
			return fail(400, { mensaje: 'Respuestas del cuestionario incompletas.' });
		}

		const regimenFiscal = calcularRegimen(canal, montoLocal, montoApps);
		const monetizacion = calcularMonetizacion(regimenFiscal.codigo);

		const db = await getDb();
		const ahora = new Date();

		await db.collection('businessProfile').updateOne(
			{ userId: usuario.id },
			{
				$set: {
					userId: usuario.id,
					onboarding: {
						canalVenta: canal,
						facturacionLocalAnual: montoLocal,
						facturacionAppsAnual: montoApps,
						completadoEn: ahora,
						versionReglas: VERSION_REGLAS
					},
					regimenFiscal,
					monetizacion,
					updatedAt: ahora
				},
				$setOnInsert: { createdAt: ahora }
			},
			{ upsert: true }
		);

		return { exito: true };
	}
};
