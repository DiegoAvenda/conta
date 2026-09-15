import { fail } from '@sveltejs/kit';
import { GROQ_API_KEY } from '$env/static/private';
import Groq from 'groq-sdk';
import { PDFParse } from 'pdf-parse';

const groq = new Groq({ apiKey: GROQ_API_KEY });

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('reporte');

		if (!file || !(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Debes seleccionar un archivo PDF válido.' });
		}

		try {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const parser = new PDFParse({ data: buffer });
			const pdfData = await parser.getText();
			const textoExtraido = pdfData.text;
			await parser.destroy();

			if (!textoExtraido.trim()) {
				return fail(400, {
					error: 'No se pudo extraer texto del PDF. Es posible que sea una imagen escaneada.'
				});
			}

			const completion = await groq.chat.completions.create({
				messages: [
					{
						role: 'system',
						content: `Eres un asistente contable. Analiza el reporte de ventas y extrae la información financiera. Devuelve ÚNICAMENTE un objeto JSON válido con las claves: plataforma, periodo, ventas_brutas, comisiones_plataforma, iva_retenido, isr_retenido, ganancia_neta. Si un dato no está presente, asigna null.`
					},
					{
						role: 'user',
						content: `Texto del reporte:\n\n${textoExtraido}`
					}
				],
				model: 'openai/gpt-oss-20b',
				temperature: 0,
				response_format: { type: 'json_object' }
			});

			const datosContables = JSON.parse(completion.choices[0].message.content);

			return {
				success: true,
				data: datosContables
			};
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Ocurrió un error al procesar el archivo con Groq.' });
		}
	}
};
