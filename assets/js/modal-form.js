/* ────────────────────────────────────────────────────────────── */
/* 1 · Crear los dos modales (download + message)                 */
/* ────────────────────────────────────────────────────────────── */
(function () {
  /* Modal de descarga */
  const dModal = document.createElement("div");
  dModal.id = "modal-download";
  dModal.style.display = "none";
  dModal.innerHTML = `
<form id="download-form">
  <div id="download-file" class="download-file-custom" style="padding:0;"></div>

  <div class="format-container">
    <p>Elegí el formato:</p>
    <div class="format"></div>
  </div>

  <input type="checkbox" id="terms" name="terms">
  <div class="disclaimer">
    Acepto los <a href="javascript:void(0);" id="toggle-disclaimer">términos y condiciones</a>
    <div id="disclaimer-content" class="disclaimer-content">
      <p style="color:#000">El contenido de identidad de la marca Personal disponible para descarga es de uso exclusivo para fines vinculados a la aplicación y representación marcaria autorizada. Queda prohibida su reproducción, modificación, distribución o utilización con cualquier otro propósito sin consentimiento previo. La descarga implica la aceptación plena de estas condiciones.</p>
    </div>
  </div>

  <button type="submit" id="download-btn" disabled>
    Descargar <span class="cs-icon cs-icon-comustock"></span>
  </button>
</form>`;
  document.body.appendChild(dModal);

  /* Modal de mensajes (para copy y futuros avisos) */
  const mModal = document.createElement("div");
  mModal.id = "modal-message";
  mModal.style.display = "none";
  document.body.appendChild(mModal);
})();

/* ────────────────────────────────────────────────────────────── */
/* 2 · Ajuste global de Fancybox (sin botón close)                */
/* ────────────────────────────────────────────────────────────── */
Fancybox.defaults = { ...Fancybox.defaults, closeButton: false };

Fancybox.bind("[data-fancybox]", {
  animationEffect: "zoom-in-out",
  on: {
    destroy() {
      const mv = document.getElementById("custom-video");
      if (mv) mv.pause();
    },
  },
});

/* ────────────────────────────────────────────────────────────── */
/* 3 · Abrir / poblar el modal adecuado                           */
/* ────────────────────────────────────────────────────────────── */
document.querySelectorAll("[data-fancybox]").forEach((anchor) => {
  anchor.addEventListener("click", (ev) => {
    const block = anchor.closest(".cs-masked-block");
    const group = block.dataset.fileGroup || "vectorial";

    /* ============ CASO «copy» (sólo mensaje) ============ */
    if (group === "copy") {
      ev.preventDefault(); // evitamos que abra el modal de descarga
      const text = block.dataset.copy || "";

      // Copiar al portapapeles (modo silencioso)
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
      }

      // Render del modal de mensaje (texto negro)
      const mWrap = document.getElementById("modal-message");
      mWrap.innerHTML = `
        <div style="padding:1.5rem 1rem; text-align:center; color:#000;">
          <p style="margin:0 0 .5rem;">El claim</p>
          <p style="margin:.25rem 0;"><strong style="color:#000">${text}</strong></p>
          <p style="margin:.5rem 0 0;">se copió en el portapapeles</p>
        </div>`;

      // Abrir mensaje y cerrarlo a los 2s
      Fancybox.show([{ src: "#modal-message", type: "inline" }]);
      setTimeout(() => Fancybox.close(), 2000);
      return; // fin para copy
    }

    /* ——— resto de lógica para descargas ——— */

    /* ========= Mute video preview (si existe) ========= */
    {
      const pv = block.querySelector("video");
      if (pv) pv.muted = true;
    }

    /* ====== datos del archivo / preview ====== */
    const media = block.querySelector("video") || block.querySelector("img");
    const src = media.getAttribute("src");
    const alt = media.getAttribute("alt") || "";
    const bgClass =
      [...block.querySelector(".cs-masked-media").classList].find((c) =>
        c.startsWith("bg-")
      ) || "";

    const holder = document.getElementById("download-file");
    holder.className = "download-file-custom" + (bgClass ? ` ${bgClass}` : "");
    holder.innerHTML = "";

    // Parse de ruta
    const parts = src.split("/");
    const base = parts.slice(0, -2).join("/") + "/"; // hasta .../banda/ o carpeta equivalente
    const nameExt = parts.pop();
    const dot = nameExt.lastIndexOf(".");
    const fileName = nameExt.slice(0, dot);
    const origExt = nameExt.slice(dot + 1).toLowerCase();
    const jpgSuffix = block.dataset.jpgFilename || ""; // ej: "_col-negro"

    // Guardamos datos
    window._downloadData = {
      basePath: base,
      fileName,
      originalExtension: origExt,
      originalSrc: src,
      alt,
      jpgSuffix,
      group,
    };

    /* ====== preview (video/audio muestran mp4; resto imagen) ====== */
    if (["audio", "video"].includes(group)) {
      holder.innerHTML = `
      <div class="video-container" style="position:relative;width:100%;">
        <video id="custom-video" preload="auto" style="width:100%;display:block;">
          <source src="${src}" type="video/mp4">
        </video>
        <button id="video-play" class="video-control"
                style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                       background:#ffffffcc;border:none;cursor:pointer;border-radius:50%;padding:18px;">
          <img src="../../assets/img/iconos/audio/play.svg" style="width:28px;height:28px;">
        </button>
        <button id="video-stop" class="video-control"
                style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                       display:none;background:#ffffffcc;border:none;cursor:pointer;border-radius:50%;padding:18px;">
          <img src="../../assets/img/iconos/audio/stop.svg" style="width:28px;height:28px;">
        </button>
      </div>`;
      const v = document.getElementById("custom-video");
      const pb = document.getElementById("video-play");
      const sb = document.getElementById("video-stop");
      const box = holder.querySelector(".video-container");

      pb.onclick = (e) => {
        e.preventDefault();
        v.play();
        pb.style.display = "none";
        sb.style.display = "block";
      };
      sb.onclick = (e) => {
        e.preventDefault();
        v.pause();
        sb.style.display = "none";
        pb.style.display = "block";
      };
      box.onmouseenter = () => {
        if (!v.paused) sb.style.display = "block";
      };
      box.onmouseleave = () => {
        if (!v.paused) sb.style.display = "none";
      };
      v.onended = () => {
        pb.style.display = "block";
        sb.style.display = "none";
      };
    } else {
      holder.innerHTML = `<img src="${src}" alt="${alt}">`;
    }

    /* ====== formatos disponibles por grupo ====== */
    const groups = {
      vectorial: ["ai", "svg", "pdf", "png", "jpg"],
      audio: ["mp3", "wav"],
      imagen: ["jpg"],
      pdf: ["pdf"],
      documento: ["docx"],
      video: ["mp4"],
      powerpoint: ["pptx"],
      editables: ["ai", "pptx"],
      email: ["oft", "eml"],
      fuentes: ["otf", "ttf"],
      zip: ["zip"],
    };
    const fmts = groups[group] || ["png", "jpg"];
    const fc = document.querySelector("#modal-download .format-container");
    const fDiv = fc.querySelector(".format");

    if (fmts.length > 1) {
      fc.style.display = "";
      fDiv.innerHTML = fmts
        .map(
          (e, i) => `
        <label for="${e}">
          <input type="radio" name="format" id="${e}" value="${e}" class="format-file" ${
            !i ? "checked" : ""
          }>
          <p class="format-select">.${e}</p>
        </label>`
        )
        .join("");
      // Bloqueo temporal para evitar dobles clics
      fDiv
        .querySelectorAll("input:not(:checked)")
        .forEach((r) => (r.disabled = true));
      setTimeout(
        () =>
          fDiv.querySelectorAll("input").forEach((r) => (r.disabled = false)),
        300
      );
    } else {
      // Un solo formato → oculto selector
      fc.style.display = "none";
    }
  });
});

