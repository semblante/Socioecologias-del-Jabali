import type { Locale } from '../config/site';
import { fileUrl, getPb } from './pb';

export type ContentRecord<T extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  slug: string;
  data: T & {
    locale: Locale;
    translationKey: string;
    status?: string;
  };
  content: string;
};

const VISIBLE_STATUSES = ['published', 'reviewed', 'placeholder'] as const;

function isVisible(status?: string) {
  const s = status ?? 'published';
  return VISIBLE_STATUSES.includes(s as (typeof VISIBLE_STATUSES)[number]);
}

function asLocale(v: unknown): Locale {
  return v === 'en' ? 'en' : 'es';
}

function parseJsonArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

type PbRow = Record<string, unknown> & { id: string; collectionId?: string };

async function listAll(collection: string, filter?: string) {
  const pb = getPb();
  // ponytail: omit filter key when unset — PB SDK sends filter=undefined and API returns 400
  return pb.collection(collection).getFullList<PbRow>({
    ...(filter ? { filter } : {}),
    requestKey: null,
  });
}

function mapCuaderno(pb: ReturnType<typeof getPb>, row: PbRow): ContentRecord {
  const slug = String(row.slug || row.id);
  return {
    id: row.id,
    slug,
    content: String(row.content ?? ''),
    data: {
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      pubDate: row.pubDate ? new Date(String(row.pubDate)) : new Date(0),
      tags: parseJsonArray(row.tags),
      cover: fileUrl(pb, row, row.cover as string | undefined),
      locale: asLocale(row.locale),
      translationKey: String(row.translationKey ?? slug),
      status: String(row.status ?? 'published'),
    },
  };
}

