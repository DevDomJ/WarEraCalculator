/** Format a production bonus percentage to 2 decimal places with + prefix */
export function formatBonus(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}

/** Format a currency value (string only, for charts/tooltips) */
export function formatCurrency(value: number, decimals = 3): string {
  return value.toFixed(decimals)
}

/** Format a currency value with a text symbol for string-only contexts (chart tooltips) */
export function formatCurrencyString(value: number, decimals = 3): string {
  return `${value.toFixed(decimals)} 🪙`
}

/** Convert a 2-letter ISO country code to its flag emoji */
export function countryCodeToFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return ''
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(0x1F1E5 + c.charCodeAt(0) - 64))
}

/** Format region display with optional country flag */
export function formatRegion(regionName?: string, countryCode?: string, regionId?: string): string {
  const flag = countryCode ? countryCodeToFlag(countryCode) : ''
  const name = regionName || regionId || ''
  return flag ? `${flag} ${name}` : name
}

/** Format a deposit expiry date as a human-readable time remaining string */
export function formatTimeRemaining(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(hours / 24)
  const h = hours % 24
  if (days > 0) return `${days}d ${h}h`
  return `${h}h`
}
