export interface ProseTocEntry {
  id: string
  text: string
}

export interface LegalDocument {
  title: string
  updatedAt: string
  html: string
  toc: ProseTocEntry[]
}