export async function getBitacora(locale: Locale) {
  const pb = getPb();
  const rows = await listAll('cuaderno', `locale = "${locale}"`);
  return rows
    .map((r) => mapCuaderno(pb, r))
    .filter((e) => isVisible(e.data.status))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getBitacoraBySlug(slug: string, locale: Locale) {
  const pb = getPb();
  const rows = await listAll('cuaderno');
  const all = rows.map((r) => mapCuaderno(pb, r));

  const entry = all.find((e) => e.data.locale === locale && e.slug === slug && isVisible(e.data.status));
  if (entry) return { entry, isFallback: false };

  if (locale === 'en') {
    const esEntry = all.find((e) => e.data.locale === 'es' && e.slug === slug && isVisible(e.data.status));
    if (!esEntry) return { entry: null, isFallback: false };
    const enEntry = all.find(
      (e) => e.data.locale === 'en' && e.data.translationKey === esEntry.data.translationKey && isVisible(e.data.status),
    );
    if (enEntry) return { entry: enEntry, isFallback: false };
    return { entry: esEntry, isFallback: true };
  }

  return { entry: null, isFallback: false };
}

export async function getEquipo(locale: Locale) {
  const pb = getPb();
  const rows = await listAll('equipo', `locale = "${locale}"`);
  return rows
    .map((row) => {
      const slug = String(row.slug || row.id);
      return {
        id: row.id,
        slug,
        content: String(row.bio ?? ''),
        data: {
          name: String(row.name ?? ''),
          role: String(row.role ?? ''),
          affiliation: String(row.affiliation ?? ''),
          group: (
            row.group === 'collaborator' || row.group === 'tesista'
              ? row.group
              : 'investigator'
          ) as 'investigator' | 'collaborator' | 'tesista',
          order: Number(row.order ?? 0),
          externalUrl: row.externalUrl ? String(row.externalUrl) : undefined,
          locale: asLocale(row.locale),
          translationKey: String(row.translationKey ?? slug),
          status: String(row.status ?? 'published'),
        },
      };
    })
    .filter((e) => isVisible(e.data.status))
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getPublicaciones(locale: Locale) {
  const rows = await listAll('publicaciones', `locale = "${locale}"`);
  return rows
    .map((row) => {
      const slug = String(row.slug || row.id);
      return {
        id: row.id,
        slug,
        content: '',
        data: {
          title: String(row.title ?? ''),
          authors: String(row.authors ?? ''),
          venue: String(row.venue ?? ''),
          year: Number(row.year ?? 0),
          type: String(row.type ?? 'article') as 'article' | 'chapter' | 'book' | 'report',
          url: row.url ? String(row.url) : undefined,
          doi: row.doi ? String(row.doi) : undefined,
          locale: asLocale(row.locale),
          translationKey: String(row.translationKey ?? slug),
          status: String(row.status ?? 'published'),
        },
      };
    })
    .filter((e) => isVisible(e.data.status))
    .sort((a, b) => b.data.year - a.data.year);
}

export async function getPage(slug: string, locale: Locale) {
  const rows = await listAll('paginas', `key = "${slug}" && locale = "${locale}"`);
  const row = rows[0];
  if (!row || !isVisible(String(row.status))) return null;
  return {
    id: row.id,
    slug,
    content: String(row.content ?? ''),
    data: {
      title: String(row.title ?? ''),
      description: row.description ? String(row.description) : undefined,
      tagline: row.tagline ? String(row.tagline) : undefined,
      intro: row.intro ? String(row.intro) : undefined,
      heroMedia: row.heroMedia ? String(row.heroMedia) : undefined,
      locale: asLocale(row.locale),
      translationKey: String(row.translationKey ?? slug),
      status: String(row.status ?? 'published'),
    },
  };
}

export async function getObjetivos(locale: Locale) {
  const rows = await listAll('objetivos', `locale = "${locale}"`);
  return rows
    .map((row) => {
      const slug = String(row.slug || row.id);
      return {
        id: row.id,
        slug,
        content: String(row.content ?? ''),
        data: {
          numero: Number(row.numero ?? 0),
          titulo: String(row.titulo ?? ''),
          resumen: String(row.resumen ?? ''),
          locale: asLocale(row.locale),
          translationKey: String(row.translationKey ?? slug),
          status: String(row.status ?? 'published'),
        },
      };
    })
    .filter((e) => isVisible(e.data.status))
    .sort((a, b) => a.data.numero - b.data.numero);
}

export async function getMetodos(locale: Locale) {
  const rows = await listAll('metodos', `locale = "${locale}"`);
  return rows
    .map((row) => {
      const slug = String(row.slug || row.id);
      let cifras: { valor: string; unidad: string }[] = [];
      if (Array.isArray(row.cifras)) cifras = row.cifras as typeof cifras;
      else if (typeof row.cifras === 'string' && row.cifras.trim()) {
        try {
          cifras = JSON.parse(row.cifras);
        } catch {
          cifras = [];
        }
      }
      return {
        id: row.id,
        slug,
        content: String(row.content ?? ''),
        data: {
          componente: String(row.componente ?? 'ecologia') as 'ecologia' | 'etnografia' | 'participativo',
          titulo: String(row.titulo ?? ''),
          order: Number(row.order ?? 0),
          cifras,
          locale: asLocale(row.locale),
          translationKey: String(row.translationKey ?? slug),
          status: String(row.status ?? 'published'),
        },
      };
    })
    .filter((e) => isVisible(e.data.status))
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getSitios(locale: Locale) {
  const pb = getPb();
  const rows = await listAll('sitios', `locale = "${locale}"`);
  return rows
    .map((row) => {
      const slug = String(row.slug || row.id);
      return {
        id: row.id,
        slug,
        content: String(row.content ?? ''),
        data: {
          nombre: String(row.nombre ?? ''),
          tipo: (row.tipo === 'secundario' ? 'secundario' : 'principal') as 'principal' | 'secundario',
          order: Number(row.order ?? 0),
          coordenadas: row.coordenadas ? String(row.coordenadas) : undefined,
          aporte: String(row.aporte ?? ''),
          imagen: fileUrl(pb, row, row.imagen as string | undefined),
          locale: asLocale(row.locale),
          translationKey: String(row.translationKey ?? slug),
          status: String(row.status ?? 'published'),
        },
      };
    })
    .filter((e) => isVisible(e.data.status))
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getSitioBySlug(slug: string, locale: Locale) {
  const all = await getSitios(locale);
  return all.find((e) => e.slug === slug) ?? null;
}

export async function getProductos(locale: Locale) {
  const rows = await listAll('productos', `locale = "${locale}"`);
  return rows
    .map((row) => {
      const slug = String(row.slug || row.id);
      return {
        id: row.id,
        slug,
        content: String(row.content ?? ''),
        data: {
          titulo: String(row.titulo ?? ''),
          tipo: String(row.tipo ?? 'libro') as 'libro' | 'policy-brief' | 'exposicion' | 'evento',
          estado: String(row.estado ?? 'planificado') as 'planificado' | 'en-curso' | 'publicado',
          fecha: row.fecha ? String(row.fecha) : undefined,
          locale: asLocale(row.locale),
          translationKey: String(row.translationKey ?? slug),
          status: String(row.status ?? 'published'),
        },
      };
    })
    .filter((e) => isVisible(e.data.status));
}

export async function getGaleria(locale: Locale) {
  try {
    const pb = getPb();
    const rows = await listAll('galeria', `locale = "${locale}"`);
    return rows
      .map((row) => {
        const slug = String(row.slug || row.id);
        return {
          id: row.id,
          slug,
          content: '',
          data: {
            titulo: String(row.titulo ?? ''),
            imagen: fileUrl(pb, row, row.imagen as string | undefined) ?? '',
            pie: row.pie ? String(row.pie) : undefined,
            autoria: row.autoria ? String(row.autoria) : undefined,
            fecha: row.fecha ? new Date(String(row.fecha)) : undefined,
            sitio: row.sitio ? String(row.sitio) : undefined,
            tags: parseJsonArray(row.tags),
            locale: asLocale(row.locale),
            translationKey: String(row.translationKey ?? slug),
            status: String(row.status ?? 'published'),
          },
        };
      })
      .filter((e) => isVisible(e.data.status))
      .sort((a, b) => (b.data.fecha?.valueOf() ?? 0) - (a.data.fecha?.valueOf() ?? 0));
  } catch {
    return [];
  }
}

export function getEntrySlug(entry: { slug?: string; id: string }) {
  return entry.slug || entry.id;
}

/** @deprecated Use ContentRecord; kept for gradual view migration */
export type BitacoraEntry = Awaited<ReturnType<typeof getBitacora>>[number];
export type EquipoEntry = Awaited<ReturnType<typeof getEquipo>>[number];
export type PublicacionEntry = Awaited<ReturnType<typeof getPublicaciones>>[number];
export type PageEntry = NonNullable<Awaited<ReturnType<typeof getPage>>>;
export type ObjetivoEntry = Awaited<ReturnType<typeof getObjetivos>>[number];
export type MetodoEntry = Awaited<ReturnType<typeof getMetodos>>[number];
export type SitioEntry = Awaited<ReturnType<typeof getSitios>>[number];
export type ProductoEntry = Awaited<ReturnType<typeof getProductos>>[number];
export type GaleriaEntry = Awaited<ReturnType<typeof getGaleria>>[number];
