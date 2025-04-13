// 1. Crear el modal dinámicamente y agregarlo al DOM
(function createDownloadModal() {
  const modalDiv = document.createElement("div");
  modalDiv.style.display = "none";
  modalDiv.id = "modal-download";
  modalDiv.innerHTML = `
    <form id="download-form">
      <div id="download-file" class="download-file-custom" style="padding: 0;">
        <img src="" alt="">
      </div>
      <div class="format-container">
        <p>Elegí el formato:</p>
        <div class="format">
          <!-- Opciones por defecto para imágenes -->
          <label for="png">
            <input type="radio" name="format" class="format-file" id="png" value="png" checked />
            <p class="format-select">.png</p>
          </label>
          <label for="jpg">
            <input type="radio" name="format" class="format-file" id="jpg" value="jpg" />
            <p class="format-select">.jpg</p>
          </label>
          <label for="ai">
            <input type="radio" name="format" class="format-file" id="ai" value="ai" />
            <p class="format-select">.ai</p>
          </label>
          <label for="svg">
            <input type="radio" name="format" class="format-file" id="svg" value="svg" />
            <p class="format-select">.svg</p>
          </label>
          <label for="pdf">
            <input type="radio" name="format" class="format-file" id="pdf" value="pdf" />
            <p class="format-select">.pdf</p>
          </label>
        </div>
      </div>
      <input type="checkbox" id="terms" name="terms">
      <div class="disclaimer">
        Acepto los <a href="javascript:void(0);" id="toggle-disclaimer">términos y condiciones</a>
        <div id="disclaimer-content" class="disclaimer-content">
          <p>
            Disclaimer Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis amet harum sed id
            quidem dolorem temporibus vitae ipsam totam aperiam expedita facere aut delectus, inventore placeat
            mayores fuga! Incidunt, debitis?
          </p>
        </div>
      </div>
      <button type="submit" id="download-btn" disabled>
        Descargar <span class="cs-icon cs-icon-comustock"></span>
      </button>
    </form>
  `;
  document.body.appendChild(modalDiv);
})();

// 2. Configurar Fancybox para abrir el modal y detectar el cierre (Fancybox v5)
Fancybox.bind("[data-fancybox]", {
  animationEffect: "zoom-in-out",
  on: {
    destroy: (instance, slide) => {
      console.log("El modal se cerró");
      const modalVideo = document.getElementById("custom-video");
      if (modalVideo) {
        modalVideo.pause();
      }
    },
  },
});

