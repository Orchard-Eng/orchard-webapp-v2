/**
 * API types for https://ship.crowdital.com/api/ — see plandocs/ORCHARD_HANDOFF.md §5 for source
 * payloads. Sanctum-style bearer auth (see useApi.ts / stores/auth.ts), no cookies.
 *
 * Most shapes below are confirmed against REAL responses captured live on 2026-08-19 by
 * logging into the developer's own account — a materially stronger source than the
 * original handoff (which never observed a live login) or the compiled-JS-bundle
 * inspection that preceded this pass. Endpoints not exercised this way still carry their
 * earlier provenance notes.
 */

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

/** Error responses are NOT wrapped in ApiEnvelope — confirmed by testing POST
 * /users/auth/login directly. Two shapes were observed for different failure kinds:
 * {status: false, message} for validation/not-found errors, {success: false, message,
 * data: "attempts_left N"} for login lockout counting. Both carry a `message` string,
 * which is all getApiErrorMessage() (~/utils/errors.ts) relies on. */

// ---------------------------------------------------------------------------
// Confirmed live, 2026-08-19 (GET /users/dashboard, POST /users/auth/login)
// ---------------------------------------------------------------------------

export interface UserProfileDetails {
  uuid: string
  account_id: string
  firstname: string
  lastname: string
  othername: string | null
  username: string
  gender: string
  country_id: number
  transaction_count: number | null
  address_line_1: string
  alt_phone_number: string | null
  profile_photo: string | null
  investment_balance: string
  user_transaction_limit: string | null
  dob: string
  personal_details_completed_at: string | null
  suspended_at: string | null
  verification_completed_at: string | null
  verification_status: string
  // The Orchard-managed virtual account for funding the wallet (shown in the Wallet
  // Funding modal) — distinct from nuban/nuban_* below, the user's own linked account.
  v_bank_name: string
  v_bank_acct_name: string
  v_bank_number: string
  // The user's own linked withdrawal bank account (Settings → Bank Details, and Send
  // Money's destination).
  nuban: string | null
  nuban_account_name: string | null
  nuban_bank: string | null
  bvn: string | null
  bvn_status: string | null
  nin: string | null
  nin_status: string | null
  account_level: string
  created_at: string
}

export interface UserWallet {
  uuid: string
  name: string
  nuban: string | null
  // Pre-formatted with commas by the API (e.g. "230,650.00") — formatNaira() strips
  // commas before parsing, don't assume a clean numeric string elsewhere.
  balance: string
  book_balance: string
  status: string
}

export interface UserProfile {
  uuid: string
  email: string
  mobile_number: string
  otp_verified_at: string | null
  account_status: string
  profile: UserProfileDetails
  wallet: UserWallet
  deactivated_at: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
  suspended_at: string | null
  ref_token: string
  referral_code: string
  requires_2fa: boolean
  // bcrypt hash of the transaction PIN — the backend includes this on every
  // dashboard/login response (confirmed still true live, 2026-08-19). Never render it;
  // this is a known backend over-exposure issue worth flagging independently of the
  // frontend (see plandocs/ORCHARD_HANDOFF.md §4.0/§7).
  transaction_pin: string
  two_factor_enabled: boolean
  is_pep: boolean
  isLogin: boolean
  is_suspended: boolean
  referral_stats: {
    total_referred: number
    pending_bonus: number
    total_bonus: number
  }
}

export interface DashboardData {
  status: boolean
  dashboard_data: {
    user: UserProfile
  }
}

