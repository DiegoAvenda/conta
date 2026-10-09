import { json } from '@sveltejs/kit';
import {
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_WABA_ID
} from '$env/static/private';

const API_VERSION = 'v25.0';

async function metaRequest(path) {
  const response = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${path}`,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      }
    }
  );

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

export async function GET() {
  try {
    const phoneNumbers = await metaRequest(
      `${WHATSAPP_WABA_ID}/phone_numbers`
    );

    const templates = await metaRequest(
      `${WHATSAPP_WABA_ID}/message_templates`
    );

    return json({
      success: phoneNumbers.ok && templates.ok,
      phoneNumbers,
      templates
    });
  } catch (error) {
    console.error(error);

    return json(
      {
        success: false,
        error: 'Meta API request failed'
      },
      { status: 500 }
    );
  }
}