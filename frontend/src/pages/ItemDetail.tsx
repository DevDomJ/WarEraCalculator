import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { itemsApi, pricesApi } from '../api/client'

export default function ItemDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const { data: item } = useQuery({
    queryKey: ['item', code],
    queryFn: () => itemsApi.getByCode(code!),
    enabled: !!code,
  })

  const { data: priceHistory } = useQuery({
    queryKey: ['priceHistory', code],
    queryFn: () => pricesApi.getHistory(code!),
    enabled: !!code,
  })

  const { data: orders } = useQuery({
    queryKey: ['orders', code],
    queryFn: () => pricesApi.getOrders(code!),
    enabled: !!code,
  })

  if (!item) return <div className="text-gray-300">Loading...</div>

  const chartData = priceHistory?.map(p => ({
    date: new Date(p.timestamp).toLocaleDateString(),
    price: p.price,
  })) || []

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-blue-400 hover:text-blue-300"
      >
        ← Back to Overview
      </button>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={`/icons/${item.code}.png`} 
            alt={item.name} 
            className="w-16 h-16"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div>
            <h2 className="text-3xl font-bold text-white">{item.name}</h2>
            <p className="text-gray-400">{item.code}</p>
          </div>
        </div>
        {item.currentPrice && (
          <p className="text-2xl font-bold text-green-400">
            Current Price: {item.currentPrice.toFixed(3)} €
          </p>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-white">Price History (30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
            <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-green-400">Buy Orders</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-300">Price</th>
                <th className="text-right py-2 text-gray-300">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {orders?.buyOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-700">
                  <td className="py-2 text-gray-200">{order.price.toFixed(3)} €</td>
                  <td className="text-right py-2 text-gray-200">{order.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-red-400">Sell Orders</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-300">Price</th>
                <th className="text-right py-2 text-gray-300">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {orders?.sellOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-700">
                  <td className="py-2 text-gray-200">{order.price.toFixed(3)} €</td>
                  <td className="text-right py-2 text-gray-200">{order.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
