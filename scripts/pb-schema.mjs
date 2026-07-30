/**
 * Idempotent PocketBase schema for Socioecologías del jabalí.
 * Requires PB 0.22.x admin API: /api/admins/auth-with-password
 *
 * Usage:
 *   PUBLIC_POCKETBASE_URL=... POCKETBASE_ADMIN_EMAIL=... POCKETBASE_ADMIN_PASSWORD=... node scripts/pb-schema.mjs
 */
const url = (process.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '');
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD');
  process.exit(1);
}

const PUBLIC_RULE =
  '@request.auth.id != "" || status = "published" || status = "reviewed" || status = "placeholder"';
const AUTH_RULE = '@request.auth.id != ""';

function select(name, values, required = true) {
  return {
    name,
    type: 'select',
    required,
    options: { maxSelect: 1, values },
  };
}

function text(name, required = false) {
  return { name, type: 'text', required, options: { min: null, max: null, pattern: '' } };
}

function number(name, required = false) {
  return { name, type: 'number', required, options: { min: null, max: null } };
}

function date(name, required = false) {
  return { name, type: 'date', required, options: {} };
}

function urlField(name, required = false) {
  return { name, type: 'url', required, options: { exceptDomains: null, onlyDomains: null } };
}

function json(name, required = false) {
  return { name, type: 'json', required, options: { maxSize: 2000000 } };
}

function file(name, required = false) {
  // ponytail: text URL/path instead of PB file field — avoids 0.22 schema quirks; images stay in public/ or absolute URLs
  return text(name, required);
}

const shared = [
  text('slug', false),
  select('locale', ['es', 'en'], true),
  text('translationKey', true),
  select('status', ['draft', 'reviewed', 'published', 'placeholder'], true),
];

const collections = [
  {
    name: 'cuaderno',
    schema: [
      ...shared,
      text('title', true),
      text('description', true),
      date('pubDate', true),
      json('tags', false),
      file('cover', false),
      text('content', false),
    ],
  },
  {
    name: 'equipo',
    schema: [
      ...shared,
      text('name', true),
      text('role', true),
      text('affiliation', true),
      select('group', ['investigator', 'collaborator'], true),
      number('order', false),
      urlField('externalUrl', false),
      text('bio', false),
    ],
  },
  {
    name: 'publicaciones',
    schema: [
      ...shared,
      text('title', true),
      text('authors', true),
      text('venue', true),
      number('year', true),
      select('type', ['article', 'chapter', 'book', 'report'], true),
      urlField('url', false),
      text('doi', false),
    ],
  },
  {
    name: 'objetivos',
    schema: [
      ...shared,
      number('numero', true),
      text('titulo', true),
      text('resumen', true),
      text('content', false),
    ],
  },
  {
    name: 'metodos',
    schema: [
      ...shared,
      select('componente', ['ecologia', 'etnografia', 'participativo'], true),
      text('titulo', true),
      number('order', false),
      json('cifras', false),
      text('content', false),
    ],
  },
  {
    name: 'sitios',
    schema: [
      ...shared,
      text('nombre', true),
      select('tipo', ['principal', 'secundario'], true),
      number('order', false),
      text('coordenadas', false),
      text('aporte', true),
      file('imagen', false),
      text('content', false),
    ],
  },
  {
    name: 'productos',
    schema: [
      ...shared,
      text('titulo', true),
      select('tipo', ['libro', 'policy-brief', 'exposicion', 'evento'], true),
      select('estado', ['planificado', 'en-curso', 'publicado'], true),
      text('fecha', false),
      text('content', false),
    ],
  },
  {
    name: 'galeria',
    schema: [
      ...shared,
      text('titulo', true),
      file('imagen', true),
      text('pie', false),
      text('autoria', false),
      date('fecha', false),
      text('sitio', false),
      json('tags', false),
    ],
  },
  {
    name: 'paginas',
    schema: [
      select('key', ['home', 'proyecto', 'contacto'], true),
      select('locale', ['es', 'en'], true),
      text('translationKey', true),
      select('status', ['draft', 'reviewed', 'published', 'placeholder'], true),
      text('title', true),
      text('description', false),
      text('tagline', false),
      text('intro', false),
      text('content', false),
    ],
  },
];

async function main() {
  const authRes = await fetch(`${url}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  });
  if (!authRes.ok) {
    console.error('Admin auth failed', authRes.status, await authRes.text());
    process.exit(1);
  }
  const { token } = await authRes.json();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: token,
  };

  const listRes = await fetch(`${url}/api/collections?perPage=200`, { headers });
  if (!listRes.ok) {
    console.error('List collections failed', await listRes.text());
    process.exit(1);
  }
  const existing = (await listRes.json()).items || [];
  const byName = Object.fromEntries(existing.map((c) => [c.name, c]));

  for (const def of collections) {
    const body = {
      name: def.name,
      type: 'base',
      system: false,
      schema: def.schema.map((f, i) => ({ ...f, id: f.name.slice(0, 8) + String(i).padStart(2, '0') })),
      listRule: PUBLIC_RULE,
      viewRule: PUBLIC_RULE,
      createRule: AUTH_RULE,
      updateRule: AUTH_RULE,
      deleteRule: AUTH_RULE,
    };

    const found = byName[def.name];
    if (!found) {
      const res = await fetch(`${url}/api/collections`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(`Create ${def.name} failed`, await res.text());
        process.exit(1);
      }
      console.log('created', def.name);
    } else {
      // Keep existing field ids when names match
      const oldByName = Object.fromEntries((found.schema || []).map((f) => [f.name, f]));
      body.schema = def.schema.map((f, i) => {
        const prev = oldByName[f.name];
        return { ...f, id: prev?.id || f.name.slice(0, 8) + String(i).padStart(2, '0') };
      });
      const res = await fetch(`${url}/api/collections/${found.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(`Update ${def.name} failed`, await res.text());
        process.exit(1);
      }
      console.log('updated', def.name);
    }
  }

  console.log('schema ok');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
