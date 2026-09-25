export type CuadernoLocale = 'es' | 'en';

export type CuadernoRef = {
  id: string;
  slug: string;
  locale: CuadernoLocale;
  translationKey: string;
  status?: string;
};

export type ResolveResult = {
  entry: CuadernoRef | null;
  isFallback: boolean;
  counterpart: CuadernoRef | null;
  ambiguous: boolean;
  redirectTo: string | null;
};

const VISIBLE_STATUSES = ['published', 'reviewed', 'placeholder'] as const;

export function isVisibleStatus(status?: string) {
  return VISIBLE_STATUSES.includes((status ?? 'published') as (typeof VISIBLE_STATUSES)[number]);
}

export function cuadernoPath(locale: CuadernoLocale, slug?: string) {
  const base = slug ? `/cuaderno/${slug}` : '/cuaderno';
  return locale === 'en' ? `/en${base}` : base;
}

function otherLocale(locale: CuadernoLocale): CuadernoLocale {
  return locale === 'es' ? 'en' : 'es';
}

function empty(ambiguous = false): ResolveResult {
  return { entry: null, isFallback: false, counterpart: null, ambiguous, redirectTo: null };
}

export function resolveCuaderno(records: CuadernoRef[], slug: string, locale: CuadernoLocale): ResolveResult {
  const visible = records.filter((r) => isVisibleStatus(r.status));
  const direct = visible.filter((r) => r.locale === locale && r.slug === slug);
  if (direct.length > 1) return empty(true);

  if (direct.length === 1) {
    const entry = direct[0];
    const mates = visible.filter(
      (r) => r.locale === otherLocale(locale) && r.translationKey === entry.translationKey,
    );
    return {
      entry,
      isFallback: false,
      counterpart: mates.length === 1 ? mates[0] : null,
      ambiguous: mates.length > 1,
      redirectTo: null,
    };
  }

  if (locale === 'en') {
    const es = visible.filter((r) => r.locale === 'es' && r.slug === slug);
    if (es.length !== 1) return empty(es.length > 1);
    const mates = visible.filter((r) => r.locale === 'en' && r.translationKey === es[0].translationKey);
    if (mates.length > 1) return empty(true);
    if (mates.length === 1 && mates[0].slug !== slug) {
      return {
        entry: mates[0],
        isFallback: false,
        counterpart: es[0],
        ambiguous: false,
        redirectTo: cuadernoPath('en', mates[0].slug),
      };
    }
    return { entry: es[0], isFallback: true, counterpart: null, ambiguous: false, redirectTo: null };
  }

  return empty();
}

export function langPaths(result: ResolveResult): { es: string; en: string } {
  const index = { es: cuadernoPath('es'), en: cuadernoPath('en') };
  if (!result.entry) return index;
  if (result.isFallback) return { es: cuadernoPath('es', result.entry.slug), en: index.en };

  const self = cuadernoPath(result.entry.locale, result.entry.slug);
  const other =
    result.counterpart && !result.ambiguous
      ? cuadernoPath(result.counterpart.locale, result.counterpart.slug)
      : null;
  if (result.entry.locale === 'es') return { es: self, en: other ?? index.en };
  return { es: other ?? index.es, en: self };
}

export function seoPaths(result: ResolveResult): { canonical: string; es: string | null; en: string | null } {
  if (!result.entry) return { canonical: cuadernoPath('es'), es: null, en: null };
  if (result.isFallback) {
    const es = cuadernoPath('es', result.entry.slug);
    return { canonical: es, es, en: null };
  }
  const self = cuadernoPath(result.entry.locale, result.entry.slug);
  const other =
    result.counterpart && !result.ambiguous
      ? cuadernoPath(result.counterpart.locale, result.counterpart.slug)
      : null;
  if (result.entry.locale === 'es') return { canonical: self, es: self, en: other };
  return { canonical: self, es: other, en: self };
}

export function prefixLangHrefs(path: string): { es: string; en: string } {
  const without = path.replace(/^\/en(?=\/|$)/, '') || '/';
  const es = without === '/' ? '/' : without;
  const en = without === '/' ? '/en/' : `/en${without}`;
  return { es, en };
}

/** Destinos del documento nuevo ganan. El prefijo solo cubre páginas sin par resuelto. */
export function nextLangHrefs(
  fromDocument: { es: string; en: string } | null,
  path: string,
): { es: string; en: string } {
  if (fromDocument?.es && fromDocument.en) return fromDocument;
  return prefixLangHrefs(path);
}

export type AlternateLink = { hreflang: string; href: string };

/** Tras navegar, canonical y alternates son los del documento nuevo. */
export function metaAfterNavigation(incoming: { canonical: string | null; alternates: AlternateLink[] }) {
  return { canonical: incoming.canonical, alternates: incoming.alternates };
}
