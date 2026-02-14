import InfoTooltip from './InfoTooltip'

interface ProfitMetrics {
  dailyOutput: number
  dailyRevenue: number
  dailyWage?: number
  dailyInputCost: number
  profitSelfProduction: number
  profitWithTrade: number
}

interface ProfitSectionProps {
  title: string
  metrics: ProfitMetrics
  outputItemName: string
  showWage?: boolean
}

/**
 * Reusable component for displaying profit analysis sections.
 * Shows daily output, revenue, costs, and profit calculations.
 * 
 * @param title - Section title (e.g., "Worker Profit Analysis")
 * @param metrics - Profit metrics to display
 * @param outputItemName - Name of the output item
 * @param showWage - Whether to show wage costs (default: true)
 */
export default function ProfitSection({ title, metrics, outputItemName, showWage = true }: ProfitSectionProps) {
  const hasInputCost = metrics.dailyInputCost > 0

  return (
    <div className="border-t border-gray-700 pt-4 mt-4 mb-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-300">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-400">Daily Output</p>
          <p className="text-lg font-bold text-white">
            {metrics.dailyOutput.toFixed(2)}
            <span className="text-sm text-gray-400 ml-1">{outputItemName}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Daily Revenue</p>
          <p className="text-lg font-bold text-green-400">
            {metrics.dailyRevenue.toFixed(3)} €
          </p>
        </div>
        {hasInputCost && (
          <div>
            <p className="text-xs text-gray-400">Daily Input Cost</p>
            <p className="text-lg font-bold text-orange-400">
              {metrics.dailyInputCost.toFixed(3)} €
            </p>
          </div>
        )}
        {hasInputCost ? (
          <>
            <div>
              <p className="text-xs text-gray-400">Profit (Self-Production)</p>
              <InfoTooltip content={showWage ? "Revenue - Wage" : "Revenue"}>
                <p className={`text-lg font-bold cursor-help ${metrics.profitSelfProduction >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.profitSelfProduction.toFixed(3)} €
                </p>
              </InfoTooltip>
            </div>
            <div>
              <p className="text-xs text-gray-400">Profit (Trade)</p>
              <InfoTooltip content={showWage ? "Revenue - Wage - Input Cost" : "Revenue - Input Cost"}>
                <p className={`text-lg font-bold cursor-help ${metrics.profitWithTrade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.profitWithTrade.toFixed(3)} €
                </p>
              </InfoTooltip>
            </div>
          </>
        ) : (
          <div>
            <p className="text-xs text-gray-400">Profit</p>
            <InfoTooltip content={showWage ? "Revenue - Wage" : "Revenue"}>
              <p className={`text-lg font-bold cursor-help ${metrics.profitSelfProduction >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.profitSelfProduction.toFixed(3)} €
              </p>
            </InfoTooltip>
          </div>
        )}
        {showWage && metrics.dailyWage !== undefined && (
          <div>
            <p className="text-xs text-gray-400">Daily Wage</p>
            <p className="text-lg font-bold text-yellow-400">
              {metrics.dailyWage.toFixed(3)} €
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
