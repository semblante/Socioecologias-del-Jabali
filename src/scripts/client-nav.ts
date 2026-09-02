import { swapFunctions } from 'astro:transitions/client';
import { surfaceFromPath } from '../lib/surface';

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
  const esPath = without === '/' ? '/' : without;
  const enPath = without === '/' ? '/en/' : `/en${without}`;
  document.querySelector('.lang-switch a[hreflang="es"]')?.setAttribute('href', esPath);
  document.querySelector('.lang-switch a[hreflang="en"]')?.setAttribute('href', enPath);

  // El swap solo reemplaza #main: hay que sincronizar is-home o el header
  // queda fixed/claro y se monta sobre títulos / menú ilegible.
  const isHome = without === '/' || without === '';
  document.body.classList.toggle('is-home', isHome);
  if (!isHome) document.body.classList.remove('is-scrolled');

  document.body.classList.remove('surface-editorial', 'surface-territory', 'surface-archive');
  document.body.classList.add(`surface-${surfaceFromPath(path)}`);

  document.documentElement.lang = isEn ? 'en' : 'es';
}

function updateMeta(newDoc: Document) {
  document.title = newDoc.title;

  const pairs: Array<[string, string]> = [
    ['meta[name="description"]', 'content'],
    ['meta[property="og:title"]', 'content'],
    ['meta[property="og:description"]', 'content'],
    ['meta[property="og:url"]', 'content'],
    ['link[rel="canonical"]', 'href'],
  ];

  for (const [selector, attr] of pairs) {
    const next = newDoc.querySelector(selector);
    const current = document.querySelector(selector);
    const value = next?.getAttribute(attr);
    if (current && value) current.setAttribute(attr, value);
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

  swapRegion('#main', newDoc);
  updateMeta(newDoc);

  if (localeChanged) {
    swapRegion('.site-header', newDoc);
    swapRegion('.site-footer', newDoc);
  }

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
