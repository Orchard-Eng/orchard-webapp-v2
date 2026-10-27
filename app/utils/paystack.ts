declare global {
  interface Window {
    // Inline JS v2 (https://js.paystack.co/v2/inline.js) — replaces v1's
    // PaystackPop.setup({...}).openIframe() with `new PaystackPop().newTransaction({...})`.
    // The script's own top-level export is `var PaystackPop = function() {...}` (confirmed
    // by fetching the script directly, 2026-09-08) — not `window.Paystack`, despite the "new
    // Paystack()" naming used in Paystack's own docs examples.
    // callback -> onSuccess, onClose -> onCancel; onLoad is new in v2 (fires once the
    // popup has actually rendered, used to bridge the loading gap before then).
    PaystackPop?: new () => {
      newTransaction(options: {
        key: string
        email: string
        amount: number
        currency?: string
        reference?: string
        onSuccess?: (transaction: { reference: string }) => void
        onCancel?: () => void
        onLoad?: () => void
        onError?: (error: { message: string }) => void
      }): void
    }
  }
}

const SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js'
let loadPromise: Promise<void> | null = null

/**
 * No @nuxt/scripts dependency in this app — a plain on-demand injection matches the
 * codebase's existing hand-rolled-over-library convention (see formatNaira, PinInput, etc).
 */
export function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Could not load Paystack.'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
