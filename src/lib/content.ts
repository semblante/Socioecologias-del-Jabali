import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../config/site';

export type BitacoraEntry = CollectionEntry<'bitacora'>;
export type EquipoEntry = CollectionEntry<'equipo'>;
export type PublicacionEntry = CollectionEntry<'publicaciones'>;
export type PageEntry = CollectionEntry<'pages'>;

const VISIBLE_STATUSES = ['published', 'reviewed', 'placeholder'] as const;

function isVisible<T extends { data: { status?: string } }>(entry: T) {
  const status = entry.data.status ?? 'published';
  return VISIBLE_STATUSES.includes(status as (typeof VISIBLE_STATUSES)[number]);
}

export async function getEntriesByLocale<T extends { data: { locale: Locale } }>(
  entries: T[],
  locale: Locale,
): Promise<T[]> {
  return entries.filter((e) => e.data.locale === locale);
}

export async function getBitacora(locale: Locale) {
  const all = await getCollection('bitacora');
  return all
    .filter((e) => e.data.locale === locale && isVisible(e))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getEquipo(locale: Locale) {
  const all = await getCollection('equipo');
  return all
    .filter((e) => e.data.locale === locale && isVisible(e))
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getPublicaciones(locale: Locale) {
  const all = await getCollection('publicaciones');
  return all
    .filter((e) => e.data.locale === locale && isVisible(e))
    .sort((a, b) => b.data.year - a.data.year);
}

export async function getPage(slug: string, locale: Locale) {
  const all = await getCollection('pages');
  const page = all.find((p) => p.data.locale === locale && p.id === `${locale}/${slug}`);
  return page && isVisible(page) ? page : null;
}

export async function getBitacoraBySlug(slug: string, locale: Locale) {
  const all = await getCollection('bitacora');
  const entry = all.find((e) => e.data.locale === locale && e.id.endsWith(`/${slug}`));
  if (entry) return { entry, isFallback: false };

  if (locale === 'en') {
    const esEntry = all.find((e) => e.data.locale === 'es' && e.id.endsWith(`/${slug}`));
    if (!esEntry) return { entry: null, isFallback: false };

    const enEntry = all.find(
      (e) => e.data.locale === 'en' && e.data.translationKey === esEntry.data.translationKey,
    );
    if (enEntry) return { entry: enEntry, isFallback: false };
    return { entry: esEntry, isFallback: true };
  }

  return { entry: null, isFallback: false };
}

export function getEntrySlug(entry: { id: string }) {
  return entry.id.split('/').pop() ?? entry.id;
}
