const VERIFY_TOKEN = 'mitokendeverificacionwhatsapp123';

export async function GET({ url }) {
	const mode = url.searchParams.get('hub.mode');
	const token = url.searchParams.get('hub.verify_token');
	const challenge = url.searchParams.get('hub.challenge');

	if (mode === 'subscribe' && token === VERIFY_TOKEN) {
		return new Response(challenge, { status: 200 });
	}

	return new Response('Forbidden', { status: 403 });
}
