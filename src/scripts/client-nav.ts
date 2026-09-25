import { swapFunctions } from 'astro:transitions/client';
import { metaAfterNavigation, nextLangHrefs } from '../lib/cuaderno-locale';
import { surfaceFromPath, topoFromPath, topoStyle } from '../lib/surface';

/** Funde el relieve de fondo hacia el de la vista nueva (dissolve de ~1,4 s). */
function crossfadeTopo(path: string) {
  const layers = [...document.querySelectorAll<HTMLElement>('[data-topo-layer]')];
  const active = layers.find((l) => l.classList.contains('is-active'));
  const next = layers.find((l) => l !== active);
  const topo = topoFromPath(path);
  if (!active || !next || active.dataset.topoKey === topo.key) return;

  next.setAttribute('style', topoStyle(topo));
  next.dataset.topoKey = topo.key;
  const swap = () => {
    next.classList.add('is-active');
    active.classList.remove('is-active');
  };
  // Espera la imagen para no fundir hacia un fondo vacío.
  const img = new Image();
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    requestAnimationFrame(swap);
  };
  img.onload = go;
  img.onerror = go;
  window.setTimeout(go, 700);
  img.src = topo.image;
}

function localeOf(path: string) {
  return path.startsWith('/en') ? 'en' : 'es';
}

function pathFromDoc(newDoc: Document) {
  const canonical = newDoc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  return new URL(canonical || window.location.href, window.location.origin).pathname;
}

function isCurrentPath(href: string, path: string) {
  const normalized = path.replace(/\/$/, '') || '/';
  const normalizedHref = href.replace(/\/$/, '') || '/';
  if (normalizedHref === '/' || normalizedHref === '/en') {
    return normalized === normalizedHref;
  }
  return normalized === normalizedHref || normalized.startsWith(`${normalizedHref}/`);
}

export function syncShellState(path = window.location.pathname) {
  document.querySelectorAll('#site-nav a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (isCurrentPath(href, path)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const isEn = localeOf(path) === 'en';
  document.querySelectorAll('.lang-switch a').forEach((link) => {
    const lang = link.getAttribute('hreflang');
    if ((lang === 'en' && isEn) || (lang === 'es' && !isEn)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const without = path.replace(/^\/en(?=\/|$)/, '') || '/';
  const isHome = without === '/' || without === '';
  document.body.classList.toggle('is-home', isHome);
  if (!isHome) document.body.classList.remove('is-scrolled');

  document.body.classList.remove('surface-editorial', 'surface-territory', 'surface-archive');
  document.body.classList.add(`surface-${surfaceFromPath(path)}`);
  crossfadeTopo(path);

  document.documentElement.lang = isEn ? 'en' : 'es';
}

function updateMeta(
  newDoc: Document,
  incoming = metaAfterNavigation({
    canonical: newDoc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    alternates: [...newDoc.querySelectorAll('link[rel="alternate"]')].map((el) => ({
      hreflang: el.getAttribute('hreflang') ?? '',
      href: el.getAttribute('href') ?? '',
    })),
  }),
) {
  document.title = newDoc.title;

  const pairs: Array<[string, string]> = [
    ['meta[name="description"]', 'content'],
    ['meta[property="og:title"]', 'content'],
    ['meta[property="og:description"]', 'content'],
    ['meta[property="og:url"]', 'content'],
  ];

  for (const [selector, attr] of pairs) {
    const next = newDoc.querySelector(selector);
    const current = document.querySelector(selector);
    const value = next?.getAttribute(attr);
    if (current && value) current.setAttribute(attr, value);
  }

  if (incoming.canonical) {
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', incoming.canonical);
  }
  document.head.querySelectorAll('link[rel="alternate"]').forEach((node) => node.remove());
  for (const alt of incoming.alternates) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    if (alt.hreflang) link.hreflang = alt.hreflang;
    link.href = alt.href;
    document.head.appendChild(link);
  }
}

function swapRegion(selector: string, newDoc: Document) {
  const current = document.querySelector(selector);
  const next = newDoc.querySelector(selector);
  if (current && next) current.replaceWith(next.cloneNode(true));
}

function swapMainOnly(newDoc: Document) {
  const nextPath = pathFromDoc(newDoc);
  const localeChanged = localeOf(window.location.pathname) !== localeOf(nextPath);
  const es = newDoc.querySelector('.lang-switch a[hreflang="es"]')?.getAttribute('href') ?? '';
  const en = newDoc.querySelector('.lang-switch a[hreflang="en"]')?.getAttribute('href') ?? '';
  const incoming = metaAfterNavigation({
    canonical: newDoc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    alternates: [...newDoc.querySelectorAll('link[rel="alternate"]')].map((el) => ({
      hreflang: el.getAttribute('hreflang') ?? '',
      href: el.getAttribute('href') ?? '',
    })),
  });

  // El CSS propio de cada vista viaja en el <head> del documento nuevo: sin
  // esto, la página llegaba sin estilos al navegar con el menú. Astro conserva
  // las hojas que ya están y solo agrega o quita las distintas.
  swapFunctions.swapHeadElements(newDoc);
  swapRegion('#main', newDoc);
  updateMeta(newDoc, incoming);

  if (localeChanged) {
    swapRegion('.site-header', newDoc);
    swapRegion('.site-footer', newDoc);
  }

  const hrefs = nextLangHrefs(es && en ? { es, en } : null, nextPath);
  document.querySelector('.lang-switch a[hreflang="es"]')?.setAttribute('href', hrefs.es);
  document.querySelector('.lang-switch a[hreflang="en"]')?.setAttribute('href', hrefs.en);

  syncShellState(nextPath);
}

document.addEventListener('astro:before-preparation', () => {
  document.body.classList.add('is-navigating');
});

document.addEventListener('astro:before-swap', (event) => {
  event.swap = () => {
    try {
      swapMainOnly(event.newDocument);
    } catch {
      swapFunctions.swapBodyElement(event.newDocument.body, document.body);
    }
  };
});

document.addEventListener('astro:page-load', () => {
  document.body.classList.remove('is-navigating');
  syncShellState();
});
