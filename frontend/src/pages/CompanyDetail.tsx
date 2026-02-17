import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatBonus } from '../utils/format'
import { useParams, useNavigate } from 'react-router-dom'
import { companyApi, itemsApi } from '../api/client'
import ItemIcon from '../components/ItemIcon'
import ProductionBonusTooltip from '../components/ProductionBonusTooltip'
import ProfitSection from '../components/ProfitSection'

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Check if cache is older than 5 minutes
  const shouldRefetch = (lastFetched?: string) => {
    if (!lastFetched) return true
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return new Date(lastFetched).getTime() < fiveMinutesAgo
  }

  const refreshMutation = useMutation({
    mutationFn: () => companyApi.refresh(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', id] })
    },
  })

  const { data: company } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const data = await companyApi.getById(id!)
      if (shouldRefetch(data.lastFetched)) {
        try {
          return await companyApi.refresh(id!)
        } catch (e) {
          console.error('Refresh failed:', e)
          return data
        }
      }
      return data
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  })

  const { data: outputItem } = useQuery({
    queryKey: ['item', company?.type],
    queryFn: () => itemsApi.getByCode(company!.type),
    enabled: !!company?.type,
  })

  if (!company) return <div className="text-gray-300">Loading...</div>

  const workers = company.workers || []

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
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:bg-gray-600"
        >
          {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <ItemIcon code={company.type} size="lg" displayName={outputItem?.displayName} />
          <div>
            <h2 className="text-3xl font-bold text-white">{company.name}</h2>
            <p className="text-gray-400">{company.type} • {company.region}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">Workers</p>
            <p className="text-xl font-bold text-white">{workers.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Daily Wage</p>
            <p className="text-xl font-bold text-white">{(company.totalDailyWage || 0).toFixed(3)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Production Bonus</p>
            {company.productionBonus ? (
              <ProductionBonusTooltip bonus={company.productionBonus}>
                <p className="text-xl font-bold text-green-400 cursor-help">
                  {formatBonus(company.productionBonus.total)}
                </p>
              </ProductionBonusTooltip>
            ) : (
              <p className="text-xl font-bold text-gray-500">0%</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Production</p>
            <p className="text-xl font-bold text-white">
              {(company.productionValue || 0).toFixed(1)} / {company.maxProduction || 0}
            </p>
          </div>
        </div>

        {company.workerProfitMetrics && workers.length > 0 && (
          <ProfitSection
            title="Worker Profit Analysis"
            metrics={company.workerProfitMetrics}
            outputItemName={outputItem?.displayName || company.type}
            showWage={true}
          />
        )}

        {company.automationProfitMetrics && company.automatedEngineLevel && company.automatedEngineLevel > 0 && workers.length > 0 && (
          <ProfitSection
            title="Automation Profit Analysis"
            metrics={company.automationProfitMetrics}
            outputItemName={outputItem?.displayName || company.type}
            showWage={false}
          />
        )}

        {company.dailyProfitMetrics && (
          <ProfitSection
            title="Daily Profit Analysis"
            metrics={company.dailyProfitMetrics}
            outputItemName={outputItem?.displayName || company.type}
            showWage={workers.length > 0}
          />
        )}

        {workers.length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Workers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Worker</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Wage</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Daily Wage</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Paid PP</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Total PP</th>
                    <th className="text-right py-2 px-2 text-gray-400 font-medium">Output</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker: any, index: number) => (
                    <tr key={worker.workerId} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          {worker.avatarUrl && (
                            <img src={worker.avatarUrl} alt={worker.username} className="w-8 h-8 rounded-full" />
                          )}
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-white">{worker.username || `Worker ${index + 1}`}</span>
                            <div className="flex gap-1.5">
                              <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded text-xs">
                                ⚡ {worker.maxEnergy || 70}
                              </span>
                              <span className="px-2 py-0.5 bg-[#E1C997]/20 text-[#E1C997] rounded text-xs flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14.79,10.62L3.5,21.9L2.1,20.5L13.38,9.21L14.79,10.62M19.27,7.73L19.86,7.14L19.07,6.35L19.71,5.71L18.29,4.29L17.65,4.93L16.86,4.14L16.27,4.73C14.53,3.31 12.57,2.17 10.47,1.37L9.64,3.16C11.39,4.08 13,5.19 14.5,6.5L14,7L17,10L17.5,9.5C18.81,11 19.92,12.61 20.84,14.36L22.63,13.53C21.83,11.43 20.69,9.47 19.27,7.73Z"></path>
                                </svg>
                                {worker.production || 0}
                              </span>
                              <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded text-xs">
                                ❤️ +{Math.round(worker.fidelity || 0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-2 px-2 text-white">{worker.wage.toFixed(3)} €</td>
                      <td className="text-right py-2 px-2 text-white">{(worker.dailyWage || 0).toFixed(3)} €</td>
                      <td className="text-right py-2 px-2 text-white">{(worker.paidProduction || 0).toFixed(2)}</td>
                      <td className="text-right py-2 px-2 text-white">{(worker.totalProduction || 0).toFixed(2)}</td>
                      <td className="text-right py-2 px-2 text-white">{(worker.outputUnits || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-500 font-bold bg-gray-700/30">
                    <td className="py-2 px-2 text-white">Total</td>
                    <td className="text-right py-2 px-2 text-white">
                      {workers.reduce((sum: number, w: any) => sum + (w.wage || 0), 0).toFixed(3)} €
                    </td>
                    <td className="text-right py-2 px-2 text-white">
                      {workers.reduce((sum: number, w: any) => sum + (w.dailyWage || 0), 0).toFixed(3)} €
                    </td>
                    <td className="text-right py-2 px-2 text-white">
                      {workers.reduce((sum: number, w: any) => sum + (w.paidProduction || 0), 0).toFixed(2)}
                    </td>
                    <td className="text-right py-2 px-2 text-white">
                      {workers.reduce((sum: number, w: any) => sum + (w.totalProduction || 0), 0).toFixed(2)}
                    </td>
                    <td className="text-right py-2 px-2 text-white">
                      {workers.reduce((sum: number, w: any) => sum + (w.outputUnits || 0), 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
