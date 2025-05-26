/* ────────────────────────────────────────────────────────────── */
/* 1 · Crear los dos modales (download + message)                 */
/* ────────────────────────────────────────────────────────────── */
(function () {
   /* Modal de descarga */
   const dModal = document.createElement('div');
   dModal.id = 'modal-download';
   dModal.style.display = 'none';
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
    <div id="disclaimer-content" class="disclaimer-content"><p>…</p></div>
  </div>

  <button type="submit" id="download-btn" disabled>
    Descargar <span class="cs-icon cs-icon-comustock"></span>
  </button>
</form>`;
   document.body.appendChild(dModal);

   /* Modal de mensajes */
   const mModal = document.createElement('div');
   mModal.id = 'modal-message';
   mModal.style.display = 'none';
   /* se rellena dinámicamente */
   document.body.appendChild(mModal);
})();

/* ────────────────────────────────────────────────────────────── */
/* 2 · Ajuste global de Fancybox (sin botón close)                */
/* ────────────────────────────────────────────────────────────── */
Fancybox.defaults = { ...Fancybox.defaults, closeButton: false };

Fancybox.bind('[data-fancybox]', {
   animationEffect: 'zoom-in-out',
   on: {
      destroy() {
         document.getElementById('custom-video')?.pause();
      },
   },
});

/* ────────────────────────────────────────────────────────────── */
/* 3 · Abrir / poblar el modal adecuado                           */
/* ────────────────────────────────────────────────────────────── */
document.querySelectorAll('[data-fancybox]').forEach((anchor) => {
   anchor.addEventListener('click', (ev) => {
      const block = anchor.closest('.cs-masked-block');
      const group = block.dataset.fileGroup || 'vectorial';

      /* ============ CASO «copy» (sólo mensaje) ============ */
      if (group === 'copy') {
         ev.preventDefault(); // anulamos apertura automática del otro modal
         const text = block.dataset.copy || '';

         /* copiar al clipboard (silencioso) */
         navigator.clipboard?.writeText(text).catch(() => {});

         /* llenar modal-message */
         const mWrap = document.getElementById('modal-message');
         mWrap.innerHTML = `
        <p>
          El claim<br><strong>${text}</strong><br>se copió en el portapapeles
        </p>`;

         /* abrir manualmente #modal-message */
         Fancybox.show([{ src: '#modal-message', type: 'inline' }]);

         /* cerrar a los 2 s */
         setTimeout(() => Fancybox.close(), 2000);
         return; // — fin —
      }

      /* ——— resto de lógica para descargas ——— */
      /* ... (todo el código de descarga se mantiene idéntico) ... */

      /* ========= Mute video preview ========= */
      block.querySelector('video')?.((v) => (v.muted = true)); // si existe

      /* ====== datos del archivo / preview … ====== */
      const media = block.querySelector('video') || block.querySelector('img');
      const src = media.getAttribute('src');
      const alt = media.getAttribute('alt') || '';
      const bgClass =
         [...block.querySelector('.cs-masked-media').classList].find((c) => c.startsWith('bg-')) ||
         '';

      const holder = document.getElementById('download-file');
      holder.className = 'download-file-custom' + (bgClass ? ` ${bgClass}` : '');
      holder.innerHTML = '';

      /* parse ruta */
      const parts = src.split('/');
      const base = parts.slice(0, -2).join('/') + '/';
      const nExt = parts.pop();
      const dot = nExt.lastIndexOf('.');
      const fname = nExt.slice(0, dot);
      const ext = nExt.slice(dot + 1).toLowerCase();
      const jpgSuf = block.dataset.jpgFilename || '';

      window._downloadData = {
         basePath: base,
         fileName: fname,
         originalExtension: ext,
         originalSrc: src,
         alt,
         jpgSuffix: jpgSuf,
         group,
      };

      /* preview */
      if (['audio', 'video'].includes(group)) {
         holder.innerHTML = `
      <div class="video-container" style="position:relative;width:100%;">
        <video id="custom-video" preload="auto" style="width:100%;display:block;">
          <source src="${src}" type="video/mp4">
        </video>
        <button id="video-play" class="video-control"
                style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                       background:#ffffffcc;border:none;cursor:pointer;border-radius:50%;padding:18px;">
          <img src="../assets/img/icons/play.svg" style="width:28px;height:28px;">
        </button>
        <button id="video-stop" class="video-control"
                style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                       display:none;background:#ffffffcc;border:none;cursor:pointer;border-radius:50%;padding:18px;">
          <img src="../assets/img/icons/stop.svg" style="width:28px;height:28px;">
        </button>
      </div>`;
         const v = document.getElementById('custom-video');
         const pb = document.getElementById('video-play');
         const sb = document.getElementById('video-stop');
         const box = holder.querySelector('.video-container');
         pb.onclick = (e) => {
            e.preventDefault();
            v.play();
            pb.style.display = 'none';
            sb.style.display = 'block';
         };
         sb.onclick = (e) => {
            e.preventDefault();
            v.pause();
            sb.style.display = 'none';
            pb.style.display = 'block';
         };
         box.onmouseenter = () => {
            if (!v.paused) sb.style.display = 'block';
         };
         box.onmouseleave = () => {
            if (!v.paused) sb.style.display = 'none';
         };
         v.onended = () => {
            pb.style.display = 'block';
            sb.style.display = 'none';
         };
      } else {
         holder.innerHTML = `<img src="${src}" alt="${alt}">`;
      }

      /* formatos disponibles */
      const groups = {
         vectorial: ['ai', 'svg', 'pdf', 'png', 'jpg'],
         audio: ['mp3', 'wav'],
         imagen: ['jpg'],
         pdf: ['pdf'],
         documento: ['docx'],
         video: ['mp4'],
         powerpoint: ['pptx'],
         email: ['oft', 'eml'],
         fuentes: ['otf', 'ttf'],
         zip: ['zip'],
      };
      const fmts = groups[group] || ['png', 'jpg'];
      const fc = document.querySelector('#modal-download .format-container');
      const fDiv = fc.querySelector('.format');

      if (fmts.length > 1) {
         fc.style.display = '';
         fDiv.innerHTML = fmts
            .map(
               (e, i) => `
        <label for="${e}">
          <input type="radio" name="format" id="${e}" value="${e}" class="format-file" ${!i ? 'checked' : ''}>
          <p class="format-select">.${e}</p>
        </label>`
            )
            .join('');
         fDiv.querySelectorAll('input:not(:checked)').forEach((r) => (r.disabled = true));
         setTimeout(() => fDiv.querySelectorAll('input').forEach((r) => (r.disabled = false)), 300);
      } else {
         fc.style.display = 'none';
      }
   });
});

/* ────────────────────────────────────────────────────────────── */
/* 4 · Términos / descarga / cierre                               */
/* ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
   const terms = document.getElementById('terms'),
      btn = document.getElementById('download-btn'),
      td = document.getElementById('toggle-disclaimer'),
      dc = document.getElementById('disclaimer-content');

   terms.onchange = () => (btn.disabled = !terms.checked);
   td.onclick = () =>
      (dc.style.maxHeight =
         !dc.style.maxHeight || dc.style.maxHeight === '0px' ? dc.scrollHeight + 'px' : '0px');

   document.getElementById('download-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const d = window._downloadData;
      const sel = document.querySelector('input[name="format"]:checked');
      const def = {
         imagen: 'jpg',
         pdf: 'pdf',
         documento: 'docx',
         video: 'mp4',
         powerpoint: 'pptx',
         email: 'eml',
         fuentes: 'ttf',
         zip: 'zip',
      };
      const fmt = sel ? sel.value : def[d.group] || d.originalExtension;

      const singles = [
         'imagen',
         'pdf',
         'documento',
         'video',
         'powerpoint',
         'email',
         'fuentes',
         'zip',
      ];
      const fname =
         fmt === 'jpg'
            ? d.jpgSuffix
               ? `${d.fileName}${d.jpgSuffix}.jpg`
               : `${d.fileName}.jpg`
            : `${d.fileName}.${fmt}`;

      const url = singles.includes(d.group)
         ? d.originalSrc.replace(/\.[^/.]+$/, `.${fmt}`)
         : fmt === 'jpg'
           ? `${d.basePath}jpg/${fname}`
           : `${d.basePath}${fmt}/${fname}`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      Fancybox.close();
   });
});

/* ────────────────────────────────────────────────────────────── */
/* 5 · Botón mute/unmute preludios                                */
/* ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
   document.querySelectorAll('.cs-masked-media.video-container').forEach((cont) => {
      const v = cont.querySelector('video');
      if (!v) return;
      cont.style.position = 'relative';
      const btn = document.createElement('button');
      Object.assign(btn.style, {
         position: 'absolute',
         top: '50%',
         left: '50%',
         transform: 'translate(-50%,-50%)',
         background: '#ffffffcc',
         border: 'none',
         cursor: 'pointer',
         borderRadius: '50%',
         padding: '14px',
         opacity: 0,
         transition: 'opacity .3s',
      });
      const img = document.createElement('img');
      Object.assign(img.style, { width: '32px', height: '32px' });
      img.src = '../assets/img/icons/unmute.svg';
      btn.appendChild(img);
      cont.appendChild(btn);
      cont.onmouseenter = () => (btn.style.opacity = 1);
      cont.onmouseleave = () => (btn.style.opacity = 0);
      btn.onclick = (e) => {
         e.preventDefault();
         v.muted = !v.muted;
         img.src = v.muted ? '../assets/img/icons/unmute.svg' : '../assets/img/icons/mute.svg';
      };
   });
});
