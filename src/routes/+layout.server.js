export async function load({ locals }) {
	return {
		user: locals.user ?? null,
		locale: locals.locale ?? 'es',
		isDemo: !locals.user
	};
}