export interface InvestmentProduct {
  product_id: string
  // Confirmed via the Postman collection: GET /users/investments/products/{{slug}}
  // replaced the old ID-based detail lookup. product_id is still the real join key for
  // POST /users/investments/order/invest and the portfolio holdings join
  // (PortfolioHolding.product_id) — slug is only for the product detail route/link.
  slug: string
  product_name: string
  product_type_id: string
  partner_type_id: string
  description: string
  investment_note: string
  min_tenure: number
  min_amount: string
  interest: string
  sell_price: string | null
  buy_price: string | null
  is_active: boolean
  available_volume: string
  purchased_volume: string
  balance_withdrawn: string | null
  maturity_date: string
  featured: boolean
  product_image: string
  // Percent, both applied against the invested principal — see the invest flow's fee/
  // payout computation (app/pages/investments/products/[id].vue) for how these combine.
  tax: string
  tr_fee: string
  tr_fee_cap: string
  partner: { uuid: string; name: string }
  risk_category: { uuid: string; name: string; colour_code: string; icon: string }
}

export interface InvestmentType {
  uuid: string
  name: string
  description: string
  pricing_model: string
  product_type_image: string
  interest_type: { uuid: string; name: string }
  risk_category: { uuid: string; name: string; colour_code: string; icon: string }
  created_at: string
  updated_at: string
}

export interface PortfolioTypeSummary {
  product_type_id: string
  product_type_name: string
  total_invested: number
  total_expected_payout: number
  total_accumulated_yield: number
  total_orders: number
  type_image: string
  status: string
  statuses: string[]
  status_breakdown: Record<string, number>
}

export interface PortfolioSummary {
  portfolio_data: PortfolioTypeSummary[]
  active_portfolio: number
  completed_portfolio: number
}

export interface PortfolioHolding {
  order_id: string
  uuid: string
  product_id: string
  amount_invested: number
  // Numeric-looking fields the portfolio-items endpoint returns as strings, unlike the
  // portfolio-summary endpoint's plain numbers above — confirmed live, 2026-08-19.
  quantity: string
  price: string
  interest_rate: string
  minimum_tenure: number
  product_name: string
  expected_payout: string
  accumulated_yield: string
  daily_yield: string
  percentage_gain: number
  status: string
  maturity_date: string
  created_at: string
}

export interface PortfolioTypeDetail extends PortfolioTypeSummary {
  total_expected_gain: number
  investments: PortfolioHolding[]
}

// CONFIRMED LIVE, 2026-09-08: this endpoint does NOT actually validate the pin server-side
// — a deliberately wrong pin still returns success:true and genuinely places the order.
// Same gap confirmed on enable2fa below. See TwoFactorToggleRequest's comment.
export interface InvestOrderRequest {
  product_id: string
  quantity: number
  price: number
  pin: string
}

// unverified shape — order/invest itself was never exercised live (a real submission
// would create an actual investment on the account); shape inferred from the confirmed
// portfolio-items response, which returns orders in the same general form.
export interface InvestOrder {
  user_id: string
  product_id: string
  order_id: string
  price: number
  quantity: number
  daily_yield: number
  accumulated_yield: number
  expected_payout: number
  status: string
  maturity_date: string
  meta: string
  tax_amount: number
  uuid: string
  updated_at: string
  created_at: string
}

export interface InvestOrderTransaction {
  user_id: string
  reference: string
  amount: number
  type: 'debit' | 'credit'
  description: string
  merchant_ref: string
  status: string
  fee_currency: string
  transaction_date: string
  [key: string]: unknown
}

export interface InvestOrderResponse {
  order: InvestOrder
  transaction: InvestOrderTransaction
}

export interface Transaction {
  uuid: string
  user_id: string
  reference: string
  transactionable_type: string
  transactionable_id: string
  // Free-form category, not a binary direction — observed values include "debit" and
  // "investment"; treat as a label, not a credit/debit flag (see TransactionRow.vue's
  // isCredit heuristic).
  type: string
  amount: string
  transaction_date: string
  fee: string
  fee_currency: string
  status: string
  pay_method: string
  description: string
  merchant_ref: string
  metadata: unknown
  created_at: string
  updated_at: string
  transaction_source: string | null
  transaction_destination: string | null
  // Human-readable ID shown in the UI (e.g. "CDIN-674163142704470TV") — distinct from
  // `uuid`, the actual unique key.
  transaction_id: string
  wallet_id: string | null
  partner_id: string | null
  direction: string | null
}

