import CoinIcon from './CoinIcon'
import { formatCurrency } from '../utils/format'

/**
 * Displays a formatted currency value with the in-game coin icon.
 * Use this for all currency displays in JSX. For string-only contexts
 * (e.g. chart tooltips), use formatCurrencyString() instead.
 *
 * @param value - The numeric currency value
 * @param decimals - Number of decimal places (default: 3)
 */
export default function CurrencyValue({ value, decimals = 3 }: { value: number; decimals?: number }) {
  return <>{formatCurrency(value, decimals)} <CoinIcon /></>
}
