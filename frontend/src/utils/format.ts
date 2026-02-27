/** Format a production bonus percentage to 2 decimal places with + prefix */
export function formatBonus(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}

/** Format a currency value to 3 decimal places with € suffix */
export function formatCurrency(value: number): string {
  return `${value.toFixed(3)} €`
}
