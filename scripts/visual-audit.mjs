import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const out = 'tmp/visual';
mkdirSync(out, { recursive: true });

const routes = [
  '/',
  '/proyecto',
  '/territorio',
  '/equipo',
  '/cuaderno',
  '/archivo',
  '/productos',
  '/publicaciones',
  '/contacto',
  '/proyecto/metodologia',
  '/proyecto/objetivos',
  '/territorio/winkulmapu',
  '/en/',
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const report = [];

page.on('pageerror', (e) => report.push({ type: 'pageerror', message: e.message }));
page.on('console', (msg) => {
  if (msg.type() === 'error') report.push({ type: 'console', message: msg.text() });
});

for (const route of routes) {
  const entry = { route };
  try {
    const res = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
    entry.status = res?.status() ?? 0;
    await page.waitForTimeout(800);

    const file = `${out}${route === '/' ? '/home' : route.replace(/\//g, '_').replace(/^_/, '/')}.png`.replace('//', '/');
    // normalize path
    const shot = `${out}/${route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')}.png`;
    await page.screenshot({ path: shot, fullPage: false });
    entry.shot = shot;

    const metrics = await page.evaluate(() => {
      const hero = document.querySelector('.hero');
      const hs = hero ? getComputedStyle(hero) : null;
      const seal = document.querySelector('.hero__seal');
      const ss = seal ? getComputedStyle(seal) : null;
      const header = document.querySelector('.site-header');
      const hds = header ? getComputedStyle(header) : null;
      return {
        title: document.title,
        isHome: document.body.classList.contains('is-home'),
        heroBg: hs?.backgroundColor || null,
        heroColor: hs?.color || null,
        sealColor: ss?.color || null,
        headerBg: hds?.backgroundColor || null,
        headerPos: hds?.position || null,
        bodyBg: getComputedStyle(document.body).backgroundColor,
      };
    });
    Object.assign(entry, metrics);
  } catch (e) {
    entry.error = String(e.message || e);
  }
  report.push(entry);
  console.log(JSON.stringify(entry));
}

await page.setViewportSize({ width: 390, height: 844 });
try {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/home-mobile.png`, fullPage: false });
} catch (e) {
  report.push({ route: '/mobile', error: String(e.message || e) });
}

await browser.close();
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log('DONE', out);
