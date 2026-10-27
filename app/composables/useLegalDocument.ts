import type { LegalDocument } from '~/types/cms'

interface HygraphDocumentsResponse {
  data?: {
    documents: { title: string; updatedAt: string; body: { html: string } }[]
  }
}

const QUERY = `query($t: String) { documents(where: { title: $t }) { title updatedAt body { html } } }`

/**
 * Fetches a legal document ("Terms" / "Privacy Policy") from Hygraph's public,
 * token-free Content API — safe to call straight from the browser, unlike the Orchard
 * backend which is proxied server-side for CORS/Sanctum reasons (see server/api/proxy).
 */
export function useLegalDocument(title: 'Terms' | 'Privacy Policy') {
  const config = useRuntimeConfig()
  return useAsyncData<LegalDocument | null>(`cms-doc-${title}`, async () => {
    const res = await $fetch<HygraphDocumentsResponse>(config.public.hygraphEndpoint, {
      method: 'POST',
      body: { query: QUERY, variables: { t: title } }
    })
    const doc = res.data?.documents?.[0]
    if (!doc) return null
    const { html, toc } = enhanceLegalHtml(doc.body.html)
    return { title: doc.title, updatedAt: doc.updatedAt, html, toc }
  })
}
