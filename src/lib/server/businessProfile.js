import { getDb } from './db.js';
import { urlPublica } from './r2.js';

// Slugs ya ocupados por rutas del panel o del sistema en contaco.store. Si un
// restaurante pudiera reclamarlos, por ejemplo /pos dejaría de ser el POS del
// dueño y se convertiría en la tienda pública de alguien.
const SLUGS_RESERVADOS = new Set([
	'api',
	'better-auth',
	'cancel',
	'checkout',
	'configure-menu',
	'dashboard',
	'egresos',
	'favicon.ico',
	'inscripcion',
	'login',
	'menu',
	'mi-restaurante',
	'orders',
	'pos',
	'profile',
	'robots.txt',
	'sat-monthly',
	'static',
	'ventas',
	'_app'
]);

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// De "Hamburguesería 1" a "hamburgueseria-1" (sin acentos ni mayúsculas).
export function normalizarSlug(valor) {
	return String(valor ?? '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function validarSlug(slug) {
	if (!slug || slug.length < 3 || slug.length > 40) {
		throw new Error('El enlace debe tener entre 3 y 40 caracteres.');
	}
	if (!SLUG_REGEX.test(slug)) {
		throw new Error('El enlace solo puede contener letras minúsculas, números y guiones.');
	}
	if (SLUGS_RESERVADOS.has(slug)) {
		throw new Error('Ese enlace está reservado por la plataforma. Elige otro.');
	}
	return slug;
}

// Se crea una sola vez por proceso (patrón de la conexión Mongo en db.js).
let indicesPromise = null;
function asegurarIndices() {
	if (!indicesPromise) {
		indicesPromise = (async () => {
			const db = await getDb();
			// Índice parcial: los perfiles sin slug (tienda no publicada) no participan.
			await db
				.collection('businessProfile')
				.createIndex(
					{ slug: 1 },
					{ unique: true, partialFilterExpression: { slug: { $type: 'string' } } }
				);
		})().catch((error) => {
			console.error('No se pudo crear el índice de businessProfile.slug:', error);
		});
	}
	return indicesPromise;
}

export async function obtenerPerfilNegocio(userId) {
	const db = await getDb();
	return await db.collection('businessProfile').findOne({ userId });
}

// Resuelve contaco.store/<slug> → perfil público del restaurante.
export async function obtenerRestaurantePorSlug(slug) {
	if (!slug || !SLUG_REGEX.test(slug)) return null;
	const db = await getDb();
	return await db.collection('businessProfile').findOne({ slug });
}

// Forma pública que viaja al cliente (sin userId ni campos fiscales como el rfc).
export function serializarRestaurante(perfil) {
	return {
		slug: perfil.slug ?? null,
		nombre: perfil.nombre ?? 'Restaurante',
		descripcion: perfil.descripcion ?? '',
		telefono: perfil.telefono ?? null,
		direccion: perfil.direccion ?? null,
		heroImageUrl: urlPublica(perfil.heroImageKey),
		deliveryEnabled: perfil.deliveryEnabled !== false
	};
}

// slug vacío/nulo = tienda despublicada; se elimina el campo para no chocar con
// el índice único.
export async function guardarPerfilRestaurante(userId, campos) {
	const slug = campos.slug ? validarSlug(campos.slug) : null;

	const db = await getDb();
	await asegurarIndices();

	if (slug) {
		const enUso = await db.collection('businessProfile').findOne({ slug, userId: { $ne: userId } });
		if (enUso) {
			throw new Error('Ese enlace ya lo usa otro restaurante. Elige otro.');
		}
	}

	const $set = {
		nombre: campos.nombre,
		descripcion: campos.descripcion ?? '',
		telefono: campos.telefono ?? null,
		direccion: campos.direccion ?? null,
		deliveryEnabled: campos.deliveryEnabled !== false,
		actualizadoEn: new Date()
	};
	if (slug) $set.slug = slug;
	// undefined = no tocar la imagen actual (undefined se ignora en $set de Mongo)
	if (campos.heroImageKey !== undefined) $set.heroImageKey = campos.heroImageKey;

	const update = { $set, $setOnInsert: { userId, creadoEn: new Date() } };
	if (!slug) update.$unset = { slug: '' };

	await db.collection('businessProfile').updateOne({ userId }, update, { upsert: true });

	return slug;
}

export async function guardarRfc(userId, rfc) {
	const rfcLimpio = rfc.trim().toUpperCase();

	// validación laxa: 12 (persona moral) o 13 (persona física) caracteres alfanuméricos.
	// No valida la homoclave real, solo descarta errores de dedo obvios antes de guardar
	if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfcLimpio)) {
		throw new Error('El RFC no tiene un formato válido');
	}

	const db = await getDb();
	await db.collection('businessProfile').updateOne(
		{ userId },
		{ $set: { rfc: rfcLimpio, actualizadoEn: new Date() } },
		{ upsert: true } // por si el usuario llega aquí antes de tener businessProfile creado
	);

	return rfcLimpio;
}
