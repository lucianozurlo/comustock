// 1. Crear el modal dinámicamente
(function createDownloadModal() {
   const modalDiv = document.createElement('div');
   modalDiv.id = 'modal-download';
   modalDiv.style.display = 'none';
   modalDiv.innerHTML = `
    <form id="download-form">
      <div id="download-file" class="download-file-custom" style="padding: 0;">
        <img src="" alt="">
      </div>
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
   document.body.appendChild(modalDiv);
})();

// 2. Inicializar Fancybox v5
Fancybox.bind('[data-fancybox]', {
   animationEffect: 'zoom-in-out',
   on: {
      destroy: () => {
         console.log('El modal se cerró');
         const mv = document.getElementById('custom-video');
         if (mv) mv.pause();
      },
   },
});

// 3. Click-handler para abrir y poblar el modal
document.querySelectorAll('[data-fancybox]').forEach((anchor) => {
   anchor.addEventListener('click', () => {
      const container = anchor.closest('.cs-masked-block');

      // Mute preview video al abrir
      const previewVid = container.querySelector('video');
      if (previewVid) previewVid.muted = true;

      // Media (video o imagen)
      const media = container.querySelector('video') || container.querySelector('img');
      const src = media.getAttribute('src');
      const alt = media.getAttribute('alt') || '';

      // Extraer fondo bg-*
      const mc = container.querySelector('.cs-masked-media');
      let bg = '';
      mc.classList.forEach((c) => {
         if (c.startsWith('bg-')) bg = c;
      });

      // Preparar contenedor del modal
      const dl = document.getElementById('download-file');
      dl.className = 'download-file-custom';
      if (bg) dl.classList.add(bg);
      dl.innerHTML = '';

      // Parse URL
      const parts = src.split('/');
      const basePath = parts.slice(0, -2).join('/') + '/';
      const fnameExt = parts.pop();
      const dotIdx = fnameExt.lastIndexOf('.');
      const fname = fnameExt.slice(0, dotIdx);
      const ext = fnameExt.slice(dotIdx + 1).toLowerCase();

      const jpgSuffix = container.dataset.jpgFilename || '';
      const group = container.dataset.fileGroup || 'vectorial';

      // Guardar datos
      window._downloadData = {
         basePath,
         fileName: fname,
         originalExtension: ext,
         originalSrc: src,
         alt,
         jpgSuffix,
         group,
      };

      // Preview en el modal
      if (group === 'audio' || group === 'video') {
         dl.innerHTML = `
        <div class="video-container" style="position:relative;width:100%;">
          <video id="custom-video" preload="auto" style="width:100%;display:block;">
            <source src="${src}" type="video/mp4">
            Tu navegador no soporta el elemento de video.
          </video>
          <button id="video-play" class="video-control"
                  style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                         background:none;border:none;cursor:pointer;border-radius:0;">
            <img src="../assets/img/iconos/audio/play.svg" alt="Play"
                 style="width:48px;height:48px;border-radius:0;">
          </button>
          <button id="video-stop" class="video-control"
                  style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                         background:none;border:none;cursor:pointer;display:none;border-radius:0;">
            <img src="../assets/img/iconos/audio/stop.svg" alt="Stop"
                 style="width:48px;height:48px;border-radius:0;">
          </button>
        </div>`;

         // Controles play/stop
         const video = document.getElementById('custom-video');
         const playBtn = document.getElementById('video-play');
         const stopBtn = document.getElementById('video-stop');
         const vc = dl.querySelector('.video-container');

         playBtn.addEventListener('click', (e) => {
            e.preventDefault();
            video.play();
            playBtn.style.display = 'none';
            stopBtn.style.display = 'block';
         });
         vc.addEventListener('mouseenter', () => {
            if (!video.paused) stopBtn.style.display = 'block';
         });
         vc.addEventListener('mouseleave', () => {
            if (!video.paused) stopBtn.style.display = 'none';
         });
         stopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            video.pause();
            stopBtn.style.display = 'none';
            playBtn.style.display = 'block';
         });
         video.addEventListener('ended', () => {
            playBtn.style.display = 'block';
            stopBtn.style.display = 'none';
         });
      } else {
         dl.innerHTML = `<img src="${src}" alt="${alt}">`;
      }

      // Generar formatos según grupo
      let formats;
      switch (group) {
         case 'vectorial':
            formats = ['ai', 'svg', 'pdf', 'png', 'jpg'];
            break;
         case 'audio':
            formats = ['mp3', 'wav'];
            break;
         case 'imagen':
            formats = ['jpg'];
            break;
         case 'pdf':
            formats = ['pdf'];
            break;
         case 'documento':
            formats = ['docx'];
            break;
         case 'video':
            formats = ['mp4'];
            break;
         case 'powerpoint':
            formats = ['pptx'];
            break;
         case 'email':
            formats = ['oft', 'eml'];
            break;
         case 'fuentes':
            formats = ['otf', 'ttf'];
            break;
         case 'zip':
            formats = ['zip'];
            break;
         default:
            formats = ['png', 'jpg'];
      }

      const fc = document.querySelector('#modal-download .format-container');
      const fDiv = fc.querySelector('.format');

      if (formats.length > 1) {
         fc.style.display = '';
         fDiv.innerHTML = formats
            .map(
               (e, i) => `
        <label for="${e}">
          <input type="radio" name="format" class="format-file" id="${e}" value="${e}" ${i === 0 ? 'checked' : ''} />
          <p class="format-select">.${e}</p>
        </label>
      `
            )
            .join('');
         fDiv.querySelectorAll('input').forEach((r) => {
            if (!r.checked) r.disabled = true;
         });
         setTimeout(() => {
            fDiv.querySelectorAll('input').forEach((r) => (r.disabled = false));
         }, 300);
      } else {
         // Oculto selector si solo hay un formato
         fc.style.display = 'none';
      }
   });
});

// 4. Términos y envío (cerrar modal al descargar)
document.addEventListener('DOMContentLoaded', () => {
   const terms = document.getElementById('terms');
   const btn = document.getElementById('download-btn');
   const td = document.getElementById('toggle-disclaimer');
   const dc = document.getElementById('disclaimer-content');

   terms.addEventListener('change', () => (btn.disabled = !terms.checked));

   td.addEventListener('click', () => {
      dc.style.maxHeight =
         dc.style.maxHeight === '0px' || !dc.style.maxHeight ? dc.scrollHeight + 'px' : '0px';
   });

   document.getElementById('download-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const selInput = document.querySelector('input[name="format"]:checked');

      // mapping de grupos single-format a su extensión
      const defaultExt = {
         imagen: 'jpg',
         pdf: 'pdf',
         documento: 'docx',
         video: 'mp4',
         powerpoint: 'pptx',
         email: 'eml',
         fuentes: 'ttf',
         zip: 'zip',
      };

      const fmt = selInput
         ? selInput.value
         : defaultExt[window._downloadData.group] || window._downloadData.originalExtension;

      const d = window._downloadData;
      const group = d.group;
      let fname, url;

      // Nombre para .jpg con sufijo
      if (fmt === 'jpg') {
         fname = d.jpgSuffix ? `${d.fileName}${d.jpgSuffix}.jpg` : `${d.fileName}.jpg`;
      } else {
         fname = `${d.fileName}.${fmt}`;
      }

      // Grupos single-format
      const single = [
         'imagen',
         'pdf',
         'documento',
         'video',
         'powerpoint',
         'email',
         'fuentes',
         'zip',
      ];
      if (single.includes(group)) {
         url = d.originalSrc.replace(/\.[^/.]+$/, `.${fmt}`);
      } else if (fmt === 'jpg') {
         url = `${d.basePath}jpg/${fname}`;
      } else {
         url = `${d.basePath}${fmt}/${fname}`;
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = fname;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Fancybox.close();
   });
});
