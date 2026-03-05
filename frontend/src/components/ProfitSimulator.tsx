import { useState, useMemo } from 'react'
import { ProfitSimulatorData } from '../api/client'
import CurrencyValue from './CurrencyValue'
import CoinIcon from './CoinIcon'

interface Props {
  data: ProfitSimulatorData
  currentWagePerPP: number
  outputItemName: string
}

/**
 * Interactive per-unit profit simulator.
 * Shows profit per unit based on editable wage and price.
 * Also shows the max profitable wage (break-even point).
 */
export default function ProfitSimulator({ data, currentWagePerPP, outputItemName }: Props) {
  const round3 = (n: number) => Math.round(n * 1000) / 1000
  const [wage, setWage] = useState(round3(currentWagePerPP))
  const [price, setPrice] = useState(round3(data.outputPrice))

  const perUnit = useMemo(() => {
    const revenue = price
    const wageCost = data.effectivePPPerUnit * wage
    const profit = revenue - data.inputCostPerUnit - wageCost
    return { revenue, wageCost, inputCost: data.inputCostPerUnit, profit }
  }, [wage, price, data])

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Profit Simulator (per unit)</h3>

      {data.maxProfitableWage != null && (
        <div className="mb-4 p-3 bg-gray-700/50 rounded">
          <p className="text-sm text-gray-400">Max Profitable Wage</p>
          <p className="text-xl font-bold text-yellow-400">
            <CurrencyValue value={data.maxProfitableWage} decimals={3} />
          </p>
          <p className="text-xs text-gray-500 mt-1">
            The highest wage where each unit of {outputItemName} still breaks even
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="sim-wage" className="block text-sm text-gray-400 mb-1">Wage per PP</label>
          <div className="flex items-center gap-2">
            <input
              id="sim-wage"
              type="number"
              step="0.001"
              value={wage}
              onChange={e => setWage(round3(parseFloat(e.target.value) || 0))}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <CoinIcon />
          </div>
        </div>
        <div>
          <label htmlFor="sim-price" className="block text-sm text-gray-400 mb-1">{outputItemName} Price</label>
          <div className="flex items-center gap-2">
            <input
              id="sim-price"
              type="number"
              step="0.001"
              value={price}
              onChange={e => setPrice(round3(parseFloat(e.target.value) || 0))}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <CoinIcon />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-400">Revenue / Unit</p>
          <p className="text-lg font-bold text-green-400"><CurrencyValue value={perUnit.revenue} /></p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Wage Cost / Unit</p>
          <p className="text-lg font-bold text-yellow-400"><CurrencyValue value={perUnit.wageCost} /></p>
          <p className="text-xs text-gray-500">{data.effectivePPPerUnit.toFixed(1)} PP × {wage}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Input Cost / Unit</p>
          <p className="text-lg font-bold text-orange-400"><CurrencyValue value={perUnit.inputCost} /></p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Profit / Unit</p>
          <p className={`text-lg font-bold ${perUnit.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <CurrencyValue value={perUnit.profit} />
          </p>
        </div>
      </div>
    </div>
  )
}
