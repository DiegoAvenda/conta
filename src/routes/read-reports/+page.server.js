import { fail } from '@sveltejs/kit';
import { GROQ_API_KEY } from '$env/static/private';
import Groq from 'groq-sdk';
import { PDFParse } from 'pdf-parse';
import { guardarReportePlataforma } from '$lib/server/reportesPlataforma.js';

const groq = new Groq({ apiKey: GROQ_API_KEY });

export const actions = {
	default: async ({ request, locals }) => {
		const userId = locals.user.id;
		const formData = await request.formData();
		const file = formData.get('reporte');

		if (!file || !(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Debes seleccionar un archivo PDF válido.' });
		}

		let textoExtraido;
		try {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const parser = new PDFParse({ data: buffer });
			const pdfData = await parser.getText();
			textoExtraido = pdfData.text;
			await parser.destroy();

			if (!textoExtraido.trim()) {
				return fail(400, {
					error: 'No se pudo extraer texto del PDF. Es posible que sea una imagen escaneada.'
				});
			}
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Ocurrió un error al leer el PDF.' });
		}

		let datosContables;
		try {
			const completion = await groq.chat.completions.create({
				messages: [
					{
						role: 'system',
						content: `Eres un asistente contable. Analiza el reporte de ventas y extrae la información financiera. Devuelve ÚNICAMENTE un objeto JSON válido con las claves: plataforma, periodo (texto legible, ej "Septiembre 2026"), periodo_anio (entero, ej 2026), periodo_mes (entero 1-12), ventas_brutas, comisiones_plataforma, iva_retenido, isr_retenido, ganancia_neta. Si un dato no está presente, asigna null.`
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

			datosContables = JSON.parse(completion.choices[0].message.content);
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Ocurrió un error al procesar el archivo con Groq.' });
		}

		// el parseo puede salir bien aunque guardar falle (Mongo caído, etc.) —
		// se separan los dos try/catch para poder mostrarle al usuario el resultado
		// de la IA aunque el guardado no se haya logrado, en vez de perder su trabajo
		let guardado = true;
		try {
			await guardarReportePlataforma(userId, datosContables, file.name);
		} catch (err) {
			console.error(err);
			if (err.code === 'REPORT_DATA_INVALID') {
				return fail(422, { error: err.message, data: datosContables });
			}
			guardado = false;
		}

		return {
			success: true,
			data: datosContables,
			guardado
		};
	}
};
