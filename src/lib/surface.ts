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
