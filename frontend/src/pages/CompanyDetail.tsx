import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { companyApi, productionApi, itemsApi } from '../api/client'
import ProductionHistoryChart from '../components/ProductionHistoryChart'
import ProductionTracker from '../components/ProductionTracker'

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [productionBonus, setProductionBonus] = useState(0.2)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const { data: company } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyApi.getById(id!),
    enabled: !!id,
  })

  const { data: outputItem } = useQuery({
    queryKey: ['item', company?.type],
    queryFn: () => itemsApi.getByCode(company!.type),
    enabled: !!company?.type,
  })

  const { data: profit } = useQuery({
    queryKey: ['profit', id, company?.type, productionBonus],
    queryFn: () => productionApi.calculateProfit(id!, company!.type, productionBonus),
    enabled: !!id && !!company?.type,
  })

  if (!company) return <div className="text-gray-300">Loading...</div>

  const totalDailyWage = company.wagePerWorker * company.workers
  const maxEnergy = 70
  const actionsPerDay = maxEnergy * 0.24
  const ppPerWork = company.productionValue * (1 + productionBonus)
  const totalPP = actionsPerDay * ppPerWork

  return (
    <div>
      <button
        onClick={() => navigate('/companies')}
        className="mb-4 text-blue-400 hover:text-blue-300"
      >
        ← Back to Companies
      </button>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">{company.name}</h2>
        <p className="text-gray-400 mb-4">{company.type} • {company.region}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-400">Workers</p>
            <p className="text-xl font-bold text-white">{company.workers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Wage/Worker</p>
            <p className="text-xl font-bold text-white">{company.wagePerWorker.toFixed(3)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Daily Wage</p>
            <p className="text-xl font-bold text-white">{totalDailyWage.toFixed(3)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Production Value</p>
            <p className="text-xl font-bold text-white">{company.productionValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-white"
        >
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </button>
      </div>

      {showAnalytics && (
        <div className="space-y-6 mb-6">
          <ProductionTracker companyId={id!} expectedPP={totalPP} />
          <ProductionHistoryChart companyId={id!} days={30} />
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-white">Production Metrics</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-300">Production Bonus</label>
          <input
            type="number"
            step="0.01"
            value={productionBonus}
            onChange={(e) => setProductionBonus(parseFloat(e.target.value))}
            className="px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">PP per Work:</span>
            <span className="font-bold text-white">{ppPerWork.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-400 italic">
            {company.productionValue} × (1 + {productionBonus}) = {ppPerWork.toFixed(2)}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Work Actions/Day:</span>
            <span className="font-bold text-white">{actionsPerDay.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-400 italic">
            {maxEnergy} × 0.24 = {actionsPerDay.toFixed(2)}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total PP/Day:</span>
            <span className="font-bold text-white">{totalPP.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-400 italic">
            {actionsPerDay.toFixed(2)} × {ppPerWork.toFixed(2)} = {totalPP.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Profit Calculator</h3>
        
        {outputItem && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-gray-700 rounded">
            {outputItem.icon && (
              <img src={outputItem.icon} alt={outputItem.name} className="w-10 h-10" />
            )}
            <div>
              <p className="font-semibold text-white">{outputItem.name}</p>
              <p className="text-sm text-gray-400">
                Current Price: <span className="text-green-400 font-bold">{outputItem.currentPrice?.toFixed(3) || 'N/A'} €</span>
              </p>
            </div>
          </div>
        )}

        {profit && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-700 rounded p-4">
              <h4 className="font-bold mb-2 text-white">Scenario A: Buy Inputs</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Revenue:</span>
                  <span className="text-green-400">{profit.scenarioA.revenue.toFixed(3)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Costs:</span>
                  <span className="text-red-400">{profit.scenarioA.costs.toFixed(3)} €</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-700 pt-2">
                  <span className="text-gray-300">Profit/PP:</span>
                  <span className={profit.scenarioA.profit > 0 ? 'text-green-400' : 'text-red-400'}>
                    {profit.scenarioA.profitPerPP.toFixed(3)} €
                  </span>
                </div>
              </div>
            </div>

            {profit.scenarioB && (
              <div className="border border-gray-700 rounded p-4">
                <h4 className="font-bold mb-2 text-white">Scenario B: Self-Produce</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Revenue:</span>
                    <span className="text-green-400">{profit.scenarioB.revenue.toFixed(3)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Costs:</span>
                    <span className="text-red-400">{profit.scenarioB.costs.toFixed(3)} €</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-700 pt-2">
                    <span className="text-gray-300">Profit/PP:</span>
                    <span className={profit.scenarioB.profit > 0 ? 'text-green-400' : 'text-red-400'}>
                      {profit.scenarioB.profitPerPP.toFixed(3)} €
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