// unverified shape — the banks list endpoint wraps a second {status, message, data}
// envelope inside ApiEnvelope's own `data` (confirmed live, 2026-08-19), but the
// individual bank object's fields weren't fully captured beyond id/name/code.
export interface Bank {
  id: number
  name: string
  code: string
  [key: string]: unknown
}

// GET /users/referral — placeholder shape, NOT confirmed. This endpoint 404s as of
// 2026-08-19 (see referral/index.vue); the referral code itself comes from the confirmed
// GET /users/dashboard payload instead. This interface only covers the stats this
// endpoint would need to supply — update the field names here once a real endpoint and
// response are provided.
export interface ReferralStats {
  signups: number
  pending_bonus: number
  total_bonus: number
}

// GET /api/banners — confirmed live, 2026-08-19 (not under /users/, unlike most other
// endpoints). Requires auth (an unauthenticated request 500s server-side on a null-user
// check). `data` came back as a single object rather than an array in this sandbox
// (only one banner exists); normalized to an array at the call site since the UI needs to
// support more than one. `imageUrl` is already an absolute URL — no resolveApiImage() call
// needed. `viewStatus` is confirmed to include at least "unviewed"; other values unverified.
export interface Banner {
  id: string
  title: string
  imageUrl: string
  link: string | null
  callToAction: string | null
  mobile_deeplink_url: string | null
  mobile_external_url: string | null
  viewStatus: string
}

