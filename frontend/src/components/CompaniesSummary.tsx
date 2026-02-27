import { CompaniesSummary as CompaniesSummaryType } from '../api/client'
import CurrencyValue from './CurrencyValue'

/**
 * Displays aggregated profit summary across all companies.
 * Shows total revenue, wages, input costs, and profit.
 *
 * @param summary - Aggregated summary data from the backend
 */
export default function CompaniesSummary({ summary }: { summary: CompaniesSummaryType }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-400">Total Daily Revenue</p>
          <p className="text-xl font-bold text-green-400"><CurrencyValue value={summary.totalDailyRevenue} /></p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Total Daily Wages</p>
          <p className="text-xl font-bold text-yellow-400"><CurrencyValue value={summary.totalDailyWage} /></p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Total Daily Input Cost</p>
          <p className="text-xl font-bold text-orange-400"><CurrencyValue value={summary.totalDailyInputCost} /></p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Total Daily Profit</p>
          <p className={`text-xl font-bold ${summary.totalDailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <CurrencyValue value={summary.totalDailyProfit} />
          </p>
        </div>
      </div>
    </div>
  )
}
