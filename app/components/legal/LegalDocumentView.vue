<script setup lang="ts">
const props = defineProps<{ title: 'Terms' | 'Privacy Policy' }>()
const { data: doc, pending, error } = useLegalDocument(props.title)
const tocOpen = ref(false)
</script>

<template>
  <div>
    <div v-if="pending" class="space-y-3" aria-hidden="true">
      <div class="h-4 w-1/3 animate-pulse rounded bg-[var(--oc-bg-subtle)]" />
      <div class="h-4 w-full animate-pulse rounded bg-[var(--oc-bg-subtle)]" />
      <div class="h-4 w-11/12 animate-pulse rounded bg-[var(--oc-bg-subtle)]" />
      <div class="h-4 w-full animate-pulse rounded bg-[var(--oc-bg-subtle)]" />
      <div class="h-4 w-4/5 animate-pulse rounded bg-[var(--oc-bg-subtle)]" />
    </div>

    <p v-else-if="error || !doc" class="rounded-md bg-[var(--oc-status-danger-bg)] px-3 py-2 text-sm text-[var(--oc-status-danger-fg)]">
      We couldn't load this document right now. Please try again shortly.
    </p>

    <template v-else>
      <p class="mt-1 mb-6 text-xs text-[var(--oc-text-faint)]">Last updated {{ formatDate(doc.updatedAt) }}</p>

      <div class="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <nav v-if="doc.toc.length" class="mb-6 lg:mb-0 lg:sticky lg:top-8">
          <Accordion v-model:open="tocOpen" title="Contents" class="lg:hidden">
            <ul class="space-y-1">
              <li v-for="item in doc.toc" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="block py-1 text-sm text-[var(--oc-text-secondary)] hover:text-[var(--oc-text-primary)]"
                  @click="tocOpen = false"
                >
                  {{ item.text }}
                </a>
              </li>
            </ul>
          </Accordion>

          <div class="hidden lg:block">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--oc-text-faint)]">Contents</p>
            <ul class="max-h-[calc(100vh-8rem)] space-y-0.5 overflow-y-auto border-l border-[var(--oc-border-default)] pr-2">
              <li v-for="item in doc.toc" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="-ml-px block border-l-2 border-transparent py-1 pl-3 text-sm text-[var(--oc-text-secondary)] transition-colors duration-fast ease-standard hover:border-[var(--oc-border-strong)] hover:text-[var(--oc-text-primary)]"
                >
                  {{ item.text }}
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div class="min-w-0 oc-prose" v-html="doc.html" />
      </div>
    </template>
  </div>
</template>
