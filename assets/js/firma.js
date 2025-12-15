const LOGO_URL = "https://comustock.personal.com.ar/firma/personal.gif";
const LINKEDIN_ICON_URL =
	"https://comustock.personal.com.ar/firma/linkedinIso.png";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const trim = (s) => (s || "").trim();
const esc = (s) =>
	(s || "").replace(
		/[&<>]/g,
		(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]
	);

const els = {
	form: $("#form"),
	preview: $("#preview"),
	btnReset: $("#btnReset"),
	rawHtml: $("#rawHtml"),
	btnCopyHtml2: $("#btnCopyHtml2"),
};

function formValues() {
	const f = new FormData(els.form);
	const v = Object.fromEntries(f.entries());
	v.hideAddress = els.form.querySelector('[name="hideAddress"]').checked;
	v.hideSocialLinks = els.form.querySelector(
		'[name="hideSocialLinks"]'
	).checked;
	return v;
}

function normalizeLinkedin(url) {
	if (!url) return "";
	let u = url.trim();
	if (!/^https?:\/\//i.test(u) && !/linkedin\.com/i.test(u)) {
		u = "https://www.linkedin.com/in/" + u.replace(/^\//, "");
	}
	if (!/^https?:\/\//i.test(u) && /linkedin\.com/i.test(u)) {
		u = "https://" + u.replace(/^\/+/, "");
	}
	return u;
}

function linkedinSlugFromUrl(fullUrl) {
	try {
		const u = new URL(fullUrl);
		const m = u.pathname.match(/\/in\/([^\/]+)/i);
		if (m && m[1]) return m[1];
		const parts = u.pathname.split("/").filter(Boolean);
		return parts[parts.length - 1] || fullUrl;
	} catch (_) {
		const cleaned = fullUrl.replace(/https?:\/\//i, "").replace(/www\./i, "");
		const parts = cleaned.split("/").filter(Boolean);
		return parts[parts.length - 1] || fullUrl;
	}
}

function buildSignatureHTML() {
	const v = formValues();

	const name = trim(v.nombre);
	const role = trim(v.rol);
	const dominio = trim(v.dominio);

	const celular = trim(v.celular);
	const telefonoLaboral = trim(v.telefonoLaboral);
	const email = trim(v.emailAddress);

	const domicilio = trim(v.domicilio);
	const localidad = trim(v.localidad);

	const rawLinkedin = trim(v.linkedinUrl);

	const isEmpty =
		!name &&
		!role &&
		!dominio &&
		!celular &&
		!telefonoLaboral &&
		!email &&
		(v.hideAddress || (!domicilio && !localidad)) &&
		(v.hideSocialLinks || !rawLinkedin);

	if (isEmpty) return "";

	const phones = [celular, telefonoLaboral]
		.filter(Boolean)
		.map(esc)
		.join(" · ");

	const roleLine = role
		? `<span style="text-align: left; color: rgb(63, 61, 60); font-family: &quot;Segoe UI&quot;, sans-serif; font-weight: normal; font-size: 10pt; line-height: 1.4;">${esc(
				role
			)}<br></span>`
		: "";

	const domLine = dominio
		? `<span style="text-align: left; color: rgb(63, 61, 60); font-family: &quot;Segoe UI&quot;, sans-serif; font-weight: normal; font-size: 10pt; line-height: 1.4;">${esc(
				dominio
			)}</span>`
		: "";

	const contactBlock =
		phones || email
			? `
<div style="margin-top: -5px; text-align: left; color: rgb(135, 133, 130); font-family: &quot;Segoe UI&quot;, sans-serif; font-weight: normal; font-size: 9pt; line-height: 1.4; font-variant-numeric: tabular-nums slashed-zero;">
  <br style="font-size: 5pt; line-height: 1; text-decoration: none;">${phones || ""}
  ${
		email
			? `<div style="text-decoration: none; border-bottom-width: 0px; color: rgb(135, 133, 130); font-family: &quot;Segoe UI&quot;, sans-serif; font-size: 9pt; font-style: normal; font-weight: normal; line-height: 1.4;">${esc(
					email
				)}</div>`
			: ``
	}
</div>`
			: "";

	const addressBlock =
		!v.hideAddress && (domicilio || localidad)
			? `
<div style="text-align: left; color: rgb(135, 133, 130); font-family: &quot;Segoe UI&quot;, sans-serif; font-size: 9pt; font-weight: normal;">
  <div style="margin-top: -3px; text-align: left; color: rgb(135, 133, 130); font-family: &quot;Segoe UI&quot;, sans-serif; font-weight: normal; font-size: 9pt; line-height: 1.4;">
    <br style="font-size: 5pt; line-height: 1;">${esc(domicilio || "")}<br>
    <span style="text-align: left; color: rgb(135, 133, 130); font-family: &quot;Segoe UI&quot;, sans-serif; font-weight: normal; font-size: 9pt; line-height: 1.4;">${esc(
			localidad || ""
		)}</span>
  </div>
</div>`
			: "";

	let linkedinBlock = "";
	if (!v.hideSocialLinks && rawLinkedin) {
		const full = normalizeLinkedin(rawLinkedin);
		const slug = linkedinSlugFromUrl(full);
		linkedinBlock = `
<div style="text-align: left; color: rgb(135, 133, 130); font-family: &quot;Segoe UI&quot;, sans-serif; font-size: 9pt; font-weight: normal;">
  <span style="text-align: left; font-family: &quot;Segoe UI&quot;, sans-serif; font-size: 9pt; font-style: normal; font-weight: normal; line-height: 1.4;">
    <br style="font-size: 10pt; line-height: 1;">
    <a target="_blank" href="${esc(
			full
		)}" style="text-decoration: none; border-bottom-width: 0px; color: rgb(135, 133, 130); font-family: &quot;Segoe UI&quot;, sans-serif; font-size: 9pt; font-style: normal; font-weight: normal; line-height: 1.4; display: inline-block;">
      <img src="${LINKEDIN_ICON_URL}" width="23" height="15" style="width: 23px; height: 15px; border: 0px; margin-bottom: -3px; display: inline-block;">${esc(
				slug
			)}
    </a>
  </span>
</div>`;
	}

	const nameHtml = name ? `${esc(name)}<br>` : "";

	// 2 saltos de línea ANTES de todo (en HTML, usando <br>)
	const leadingBreaks = `<br><br>`;

	const html = `
${leadingBreaks}<div class="w-signature"><table cellspacing="0" cellpadding="0" id="miFirma" style="border: 0px;"><tbody>
<img src="${LOGO_URL}" width="84" height="53" style="width: 100px; height: 53px; border: 0px; display: inline;"><br>
<tr><td style="vertical-align: top; padding: 0px 0px 0px 3px;">
  <div style="margin-top: -5px; text-align: left; color: rgb(44, 43, 42); font-family: &quot;Segoe UI&quot;, sans-serif; font-size: 10pt; font-weight: bold; line-height: 1.6;">
    ${nameHtml}${roleLine}${domLine}
  </div>
  ${contactBlock}
  ${addressBlock}
  ${linkedinBlock}
</td></tr>
</tbody></table></div>`.trim();

	return html;
}

function render() {
	const html = buildSignatureHTML();
	els.preview.innerHTML = html;
	if (els.rawHtml) els.rawHtml.value = html;
}

function htmlToPlainText(html) {
	const tmp = document.createElement("div");
	tmp.innerHTML = html;
	return (tmp.innerText || "").trim();
}

async function copyPureHtmlClipboard(html) {
	try {
		if (!navigator.clipboard || !window.ClipboardItem) return false;

		const plain = htmlToPlainText(html);

		const item = new ClipboardItem({
			"text/html": new Blob([html], { type: "text/html" }),
			"text/plain": new Blob([plain], { type: "text/plain" }),
		});

		await navigator.clipboard.write([item]);
		return true;
	} catch (_) {
		return false;
	}
}

function copyFromIsolatedIframe(html) {
	try {
		const iframe = document.createElement("iframe");
		iframe.setAttribute("aria-hidden", "true");
		iframe.style.position = "fixed";
		iframe.style.left = "-9999px";
		iframe.style.top = "0";
		iframe.style.width = "0";
		iframe.style.height = "0";
		iframe.style.opacity = "0";
		document.body.appendChild(iframe);

		const doc = iframe.contentDocument;
		doc.open();
		doc.write(
			"<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>"
		);
		doc.close();

		const container = doc.createElement("div");
		container.innerHTML = html;
		doc.body.appendChild(container);

		iframe.contentWindow.focus();

		const range = doc.createRange();
		range.selectNodeContents(container);

		const sel = iframe.contentWindow.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);

		const ok = doc.execCommand("copy");

		sel.removeAllRanges();
		document.body.removeChild(iframe);

		return ok;
	} catch (_) {
		return false;
	}
}

function legacyCopy(html) {
	const box = document.createElement("div");
	box.setAttribute("contenteditable", "true");
	box.style.position = "fixed";
	box.style.left = "-9999px";
	box.style.top = "0";
	document.body.appendChild(box);

	box.innerHTML = html;
	box.focus();

	const range = document.createRange();
	range.selectNodeContents(box);

	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);

	try {
		document.execCommand("copy");
		toast("Firma copiada (modo compatible).");
	} catch (e) {
		toast("No se pudo copiar automáticamente. Probá Chrome/Edge.");
	}

	sel.removeAllRanges();
	document.body.removeChild(box);
}

