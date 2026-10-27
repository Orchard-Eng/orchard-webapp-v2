import DOMPurify from 'isomorphic-dompurify'

// Product/investment-type descriptions come from the backend's own admin content, but this
// repo has no visibility into that admin panel's security model — a single compromised
// admin account or authoring bug would otherwise become stored XSS in every investor's
// session. Strict allow-list: enough for rich-text formatting, nothing executable.
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'blockquote']
const ALLOWED_ATTR = ['href']

let hookRegistered = false
function ensureLinkHardeningHook() {
  if (hookRegistered) return
  hookRegistered = true
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

export function sanitizeHtml(html: string | null | undefined): string {
  ensureLinkHardeningHook()
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^https?:\/\//i
  })
}
