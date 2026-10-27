const nairaFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

/**
 * Hand-rolled rather than Intl's NGN currency formatting, to guarantee the exact
 * "₦1,234.56" shape independent of locale-data quirks across environments.
 *
 * The real API returns numeric amounts inconsistently — sometimes a plain number,
 * sometimes a string, and wallet.balance specifically comes pre-formatted with commas
 * (e.g. "230,650.00", confirmed via a live account, 2026-08-19) — so commas are stripped
 * before parsing rather than assuming a clean numeric string.
 */
export function formatNaira(value: number | string): string {
  const cleaned = typeof value === 'string' ? value.replace(/,/g, '') : value
  const num = Math.abs(Number(cleaned) || 0)
  const sign = Number(cleaned) < 0 ? '-' : ''
  return `${sign}₦${nairaFormatter.format(num)}`
}
