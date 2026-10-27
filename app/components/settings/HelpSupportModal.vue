<script setup lang="ts">
import { RiFacebookBoxLine, RiInstagramLine, RiLinkedinBoxLine, RiMailLine, RiPhoneLine, RiTwitterXLine } from '@remixicon/vue'

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <Modal v-model:open="open" title="Help & Support">
    <div class="space-y-4">
      <div class="flex items-center gap-3 text-sm">
        <RiPhoneLine class="h-4 w-4 text-[var(--oc-text-muted)]" />
        <span class="text-[var(--oc-text-primary)]">+234 706 0726 012</span>
        <CopyButton text="+234 706 0726 012" label="Copy phone number" />
      </div>
      <div class="flex items-center gap-3 text-sm">
        <RiPhoneLine class="h-4 w-4 text-[var(--oc-text-muted)]" />
        <span class="text-[var(--oc-text-primary)]">+234 704 8582 184</span>
        <CopyButton text="+234 704 8582 184" label="Copy phone number" />
      </div>
      <div class="flex items-center gap-3 text-sm">
        <RiMailLine class="h-4 w-4 text-[var(--oc-text-muted)]" />
        <span class="text-[var(--oc-text-primary)]">info@crowdital.com</span>
        <CopyButton text="info@crowdital.com" label="Copy email" />
      </div>
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--oc-text-muted)]">Connect with us</p>
        <div class="flex gap-3 text-[var(--oc-text-secondary)]">
          <RiFacebookBoxLine class="h-5 w-5" />
          <RiTwitterXLine class="h-5 w-5" />
          <RiInstagramLine class="h-5 w-5" />
          <RiLinkedinBoxLine class="h-5 w-5" />
        </div>
      </div>
    </div>
  </Modal>
</template>
