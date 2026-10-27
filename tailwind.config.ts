import type { Config } from 'tailwindcss'
import orchard from './app/assets/tailwind/orchard.theme'

export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue'
  ],
  theme: {
    extend: orchard
  }
} satisfies Config
