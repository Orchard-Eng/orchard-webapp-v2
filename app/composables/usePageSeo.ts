import type { MaybeRefOrGetter } from 'vue'

/**
 * Plain useSeoMeta({ title, description }) does NOT auto-populate og:title/og:description/
 * twitter:title/twitter:description (that inference is a nuxt-seo-utils/@nuxtjs/seo module
 * feature, not core Unhead) — confirmed by inspecting the rendered <head>, this app has
 * neither module installed. Mirror the values explicitly instead so link previews actually
 * show a title/description, not just the image.
 */
export function usePageSeo(title: MaybeRefOrGetter<string>, description: MaybeRefOrGetter<string>) {
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description
  })
}
