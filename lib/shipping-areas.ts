/**
 * Shipping coverage — which provinces Bakpia Master will deliver to.
 *
 * IDs come from KiriminAja `POST /api/mitra/province` (see `lib/kiriminaja.ts`).
 * The full 37-province reference table is recorded in
 * `.claude/my-plans/i-want-to-check-serene-pancake.md`.
 *
 * This is an ALLOWLIST on purpose, not a blocklist: KiriminAja appends new
 * provinces to the end of its list over time (IDs 35–37 are the provinces split
 * out of Papua in 2022–23). An allowlist keeps a newly-added area hidden until
 * someone deliberately enables it here, instead of silently accepting orders
 * from a region the bakery cannot serve.
 *
 * Current scope: Jawa + Bali + Sumatera.
 */
export const ALLOWED_PROVINCE_IDS: readonly number[] = [
  // ── Jawa ──
  3, // Banten
  5, // DI Yogyakarta
  6, // DKI Jakarta
  9, // Jawa Barat
  10, // Jawa Tengah
  11, // Jawa Timur

  // ── Bali ──
  1, // Bali

  // ── Sumatera ──
  2, // Bangka Belitung
  4, // Bengkulu
  8, // Jambi
  17, // Kepulauan Riau
  18, // Lampung

  26, // Riau
  32, // Sumatera Barat
  33, // Sumatera Selatan
  34, // Sumatera Utara
];

/** True when the given KiriminAja province ID is inside the shipping coverage. */
export function isProvinceServiceable(provinceId: number): boolean {
  return ALLOWED_PROVINCE_IDS.includes(provinceId);
}
