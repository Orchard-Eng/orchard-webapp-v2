/**
 * Resolves a Nigerian bank account number to its account holder's name via Paystack's
 * "Resolve Account Number" API, server-side only — that API requires a Paystack SECRET
 * key, which must never reach the browser (unlike the publishable key used for the
 * Paystack Inline funding flow, see app/utils/paystack.ts). The browser calls this
 * same-origin route; this route is the only thing that ever holds the secret key.
 *
 * This route sat with zero authentication and no rate limiting (flagged CRITICAL in the
 * 2026-09-07 security audit) — anyone on the internet could resolve any Nigerian bank
 * account number to a real name, for free, off Orchard's own Paystack quota. Now requires
 * a bearer token that's verified against the real backend, plus a per-IP rate limit.
 */
export default defineEventHandler(async (event) => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (isRateLimited(`resolve-account:${clientIp}`, 10, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again shortly.' })
  }

  const config = useRuntimeConfig()
  const target = `${config.apiBase}`

  const authorization = getRequestHeader(event, 'authorization')
  if (!authorization) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  // Remove trailing slashes to avoid malformed URLs.
  const apiBase = String(config.apiBase).replace(/\/+$/, '')
  const dashboardUrl = `${apiBase}/api/users/dashboard`

  try {
    await $fetch(dashboardUrl, { headers: { authorization } })
  } catch (error: any) {
    const upstreamStatus = error?.response?.status
      ?? error?.statusCode
      ?? error?.status
      ?? null

    console.error('Resolve-account authentication check failed', {
      upstreamStatus,
      message: error?.message ?? 'Unknown upstream error',
      dashboardUrl,
    })

    if (upstreamStatus === 401 || upstreamStatus === 403) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Your session is invalid or has expired. Please sign in again.',
      })
    }
    throw createError({ statusCode: 502, statusMessage: 'Authentication required' })
  }

  const { account_number: accountNumber, bank_code: bankCode } = getQuery(event)

  if (typeof accountNumber !== 'string' || typeof bankCode !== 'string' || !accountNumber || !bankCode) {
    throw createError({ statusCode: 400, statusMessage: 'account_number and bank_code are required' })
  }

  if (!config.paystackSecretKey) {
    throw createError({ statusCode: 500, statusMessage: 'Paystack secret key is not configured' })
  }

  try {
    const response = await $fetch<{ status: boolean; message: string; data?: { account_name: string; account_number: string } }>(
      'https://api.paystack.co/bank/resolve',
      {
        query: { account_number: accountNumber, bank_code: bankCode },
        headers: { Authorization: `Bearer ${config.paystackSecretKey}` }
      }
    )

    if (!response.status || !response.data?.account_name) {
      throw createError({ statusCode: 422, statusMessage: response.message || 'Could not resolve this account number' })
    }

    return { account_name: response.data.account_name }
  } catch (error) {
    // const fallbackMessage = 'Could not resolve this account number'

    // const message =
    //   error &&
    //     typeof error === 'object' &&
    //     'data' in error &&
    //     error.data &&
    //     typeof error.data === 'object' &&
    //     'message' in error.data
    //     ? String((error.data as { message: unknown }).message)
    //     : fallbackMessage

    // // Preserve errors deliberately created by your own code.
    // if (
    //   error &&
    //   typeof error === 'object' &&
    //   'statusCode' in error &&
    //   error.statusCode === 422
    // ) {
    //   throw error
    // }

    // throw createError({
    //   statusCode: 422,
    //   statusMessage: fallbackMessage,
    // })
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    const message =
      error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
        ? String((error.data as { message: unknown }).message)
        : 'Could not resolve this account number'
    throw createError({ statusCode: 422, statusMessage: message })
  }
})
