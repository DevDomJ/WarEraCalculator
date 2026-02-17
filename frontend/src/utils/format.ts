/** Format a production bonus percentage to 2 decimal places with + prefix */
export function formatBonus(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}
