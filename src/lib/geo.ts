/** Parse "lat, lng" from sitios frontmatter. */
export function parseCoords(raw?: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  const parts = raw.split(',').map((s) => Number(s.trim()));
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
  return { lat: parts[0], lng: parts[1] };
}
