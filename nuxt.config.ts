// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/image'
  ],

  colorMode: {
    classSuffix: '',
    dataValue: 'theme',
    preference: 'system',
    fallback: 'light'
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css'
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  typescript: {
    strict: true
  },

  /**
   * this also works, but the env vars are not automatically populated into runtimeConfig, so we have to manually set them in .env and .env.prod. The below is the recommended way to do it.
   * runtimeConfig: {
    paystackSecretKey: process.env.NUXT_PAYSTACK_SECRET_KEY,
    storageUrl: process.env.NUXT_STORAGE_URL,

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      paystackPublicKey: process.env.NUXT_PAYSTACK_PUBLIC_KEY
    }
  }
   */
  runtimeConfig: {
    // Server-only
    // Automatically populated from NUXT_PAYSTACK_SECRET_KEY
    apiBase: '',
    paystackSecretKey: '',

    // Automatically populated from NUXT_STORAGE_URL
    //storageUrl: '',

    public: {
      // Automatically populated from NUXT_PUBLIC_API_BASE
      apiBase: '/api/proxy/',

      // Automatically populated from NUXT_PAYSTACK_PUBLIC_KEY
      paystackPublicKey: '',
      storageUrl: '',
      // Hygraph's public, token-free Content API (read-only CDN) — hosts the "Terms" and
      // "Privacy Policy" documents rendered on /terms and /privacy. Safe to call directly
      // from the browser, unlike the Orchard backend (see server/api/proxy).
      hygraphEndpoint: 'https://eu-west-2.cdn.hygraph.com/content/cmsfxttwc01dq06w6viwakz8g/master'
    }
  },

  // Baseline security headers (flagged MEDIUM in the 2026-09-07 security audit — none
  // existed before). No module needed for a static set like this.
  //
  // script-src/style-src include 'unsafe-inline' because Nuxt's own SSR payload script
  // and Vue's :style bindings both rely on it, and there's no nonce plumbing wired up here
  // — the actual XSS control for backend-authored HTML is the DOMPurify sanitization in
  // app/utils/sanitizeHtml.ts (which strips <script> outright), not this header. The real
  // value of this CSP is restricting which *origins* can load a script/frame/connection at
  // all — only self and Paystack's own domains are allowed.
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://js.paystack.co",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https://ship.crowdital.com",
          "font-src 'self'",
          "connect-src 'self' https://api.paystack.co https://eu-west-2.cdn.hygraph.com",
          "frame-src https://checkout.paystack.com https://js.paystack.co",
          "object-src 'none'",
          "base-uri 'self'"
        ].join('; ')
      }
    }
  },

  app: {
    pageTransition: {
      name: 'oc-fade',
      mode: 'out-in'
    },

    head: {
      titleTemplate: '%s · Orchard',

      meta: [
        {
          name: 'description',
          content:
            'Orchard makes investing simple — track your portfolio, fund your wallet, and grow your money with curated investment products.'
        },
        {
          property: 'og:site_name',
          content: 'Orchard'
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        }
      ],

      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico'
        },
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/images/icon.svg'
        }
      ]
    }
  },

  vite: {
    plugins: [
      {
        name: 'remixicon-vue-pure-annotate',

        transform(code: string, id: string) {
          if (
            !id.includes('@remixicon/vue') ||
            !id.endsWith('.mjs')
          ) {
            return
          }

          return code.replaceAll(
            'e({name:"Ri',
            '/*#__PURE__*/ e({name:"Ri'
          )
        }
      }
    ]
  }
})
