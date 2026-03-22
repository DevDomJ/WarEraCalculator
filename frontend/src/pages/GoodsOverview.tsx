import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { itemsApi, recommendationApi, ItemRecommendation } from '../api/client'
import ItemIcon from '../components/ItemIcon'
import CurrencyValue from '../components/CurrencyValue'
import ProductionBonusTooltip from '../components/ProductionBonusTooltip'
import EngineLevelSelector from '../components/EngineLevelSelector'
import { useEngineLevel } from '../hooks/useEngineLevel'
import { countryCodeToFlag, formatBonus, formatTimeRemaining } from '../utils/format'

export default function GoodsOverview() {
  const navigate = useNavigate()
  const [showEquipment, setShowEquipment] = useState(false)
  const [engineLevel, setEngineLevel] = useEngineLevel()

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: itemsApi.getAll,
  })

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', engineLevel],
    queryFn: () => recommendationApi.getAll(engineLevel),
  })

  // Find top 3 most profitable items by dailyProfit
  const top3Items = useMemo(() => {
    if (!recommendations) return new Set<string>()
    const sorted = Object.entries(recommendations)
      .sort(([, a], [, b]) => b.profitMetrics.profit - a.profitMetrics.profit)
      .slice(0, 3)
      .map(([code]) => code)
    return new Set(sorted)
  }, [recommendations])

  if (isLoading) return <div className="text-center py-8 text-gray-300">Loading...</div>
  if (error) return <div className="text-center py-8 text-red-400">Error loading items</div>

  if (showEquipment) {
    const equipmentItems = items?.filter(item => item.category === 'Equipment')

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
                <ItemIcon code={item.code} size="md" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.displayName || item.name}</h3>
                  <p className="text-sm text-gray-400">{item.code}</p>
                  {item.currentPrice && (
                    <p className="text-lg font-bold text-green-400 mt-1">
                      <CurrencyValue value={item.currentPrice} />
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

  const categories = ['Ammo', 'Food', 'Construction']

  const renderCard = (item: typeof items extends (infer T)[] | undefined ? T : never) => {
    const rec = recommendations?.[item.code]
    const isTop3 = top3Items.has(item.code)

    return (
      <div
        key={item.code}
        onClick={() => navigate(`/item/${item.code}`)}
        className={`bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg hover:bg-gray-750 transition-all ${
          isTop3 ? 'border-l-4 border-green-500' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <ItemIcon code={item.code} size="md" />
          <div className="flex-1">
            <h3 className="font-semibold text-white">{item.displayName || item.name}</h3>
            <p className="text-sm text-gray-400">{item.code}</p>
            {item.currentPrice && (
              <p className="text-lg font-bold text-green-400 mt-1">
                <CurrencyValue value={item.currentPrice} />
              </p>
            )}
          </div>
        </div>
        {rec && <RecommendationInfo rec={rec} />}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Market Overview</h2>
        <div className="flex items-center gap-4">
          <EngineLevelSelector value={engineLevel} onChange={setEngineLevel} />
          <button
            onClick={() => setShowEquipment(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          >
            Show Equipment
          </button>
        </div>
      </div>
      
      {/* Large categories full width */}
      {categories.map(category => {
        const categoryItems = items?.filter(item => item.category === category)
        if (!categoryItems || categoryItems.length === 0) return null

        return (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-300 mb-4">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {categoryItems.map(renderCard)}
            </div>
          </div>
        )
      })}

      {/* Small categories */}
      {['Buffs', 'Cases', 'Craft'].map(category => {
        const categoryItems = items?.filter(item => item.category === category)
        if (!categoryItems || categoryItems.length === 0) return null

        return (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-300 mb-4">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {categoryItems.map(renderCard)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RecommendationInfo({ rec }: { rec: ItemRecommendation }) {
  const flag = rec.bestRegion.countryCode ? countryCodeToFlag(rec.bestRegion.countryCode) : ''

  return (
    <div className="mt-3 pt-3 border-t border-gray-700 text-sm space-y-1">
      <div className="flex items-center gap-1 text-gray-300">
        <span>🏭</span>
        <span className="truncate">Best: {rec.bestRegion.regionName} {flag}</span>
      </div>
      <ProductionBonusTooltip bonus={rec.bonus}>
        <span className="text-green-400 cursor-help">
          Bonus: {formatBonus(rec.bonus.total)} ℹ️
        </span>
      </ProductionBonusTooltip>
      <div className="flex justify-between text-gray-300">
        <span>Profit/PP: <CurrencyValue value={rec.profitMetrics.profitPerPP} decimals={4} /></span>
      </div>
      <div className={`font-semibold ${rec.profitMetrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        Daily: <CurrencyValue value={rec.profitMetrics.profit} />
      </div>
      {rec.depositExpiresAt && (
        <div className="text-yellow-400">
          ⏱ Deposit: {formatTimeRemaining(rec.depositExpiresAt)}
        </div>
      )}
    </div>
  )
}
