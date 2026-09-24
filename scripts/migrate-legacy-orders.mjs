// Migra las órdenes de la app independiente de comensales (carpeta btc) al
// esquema de esta app para que aparezcan en Comandas del restaurante.
//
// Uso: pnpm migrate:legacy -- --seller=<userId-del-dueño>
// (el userId es el _id del dueño en la colección `user` de better-auth)
import { MongoClient, ObjectId } from 'mongodb';

const seller = process.argv.find((arg) => arg.startsWith('--seller='))?.split('=')[1];

if (!seller || !ObjectId.isValid(seller)) {
	console.error('Falta o es inválido --seller=<userId ObjectId del dueño del restaurante>');
	process.exit(1);
}
if (!process.env.MONGODB_URI || !process.env.MONGODB_DATABASE) {
	console.error('Faltan MONGODB_URI/MONGODB_DATABASE. Ejecuta con: node --env-file=.env ...');
	process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);

try {
	await client.connect();
	const db = client.db(process.env.MONGODB_DATABASE);

	// Órdenes legadas: solo traían customerId/items/totalPrice/delivered/prepared.
	// Como solo existen si el webhook de Stripe confirmó el pago, van como pagadas.
	const resultado = await db.collection('orders').updateMany({ sellerId: { $exists: false } }, [
		{
			$set: {
				sellerId: seller,
				userId: seller,
				channel: 'delivery',
				paymentStatus: 'paid',
				paymentMethod: 'card',
				status: {
					$cond: [{ $eq: ['$delivered', true] }, 'completed', 'pending']
				},
				actualizadoEn: new Date()
			}
		}
	]);

	console.log(`Órdenes legadas actualizadas: ${resultado.modifiedCount}`);
} catch (error) {
	console.error('Error migrando órdenes legadas:', error);
	process.exitCode = 1;
} finally {
	await client.close();
}
