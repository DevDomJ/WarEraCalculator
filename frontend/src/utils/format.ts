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
