/** Parse "lat, lng" from sitios frontmatter. */
export function parseCoords(raw?: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  const parts = raw.split(',').map((s) => Number(s.trim()));
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
  return { lat: parts[0], lng: parts[1] };
}

/**
 * Zona de trabajo dibujada sobre el mapa. Cuando llegue el KMZ oficial:
 * convertirlo a GeoJSON (p. ej. en geojson.io), reemplazar el archivo y
 * poner `approximate: false` para quitar el «aprox.» de la leyenda.
 */
export const WORK_ZONE = {
  url: '/geo/zona-trabajo.geojson',
  approximate: true,
} as const;
