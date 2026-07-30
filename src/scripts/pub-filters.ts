function initPubFilters() {
  if ((window as Window & { __pubFiltersBound?: boolean }).__pubFiltersBound) return;
  (window as Window & { __pubFiltersBound?: boolean }).__pubFiltersBound = true;

  document.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest?.('.pub-filter');
    if (!btn) return;

    const type = (btn as HTMLButtonElement).dataset.filter;
    const filters = document.querySelectorAll('.pub-filter');
    const items = document.querySelectorAll('.pub-item');

    filters.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    items.forEach((item) => {
      const el = item as HTMLElement;
      el.hidden = type !== 'all' && el.dataset.type !== type;
    });
  });
}

document.addEventListener('astro:page-load', initPubFilters);
initPubFilters();
