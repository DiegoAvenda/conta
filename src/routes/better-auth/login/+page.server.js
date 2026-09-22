import { fail, redirect } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_PROVIDERS = ['google'];

export const load = (event) => {
	if (event.locals.user) {
		return redirect(302, '/better-auth');
	}
	return {};
};

export const actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!EMAIL_REGEX.test(email)) {
			return fail(400, { message: 'Ingresa un correo válido.' });
		}
		if (password.length < 8) {
			return fail(400, { message: 'La contraseña debe tener al menos 8 caracteres.' });
		}

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Signin failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/better-auth');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString().trim() ?? '';

		if (!EMAIL_REGEX.test(email)) {
			return fail(400, { message: 'Ingresa un correo válido.' });
		}
		if (password.length < 8) {
			return fail(400, { message: 'La contraseña debe tener al menos 8 caracteres.' });
		}
		if (name.length < 2) {
			return fail(400, { message: 'El nombre debe tener al menos 2 caracteres.' });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/better-auth');
	},
	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'google';
		const callbackURL = formData.get('callbackURL')?.toString() ?? '/better-auth';

		if (!ALLOWED_PROVIDERS.includes(provider)) {
			return fail(400, { message: 'Proveedor no soportado.' });
		}
		if (!callbackURL || callbackURL.length > 200) {
			return fail(400, { message: 'La URL de retorno no es válida.' });
		}

		const result = await auth.api.signInSocial({
			body: {
				provider,
				callbackURL
			}
		});

		if (result.url) {
			return redirect(302, result.url);
		}
		return fail(400, { message: 'Social sign-in failed' });
	}
};
