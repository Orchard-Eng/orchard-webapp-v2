import type { ProseTocEntry } from '~/types/cms'

/**
 * The legal documents in Hygraph use plain <h3> tags for their numbered sections
 * ("1. Introduction...", "2. What Orchard Is...") with no ids and no other heading
 * levels in between — so h3 is both the TOC source and the anchor target. Also wraps
 * <table> elements (used in the Privacy Policy's data-processing table) so a wide table
 * scrolls horizontally instead of breaking the page layout on mobile.
 */
export function enhanceLegalHtml(html: string): { html: string; toc: ProseTocEntry[] } {
  const toc: ProseTocEntry[] = []
  const seen = new Map<string, number>()

  let result = html.replace(/<h3([^>]*)>([\s\S]*?)<\/h3>/gi, (match, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    if (!text) return match
    let slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section'
    const count = seen.get(slug) ?? 0
    seen.set(slug, count + 1)
    if (count > 0) slug = `${slug}-${count}`
    toc.push({ id: slug, text })
    return `<h3${attrs} id="${slug}">${inner}</h3>`
  })

  result = result
    .replace(/<table>/gi, '<div class="oc-prose-table-wrap"><table>')
    .replace(/<\/table>/gi, '</table></div>')

  return { html: result, toc }
}
