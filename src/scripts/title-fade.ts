const TITLE_SELECTOR = '.page-header__title';
const ENTERING_CLASS = 'page-header__title--entering';

let waitingForFonts = false;

function showTitles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll<HTMLElement>(TITLE_SELECTOR).forEach((title) => {
    if (title.dataset.fadePlayed === 'true') return;
    title.dataset.fadePlayed = 'true';
    title.classList.add(ENTERING_CLASS);
    title.addEventListener('animationend', () => title.classList.remove(ENTERING_CLASS), { once: true });
  });
}

function onPageLoad() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.documentElement.classList.contains('fonts-pending')) {
    showTitles();
    return;
  }
  if (waitingForFonts) return;

  waitingForFonts = true;
  document.addEventListener('site:fonts-ready', () => {
    waitingForFonts = false;
    showTitles();
  }, { once: true });
}

document.addEventListener('astro:page-load', onPageLoad);
onPageLoad();
