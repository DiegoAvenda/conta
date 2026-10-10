<script>
	import { i18n, setLocale, t } from '$lib/i18n/locale.svelte.js';

	let { compacto = false } = $props();

	const esActivo = $derived(i18n.locale === 'es');
</script>

<div
	class={compacto ? 'join' : 'join rounded-xl border border-base-300 bg-base-100 p-1 shadow-sm'}
	role="group"
	aria-label={t('common.language')}
>
	<button
		type="button"
		onclick={() => setLocale('es')}
		aria-pressed={esActivo}
		title={t('common.spanish')}
		class:btn-active={esActivo}
		class={compacto ? 'btn btn-ghost btn-xs' : 'btn join-item btn-sm'}
	>
		ES
	</button>
	<button
		type="button"
		onclick={() => setLocale('en')}
		aria-pressed={!esActivo}
		title={t('common.english')}
		class:btn-active={!esActivo}
		class={compacto ? 'btn btn-ghost btn-xs' : 'btn join-item btn-sm'}
	>
		EN
	</button>
</div>
