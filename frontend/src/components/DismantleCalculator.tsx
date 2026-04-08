import { useQuery } from '@tanstack/react-query'
import { itemsApi } from '../api/client'
import CurrencyValue from './CurrencyValue'
import { RARITY_TEXT_COLORS } from '../utils/rarity'

/**
 * Dismantle Calculator — shows scrap sell/buy values per equipment rarity tier.
 * Used in the Market Overview when "Show Equipment" is toggled.
 *
 * @param onBack - Callback to return to the wares view
 */
export default function DismantleCalculator({ onBack }: { onBack: () => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dismantle-values'],
    queryFn: itemsApi.getDismantleValues,
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Dismantle Calculator</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          Show Wares
        </button>
      </div>

      {isLoading && <div className="text-center py-8 text-gray-300">Loading...</div>}
      {error && <div className="text-center py-8 text-red-400">Error loading dismantle values</div>}

      {data && (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-700 text-sm text-gray-400">
            Scrap prices — Sell: {data.scrapSellPrice != null ? <CurrencyValue value={data.scrapSellPrice} /> : 'N/A'}
            {' · '}Buy: {data.scrapBuyPrice != null ? <CurrencyValue value={data.scrapBuyPrice} /> : 'N/A'}
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="px-4 py-3">Rarity</th>
                <th className="px-4 py-3 text-right">Scrap</th>
                <th className="px-4 py-3 text-right">Sell Value</th>
                <th className="px-4 py-3 text-right">Buy Value</th>
              </tr>
            </thead>
            <tbody>
              {data.tiers.map(tier => (
                <tr key={tier.rarity} className="border-b border-gray-700/50 hover:bg-gray-750">
                  <td className={`px-4 py-3 font-medium capitalize ${RARITY_TEXT_COLORS[tier.rarity] || 'text-white'}`}>
                    {tier.rarity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">{tier.scrapCount}</td>
                  <td className="px-4 py-3 text-right text-green-400">
                    {tier.sellValue != null ? <CurrencyValue value={tier.sellValue} /> : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-400">
                    {tier.buyValue != null ? <CurrencyValue value={tier.buyValue} /> : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">
        Sell Value = scrap count × lowest scrap sell order. Buy Value = scrap count × highest scrap buy order.
        Compare with equipment market prices to find dismantle opportunities.
      </p>
    </div>
  )
}
