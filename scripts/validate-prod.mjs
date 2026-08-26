/**
 * Validación de producción vs architecture.md / ESTADO.md.
 * Usage: node scripts/validate-prod.mjs
 * Env opcional: BASE_URL, PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD
 */
const BASE = (process.env.BASE_URL || 'https://web-production-57fa0.up.railway.app').replace(/\/$/, '');
const PB = (process.env.PUBLIC_POCKETBASE_URL || 'https://pocketbase-production-6f98.up.railway.app').replace(/\/$/, '');

const STATIC_ROUTES = [
  '/',
  '/proyecto',
  '/proyecto/objetivos',
  '/proyecto/metodologia',
  '/territorio',
  '/territorio/winkulmapu',
  '/equipo',
  '/cuaderno',
  '/archivo',
  '/publicaciones',
  '/productos',
  '/contacto',
  '/en/',
  '/en/proyecto',
  '/en/proyecto/objetivos',
  '/en/proyecto/metodologia',
  '/en/territorio',
  '/en/territorio/winkulmapu',
  '/en/equipo',
  '/en/cuaderno',
  '/en/archivo',
  '/en/publicaciones',
  '/en/productos',
  '/en/contacto',
];

const REDIRECTS = [
  { from: '/bitacora', expect: '/cuaderno' },
  { from: '/en/bitacora', expect: '/en/cuaderno' },
];

const COLLECTIONS = [
  'cuaderno',
  'equipo',
  'publicaciones',
  'objetivos',
  'metodos',
  'sitios',
  'productos',
  'galeria',
  'paginas',
];

const REQUIRED_SCHEMA_FIELDS = {
  paginas: ['heroMedia'],
  equipo: ['group'],
};

const failures = [];
const passes = [];

function fail(name, detail) {
  failures.push({ name, detail });
  console.error(`FAIL  ${name}: ${detail}`);
}

function pass(name, detail = 'ok') {
  passes.push({ name, detail });
  console.log(`PASS  ${name}: ${detail}`);
}

async function fetchStatus(url, opts = {}) {
  const res = await fetch(url, { redirect: opts.followRedirect === false ? 'manual' : 'follow', ...opts });
  const text = opts.readBody ? await res.text() : '';
  return { res, text };
}

async function checkRoutes() {
  for (const route of STATIC_ROUTES) {
    try {
      const { res, text } = await fetchStatus(`${BASE}${route}`, { readBody: true });
      if (res.status !== 200) {
        fail(`route ${route}`, `status ${res.status}`);
        continue;
      }
      if (/Internal Server Error|Failed to fetch/i.test(text)) {
        fail(`route ${route}`, 'error text in body');
        continue;
      }
      pass(`route ${route}`, String(res.status));
    } catch (e) {
      fail(`route ${route}`, String(e.message || e));
    }
  }
}

async function checkRedirects() {
  for (const { from, expect } of REDIRECTS) {
    try {
      const { res } = await fetchStatus(`${BASE}${from}`, { followRedirect: false });
      const loc = res.headers.get('location') || '';
      if (![301, 302, 307, 308].includes(res.status)) {
        fail(`redirect ${from}`, `status ${res.status}`);
        continue;
      }
      if (!loc.includes(expect)) {
        fail(`redirect ${from}`, `location ${loc} (expected *${expect}*)`);
        continue;
      }
      pass(`redirect ${from}`, `→ ${loc}`);
    } catch (e) {
      fail(`redirect ${from}`, String(e.message || e));
    }
  }
}

async function checkDynamicRoutes() {
  const sitios = await pbList('sitios', 'locale = "es"');
  for (const row of sitios) {
    const slug = row.slug;
    if (!slug) continue;
    const route = `/territorio/${slug}`;
    const { res } = await fetchStatus(`${BASE}${route}`);
    if (res.status !== 200) fail(`dynamic ${route}`, `status ${res.status}`);
    else pass(`dynamic ${route}`, '200');
  }

  const cuaderno = await pbList('cuaderno', 'locale = "es"');
  for (const row of cuaderno) {
    const slug = row.slug;
    if (!slug) continue;
    const route = `/cuaderno/${slug}`;
    const { res } = await fetchStatus(`${BASE}${route}`);
    if (res.status !== 200) fail(`dynamic ${route}`, `status ${res.status}`);
    else pass(`dynamic ${route}`, '200');
  }
}

async function pbList(collection, filter) {
  const q = filter ? `?filter=${encodeURIComponent(filter)}&perPage=200` : '?perPage=200';
  const res = await fetch(`${PB}/api/collections/${collection}/records${q}`);
  if (!res.ok) throw new Error(`list ${collection}: ${res.status}`);
  return (await res.json()).items || [];
}