// 3. Extraer datos del enlace y actualizar el modal antes de abrirlo
document.querySelectorAll("[data-fancybox]").forEach(function (anchor) {
  anchor.addEventListener("click", function () {
    const container = anchor.closest(".cs-masked-block");

    // Forzar que si hay video en preview se mutee al abrir el modal
    const previewVideo = container.querySelector("video");
    if (previewVideo) {
      previewVideo.muted = true;
    }

    // Buscar primero un video; si no existe, buscar una imagen.
    let mediaElement =
      container.querySelector("video") || container.querySelector("img");
    const mediaSrc = mediaElement.getAttribute("src");
    const mediaAlt = mediaElement.getAttribute("alt") || "";

    // Extraer la clase de fondo (aquella que empieza por "bg-")
    const mediaContainer = container.querySelector(".cs-masked-media");
    let bgClass = "";
    if (mediaContainer) {
      mediaContainer.classList.forEach(function (cl) {
        if (cl.indexOf("bg-") === 0) {
          bgClass = cl;
        }
      });
    }
    const downloadFileDiv = document.getElementById("download-file");
    downloadFileDiv.className = "download-file-custom";
    if (bgClass) {
      downloadFileDiv.classList.add(bgClass);
    }

    // Parsear la URL para extraer basePath, fileName y extensión.
    const parts = mediaSrc.split("/");
    const basePath = parts.slice(0, parts.length - 2).join("/") + "/";
    const folder = parts[parts.length - 2];
    const filenameWithExt = parts[parts.length - 1];
    const dotIndex = filenameWithExt.lastIndexOf(".");
    const fileName = filenameWithExt.substring(0, dotIndex);
    const originalExtension = filenameWithExt
      .substring(dotIndex + 1)
      .toLowerCase();

    // Extraer nombre especial para JPG, si existe.
    const jpgFilename = container.getAttribute("data-jpg-filename");
    window._downloadData = {
      basePath,
      fileName,
      originalFolder: folder,
      originalExtension,
      originalSrc: mediaSrc,
      alt: mediaAlt,
      jpgFilename: jpgFilename ? jpgFilename : fileName + ".jpg",
    };

    // ¡Importante! Vaciar el contenido del contenedor para reiniciar la estructura.
    downloadFileDiv.innerHTML = "";

    // Actualizar el contenido visual del modal según el tipo de archivo.
    if (originalExtension === "mp4") {
      downloadFileDiv.innerHTML = `
        <div class="video-container" style="position: relative; width: 100%;">
          <video id="custom-video" style="width: 100%; display: block;" preload="auto">
            <source src="${mediaSrc}" type="video/mp4">
            Tu navegador no soporta el elemento de video.
          </video>
          <button id="video-play" class="video-control"
                  style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                         background: none; border: none; cursor: pointer; border-radius: 0;">
            <img src="../assets/img/icons/play.svg" alt="Play" style="width:48px; height:48px; border-radius: 0;">
          </button>
          <button id="video-stop" class="video-control"
                  style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                         background: none; border: none; cursor: pointer; display: none; border-radius: 0;">
            <img src="../assets/img/icons/stop.svg" alt="Stop" style="width:48px; height:48px; border-radius: 0;">
          </button>
        </div>
      `;

      const video = document.getElementById("custom-video");
      const playBtn = document.getElementById("video-play");
      const stopBtn = document.getElementById("video-stop");
      const videoContainer = document.querySelector(".video-container");

      playBtn.addEventListener("click", function (e) {
        e.preventDefault();
        video.play();
        playBtn.style.display = "none";
        stopBtn.style.display = "block";
      });

      videoContainer.addEventListener("mouseenter", function () {
        if (!video.paused) {
          stopBtn.style.display = "block";
        }
      });
      videoContainer.addEventListener("mouseleave", function () {
        if (!video.paused) {
          stopBtn.style.display = "none";
        }
      });

      stopBtn.addEventListener("click", function (e) {
        e.preventDefault();
        video.pause();
        stopBtn.style.display = "none";
        playBtn.style.display = "block";
      });

      video.addEventListener("ended", function () {
        playBtn.style.display = "block";
        stopBtn.style.display = "none";
      });
    } else {
      downloadFileDiv.innerHTML = `<img src="${mediaSrc}" alt="${mediaAlt}">`;
    }

    // Actualizar opciones de formato según el tipo de archivo
    const formatContainer = document.querySelector(
      "#modal-download .format-container"
    );
    if (originalExtension === "mp4") {
      formatContainer.innerHTML = `
        <p>Elegí el formato:</p>
        <div class="format">
          <label for="mp3">
            <input type="radio" name="format" class="format-file" id="mp3" value="mp3" checked />
            <p class="format-select">.mp3</p>
          </label>
          <label for="wav">
            <input type="radio" name="format" class="format-file" id="wav" value="wav" />
            <p class="format-select">.wav</p>
          </label>
        </div>
      `;
    } else {
      formatContainer.innerHTML = `
        <p>Elegí el formato:</p>
        <div class="format">
          <label for="png">
            <input type="radio" name="format" class="format-file" id="png" value="png" checked />
            <p class="format-select">.png</p>
          </label>
          <label for="jpg">
            <input type="radio" name="format" class="format-file" id="jpg" value="jpg" />
            <p class="format-select">.jpg</p>
          </label>
          <label for="ai">
            <input type="radio" name="format" class="format-file" id="ai" value="ai" />
            <p class="format-select">.ai</p>
          </label>
          <label for="svg">
            <input type="radio" name="format" class="format-file" id="svg" value="svg" />
            <p class="format-select">.svg</p>
          </label>
          <label for="pdf">
            <input type="radio" name="format" class="format-file" id="pdf" value="pdf" />
            <p class="format-select">.pdf</p>
          </label>
        </div>
      `;
    }

    // Desactivar temporalmente los radio buttons (los no seleccionados)
    const radioButtons = document.querySelectorAll(
      '#download-form input[type="radio"]'
    );
    radioButtons.forEach((radio) => {
      if (!radio.checked) {
        radio.disabled = true;
      }
    });
    setTimeout(() => {
      radioButtons.forEach((radio) => {
        radio.disabled = false;
      });
    }, 300);
  });
});

