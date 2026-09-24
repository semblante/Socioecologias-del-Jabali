/**
 * Entrada suave de bloques al hacer scroll. Lo que ya está en pantalla al
 * cargar no se anima (evita el parpadeo encima de la transición de página);
 * lo que está más abajo entra al cruzar el viewport, en cascada corta.
 */
const TARGETS = [
  '.about__inner',
  '.strip__item',
  '.terra__head',
  '.terra .site-map',
  '.notes__head',
  '.notes__item',
  '.prose > *',
  '.journal__item',
  '.team-heading',
  '.team-list > li',
  '.pub-item',
  '.prod-item',
  '.obj-item',
  '.archivo-item',
  '.sitio',
  '.territorio__sub',
  '.territorio__secondary-lead',
  '.sitio-list__item',
  '.territorio__map',
  '.site-footer__grid',
].join(',');

let observer: IntersectionObserver | null = null;

function initReveal() {
  observer?.disconnect();
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  observer = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((e) => e.isIntersecting);
      entering.forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        el.style.transitionDelay = `${Math.min(i, 4) * 70}ms`;
        el.classList.add('is-in');
        observer?.unobserve(el);
        // Limpia el retraso para que no afecte hovers posteriores.
        window.setTimeout(() => (el.style.transitionDelay = ''), 1200);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  const fold = window.innerHeight * 0.92;
  document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
    if (el.classList.contains('is-in')) return;
    // El footer persiste entre páginas: si quedó pendiente, hay que volver a
    // observarlo con el observer nuevo o se queda invisible para siempre.
    if (!el.classList.contains('reveal')) {
      if (el.getBoundingClientRect().top < fold) return;
      el.classList.add('reveal');
    }
    observer?.observe(el);
  });
}

// Igual que letters.ts: el evento puede llegar antes que este módulo.
document.addEventListener('astro:page-load', initReveal);
initReveal();
