(function () {
	const form = document.getElementById("contactMailtoForm");
	const textarea = form.querySelector("#message");
	const btn = document.getElementById("sendMailtoBtn");
	const responseEl = form.querySelector(".cs-contact-form__response");

	const TO = "EquipoComunicacionInterna@teco.com.ar";
	const SUBJECT = "Comentario desde Comustock"; // fijo

	function openMailtoNewTab(mailto) {
		const w = window.open(mailto, "_blank", "noopener,noreferrer");
		if (!w) {
			const a = document.createElement("a");
			a.href = mailto;
			a.target = "_blank";
			a.rel = "noopener noreferrer";
			document.body.appendChild(a);
			a.click();
			a.remove();
		}
	}

	btn.addEventListener("click", () => {
		const body = (textarea.value || "").trim();

		if (!body) {
			if (responseEl)
				responseEl.textContent =
					form.getAttribute("data-fill-error") || "El campo está vacío.";
			textarea.focus();
			return;
		}

		const mailto =
			`mailto:${encodeURIComponent(TO)}` +
			`?subject=${encodeURIComponent(SUBJECT)}` +
			`&body=${encodeURIComponent(body)}`;

		openMailtoNewTab(mailto);
	});
})();
