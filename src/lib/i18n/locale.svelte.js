import { browser } from '$app/environment';
import { es } from './es.js';
import { en } from './en.js';

export const locales = ['es', 'en'];
export const dictionaries = { es, en };
const CLAVE = 'contaco:locale';

function localeInicial() {
	if (!browser) return 'es';
	try {
		const guardado = localStorage.getItem(CLAVE);
		if (guardado === 'es' || guardado === 'en') return guardado;
	} catch {
		// localStorage no disponible: se usa el idioma por defecto
	}
	const cookie = document.cookie
		.split('; ')
		.find((c) => c.startsWith('contaco_locale='))
		?.split('=')[1];
	if (cookie === 'es' || cookie === 'en') return cookie;
	return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

// Estado global del idioma (Svelte 5 runes, igual que storeCart).
export const i18n = $state({ locale: 'es' });
let inicializado = false;

export function initLocale(serverLocale) {
	if (inicializado) return;
	inicializado = true;
	if (serverLocale === 'es' || serverLocale === 'en') {
		i18n.locale = serverLocale;
		return;
	}
	i18n.locale = localeInicial();
	if (browser) document.documentElement.lang = i18n.locale;
}

export function setLocale(locale) {
	if (locale !== 'es' && locale !== 'en') return;
	i18n.locale = locale;
	if (!browser) return;
	document.documentElement.lang = locale;
	try {
		localStorage.setItem(CLAVE, locale);
	} catch {
		// modo privado estricto: el idioma solo vive en memoria
	}
	document.cookie = `contaco_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

// t('nav.home') -> busca en el diccionario activo, con fallback a español.
export function t(path) {
	const partes = String(path).split('.');
	let actual = dictionaries[i18n.locale];
	for (const p of partes) actual = actual?.[p];
	if (typeof actual === 'string') return actual;
	let respaldo = dictionaries.es;
	for (const p of partes) respaldo = respaldo?.[p];
	return typeof respaldo === 'string' ? respaldo : path;
}
