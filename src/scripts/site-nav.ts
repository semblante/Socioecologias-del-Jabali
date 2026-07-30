function closeNav() {
  document.getElementById('site-nav')?.classList.remove('is-open');
  const toggle = document.getElementById('menu-toggle');
  toggle?.classList.remove('is-active');
  toggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}

function initSiteNav() {
  // ponytail: delegación en document — el header persiste entre rutas del mismo idioma
  if ((window as Window & { __siteNavBound?: boolean }).__siteNavBound) return;
  (window as Window & { __siteNavBound?: boolean }).__siteNavBound = true;

  document.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    if (!target) return;

    if (target.closest('#menu-toggle')) {
      const nav = document.getElementById('site-nav');
      const toggle = document.getElementById('menu-toggle');
      const open = nav?.classList.toggle('is-open');
      toggle?.classList.toggle('is-active', !!open);
      toggle?.setAttribute('aria-expanded', String(!!open));
      toggle?.setAttribute(
        'aria-label',
        open
          ? document.documentElement.lang === 'en'
            ? 'Close navigation menu'
            : 'Cerrar menú de navegación'
          : document.documentElement.lang === 'en'
            ? 'Open navigation menu'
            : 'Abrir menú de navegación',
      );
      document.body.classList.toggle('nav-open', !!open);
      return;
    }

    if (target.closest('#site-nav a')) {
      closeNav();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('site-nav')?.classList.contains('is-open')) {
      closeNav();
    }
  });
}

document.addEventListener('astro:page-load', initSiteNav);
initSiteNav();

function syncHomeHeader() {
  if (!document.body.classList.contains('is-home')) {
    document.body.classList.remove('is-scrolled');
    return;
  }
  document.body.classList.toggle('is-scrolled', window.scrollY > 48);
}

function initHomeHeader() {
  syncHomeHeader();
  if ((window as Window & { __homeHeaderBound?: boolean }).__homeHeaderBound) return;
  (window as Window & { __homeHeaderBound?: boolean }).__homeHeaderBound = true;
  window.addEventListener('scroll', syncHomeHeader, { passive: true });
  document.addEventListener('astro:page-load', syncHomeHeader);
}

initHomeHeader();
