// 1. Crear el modal dinámicamente y agregarlo al DOM
(function createDownloadModal() {
  const modalDiv = document.createElement("div");
  modalDiv.style.display = "none";
  modalDiv.id = "modal-download";
  modalDiv.innerHTML = `
			<form id="download-form">
					<div id="download-file" class="">
							<img src="" alt="">
					</div>

					<div class="format-container">
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

					<button type="submit" id="download-btn" disabled>Descargar <span class="cs-icon cs-icon-comustock"></span></button>
			</form>
	`;
  document.body.appendChild(modalDiv);
})();

// 2. Configurar Fancybox
Fancybox.bind("[data-fancybox]", {
  animationEffect: "zoom-in-out",
});

// 3. Extraer datos del enlace y actualizar el modal antes de abrirlo
document.querySelectorAll("[data-fancybox]").forEach(function (anchor) {
  anchor.addEventListener("click", function () {
    // Buscar el contenedor principal
    const container = anchor.closest(".cs-masked-block");
    // Extraer la imagen del contenedor
    const imgElement = container.querySelector("img");
    const imgSrc = imgElement.getAttribute("src");
    const imgAlt = imgElement.getAttribute("alt");

    // Actualizar la imagen del modal
    const modalImg = document.querySelector(
      "#modal-download #download-file img"
    );
    modalImg.src = imgSrc;
    modalImg.alt = imgAlt;

    // Extraer de forma dinámica la clase de fondo (aquella que empieza por "bg-")
    const mediaContainer = container.querySelector(".cs-masked-media");
    let bgClass = "";
    if (mediaContainer) {
      mediaContainer.classList.forEach(function (cl) {
        if (cl.indexOf("bg-") === 0) {
          bgClass = cl;
        }
      });
    }
    // Actualizar el div del modal con el fondo obtenido
    const downloadFileDiv = document.getElementById("download-file");
    downloadFileDiv.className = "";
    if (bgClass) {
      downloadFileDiv.classList.add(bgClass);
    }

    // Parsear la URL de la imagen para extraer basePath, fileName, etc.
    // Ejemplo: "../content/identidad/telecom/logos/svg/telecom_blanco.svg"
    const parts = imgSrc.split("/");
    const basePath = parts.slice(0, parts.length - 2).join("/") + "/";
    const folder = parts[parts.length - 2];
    const filenameWithExt = parts[parts.length - 1];
    const dotIndex = filenameWithExt.lastIndexOf(".");
    const fileName = filenameWithExt.substring(0, dotIndex);
    const originalExtension = filenameWithExt.substring(dotIndex + 1);

    // Extraer el nombre especial para JPG, si está definido en el contenedor
    const jpgFilename = container.getAttribute("data-jpg-filename");

    // Guardar estos datos para la descarga
    window._downloadData = {
      basePath,
      fileName,
      originalFolder: folder,
      originalExtension,
      originalSrc: imgSrc,
      alt: imgAlt,
      jpgFilename: jpgFilename ? jpgFilename : fileName + ".jpg",
    };

    // Desactivar temporalmente los radio button (todos excepto png)
    const radioButtons = document.querySelectorAll(
      '#download-form input[type="radio"]'
    );
    radioButtons.forEach((radio) => {
      if (radio.value !== "png") {
        radio.disabled = true;
      }
    });
    // Luego, después de 300ms, habilitarlos para que el usuario pueda seleccionar
    setTimeout(() => {
      radioButtons.forEach((radio) => {
        radio.disabled = false;
      });
    }, 300);
  });
});

// 4. Manejo de eventos dentro del modal
document.addEventListener("DOMContentLoaded", function () {
  const termsCheckbox = document.getElementById("terms");
  const downloadBtn = document.getElementById("download-btn");
  const toggleDisclaimer = document.getElementById("toggle-disclaimer");
  const disclaimerContent = document.getElementById("disclaimer-content");

  // Habilitar o deshabilitar el botón según el checkbox
  termsCheckbox.addEventListener("change", function () {
    downloadBtn.disabled = !this.checked;
  });

  // Alternar el disclaimer con animación (ajustando maxHeight dinámicamente)
  toggleDisclaimer.addEventListener("click", function () {
    if (
      disclaimerContent.style.maxHeight &&
      disclaimerContent.style.maxHeight !== "0px"
    ) {
      // Si ya está expandido, colapsarlo
      disclaimerContent.style.maxHeight = "0px";
      toggleDisclaimer.textContent = "términos y condiciones";
    } else {
      // Si está colapsado, expandirlo dinámicamente según su contenido
      disclaimerContent.style.maxHeight = disclaimerContent.scrollHeight + "px";
      toggleDisclaimer.textContent = "términos y condiciones";
    }
  });

  // Envío del formulario para descargar el archivo
  document
    .getElementById("download-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      // Obtener el formato seleccionado (por defecto, png)
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
        // Si es JPG, usar el nombre especial definido en data-jpg-filename
        fileNameToDownload = downloadData.jpgFilename;
        fileUrl =
          downloadData.basePath + selectedFormat + "/" + fileNameToDownload;
      } else {
        fileNameToDownload = downloadData.fileName + "." + selectedFormat;
        fileUrl =
          downloadData.basePath + selectedFormat + "/" + fileNameToDownload;
      }
      console.log("URL de descarga:", fileUrl);

      // Crear un enlace temporal para iniciar la descarga
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileNameToDownload;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cerrar el modal Fancybox (opcional)
      Fancybox.close();
    });
});
