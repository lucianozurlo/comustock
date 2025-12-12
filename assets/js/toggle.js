// Evitamos el scroll automático al cambiar de hash
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

document.addEventListener("DOMContentLoaded", function () {
  const toggleLinks = document.querySelectorAll(".toggle-link");

  /**
   * Activa el target: añade la clase, espera y luego muestra contenido + scroll.
   * @param {string} targetId — id del contenedor a activar
   * @param {number} delay — retardo en milisegundos antes de mostrar+scrollear
   */
  function activate(targetId, delay) {
    const target = document.getElementById(targetId);
    if (!target) return;

    // 1. Agregar solo la clase inmediatamente
    target.classList.add("is-active");

    // 2. Tras el retardo, mostrar contenido y scrollear
    setTimeout(() => {
      const content = target.querySelector(".cs-toggles-item--content");
      if (content) content.style.display = "block";

      const productos = document.getElementById("productos");
      if (!productos) return;
      window.scrollTo({
        top: productos.offsetTop - 221,
        behavior: "smooth",
      });
    }, delay);
  }

  // — Handlers de click (misma página: retardo 0.1s) —
  toggleLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      activate(this.dataset.target, 100); // 100 ms = 0.1 s
    });
  });

  // — Si abrís con hash en la URL (otra página: retardo 1s) —
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    activate(initialHash, 1000); // 1000 ms = 1 s
  }
});
