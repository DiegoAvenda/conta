import { json } from '@sveltejs/kit';
import {
	WHATSAPP_ACCESS_TOKEN,
	WHATSAPP_PHONE_NUMBER_ID,
	WHATSAPP_TEST_NUMBER
} from '$env/static/private';

const GRAPH_API_VERSION = 'v25.0';

export async function POST() {
	try {
		const response = await fetch(
			`https://graph.facebook.com/${GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',

					to: WHATSAPP_TEST_NUMBER,

					type: 'template',

					template: {
						name: 'jaspers_market_order_confirmation_v1',

						language: {
							code: 'en_US'
						},

						components: [
							{
								type: 'body',

								parameters: [
									{
										type: 'text',
										text: 'John Doe'
									},
									{
										type: 'text',
										text: '123456'
									},
									{
										type: 'text',
										text: 'Sep 26, 2026'
									}
								]
							}
						]
					}
				})
			}
		);

		const data = await response.json();

		if (!response.ok) {
			console.error('WhatsApp API error:', data);

			return json(
				{
					success: false,
					error: data?.error?.message ?? 'WhatsApp API request failed',
					details: data
				},
				{
					status: response.status
				}
			);
		}

		return json({
			success: true,
			message: 'WhatsApp message sent successfully',
			data
		});
	} catch (error) {
		console.error('Unexpected error:', error);

		return json(
			{
				success: false,
				error: 'Unexpected server error'
			},
			{
				status: 500
			}
		);
	}
}
