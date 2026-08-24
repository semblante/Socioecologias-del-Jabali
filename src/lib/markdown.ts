import { marked, type Tokens } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const renderer = new marked.Renderer();
renderer.heading = ({ tokens, depth, text }: Tokens.Heading) => {
  const label = marked.Parser.parseInline(tokens);
  const id = slugifyHeading(text);
  return `<h${depth} id="${id}">${label}</h${depth}>\n`;
};
marked.use({ renderer });

/** Nombre científico del jabalí: siempre en itálica en el HTML de salida. */
export function italicizeSusScrofa(html: string): string {
  // ponytail: solo este binomio; si aparecen otros, generalizar a lista de especies.
  return html.replace(/<\/?em>\s*Sus scrofa\s*<\/?em>|Sus scrofa/gi, '<em>Sus scrofa</em>');
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Texto plano → HTML seguro con Sus scrofa en itálica. */
export function textWithSpecies(text: string): string {
  return italicizeSusScrofa(escapeHtml(text ?? ''));
}

export function markdownToHtml(source: string): string {
  return italicizeSusScrofa(marked.parse(source ?? '', { async: false }) as string);
}
