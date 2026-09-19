/** Polish mobile/landline mask: +48 XXX XXX XXX */

const PL_PREFIX = '+48 '

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Digits after country code (9 for PL). */
export function nationalDigits(value: string): string {
  let digits = phoneDigits(value)
  if (digits.startsWith('48') && digits.length > 9) {
    digits = digits.slice(2)
  }
  if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 9)
}

export function formatPhoneMask(value: string): string {
  const digits = nationalDigits(value)
  if (!digits) return value.trim() === '+' || value.trim() === '+4' || value.trim() === '+48' ? PL_PREFIX.trimEnd() : ''

  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean)
  return `${PL_PREFIX}${parts.join(' ')}`.trimEnd()
}

export function isValidPhone(value: string): boolean {
  const digits = nationalDigits(value)
  return digits.length === 9
}

export function phoneForSubmit(value: string): string {
  const digits = nationalDigits(value)
  if (digits.length === 0) return ''
  return formatPhoneMask(digits)
}
