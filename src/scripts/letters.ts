/**
 * Entrada letra por letra de los títulos display. Dos modos, según
 * siteConfig.intro (queda en <html data-intro>):
 *
 * - 'flicker': cada letra se enciende como tubo fluorescente, con retraso,
 *   ritmo (flick-a/b/c) y duración propios, al azar.
 * - 'sweep': cada letra viaja de izquierda a derecha; la primera en moverse es
 *   la más cercana al borde derecho. El retraso sale de la posición real de
 *   cada letra, así todas las líneas barren igual.
 *
 * Mientras las fuentes cargan, la animación queda en pausa (html.fonts-pending).
 */
const SELECTOR = '.hero__title, .page-header__title';
// Pausa inicial: deja terminar el fundido del bloque antes del barrido.
const LEAD_MS = 240;
// Duración total del barrido de derecha a izquierda.
const SWEEP_MS = 760;

function split(el: HTMLElement) {
  if (el.dataset.split === '1') return;
  const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
  if (!text) return;
  el.dataset.split = '1';
  el.setAttribute('aria-label', text);

  const words = text.split(' ');
  const wrap = document.createElement('span');
  wrap.setAttribute('aria-hidden', 'true');

  words.forEach((word, w) => {
    // La palabra es inline-block y no se parte: el balanceo de líneas sigue intacto.
    const ws = document.createElement('span');
    ws.className = 'split-word';
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = 'split-ch';
      c.textContent = ch;
      ws.appendChild(c);
    }
    wrap.appendChild(ws);
    if (w < words.length - 1) wrap.appendChild(document.createTextNode(' '));
  });

  el.replaceChildren(wrap);
  schedule(el);
}

// Modo fluorescente: ventana en la que se reparten los encendidos.
const FLICKER_WINDOW_MS = 1100;
const FLICKS = ['flick-a', 'flick-b', 'flick-c'];

const mode = () => document.documentElement.dataset.intro === 'sweep' ? 'sweep' : 'flicker';

/** Cada letra con su propio encendido: tiempo, ritmo y duración al azar. */
function scheduleFlicker(el: HTMLElement) {
  el.querySelectorAll<HTMLElement>('.split-ch').forEach((c) => {
    if (c.style.getPropertyValue('--ch-flick')) return; // ya sorteada
    c.style.setProperty('--ch-delay', `${Math.round(LEAD_MS + Math.random() * FLICKER_WINDOW_MS)}ms`);
    c.style.setProperty('--ch-flick', FLICKS[Math.floor(Math.random() * FLICKS.length)]);
    c.style.setProperty('--ch-dur', `${Math.round(700 + Math.random() * 500)}ms`);
  });
}

function schedule(el: HTMLElement) {
  if (mode() === 'flicker') scheduleFlicker(el);
  else scheduleSweep(el);
}

/** Retraso por distancia al borde derecho, medido sobre el layout real. */
function scheduleSweep(el: HTMLElement) {
  const chars = [...el.querySelectorAll<HTMLElement>('.split-ch')];
  if (!chars.length) return;
  const rects = chars.map((c) => c.getBoundingClientRect());
  const right = Math.max(...rects.map((r) => r.right));
  const left = Math.min(...rects.map((r) => r.left));
  const span = Math.max(right - left, 1);
  chars.forEach((c, i) => {
    const delay = LEAD_MS + ((right - rects[i].right) / span) * SWEEP_MS;
    c.style.setProperty('--ch-delay', `${Math.round(delay)}ms`);
  });
}

function initLetters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const titles = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
  titles.forEach(split);
  // Barrido: con las fuentes definitivas cambian anchos y cortes de línea; se vuelve a medir.
  if (mode() === 'sweep') document.fonts?.ready.then(() => titles.forEach(scheduleSweep));
}

// page-load cubre la navegación; la llamada directa, la carga inicial (el
// evento puede dispararse antes de que este módulo registre el listener).
document.addEventListener('astro:page-load', initLetters);
initLetters();
