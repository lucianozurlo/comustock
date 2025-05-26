/* ────────────────────────────────────────────────────────────────────────
   brands.js  (rev 2025-05-25 c) – scroll a #productos cuando es toggle
   ──────────────────────────────────────────────────────────────────────── */

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* helpers */
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const off = (i) => (i === 0 ? 282 : 221); // offset por sección

/* desplazamiento con offset ------------------------------------------------ */
function goTo(id, smooth = true) {
	const el = $('#' + id);
	if (!el) return;

	/* abre acordeón si procede ------------------------------------------- */
	const toggler = el.classList.contains('cs-toggles-item') ? el : el.closest('.cs-toggles-item');
	if (toggler) openAccordion(toggler);

	/* determina a qué elemento desplazar ---------------------------------- */
	let scrollEl = el;
	const parentSection = el.closest('.brand-section');

	/* ⇢ NOVEDAD: si el destino vive dentro de #productos,
     el scroll se hace sobre la sección #productos                       */
	if (parentSection && parentSection.id === 'productos') {
		scrollEl = parentSection;
	}

	/* calcula offset contextual ------------------------------------------ */
	const idx = parentSection ? $$('.brand-section').indexOf(parentSection) : 0;

	const y = scrollEl.getBoundingClientRect().top + window.pageYOffset - off(idx);
	window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });

	/* tras abrir el acordeón la altura cambia → recolocamos -------------- */
	if (toggler) {
		setTimeout(() => {
			const y2 = scrollEl.getBoundingClientRect().top + window.pageYOffset - off(idx);
			window.scrollTo({ top: y2, behavior: 'auto' });
		}, 350);
	}
}

/* lateral activo --------------------------------------------------------- */
function highlightLink() {
	const y = window.pageYOffset;
	let activeId = $$('.brand-section')[0].id;

	$$('.brand-section').forEach((sec, i) => {
		if (y >= sec.offsetTop - off(i)) activeId = sec.id;
	});

	$$('.side-menu a').forEach((a) => a.classList.toggle('active', a.hash.slice(1) === activeId));
}

/* acordeones exclusivos --------------------------------------------------- */
function openAccordion(acc) {
	$$('.cs-toggles-item').forEach((item) => {
		const box = item.querySelector('.cs-toggles-item--content');
		if (!box) return;

		if (item === acc) {
			item.classList.add('is-active');
			box.style.removeProperty('display');
		} else {
			item.classList.remove('is-active');
			box.style.display = 'none';
		}
	});
}

/* vigila que ningún script mueva el scroll después ----------------------- */
function watchdogHash() {
	const target = location.hash.slice(1);
	if (!target) return;

	let ticks = 20;
	const iv = setInterval(() => {
		const el = $('#' + target);
		if (!el) return;
		const parent = el.closest('.brand-section');
		const idx = parent ? $$('.brand-section').indexOf(parent) : 0;
		const wanted =
			(parent && parent.id === 'productos' ? parent : el).getBoundingClientRect().top - off(idx);

		if (Math.abs(wanted) > 5) goTo(target, false);
		if (--ticks <= 0) clearInterval(iv);
	}, 150);
}

/* listeners -------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
	/* menú lateral */
	$$('.side-menu a').forEach((a) =>
		a.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			history.pushState(null, '', a.hash);
			goTo(a.hash.slice(1));
		})
	);

	/* anclas internas genéricas */
	document.addEventListener('click', (e) => {
		const link = e.target.closest('a[href^="#"]');
		if (!link) return;

		const url = new URL(link.href, location.href);
		if (url.pathname !== location.pathname || url.host !== location.host) return;

		e.preventDefault();
		history.pushState(null, '', url.hash);
		goTo(url.hash.slice(1));
	});

	/* clic en título acordeón → exclusivo */
	$$('.cs-toggles-item--title').forEach((t) =>
		t.addEventListener('click', () => openAccordion(t.closest('.cs-toggles-item')))
	);

	window.addEventListener('scroll', highlightLink);
	highlightLink();
});

/* hash y carga ----------------------------------------------------------- */
const applyHash = () => goTo(location.hash.slice(1), false);

window.addEventListener('hashchange', applyHash);
window.addEventListener('pageshow', applyHash);
window.addEventListener('load', () => {
	applyHash();
	watchdogHash();
});
