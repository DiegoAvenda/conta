import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const rutasProtegidas = [
	'/dashboard',
	'/egresos',
	'/pos',
	'/orders',
	'/configure-menu',
	'/sat-monthly',
	'/mi-restaurante'
];

/** @type {import('@sveltejs/kit').Handle} */ const handleBetterAuth = async ({
	event,
	resolve
}) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	if (!event.locals.user && rutasProtegidas.some((ruta) => event.url.pathname.startsWith(ruta))) {
		throw redirect(303, '/better-auth/login');
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export /** @type {import('@sveltejs/kit').Handle} */ const handle = handleBetterAuth;
