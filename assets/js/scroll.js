(() => {
	const OFFSET = 80;
	const SCROLL_OPTS = { behavior: 'smooth' };

	const scrollToEl = (el) => {
		if (!el) return;
		const y = el.getBoundingClientRect().top + window.pageYOffset - OFFSET;
		window.scrollTo({ top: y, ...SCROLL_OPTS });
	};

	document.addEventListener('click', (ev) => {
		const a = ev.target.closest('a[data-jump]');
		if (!a) return;

		const url = new URL(a.href, location);
		const samePage = url.pathname === location.pathname;

		if (samePage) {
			ev.preventDefault();
			history.pushState(null, '', url.hash);
			scrollToEl(document.querySelector(url.hash));
		} else {
			sessionStorage.setItem('jump', '1');
		}
	});

	window.addEventListener('DOMContentLoaded', () => {
		if (location.hash && sessionStorage.getItem('jump') === '1') {
			sessionStorage.removeItem('jump');
			setTimeout(() => {
				scrollToEl(document.querySelector(location.hash));
			}, 50);
		}
	});
})();
