import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { itemsApi } from '../api/client'
import { ITEM_NAMES, ITEM_CATEGORIES } from '../utils/itemNames'

export default function GoodsOverview() {
  const navigate = useNavigate()
  const [showEquipment, setShowEquipment] = useState(false)
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: itemsApi.getAll,
  })

  if (isLoading) return <div className="text-center py-8 text-gray-300">Loading...</div>
  if (error) return <div className="text-center py-8 text-red-400">Error loading items</div>

  if (showEquipment) {
    const equipmentItems = items?.filter(item => 
      ITEM_CATEGORIES.Equipment?.includes(item.code)
    ).sort((a, b) => {
      const codes = ITEM_CATEGORIES.Equipment
      return codes.indexOf(a.code) - codes.indexOf(b.code)
    })

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Equipment</h2>
          <button
            onClick={() => setShowEquipment(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          >
            Show Wares
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {equipmentItems?.map(item => (
            <div
              key={item.code}
              onClick={() => navigate(`/item/${item.code}`)}
              className="bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg hover:bg-gray-750 transition-all"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={`/icons/${item.code}.png`} 
                  alt={item.name} 
                  className="w-12 h-12"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{ITEM_NAMES[item.code] || item.name}</h3>
                  <p className="text-sm text-gray-400">{item.code}</p>
                  {item.currentPrice && (
                    <p className="text-lg font-bold text-green-400 mt-1">
                      {item.currentPrice.toFixed(3)} €
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Market Overview</h2>
        <button
          onClick={() => setShowEquipment(true)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          Show Equipment
        </button>
      </div>
      
      {/* Large categories full width */}
      {['Ammo', 'Food', 'Construction'].map(category => {
        const categoryItems = items?.filter(item => 
          ITEM_CATEGORIES[category as keyof typeof ITEM_CATEGORIES]?.includes(item.code)
        ).sort((a, b) => {
          const codes = ITEM_CATEGORIES[category as keyof typeof ITEM_CATEGORIES]
          return codes.indexOf(a.code) - codes.indexOf(b.code)
        })

        if (!categoryItems || categoryItems.length === 0) return null

        return (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-300 mb-4">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {categoryItems.map(item => (
                <div
                  key={item.code}
                  onClick={() => navigate(`/item/${item.code}`)}
                  className="bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg hover:bg-gray-750 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={`/icons/${item.code}.png`} 
                      alt={item.name} 
                      className="w-12 h-12"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{ITEM_NAMES[item.code] || item.name}</h3>
                      <p className="text-sm text-gray-400">{item.code}</p>
                      {item.currentPrice && (
                        <p className="text-lg font-bold text-green-400 mt-1">
                          {item.currentPrice.toFixed(3)} €
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Small categories */}
      {['Buffs', 'Cases', 'Craft'].map(category => {
        const categoryItems = items?.filter(item => 
          ITEM_CATEGORIES[category as keyof typeof ITEM_CATEGORIES]?.includes(item.code)
        ).sort((a, b) => {
          const codes = ITEM_CATEGORIES[category as keyof typeof ITEM_CATEGORIES]
          return codes.indexOf(a.code) - codes.indexOf(b.code)
        })

        if (!categoryItems || categoryItems.length === 0) return null

        return (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-300 mb-4">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {categoryItems.map(item => (
                <div
                  key={item.code}
                  onClick={() => navigate(`/item/${item.code}`)}
                  className="bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg hover:bg-gray-750 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={`/icons/${item.code}.png`} 
                      alt={item.name} 
                      className="w-12 h-12"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{ITEM_NAMES[item.code] || item.name}</h3>
                      <p className="text-sm text-gray-400">{item.code}</p>
                      {item.currentPrice && (
                        <p className="text-lg font-bold text-green-400 mt-1">
                          {item.currentPrice.toFixed(3)} €
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
