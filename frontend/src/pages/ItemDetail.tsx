import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts'
import { itemsApi, pricesApi } from '../api/client'
import { useState, useMemo } from 'react'
import { ITEM_NAMES } from '../utils/itemNames'

type TimeInterval = 'day' | 'week' | '2weeks' | 'month'

export default function ItemDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [interval, setInterval] = useState<TimeInterval>('week')
  const [offset, setOffset] = useState(0)
  const [visibleLines, setVisibleLines] = useState({
    price: true,
    highestBuy: true,
    lowestSell: true,
    volume: true,
  })

  const days = interval === 'day' ? 1 : interval === 'week' ? 7 : interval === '2weeks' ? 14 : 30

  const { data: item } = useQuery({
    queryKey: ['item', code],
    queryFn: () => itemsApi.getByCode(code!),
    enabled: !!code,
  })

  const { data: allPriceHistory } = useQuery({
    queryKey: ['priceHistory', code, 365],
    queryFn: () => pricesApi.getHistory(code!, 365),
    enabled: !!code,
  })

  const { priceHistory, canGoBack, canGoForward, dateRange } = useMemo(() => {
    if (!allPriceHistory || allPriceHistory.length === 0) {
      return { priceHistory: [], canGoBack: false, canGoForward: false, dateRange: '' }
    }

    const now = new Date()
    now.setHours(23, 59, 59, 999)
    
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() - offset)
    
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days + 1)
    startDate.setHours(0, 0, 0, 0)

    const filtered = allPriceHistory.filter(p => {
      const date = new Date(p.timestamp)
      return date >= startDate && date <= endDate
    })

    // Get oldest data point (find actual oldest regardless of sort order)
    const timestamps = allPriceHistory.map(p => new Date(p.timestamp).getTime())
    const oldestTimestamp = new Date(Math.min(...timestamps))
    oldestTimestamp.setHours(0, 0, 0, 0)
    
    // Calculate what the next period's start date would be
    const nextStartDate = new Date(startDate)
    nextStartDate.setDate(nextStartDate.getDate() - days)
    nextStartDate.setHours(0, 0, 0, 0)
    
    // Check if we have data for that period
    const canGoBack = oldestTimestamp <= nextStartDate
    const canGoForward = offset > 0

    const formatDate = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const dateRange = days === 1 
      ? formatDate(startDate)
      : `${formatDate(startDate)} - ${formatDate(endDate)}`

    return { priceHistory: filtered, canGoBack, canGoForward, dateRange }
  }, [allPriceHistory, offset, days])

  const { data: orders } = useQuery({
    queryKey: ['orders', code],
    queryFn: () => pricesApi.getOrders(code!),
    enabled: !!code,
  })

  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return []

    if (interval === 'day') {
      const fullDay: any[] = []
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          fullDay.push({ date: time, price: null, highestBuy: null, lowestSell: null, volume: 0 })
        }
      }
      
      priceHistory.forEach(p => {
        const date = new Date(p.timestamp)
        const hour = date.getHours()
        const minute = Math.floor(date.getMinutes() / 15) * 15
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const index = fullDay.findIndex(d => d.date === time)
        
        if (index !== -1) {
          const slot = fullDay[index]
          if (slot.price === null) {
            slot.price = p.price
            slot.highestBuy = p.highestBuy
            slot.lowestSell = p.lowestSell
            slot.volume = p.volume
            slot.count = 1
          } else {
            slot.price = (slot.price * slot.count + p.price) / (slot.count + 1)
            if (p.highestBuy) slot.highestBuy = slot.highestBuy ? (slot.highestBuy * slot.count + p.highestBuy) / (slot.count + 1) : p.highestBuy
            if (p.lowestSell) slot.lowestSell = slot.lowestSell ? (slot.lowestSell * slot.count + p.lowestSell) / (slot.count + 1) : p.lowestSell
            slot.volume += p.volume
            slot.count++
          }
        }
      })
      
      return fullDay
    }

    const byDay = new Map<string, any[]>()
    priceHistory.forEach(p => {
      const date = new Date(p.timestamp)
      const key = date.toISOString().split('T')[0]
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key)!.push(p)
    })

    return Array.from(byDay.entries()).map(([dateStr, points]) => {
      const date = new Date(dateStr)
      const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length
      const avgHighestBuy = points.filter(p => p.highestBuy).length > 0
        ? points.reduce((sum, p) => sum + (p.highestBuy || 0), 0) / points.filter(p => p.highestBuy).length
        : null
      const avgLowestSell = points.filter(p => p.lowestSell).length > 0
        ? points.reduce((sum, p) => sum + (p.lowestSell || 0), 0) / points.filter(p => p.lowestSell).length
        : null
      const totalVolume = points.reduce((sum, p) => sum + p.volume, 0)

      let label: string
      if (interval === 'week') {
        label = date.toLocaleDateString('de-DE', { weekday: 'long' })
      } else {
        label = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
      }

      return {
        date: label,
        price: avgPrice,
        highestBuy: avgHighestBuy,
        lowestSell: avgLowestSell,
        volume: totalVolume,
      }
    })
  }, [priceHistory, interval])

  if (!item) return <div className="text-gray-300">Loading...</div>

  const handleLegendClick = (dataKey: string) => {
    setVisibleLines(prev => ({ ...prev, [dataKey]: !prev[dataKey as keyof typeof prev] }))
  }

  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any) => (
          <div
            key={entry.dataKey}
            onClick={() => handleLegendClick(entry.dataKey)}
            className="flex items-center gap-2 cursor-pointer"
            style={{ opacity: visibleLines[entry.dataKey as keyof typeof visibleLines] ? 1 : 0.5 }}
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  const formatTooltip = (value: any) => {
    if (typeof value === 'number') {
      return value.toFixed(3)
    }
    return value
  }

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
            <h2 className="text-3xl font-bold text-white">{ITEM_NAMES[item.code] || item.name}</h2>
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Price History</h3>
            <p className="text-sm text-gray-400 mt-1">{dateRange}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setOffset(offset + days)}
                disabled={!canGoBack}
                className={`text-xl ${
                  canGoBack
                    ? 'text-gray-300 hover:text-white cursor-pointer'
                    : 'text-gray-700 cursor-not-allowed'
                }`}
                title="Previous period"
              >
                ◀
              </button>
              <button
                onClick={() => setOffset(Math.max(0, offset - days))}
                disabled={!canGoForward}
                className={`text-xl ${
                  canGoForward
                    ? 'text-gray-300 hover:text-white cursor-pointer'
                    : 'text-gray-700 cursor-not-allowed'
                }`}
                title="Next period"
              >
                ▶
              </button>
            </div>
            <div className="flex gap-2">
              {(['day', 'week', '2weeks', 'month'] as TimeInterval[]).map(i => (
                <button
                  key={i}
                  onClick={() => {
                    setInterval(i)
                    setOffset(0)
                  }}
                  className={`px-3 py-1 rounded ${
                    interval === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {i === '2weeks' ? '2 Weeks' : i === 'month' ? 'Month' : i.charAt(0).toUpperCase() + i.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              interval={interval === 'day' ? 7 : 'preserveStartEnd'}
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} formatter={formatTooltip} />
            <Legend 
              content={renderLegend}
            />
            <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} name="Average Price" hide={!visibleLines.price} connectNulls />
            <Line type="monotone" dataKey="highestBuy" stroke="#3b82f6" strokeWidth={2} name="Highest Buy" hide={!visibleLines.highestBuy} connectNulls />
            <Line type="monotone" dataKey="lowestSell" stroke="#ef4444" strokeWidth={2} name="Lowest Sell" hide={!visibleLines.lowestSell} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-white">Trade Volume</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              interval={interval === 'day' ? 7 : 'preserveStartEnd'}
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} formatter={formatTooltip} />
            <Legend 
              content={renderLegend}
            />
            <Bar dataKey="volume" fill="#8b5cf6" name="Volume" hide={!visibleLines.volume} />
          </BarChart>
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