async function copyHTML(e) {
	if (e) e.preventDefault();
	render();

	const html = buildSignatureHTML();
	if (!html) {
		toast("Completá al menos un dato para generar la firma.");
		return;
	}

	const okClipboard = await copyPureHtmlClipboard(html);
	if (okClipboard) {
		toast("Firma copiada. Pegala en Outlook (Firmas).");
		return;
	}

	const okIsolated = copyFromIsolatedIframe(html);
	if (okIsolated) {
		toast("Firma copiada. Pegala en Outlook (Firmas).");
		return;
	}

	legacyCopy(html);
}

function toast(msg) {
	const t = document.createElement("div");
	t.textContent = msg;
	t.style.position = "fixed";
	t.style.bottom = "18px";
	t.style.right = "18px";
	t.style.background = "rgba(17,24,39,.95)";
	t.style.border = "1px solid rgba(0,0,0,.12)";
	t.style.padding = "10px 12px";
	t.style.borderRadius = "10px";
	t.style.color = "#ffffff";
	t.style.zIndex = 9999;
	t.style.boxShadow = "0 10px 30px rgba(0,0,0,.18)";
	document.body.appendChild(t);
	setTimeout(() => {
		t.remove();
	}, 2600);
}

function resetAll() {
	els.form.reset();
	render();
}

els.form.addEventListener("input", render);
els.form.addEventListener("change", render);
els.btnCopyHtml2.addEventListener("click", copyHTML);
els.btnReset.addEventListener("click", resetAll);

render();