// GET /users/nextofkin/:email/show — confirmed live, 2026-08-19. Returns an array (a
// user can apparently have more than one); the Profile page shows/edits just the first.
export interface NextOfKin {
  uuid: string
  kinable_type: string
  kinable_id: string
  firstname: string
  lastname: string
  phone: string
  email: string
  relationship: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Confirmed from the live app's compiled JS bundle (apex-user.crowdital.com
// /js/app.30854f4b.js, inspected 2026-08-19) — real endpoint paths and payload
// field names extracted from the minified source. Response shapes for the
// write endpoints below (login excepted, now confirmed live) weren't
// independently verified with a real call, to avoid mutating the account.
// ---------------------------------------------------------------------------

// POST /users/auth/login
export interface LoginRequest {
  identifier: string // email or phone — the real app's own field name
  password: string
}

// POST /users/auth/login response data — confirmed live, 2026-08-19. Always includes the
// full user object and a token; requires_2fa lives on user.requires_2fa (nested, not a
// top-level sibling as the minified bundle's own client code appeared to check — that
// code path may be stale/unreachable against the current backend). No two_factor_token
// field is present in the real response despite the bundle assuming one.
export interface LoginResponse {
  user: UserProfile
  token: string
}

// POST /users/auth/verify2fa — unverified request/response shape; the developer's own
// test account has 2FA disabled, so this branch couldn't be exercised live.
export interface TwoFactorVerifyRequest {
  user_id: string
  code: string
}
export interface TwoFactorVerifyResponse {
  token: string
}

// POST /users/onboard/register — the real app's registration is a multi-step wizard
// (register → verifyotp → addusername → createpin → KYC); this app currently only
// implements the first four steps (KYC stays out of scope, see plandocs/ORCHARD_HANDOFF.md §4.9).
export interface SignupRequest {
  firstname: string
  lastname: string
  email: string
  phone: string
  password: string
  policy_agreement: boolean
  is_pep: boolean
  referral_code?: string
}

// POST /users/onboard/verifyotp — email-verification OTP during onboarding, a different
// step from the login 2FA code above.
export interface OtpVerifyRequest {
  otp: string
  email: string
}

// POST /users/onboard/addusername
export interface AddUsernameRequest {
  username: string
  dob: string
  email: string
}

// POST /users/onboard/createpin — used both during onboarding and from Settings to
// change the transaction PIN (same endpoint either way, identified by email rather than
// the bearer token).
export interface CreatePinRequest {
  email: string
  pin: string
}

// POST /users/auth/sendpasstoken — forgot-password step 1
export interface SendPassTokenRequest {
  email: string
}

// POST /users/auth/verifytoken — forgot-password step 2, a 6-digit code; the field is
// named "token", not "otp" (a separate concept from the onboarding OTP above).
export interface VerifyResetTokenRequest {
  email: string
  token: string
}

// POST /users/auth/resetpassword — forgot-password step 3 only (logged-out flow, no
// current-password check; identified by email alone). Settings' password-change form uses
// the real authenticated endpoint below instead.
export interface ResetPasswordRequest {
  email: string
  newPassword: string
}

// PATCH /users/settings/passwordchange — the real "change password while logged in"
// endpoint (confirmed via the Postman collection), verifying current_password server-side.
export interface ChangePasswordRequest {
  email: string
  current_password: string
  new_password: string
}

// PUT /users/details/edit — only these 5 fields are sent, even though the profile form
// also displays username/dob (apparently read-only here).
export interface ProfileUpdateRequest {
  firstname: string
  lastname: string
  mobile_number: string
  address_line_1: string
  gender: string
}

// POST /users/nextofkin/:email/add — email goes in the URL path, not the body. The
// request body itself wasn't captured, but GET /users/nextofkin/:email/show (confirmed
// live, 2026-08-19 — see NextOfKin above) confirms these are the right resource fields.
export interface NextOfKinUpdateRequest {
  firstname: string
  lastname: string
  phone: string
  email: string
  relationship: string
}

// PATCH /users/auth/enable2fa — confirmed via the Postman collection, 2026-09-08: takes
// the transaction pin inline, required in both directions (not just when disabling).
// CONFIRMED LIVE, 2026-09-08: this endpoint does NOT actually validate the pin server-side
// — a deliberately wrong pin still returns success:true and genuinely disables 2FA. Same
// gap confirmed on order/invest below. PinConfirmModal.vue calls the standalone
// verify/transaction-pin endpoint first as a partial client-side mitigation, but the real
// fix belongs on the backend inside these two endpoints.
export interface TwoFactorToggleRequest {
  requires_2fa: boolean
  pin: string
}

// POST /users/verify/transaction-pin — confirmed via the Postman collection. Standalone
// pin check, called from PinConfirmModal.vue before invest/2FA as a mitigation for the
// gap noted above — whether this endpoint itself validates correctly is unconfirmed.
export interface VerifyTransactionPinRequest {
  pin: string
}

// POST /users/transactions/wallet/withdraw — this is Send Money's real endpoint.
// Requires the funding wallet's id (user.wallet.uuid) and the transaction PIN inline —
// the invest flow's "no PIN gate" observation (plandocs/ORCHARD_HANDOFF.md §4.0) does not extend
// to withdrawals in the real app. Not exercised live (would trigger a real withdrawal).
export interface WithdrawRequest {
  wallet_id: string
  amount: number
  pin: string
}

// No matching endpoint was found in the bundle for either Paystack initiation or a
// bank-transfer-funding "I have sent the money" confirmation — the real app may not call
// the backend for these at all (e.g. a client-side Paystack widget with webhook-only
// confirmation). Both stay best-guess and may not correspond to anything real.
// unverified shape — see plandocs/ORCHARD_HANDOFF.md §7
export interface AddMoneyConfirmRequest {
  amount: number
}

// POST /users/verify/bvnfull — confirmed field names from the Orchard User Postman
// collection's own example. Response shape is still unverified (KYC was out of scope for
// the original live walkthrough, plandocs/ORCHARD_HANDOFF.md §4.9, and this account is already
// fully verified) — account-name resolution happens entirely backend-side (confirmed by
// the product owner), so there's nothing else for the frontend to fetch beforehand.
export interface KycSubmissionRequest {
  bvn: string
  nin: string
  first_name: string
  last_name: string
  email: string
  phone: string
  account_number: string
  bank_code: string
  bank: string
  account_name: string
}

// POST /users/verify/matchtin — confirmed field name from the Postman collection.
export interface MatchTinRequest {
  tin: string
}
