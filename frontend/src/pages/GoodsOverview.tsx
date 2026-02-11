import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { itemsApi } from '../api/client'

const isEquipment = (code: string) => {
  return code.startsWith('pants') || code.startsWith('gloves') || code.startsWith('boots') ||
         code.startsWith('chest') || code.startsWith('helmet') || 
         ['jet', 'tank', 'sniper', 'rifle', 'gun', 'knife'].includes(code)
}

export default function GoodsOverview() {
  const navigate = useNavigate()
  const [showEquipment, setShowEquipment] = useState(false)
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: itemsApi.getAll,
  })

  if (isLoading) return <div className="text-center py-8 text-gray-300">Loading...</div>
  if (error) return <div className="text-center py-8 text-red-400">Error loading items</div>

  const wares = items?.filter(item => !isEquipment(item.code))
  const equipment = items?.filter(item => isEquipment(item.code))

  const displayItems = showEquipment ? equipment : wares

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Market Overview</h2>
        <button
          onClick={() => setShowEquipment(!showEquipment)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          {showEquipment ? 'Show Wares' : 'Show Equipment'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayItems?.map(item => (
          <div
            key={item.code}
            onClick={() => navigate(`/item/${item.code}`)}
            className="bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg hover:bg-gray-750 transition-all"
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <img src={item.icon} alt={item.name} className="w-12 h-12" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.code}</p>
                {item.currentPrice && (
                  <p className="text-lg font-bold text-green-400 mt-1">
                    ${item.currentPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