/* ────────────────────────────────────────────────────────────── */
/* 4 · Términos / descarga / cierre                               */
/* ────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const terms = document.getElementById("terms"),
    btn = document.getElementById("download-btn"),
    td = document.getElementById("toggle-disclaimer"),
    dc = document.getElementById("disclaimer-content");

  terms.onchange = () => (btn.disabled = !terms.checked);
  td.onclick = () =>
    (dc.style.maxHeight =
      !dc.style.maxHeight || dc.style.maxHeight === "0px"
        ? dc.scrollHeight + "px"
        : "0px");

  document.getElementById("download-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = window._downloadData;

    // Por si alguien intenta submittear en modo "copy"
    if (d.group === "copy") {
      Fancybox.close();
      return;
    }

    const sel = document.querySelector('input[name="format"]:checked');
    const def = {
      imagen: "jpg",
      pdf: "pdf",
      documento: "docx",
      video: "mp4",
      powerpoint: "pptx",
      email: "eml",
      fuentes: "ttf",
      zip: "zip",
    };
    const fmt = sel ? sel.value : def[d.group] || d.originalExtension;

    const singles = [
      "imagen",
      "pdf",
      "documento",
      "video",
      "powerpoint",
      "email",
      "fuentes",
      "zip",
    ];

    const fname =
      fmt === "jpg"
        ? d.jpgSuffix
          ? `${d.fileName}${d.jpgSuffix}.jpg`
          : `${d.fileName}.jpg`
        : `${d.fileName}.${fmt}`;

    // Reglas de URL:
    // - Grupos de un solo formato: reemplazo directo de extensión en el src original.
    // - Resto: carpeta por extensión y mismo nombre.
    const url = singles.includes(d.group)
      ? d.originalSrc.replace(/\.[^/.]+$/, `.${fmt}`)
      : fmt === "jpg"
      ? `${d.basePath}jpg/${fname}`
      : `${d.basePath}${fmt}/${fname}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    Fancybox.close();
  });
});

/* ────────────────────────────────────────────────────────────── */
/* 5 · Botón mute/unmute para previews en grid                    */
/* ────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".cs-masked-media.video-container")
    .forEach((cont) => {
      const v = cont.querySelector("video");
      if (!v) return;

      cont.style.position = "relative";

      const btn = document.createElement("button");
      Object.assign(btn.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        background: "#ffffffcc",
        border: "none",
        cursor: "pointer",
        borderRadius: "50%",
        padding: "14px",
        opacity: 0,
        transition: "opacity .3s",
      });

      const img = document.createElement("img");
      Object.assign(img.style, { width: "32px", height: "32px" });
      img.src = "../../assets/img/icons/unmute.svg";

      btn.appendChild(img);
      cont.appendChild(btn);

      cont.onmouseenter = () => (btn.style.opacity = 1);
      cont.onmouseleave = () => (btn.style.opacity = 0);

      btn.onclick = (e) => {
        e.preventDefault();
        v.muted = !v.muted;
        img.src = v.muted
          ? "../../assets/img/icons/unmute.svg"
          : "../../assets/img/icons/mute.svg";
      };
    });
});

/* ────────────────────────────────────────────────────────────── */
/* 6 · Lazy IMÁGENES y FONDOS (simple: data-src / data-bg)        */
/* ────────────────────────────────────────────────────────────── */
(function lazyImagesSimple() {
  const imgs = document.querySelectorAll("img.js-lazy[data-src]");
  const bgs = document.querySelectorAll(".js-lazy-bg[data-bg]");

  const upgradeImg = (img) => {
    const ds = img.getAttribute("data-src");
    if (!ds) return;
    img.setAttribute("src", ds);
    img.removeAttribute("data-src");
    img.dataset.loaded = "1";
  };

  const upgradeBg = (el) => {
    const bg = el.getAttribute("data-bg");
    if (!bg) return;
    el.style.backgroundImage = `url("${bg}")`;
    el.removeAttribute("data-bg");
    el.dataset.loaded = "1";
  };

  const onIntersect = (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.tagName === "IMG") upgradeImg(el);
      else upgradeBg(el);
      obs.unobserve(el);
    });
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(onIntersect, {
      rootMargin: "200px 0px",
    });
    imgs.forEach((i) => io.observe(i));
    bgs.forEach((b) => io.observe(b));
  } else {
    imgs.forEach(upgradeImg);
    bgs.forEach(upgradeBg);
  }
})();

