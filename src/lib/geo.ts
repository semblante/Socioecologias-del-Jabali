/** Parse "lat, lng" from sitios frontmatter. */
export function parseCoords(raw?: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  const parts = raw.split(',').map((s) => Number(s.trim()));
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
  return { lat: parts[0], lng: parts[1] };
}

/**
 * Zona de trabajo dibujada sobre el mapa. Polígono del KMZ de Tironi
 * (gobernanza, Parque Nacional Villarrica), convertido sin simplificar y con
 * su anillo interior conservado. `approximate: false` quita el «aprox.» de la leyenda.
 */
/**
 * Los puntos de sitios (`sitios.coordenadas`) no son dato entregado por Manuel
 * Tironi: eran estimaciones y el KMZ de gobernanza solo trae el polígono. Mientras
 * esté en `false`, los mapas muestran solo la zona. Pasar a `true` cuando las
 * coordenadas del panel estén verificadas por el equipo.
 */
export const SITE_MARKERS_VERIFIED = false;

export const WORK_ZONE = {
  url: '/geo/zona-trabajo.geojson',
  approximate: false,
} as const;
