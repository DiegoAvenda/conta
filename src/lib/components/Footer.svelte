<script>
	import { resolve } from '$app/paths';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import { t, i18n } from '$lib/i18n/locale.svelte.js';

	// Se lee para re-renderizar al cambiar el idioma.
	void i18n.locale;
</script>

<footer class="footer bg-neutral p-10 text-neutral-content sm:footer-horizontal">
	<nav>
		<h6 class="footer-title">{t('footer.onboarding')}</h6>
		<a href={resolve('/better-auth')} class="link link-hover">{t('footer.login')}</a>
		<a href={resolve('/inscripcion')} class="link link-hover">{t('footer.inscripcion')}</a>
	</nav>
	<nav>
		<h6 class="footer-title">{t('footer.activity')}</h6>
		<a href={resolve('/egresos')} class="link link-hover">{t('footer.egresos')}</a>
	</nav>
	<nav>
		<h6 class="footer-title">{t('footer.results')}</h6>
		<a href={resolve('/dashboard')} class="link link-hover">Dashboard</a>
		<a href={resolve('/orders')} class="link link-hover">Orders</a>
		<a href={resolve('/pos')} class="link link-hover">POS</a>
		<a href={resolve('/configure-menu')} class="link link-hover">Menu</a>
	</nav>
	<nav>
		<h6 class="footer-title">{t('footer.language')}</h6>
		<LanguageToggle />
	</nav>
</footer>