/* ────────────────────────────────────────────────────────────── */
/* 7 · Lazy VIDEOS (data-src o <source data-src>)                 */
/* ────────────────────────────────────────────────────────────── */
(function lazyVideosSimple() {
  const vids = document.querySelectorAll(
    ".cs-masked-media.video-container video, video.js-lazy-video"
  );
  if (!vids.length) return;

  const loadVideo = (v) => {
    const sources = v.querySelectorAll("source[data-src]");
    if (sources.length) {
      sources.forEach((s) => {
        s.src = s.dataset.src;
        s.removeAttribute("data-src");
      });
    } else if (v.dataset.src && !v.src) {
      v.src = v.dataset.src;
      v.removeAttribute("data-src");
    }
    v.load();
  };

  const onIntersect = (entries, obs) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) {
        if (
          !v.currentSrc &&
          (v.dataset.src || v.querySelector("source[data-src]"))
        ) {
          loadVideo(v);
        }
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(onIntersect, {
      rootMargin: "200px 0px",
    });
    vids.forEach((v) => io.observe(v));
  } else {
    vids.forEach((v) => loadVideo(v));
  }
})();

/* ────────────────────────────────────────────────────────────── */
/* 8 · Promover preview a FULL antes de abrir el modal            */
/* ────────────────────────────────────────────────────────────── */
/* Asegura que si hay img/video lazy, se cargue la versión full
   antes de que Fancybox renderice el contenido del bloque */
(function promotePreviewOnModalOpen() {
  document.addEventListener(
    "click",
    (e) => {
      const trigger = e.target.closest("[data-fancybox]");
      if (!trigger) return;

      const block = trigger.closest(".cs-masked-block") || document;

      // IMG
      const img = block.querySelector("img.js-lazy[data-src]");
      if (img) {
        const ds = img.getAttribute("data-src");
        if (ds) {
          img.setAttribute("src", ds);
          img.removeAttribute("data-src");
          img.dataset.loaded = "1";
        }
      }

      // BG
      const bg = block.querySelector(".js-lazy-bg[data-bg]");
      if (bg) {
        const val = bg.getAttribute("data-bg");
        if (val) {
          bg.style.backgroundImage = `url("${val}")`;
          bg.removeAttribute("data-bg");
          bg.dataset.loaded = "1";
        }
      }

      // VIDEO
      const v = block.querySelector("video");
      if (v && !v.currentSrc) {
        const s = v.querySelector("source[data-src]");
        if (s) {
          s.src = s.dataset.src;
          s.removeAttribute("data-src");
        } else if (v.dataset.src) {
          v.src = v.dataset.src;
          v.removeAttribute("data-src");
        }
        v.load();
      }
    },
    true
  ); // captura, ocurre antes que Fancybox
})();
