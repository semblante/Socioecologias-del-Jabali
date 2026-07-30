import type { Locale } from '../config/site';
import { defaultLocale } from '../config/site';

export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return normalized === '/' ? '/' : normalized;
  if (normalized === '/') return `/${locale}/`;
  return `/${locale}${normalized}`;
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, first] = url.pathname.split('/');
  if (first === 'en') return 'en';
  return 'es';
}

export function switchLocalePath(pathname: string, target: Locale): string {
  const withoutLocale = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return localizedPath(withoutLocale, target);
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