// 4. Manejo de eventos dentro del modal (términos y envío)
document.addEventListener("DOMContentLoaded", function () {
  const termsCheckbox = document.getElementById("terms");
  const downloadBtn = document.getElementById("download-btn");
  const toggleDisclaimer = document.getElementById("toggle-disclaimer");
  const disclaimerContent = document.getElementById("disclaimer-content");

  termsCheckbox.addEventListener("change", function () {
    downloadBtn.disabled = !this.checked;
  });

  toggleDisclaimer.addEventListener("click", function () {
    if (
      disclaimerContent.style.maxHeight &&
      disclaimerContent.style.maxHeight !== "0px"
    ) {
      disclaimerContent.style.maxHeight = "0px";
      toggleDisclaimer.textContent = "términos y condiciones";
    } else {
      disclaimerContent.style.maxHeight = disclaimerContent.scrollHeight + "px";
      toggleDisclaimer.textContent = "términos y condiciones";
    }
  });

  document
    .getElementById("download-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const selectedFormat = document.querySelector(
        'input[name="format"]:checked'
      ).value;
      console.log("Formato seleccionado:", selectedFormat);
      const downloadData = window._downloadData;
      if (!downloadData) {
        alert("No se pudieron obtener los datos del archivo.");
        return;
      }
      let fileUrl, fileNameToDownload;
      if (selectedFormat === "jpg" && downloadData.jpgFilename) {
        fileNameToDownload = downloadData.jpgFilename;
        fileUrl =
          downloadData.basePath + selectedFormat + "/" + fileNameToDownload;
      } else {
        fileNameToDownload = downloadData.fileName + "." + selectedFormat;
        fileUrl =
          downloadData.basePath + selectedFormat + "/" + fileNameToDownload;
      }
      console.log("URL de descarga:", fileUrl);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileNameToDownload;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (downloadData.originalExtension !== "mp4") {
        Fancybox.close();
      }
    });
});

// 5. Configurar mute/unmute para videos en preview
document.addEventListener("DOMContentLoaded", function () {
  const previewContainers = document.querySelectorAll(
    ".cs-masked-block .cs-masked-media.video-container"
  );
  previewContainers.forEach(function (container) {
    const video = container.querySelector("video");
    if (!video) return;
    const muteBtn = document.createElement("button");
    muteBtn.classList.add("mute-toggle");
    muteBtn.style.position = "absolute";
    muteBtn.style.top = "50%";
    muteBtn.style.left = "50%";
    muteBtn.style.transform = "translate(-50%, -50%)";
    muteBtn.style.background = "none";
    muteBtn.style.border = "none";
    muteBtn.style.cursor = "pointer";
    muteBtn.style.borderRadius = "0";
    const iconImg = document.createElement("img");
    iconImg.src = "../assets/img/icons/unmute.svg";
    iconImg.alt = "Unmute";
    iconImg.style.width = "48px";
    iconImg.style.height = "48px";
    iconImg.style.opacity = "0";
    iconImg.style.transition = "opacity 0.3s";
    iconImg.style.borderRadius = "0";
    muteBtn.appendChild(iconImg);
    container.style.position = "relative";
    container.appendChild(muteBtn);
    container.addEventListener("mouseenter", function () {
      iconImg.style.opacity = "1";
    });
    container.addEventListener("mouseleave", function () {
      iconImg.style.opacity = "0";
    });
    muteBtn.addEventListener("click", function (e) {
      e.preventDefault();
      video.muted = !video.muted;
      if (video.muted) {
        iconImg.src = "../assets/img/icons/unmute.svg";
        iconImg.alt = "Unmute";
      } else {
        iconImg.src = "../assets/img/icons/mute.svg";
        iconImg.alt = "Mute";
      }
    });
  });
});
