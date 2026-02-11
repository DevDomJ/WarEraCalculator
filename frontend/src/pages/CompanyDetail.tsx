import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { companyApi, productionApi, itemsApi } from '../api/client'
import { ITEM_NAMES } from '../utils/itemNames'
import ProductionTracker from '../components/ProductionTracker'

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [productionBonus, setProductionBonus] = useState(0.2)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Check if cache is older than 5 minutes
  const shouldRefetch = (lastFetched?: string) => {
    if (!lastFetched) return true
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return new Date(lastFetched).getTime() < fiveMinutesAgo
  }

  const { data: company, refetch } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const data = await companyApi.getById(id!)
      // If cache is old, trigger refresh
      if (shouldRefetch(data.lastFetched)) {
        console.log('Cache is old, refreshing...', data.lastFetched)
        try {
          const refreshed = await fetch(`http://localhost:3000/api/companies/${id}/refresh`, {
            method: 'POST'
          }).then(r => r.json())
          console.log('Refreshed data:', refreshed)
          return refreshed
        } catch (e) {
          console.error('Refresh failed:', e)
          return data // Fallback to cached data
        }
      }
      return data
    },
    enabled: !!id,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache
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

  const workers = company.workers || [];
  const wages = workers.map(w => w.wage);
  const totalDailyWage = wages.reduce((sum, wage) => sum + wage, 0);
  const maxEnergy = 70
  const actionsPerDay = maxEnergy * 0.24
  const ppPerWork = company.productionValue * (1 + productionBonus)
  const totalPP = actionsPerDay * ppPerWork

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/companies')}
          className="text-blue-400 hover:text-blue-300"
        >
          ← Back to Companies
        </button>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">{company.name}</h2>
        <p className="text-gray-400 mb-4">{company.type} • {company.region}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">Workers</p>
            <p className="text-xl font-bold text-white">{workers.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Daily Wage</p>
            <p className="text-xl font-bold text-white">{totalDailyWage.toFixed(3)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Production</p>
            <p className="text-xl font-bold text-white">
              {company.productionValue.toFixed(0)} / {company.maxProduction}
            </p>
          </div>
        </div>

        {workers.length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Workers</h3>
            <div className="space-y-2">
              {workers.map((worker, index) => (
                <div key={worker.workerId} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                  <div className="flex items-center gap-3">
                    {worker.avatarUrl && (
                      <img src={worker.avatarUrl} alt={worker.username} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <p className="font-semibold text-white">{worker.username || `Worker ${index + 1}`}</p>
                      <p className="text-xs text-gray-400">Wage: {worker.wage.toFixed(3)} €</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Energy</p>
                      <p className="font-semibold text-white">{worker.maxEnergy || 70}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Production</p>
                      <p className="font-semibold text-white">{worker.production || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
            <img 
              src={`/icons/${company.type}.png`} 
              alt={ITEM_NAMES[company.type] || company.type} 
              className="w-10 h-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div>
              <p className="font-semibold text-white">{ITEM_NAMES[company.type] || company.type}</p>
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
