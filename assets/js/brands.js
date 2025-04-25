// let timeout;
// document.addEventListener("scroll", function() {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//         if (window.scrollY >= 36) {
//             document.body.classList.add("scrolled");
//         } else {
//             document.body.classList.remove("scrolled");
//         }
//     }, 10);
// });

/* sticky divs */
// Desactivamos la restauración automática del scroll si es compatible
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".brand-section");
  const menuLinks = document.querySelectorAll(".side-menu a");

  // Al hacer click en cada link del side menu
  menuLinks.forEach((link, index) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation(); // Evita que otros handlers se disparen

      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      // Para el primer enlace usamos offset 282, para los demás 221
      let offset = index === 0 ? 282 : 221;
      window.scrollTo({
        top: targetSection.offsetTop - offset,
        behavior: "smooth",
      });
    });
  });

  // Detectar en qué sección estamos y marcar el enlace activo
  window.addEventListener("scroll", function () {
    let currentSection = sections[0].id; // Por defecto, la primera sección
    sections.forEach((section, i) => {
      // Usamos el mismo offset que para el scroll en función del índice
      let effectiveOffset = i === 0 ? 282 : 221;
      if (window.pageYOffset >= section.offsetTop - effectiveOffset) {
        currentSection = section.id;
      }
    });
    menuLinks.forEach((link) => {
      if (link.getAttribute("href").substring(1) === currentSection) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });

  // Forzar la ejecución del evento scroll al cargar la página para activar el primer enlace
  window.dispatchEvent(new Event("scroll"));

  // Al cargar la página, si hay hash en la URL, anular el scroll automático y aplicar el scroll con offset
  window.addEventListener("load", function () {
    window.scrollTo(0, 0);
    setTimeout(function () {
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          let index = 0;
          menuLinks.forEach((link, i) => {
            if (link.getAttribute("href").substring(1) === targetId) {
              index = i;
            }
          });
          let offset = index === 0 ? 282 : 221;
          window.scrollTo({
            top: targetSection.offsetTop - offset,
            behavior: "smooth",
          });
        }
      }
    }, 500);
  });

  // Si se cambia el hash estando la página activa, aplicamos el scroll con offset
  window.addEventListener("hashchange", function () {
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        let index = 0;
        menuLinks.forEach((link, i) => {
          if (link.getAttribute("href").substring(1) === targetId) {
            index = i;
          }
        });
        let offset = index === 0 ? 282 : 221;
        window.scrollTo({
          top: targetSection.offsetTop - offset,
          behavior: "smooth",
        });
      }
    }
  });
});
