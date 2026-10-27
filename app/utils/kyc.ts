import type { UserProfile } from '~/types/api'

export function isKycComplete(user: UserProfile | null | undefined): boolean {
  return !!user?.profile?.verification_completed_at
}

// bvn_status/nin_status's real vocabulary was never observed live (KYC was out of scope
// during the original walkthrough — see plandocs/ORCHARD_HANDOFF.md §4.9) — match loosely against
// anything that reads as affirmative rather than assuming a specific exact value, and
// default to "not yet verified" for anything else (null, "pending", unrecognized, etc).
function looksVerified(status: string | null | undefined): boolean {
  if (!status) return false
  return /verif|success|complet/i.test(status)
}

export function isBvnVerified(user: UserProfile | null | undefined): boolean {
  return looksVerified(user?.profile?.bvn_status)
}

export function isNinVerified(user: UserProfile | null | undefined): boolean {
  return looksVerified(user?.profile?.nin_status)
}

export function hasLinkedBankAccount(user: UserProfile | null | undefined): boolean {
  return !!user?.profile?.nuban
}

/** Masks all but the last 4 characters, e.g. "22294663831" -> "•••••••3831". */
export function maskExceptLast4(value: string | null | undefined): string {
  if (!value) return '—'
  if (value.length <= 4) return value
  return '•'.repeat(value.length - 4) + value.slice(-4)
}