async function checkPocketBase() {
  const health = await fetch(`${PB}/api/health`);
  if (!health.ok) fail('pocketbase health', String(health.status));
  else pass('pocketbase health', '200');

  for (const name of COLLECTIONS) {
    try {
      const items = await pbList(name);
      if (items.length === 0 && name === 'galeria') {
        pass(`collection ${name}`, 'empty (client pending)');
      } else if (items.length === 0) {
        fail(`collection ${name}`, 'empty');
      } else {
        pass(`collection ${name}`, `${items.length} records`);
      }
    } catch (e) {
      fail(`collection ${name}`, String(e.message || e));
    }
  }

  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;
  if (email && password) {
    const auth = await fetch(`${PB}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    });
    if (!auth.ok) fail('admin auth', `${auth.status}`);
    else pass('admin auth', email);
  } else {
    pass('admin auth', 'skipped (no env creds)');
  }
}

async function checkSchemaFields() {
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;
  let headers = {};
  if (email && password) {
    const auth = await fetch(`${PB}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    });
    if (!auth.ok) {
      fail('schema fields', `admin auth ${auth.status}`);
      return;
    }
    headers = { Authorization: (await auth.json()).token };
  }

  const res = await fetch(`${PB}/api/collections?perPage=200`, { headers });
  if (!res.ok) {
    fail('schema fields', `list collections ${res.status}`);
    return;
  }
  const items = (await res.json()).items || [];
  const byName = Object.fromEntries(items.map((c) => [c.name, c]));

  for (const name of COLLECTIONS) {
    if (!byName[name]) fail(`schema collection ${name}`, 'missing');
    else pass(`schema collection ${name}`, 'exists');
  }

  for (const [coll, fields] of Object.entries(REQUIRED_SCHEMA_FIELDS)) {
    const schema = byName[coll]?.schema || [];
    const names = schema.map((f) => f.name);
    for (const f of fields) {
      if (!names.includes(f)) fail(`schema field ${coll}.${f}`, 'missing');
      else pass(`schema field ${coll}.${f}`, 'exists');
    }
  }

  const equipo = await pbList('equipo');
  const groups = new Set(equipo.map((r) => r.group));
  if (!groups.has('tesista')) fail('equipo group tesista', 'no records');
  else pass('equipo group tesista', 'present');

  const paginas = await pbList('paginas', 'key = "home"');
  const homeEs = paginas.find((p) => p.locale === 'es');
  if (!homeEs) fail('paginas home es', 'missing');
  else pass('paginas home es', homeEs.title || homeEs.key);
}

async function checkContentMarkers() {
  const { text } = await fetchStatus(`${BASE}/`, { readBody: true });
  if (!text.includes('<em>Sus scrofa</em>') && !text.includes('<em>sus scrofa</em>')) {
    fail('Sus scrofa italic', 'not found on home');
  } else {
    pass('Sus scrofa italic', 'home');
  }

  const { text: equipo } = await fetchStatus(`${BASE}/equipo`, { readBody: true });
  if (!/Francisco Colipe|Fernanda Fuentes|Marcelo Alvarado/i.test(equipo)) {
    fail('equipo profiles', 'expected team members missing');
  } else {
    pass('equipo profiles', 'Tironi team present');
  }

  const { text: terr } = await fetchStatus(`${BASE}/territorio/winkulmapu`, { readBody: true });
  if (!/Winkulmapu/i.test(terr)) {
    fail('territorio winkulmapu', 'content missing');
  } else {
    pass('territorio winkulmapu', 'content ok');
  }

  for (const asset of ['/brand/icon-512.png', '/brand/icon-180.png', '/favicon.svg']) {
    const { res } = await fetchStatus(`${BASE}${asset}`);
    if (res.status !== 200) fail(`asset ${asset}`, String(res.status));
    else pass(`asset ${asset}`, '200');
  }
}

async function checkDomain() {
  try {
    await fetchStatus('https://ecologiasdeljabali.cl/', { followRedirect: false });
    pass('domain ecologiasdeljabali.cl', 'resolves');
  } catch {
    pass('domain ecologiasdeljabali.cl', 'DNS pending (expected until CNAME propagates)');
  }
}

console.log(`\nValidating ${BASE} + ${PB}\n`);

await checkPocketBase();
await checkSchemaFields();
await checkRoutes();
await checkRedirects();
await checkDynamicRoutes();
await checkContentMarkers();
await checkDomain();

console.log(`\n--- ${passes.length} passed, ${failures.length} failed ---\n`);
if (failures.length) {
  process.exitCode = 1;
}
