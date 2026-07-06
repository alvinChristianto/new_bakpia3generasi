// Indonesian phone numbers: "08..." or "+62..." followed by 9-11 more digits,
// i.e. 11-13 digits total (excluding the leading "+"). Anything with 14+
// digits, a missing/wrong prefix, or a non-digit character is rejected with a
// specific message so the user knows exactly what to fix.
const MIN_PHONE_DIGITS = 11
const MAX_PHONE_DIGITS = 13

export function getPhoneError(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Nomor telepon harus diisi'
  }

  if (/[a-zA-Z]/.test(trimmed)) {
    return 'Nomor telepon tidak boleh mengandung huruf'
  }

  const stripped = trimmed.replace(/[-\s]/g, '')

  if (!/^\+?[0-9]+$/.test(stripped)) {
    return 'Nomor telepon hanya boleh berisi angka'
  }

  if (!/^(\+62|08)/.test(stripped)) {
    return 'Nomor telepon harus diawali dengan +62 atau 08'
  }

  const digitCount = stripped.replace(/\D/g, '').length

  if (digitCount > MAX_PHONE_DIGITS) {
    return `Nomor telepon terlalu panjang (maksimal ${MAX_PHONE_DIGITS} digit)`
  }

  if (digitCount < MIN_PHONE_DIGITS) {
    return `Nomor telepon terlalu pendek (minimal ${MIN_PHONE_DIGITS} digit)`
  }

  return ''
}

export function isPhoneValid(value: string): boolean {
  return getPhoneError(value) === ''
}
