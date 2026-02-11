import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { analyticsApi } from '../api/client'

interface Props {
  companyId: string
  days?: number
}

export default function ProductionHistoryChart({ companyId, days = 30 }: Props) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', companyId, days],
    queryFn: () => analyticsApi.getAnalytics(companyId, days),
  })

  if (isLoading) return <div className="text-gray-300">Loading analytics...</div>
  if (!analytics) return null

  const chartData = analytics.history.map(h => ({
    date: new Date(h.date).toLocaleDateString(),
    actual: h.actualPP,
    expected: h.expectedPP,
  }))

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 text-white">Production History ({days} days)</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-400">Efficiency</p>
          <p className="text-2xl font-bold text-blue-400">{analytics.efficiency.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Avg Variance</p>
          <p className={`text-2xl font-bold ${analytics.averageVariance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {analytics.averageVariance.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Total Actual PP</p>
          <p className="text-2xl font-bold text-white">{analytics.totalActualPP.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Total Expected PP</p>
          <p className="text-2xl font-bold text-white">{analytics.totalExpectedPP.toFixed(0)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
          <Legend />
          <Line type="monotone" dataKey="expected" stroke="#9ca3af" strokeWidth={2} name="Expected PP" />
          <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual PP" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
