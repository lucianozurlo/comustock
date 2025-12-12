document.addEventListener("DOMContentLoaded", function () {
  const copyElements = document.querySelectorAll(".copy");

  copyElements.forEach(function (copyElement) {
    copyElement.addEventListener("click", function () {
      // Extrae el valor hexadecimal del <strong>
      const hexColor = this.querySelector("strong").innerText.trim();

      // Copia el texto usando la API del portapapeles
      navigator.clipboard
        .writeText(hexColor)
        .then(function () {
          // Cambia el tooltip a "Color copiado"
          copyElement.setAttribute("data-tooltip", "Color copiado");

          // Reestablece el tooltip a "Copiar" después de 2 segundos
          setTimeout(() => {
            copyElement.setAttribute("data-tooltip", "Copiar");
          }, 2000);
        })
        .catch(function (err) {
          console.error("Error al copiar en el portapapeles:", err);
        });
    });
  });
});
