import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  langPaths,
  metaAfterNavigation,
  nextLangHrefs,
  prefixLangHrefs,
  resolveCuaderno,
  seoPaths,
  type CuadernoRef,
} from './cuaderno-locale.ts';

function ref(partial: CuadernoRef): CuadernoRef {
  return partial;
}

const pair = [
  ref({ id: 'a-es', slug: 'campo', locale: 'es', translationKey: 'par-a', status: 'published' }),
  ref({ id: 'a-en', slug: 'field', locale: 'en', translationKey: 'par-a', status: 'published' }),
  ref({ id: 'b-es', slug: 'field', locale: 'es', translationKey: 'par-b', status: 'published' }),
  ref({ id: 'b-en', slug: 'campo', locale: 'en', translationKey: 'par-b', status: 'published' }),
];

describe('par con slugs distintos', () => {
  it('enlaza el slug real del mismo translationKey y no el de la colisión', () => {
    const es = resolveCuaderno(pair, 'campo', 'es');
    assert.equal(es.entry?.id, 'a-es');
    assert.equal(es.counterpart?.slug, 'field');
    assert.equal(es.counterpart?.translationKey, 'par-a');
    assert.deepEqual(langPaths(es), { es: '/cuaderno/campo', en: '/en/cuaderno/field' });

    const en = resolveCuaderno(pair, 'field', 'en');
    assert.equal(en.entry?.id, 'a-en');
    assert.equal(en.counterpart?.slug, 'campo');
    assert.equal(en.counterpart?.translationKey, 'par-a');
    assert.deepEqual(langPaths(en), { es: '/cuaderno/campo', en: '/en/cuaderno/field' });
  });
});

describe('alias EN del slug ES', () => {
  const notes = [
    ref({ id: 'es', slug: 'notas', locale: 'es', translationKey: 'notas', status: 'published' }),
    ref({ id: 'en', slug: 'notes', locale: 'en', translationKey: 'notas', status: 'published' }),
  ];

  it('redirige al slug EN real y no deja una segunda canonical', () => {
    const alias = resolveCuaderno(notes, 'notas', 'en');
    assert.equal(alias.redirectTo, '/en/cuaderno/notes');
    assert.equal(alias.isFallback, false);
    const seo = seoPaths(alias);
    assert.equal(seo.canonical, '/en/cuaderno/notes');
    assert.equal(seo.en, '/en/cuaderno/notes');
    assert.notEqual(seo.canonical, '/en/cuaderno/notas');
  });
});

describe('header persistente', () => {
  it('conserva los destinos resueltos y no los reemplaza por prefijos', () => {
    const resolved = { es: '/cuaderno/campo', en: '/en/cuaderno/field' };
    assert.deepEqual(nextLangHrefs(resolved, '/cuaderno/notas'), resolved);
    assert.notDeepEqual(nextLangHrefs(resolved, '/cuaderno/campo'), prefixLangHrefs('/cuaderno/campo'));
  });
});

describe('canonical y alternates', () => {
  it('usa las URLs del par y no emite draft, ausente ni ambiguo', () => {
    const published = [
      ref({ id: 'es', slug: 'notas', locale: 'es', translationKey: 'notas', status: 'published' }),
      ref({ id: 'en', slug: 'notes', locale: 'en', translationKey: 'notas', status: 'draft' }),
    ];
    const drafty = resolveCuaderno(published, 'notas', 'es');
    assert.equal(drafty.counterpart, null);
    assert.equal(seoPaths(drafty).en, null);
    assert.equal(langPaths(drafty).en, '/en/cuaderno');

    const duplicated = [
      ref({ id: 'es', slug: 'notas', locale: 'es', translationKey: 'notas', status: 'published' }),
      ref({ id: 'en1', slug: 'notes', locale: 'en', translationKey: 'notas', status: 'published' }),
      ref({ id: 'en2', slug: 'notes-2', locale: 'en', translationKey: 'notas', status: 'reviewed' }),
    ];
    const ambiguous = resolveCuaderno(duplicated, 'notas', 'es');
    assert.equal(ambiguous.ambiguous, true);
    assert.equal(ambiguous.counterpart, null);
    assert.notEqual(ambiguous.counterpart && ambiguous.counterpart.id, 'en1');
    assert.equal(seoPaths(ambiguous).en, null);

    const stale = [{ hreflang: 'en', href: 'https://ecologiasdeljabali.cl/en/cuaderno/notas' }];
    const incoming = [{ hreflang: 'en', href: 'https://ecologiasdeljabali.cl/en/cuaderno/notes' }];
    const next = metaAfterNavigation({
      canonical: 'https://ecologiasdeljabali.cl/cuaderno/notas',
      alternates: incoming,
    });
    assert.deepEqual(next.alternates, incoming);
    assert.notDeepEqual(next.alternates, stale);
  });
});

describe('sin contraparte visible', () => {
  it('el otro idioma va al índice y el fallback no finge traducción', () => {
    const onlyEs = [ref({ id: 'es', slug: 'notas', locale: 'es', translationKey: 'notas', status: 'published' })];
    const fallback = resolveCuaderno(onlyEs, 'notas', 'en');
    assert.equal(fallback.isFallback, true);
    assert.equal(fallback.redirectTo, null);
    assert.equal(fallback.entry?.locale, 'es');
    assert.deepEqual(langPaths(fallback), { es: '/cuaderno/notas', en: '/en/cuaderno' });
    const seo = seoPaths(fallback);
    assert.equal(seo.canonical, '/cuaderno/notas');
    assert.equal(seo.en, null);
  });
});

describe('translationKey duplicado', () => {
  it('no elige la primera entrada', () => {
    const rows = [
      ref({ id: 'a', slug: 'uno', locale: 'es', translationKey: 'k', status: 'published' }),
      ref({ id: 'b', slug: 'uno', locale: 'es', translationKey: 'k', status: 'published' }),
    ];
    const resolved = resolveCuaderno(rows, 'uno', 'es');
    assert.equal(resolved.ambiguous, true);
    assert.equal(resolved.entry, null);
  });
});

describe('slug igual y rutas estáticas', () => {
  it('mantiene el prefijo cuando el par comparte slug o no hay par', () => {
    const same = [
      ref({ id: 'es', slug: 'notas', locale: 'es', translationKey: 'notas', status: 'published' }),
      ref({ id: 'en', slug: 'notas', locale: 'en', translationKey: 'notas', status: 'placeholder' }),
    ];
    const resolved = resolveCuaderno(same, 'notas', 'es');
    assert.deepEqual(langPaths(resolved), { es: '/cuaderno/notas', en: '/en/cuaderno/notas' });
    assert.deepEqual(prefixLangHrefs('/proyecto'), { es: '/proyecto', en: '/en/proyecto' });
    assert.deepEqual(nextLangHrefs(null, '/'), { es: '/', en: '/en/' });
  });
});
