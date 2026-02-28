import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { companyApi, Worker } from '../api/client'
import CurrencyValue from '../components/CurrencyValue'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * WorkerDetail page - Shows worker info card and daily production chart.
 * Route: /company/:companyId/worker/:workerId
 */
export default function WorkerDetail() {
  const { companyId, workerId } = useParams<{ companyId: string; workerId: string }>()
  const navigate = useNavigate()

  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyApi.getById(companyId!),
    enabled: !!companyId,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['workerStats', companyId, workerId],
    queryFn: () => companyApi.getWorkerStats(companyId!, workerId!, 30),
    enabled: !!companyId && !!workerId,
  })

  const worker = company?.workers?.find((w: Worker) => w.userId === workerId)

  if (!company) return <div className="text-gray-300">Loading...</div>

  return (
    <div>
      <button
        onClick={() => navigate(`/company/${companyId}`)}
        className="text-blue-400 hover:text-blue-300 mb-4"
      >
        ← Back to {company.name}
      </button>

      {/* Worker info card */}
      {worker && (
        <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {worker.avatarUrl && (
              <img src={worker.avatarUrl} alt={worker.username} className="w-12 h-12 rounded-full" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{worker.username || 'Unknown'}</h2>
              <p className="text-gray-400">Worker at {company.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <p className="text-sm text-gray-400">Wage</p>
              <p className="text-lg font-bold text-white"><CurrencyValue value={worker.wage} /></p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Daily Wage</p>
              <p className="text-lg font-bold text-white"><CurrencyValue value={worker.dailyWage || 0} /></p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Energy</p>
              <p className="text-lg font-bold text-blue-300">⚡ {worker.maxEnergy || 70}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Production</p>
              <p className="text-lg font-bold text-[#E1C997]">⛏ {worker.production || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Fidelity</p>
              <p className="text-lg font-bold text-purple-300">❤️ +{Math.round(worker.fidelity || 0)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total PP (calc)</p>
              <p className="text-lg font-bold text-white">{(worker.totalProduction || 0).toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg PP/Day</p>
              <p className="text-lg font-bold text-green-400">
                {worker.avgDailyProduction != null ? worker.avgDailyProduction.toFixed(1) : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Production chart */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Daily Production (Last 30 Days)</h3>
        {statsLoading ? (
          <p className="text-gray-400">Loading stats...</p>
        ) : stats && stats.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="dailyDate"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
                formatter={(value: number, name: string) => [
                  value.toFixed(1),
                  name === 'total' ? 'Production PP' : name === 'wage' ? 'Wage Paid' : name,
                ]}
              />
              <Bar dataKey="total" fill="#3B82F6" name="total" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No production data available.</p>
        )}
      </div>
    </div>
  )
}
