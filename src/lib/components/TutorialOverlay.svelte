<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { tutorialSteps, tutorialPageOrder } from '$lib/demo/tutorialSteps.js';

	let { isDemo = false } = $props();

	const SKIP_KEY = 'contaco_tutorial_skip';

	// Ruta reactiva: el layout persiste entre navegaciones SPA, así que
	// hay que leerla de $app/state y no de window.location una sola vez.
	const path = $derived((page.url.pathname ?? '/').replace(/\/$/, '') || '/');
	const steps = $derived(tutorialSteps[path] ?? tutorialSteps['/']);
	const currentPageIndex = $derived(tutorialPageOrder.indexOf(path));

	let currentStep = $state(0);
	let pos = $state(null);
	let skipped = $state(false);
	let targetEl = $state(null);

	function clearHighlight() {
		if (targetEl) {
			targetEl.style.outline = '';
			targetEl.style.outlineOffset = '';
			targetEl = null;
		}
	}

	function findEl(selector) {
		// Acepta "a, b": prueba cada parte hasta encontrar una visible.
		for (const part of selector.split(',')) {
			const s = part.trim();
			if (!s) continue;
			const els = document.querySelectorAll(s);
			for (const el of els) {
				const r = el.getBoundingClientRect();
				if (r.width > 0 && r.height > 0) return el;
			}
		}
		return null;
	}

	function computePos() {
		clearHighlight();
		if (skipped || currentStep >= steps.length) return null;
		const step = steps[currentStep];
		if (!step) return null;
		const el = findEl(step.selector);
		// Fallback: si el selector no existe, mostrar fijo abajo-derecha
		// en vez de desaparecer.
		if (!el) {
			return { top: null, left: null, fixed: true, title: step.title, desc: step.desc };
		}
		el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		el.style.outline = '3px solid var(--color-primary, #4f46e5)';
		el.style.outlineOffset = '4px';
		targetEl = el;
		const rect = el.getBoundingClientRect();
		return {
			top: rect.bottom + window.scrollY + 12,
			left: Math.max(Math.min(rect.left + window.scrollX, window.innerWidth - 340), 16),
			fixed: false,
			title: step.title,
			desc: step.desc
		};
	}

	async function refresh(retries = 6) {
		await tick();
		for (let i = 0; i < retries; i++) {
			pos = computePos();
			// Si encontró el elemento real, listo. Si es fallback fijo,
			// reintenta un poco por si el DOM aún carga.
			if (pos && !pos.fixed) return;
			if (i < retries - 1) await new Promise((r) => setTimeout(r, 250));
		}
	}

	function next() {
		if (currentStep < steps.length - 1) {
			currentStep++;
			refresh();
		} else if (currentPageIndex >= 0 && currentPageIndex < tutorialPageOrder.length - 1) {
			// Termina la página actual -> navega con goto (SPA) para que el
			// layout persista y el $effect de abajo reinicie el paso.
			goto(resolve(tutorialPageOrder[currentPageIndex + 1]));
		} else {
			skip();
		}
	}

	function back() {
		if (currentStep > 0) {
			currentStep--;
			refresh();
		}
	}

	function skip() {
		skipped = true;
		pos = null;
		clearHighlight();
		try {
			localStorage.setItem(SKIP_KEY, '1');
		} catch {
			void 0;
		}
	}

	onMount(() => {
		try {
			if (localStorage.getItem(SKIP_KEY) === '1') skipped = true;
		} catch {
			void 0;
		}
		if (isDemo && !skipped) refresh(8);
		const onRs = () => {
			if (isDemo && !skipped) refresh(2);
		};
		window.addEventListener('resize', onRs);
		return () => {
			window.removeEventListener('resize', onRs);
			clearHighlight();
		};
	});

	// Reinicia el paso al cambiar de página (navegación SPA sin remontar
	// el layout) y reposiciona el recuadro en la página nueva.
	$effect(() => {
		void path;
		void steps;
		if (!isDemo || skipped) return;
		currentStep = 0;
		refresh(8);
	});

	$effect(() => {
		void currentStep;
	});
</script>

{#if isDemo && !skipped && pos && currentStep < steps.length}
	<div
		style={(pos.fixed
			? 'position:fixed; bottom:24px; right:24px; z-index:9999;'
			: `position:absolute; top:${pos.top}px; left:${pos.left}px; z-index:9999;`) +
			' background-color:#0f172a; opacity:1;'}
		class="w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl"
	>
		<div class="mb-2 flex items-center justify-between gap-2">
			<span class="badge badge-sm border-0 bg-white font-bold text-slate-900">
				Página {tutorialPageOrder.indexOf(path) + 1}/{tutorialPageOrder.length} · Paso {currentStep + 1}/{steps.length}
			</span>
			<button onclick={skip} class="btn btn-xs border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800">Saltar</button>
		</div>
		<h4 class="mb-1 text-sm font-bold text-white">{pos.title}</h4>
		<p class="text-xs leading-relaxed text-slate-300">{pos.desc}</p>
		<div class="mt-3 flex justify-end gap-2">
			{#if currentStep > 0}
				<button onclick={back} class="btn btn-xs border-slate-600 bg-transparent text-white hover:bg-slate-800">← Atrás</button>
			{/if}
			<button onclick={next} class="btn btn-xs border-0 bg-white font-bold text-slate-900 hover:bg-slate-200">
				{#if currentStep === steps.length - 1 && currentPageIndex < tutorialPageOrder.length - 1}
					Ir a {tutorialPageOrder[currentPageIndex + 1]} →
				{:else}
					Siguiente →
				{/if}
			</button>
		</div>
	</div>
{/if}
