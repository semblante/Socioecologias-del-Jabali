export type Surface = 'editorial' | 'territory' | 'archive';

/** Deriva la variante topográfica del path sin prefijo /en. */
export function surfaceFromPath(path: string): Surface {
  const without = path.replace(/^\/en(?=\/|$)/, '') || '/';
  if (without.startsWith('/territorio')) return 'territory';
  if (
    without.startsWith('/bitacora') ||
    without.startsWith('/cuaderno') ||
    without.startsWith('/publicaciones')
  ) {
    return 'archive';
  }
  return 'editorial';
}

/**
 * Relieve de fondo por vista. Portada y Territorio usan el mapa real de la
 * Araucanía; el resto, un terreno propio generado con scripts/gen-topo.mjs.
 * Al navegar, client-nav funde la capa vieja con la nueva.
 */
export interface TopoVariant {
  key: string;
  image: string;
  position: string;
  size: string;
  filter: string;
  opacity: number;
}

const REAL_MAP = '/textures/mapa-topografico-fondo.png';

const TOPO: Record<string, Omit<TopoVariant, 'key'>> = {
  home: { image: REAL_MAP, position: '38% 42%', size: 'cover', filter: 'sepia(0.35) hue-rotate(8deg) saturate(0.55) brightness(0.92)', opacity: 0.08 },
  territorio: { image: REAL_MAP, position: '72% 28%', size: '135% auto', filter: 'sepia(0.5) hue-rotate(85deg) saturate(0.6)', opacity: 0.1 },
  proyecto: { image: '/textures/topo-proyecto.svg', position: '50% 30%', size: 'cover', filter: 'sepia(0.6) hue-rotate(-12deg) saturate(1.4)', opacity: 0.1 },
  equipo: { image: '/textures/topo-equipo.svg', position: '50% 50%', size: 'cover', filter: 'sepia(0.4) saturate(0.8)', opacity: 0.095 },
  cuaderno: { image: '/textures/topo-cuaderno.svg', position: '30% 60%', size: 'cover', filter: 'sepia(0.5) hue-rotate(60deg) saturate(1.1)', opacity: 0.1 },
  archivo: { image: '/textures/topo-archivo.svg', position: '60% 40%', size: 'cover', filter: 'sepia(0.3) hue-rotate(-25deg)', opacity: 0.09 },
  publicaciones: { image: '/textures/topo-publicaciones.svg', position: '50% 50%', size: 'cover', filter: 'sepia(0.45) hue-rotate(160deg) saturate(0.9)', opacity: 0.095 },
  productos: { image: '/textures/topo-productos.svg', position: '40% 50%', size: 'cover', filter: 'sepia(0.55) hue-rotate(20deg) saturate(1.2)', opacity: 0.095 },
  contacto: { image: '/textures/topo-contacto.svg', position: '50% 70%', size: 'cover', filter: 'sepia(0.4) hue-rotate(-40deg) saturate(1.1)', opacity: 0.095 },
};

export function topoFromPath(path: string): TopoVariant {
  const without = path.replace(/^\/en(?=\/|$)/, '') || '/';
  const first = without.split('/').filter(Boolean)[0] ?? 'home';
  const alias: Record<string, string> = { bitacora: 'cuaderno' };
  const key = alias[first] ?? (first in TOPO ? first : 'home');
  return { key, ...TOPO[key] };
}

export function topoStyle(t: TopoVariant): string {
  return [
    `--topo-image:url("${t.image}")`,
    `--topo-position:${t.position}`,
    `--topo-size:${t.size}`,
    `--topo-filter:${t.filter}`,
    `--topo-opacity:${t.opacity}`,
  ].join(';');
}
