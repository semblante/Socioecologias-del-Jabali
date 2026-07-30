import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export function markdownToHtml(source: string): string {
  return marked.parse(source ?? '', { async: false }) as string;
}
