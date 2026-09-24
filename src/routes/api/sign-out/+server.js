import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

// Cierre de sesión invocado por el Navbar de la tienda (fetch + recarga),
// ya que los actions solo viven en páginas y este botón está en el layout.
export async function POST({ request }) {
	try {
		await auth.api.signOut({ headers: request.headers });
	} catch (error) {
		console.error('signOut:', error);
	}
	return json({ ok: true });
}
