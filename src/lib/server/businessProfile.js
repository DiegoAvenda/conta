import { getDb } from './db.js';

export async function obtenerPerfilNegocio(userId) {
	const db = await getDb();
	return await db.collection('businessProfile').findOne({ userId });
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
