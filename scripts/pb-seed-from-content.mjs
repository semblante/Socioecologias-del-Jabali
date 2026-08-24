/**
 * Seed PocketBase from src/content MDX/MD files.
 * Idempotent on (collection, slug|key, locale).
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import PocketBase from 'pocketbase';

const url = (process.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '');
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;
const root = path.resolve('src/content');

if (!email || !password) {
  console.error('Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD');
  process.exit(1);
}

const pb = new PocketBase(url);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/i.test(name)) out.push(p);
  }
  return out;
}

function localeFromPath(file) {
  const parts = file.split(path.sep);
  const i = parts.findIndex((p) => p === 'es' || p === 'en');
  return i >= 0 ? parts[i] : 'es';
}

function slugFromPath(file) {
  return path.basename(file).replace(/\.(md|mdx)$/i, '');
}

async function upsert(collection, filter, data) {
  try {
    const existing = await pb.collection(collection).getFirstListItem(filter);
    await pb.collection(collection).update(existing.id, data);
    console.log('update', collection, filter);
  } catch {
    await pb.collection(collection).create(data);
    console.log('create', collection, filter);
  }
}

async function main() {
  await pb.admins.authWithPassword(email, password);

  // bitacora → cuaderno
  for (const file of walk(path.join(root, 'bitacora'))) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const locale = data.locale || localeFromPath(file);
    const slug = slugFromPath(file);
    await upsert('cuaderno', `slug = "${slug}" && locale = "${locale}"`, {
      slug,
      locale,
      translationKey: data.translationKey || slug,
      status: data.status || 'published',
      title: data.title,
      description: data.description || '',
      pubDate: data.pubDate ? new Date(data.pubDate).toISOString().slice(0, 10) : null,
      tags: data.tags || [],
      content: content.trim(),
    });
  }

  for (const file of walk(path.join(root, 'equipo'))) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const locale = data.locale || localeFromPath(file);
    const slug = slugFromPath(file);
    await upsert('equipo', `slug = "${slug}" && locale = "${locale}"`, {
      slug,
      locale,
      translationKey: data.translationKey || slug,
      status: data.status || 'published',
      name: data.name,
      role: data.role,
      affiliation: data.affiliation,
      group: data.group || 'investigator',
      order: data.order ?? 0,
      externalUrl: data.externalUrl || '',
      bio: content.trim(),
    });
  }

  for (const file of walk(path.join(root, 'publicaciones'))) {
    const { data } = matter(fs.readFileSync(file, 'utf8'));
    const locale = data.locale || localeFromPath(file);
    const slug = slugFromPath(file);
    await upsert('publicaciones', `slug = "${slug}" && locale = "${locale}"`, {
      slug,
      locale,
      translationKey: data.translationKey || slug,
      status: data.status || 'published',
      title: data.title,
      authors: data.authors,
      venue: data.venue,
      year: data.year,
      type: data.type || 'article',
      url: data.url || '',
      doi: data.doi || '',
    });
  }

  for (const file of walk(path.join(root, 'objetivos'))) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const locale = data.locale || localeFromPath(file);
    const slug = slugFromPath(file);
    await upsert('objetivos', `slug = "${slug}" && locale = "${locale}"`, {
      slug,
      locale,
      translationKey: data.translationKey || slug,
      status: data.status || 'published',
      numero: data.numero ?? 0,
      titulo: data.titulo || data.title,
      resumen: data.resumen || data.description || '',
      content: content.trim(),
    });
  }

  for (const file of walk(path.join(root, 'metodos'))) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const locale = data.locale || localeFromPath(file);
    const slug = slugFromPath(file);
    await upsert('metodos', `slug = "${slug}" && locale = "${locale}"`, {
      slug,
      locale,
      translationKey: data.translationKey || slug,
      status: data.status || 'published',
      componente: data.componente || 'ecologia',
      titulo: data.titulo || data.title,
      order: data.order ?? 0,
      cifras: data.cifras || [],
      content: content.trim(),
    });
  }

  for (const file of walk(path.join(root, 'sitios'))) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const locale = data.locale || localeFromPath(file);
    const slug = slugFromPath(file);
    await upsert('sitios', `slug = "${slug}" && locale = "${locale}"`, {
      slug,
      locale,
      translationKey: data.translationKey || slug,
      status: data.status || 'published',
      nombre: data.nombre || data.title,
      tipo: data.tipo || 'secundario',
      order: data.order ?? 0,
      coordenadas: data.coordenadas || '',
      aporte: data.aporte || '',
      content: content.trim(),
    });
  }

  for (const file of walk(path.join(root, 'productos'))) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const locale = data.locale || localeFromPath(file);
    const slug = slugFromPath(file);
    await upsert('productos', `slug = "${slug}" && locale = "${locale}"`, {
      slug,
      locale,
      translationKey: data.translationKey || slug,
      status: data.status || 'published',
      titulo: data.titulo || data.title,
      tipo: data.tipo || 'libro',
      estado: data.estado || 'planificado',
      fecha: data.fecha || '',
      content: content.trim(),
    });
  }

  for (const file of walk(path.join(root, 'pages'))) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const locale = data.locale || localeFromPath(file);
    const key = slugFromPath(file);
    await upsert('paginas', `key = "${key}" && locale = "${locale}"`, {
      key,
      locale,
      translationKey: data.translationKey || key,
      status: data.status || 'published',
      title: data.title,
      description: data.description || '',
      tagline: data.tagline || '',
      intro: data.intro || '',
      heroMedia: data.heroMedia || '',
      content: content.trim(),
    });
  }

  console.log('seed ok');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
