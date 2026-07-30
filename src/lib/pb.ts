import PocketBase from 'pocketbase';

export function getPb() {
  const url = import.meta.env.PUBLIC_POCKETBASE_URL;
  if (!url) throw new Error('PUBLIC_POCKETBASE_URL is not set');
  return new PocketBase(url);
}

export function fileUrl(_pb: ReturnType<typeof getPb>, _record: { id: string }, filename?: string) {
  if (!filename) return undefined;
  if (/^https?:\/\//i.test(filename) || filename.startsWith('/')) return filename;
  return `/${filename.replace(/^\/+/, '')}`;
}
