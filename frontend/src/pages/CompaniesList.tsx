import { useState, useEffect } from 'react'
import { formatBonus, formatRegion } from '../utils/format'
import CurrencyValue from '../components/CurrencyValue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { companyApi, Company, CompaniesSummary as CompaniesSummaryType } from '../api/client'
import ItemIcon from '../components/ItemIcon'
import ProductionBonusTooltip from '../components/ProductionBonusTooltip'
import CompaniesSummary from '../components/CompaniesSummary'

function SortableCompanyCard({ company }: { company: Company }) {
  const navigate = useNavigate()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: company.companyId })

  const style = {
    transform: CSS.Transform.toString(transform && { ...transform, x: 0 }),
    transition,
  }

  const workers = company.workers || []
  const wages = workers.map(w => w.wage)
  const minWage = wages.length > 0 ? Math.min(...wages) : 0
  const maxWage = wages.length > 0 ? Math.max(...wages) : 0
  const allSameWage = minWage === maxWage
  const isDisabled = !!company.disabledAt

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow flex gap-3 ${isDisabled ? 'opacity-40' : ''}`}
    >
      <div
        className="flex items-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
        {...attributes}
        {...listeners}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      <div onClick={() => navigate(`/company/${company.companyId}`)} className="cursor-pointer flex-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <ItemIcon code={company.type} size="md" />
            <div>
              <h3 className="text-xl font-bold text-white">
                {company.name}
                {isDisabled && <span className="ml-2 text-xs text-red-400 font-semibold">Disabled</span>}
              </h3>
              <p className="text-gray-400">{company.type} • {formatRegion(company.regionName, company.countryCode, company.region)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 font-mono">{company.companyId}</p>
            <p className="text-sm text-gray-400">Workers</p>
            <p className="text-lg font-bold text-white">{workers.length}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-400">Wage/Worker</p>
            <p className="font-semibold text-gray-200">
              {workers.length === 0 ? 'No workers' :
               allSameWage ? <CurrencyValue value={minWage} /> :
               <><CurrencyValue value={minWage} /> - <CurrencyValue value={maxWage} /></>}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Production</p>
            <p className="font-semibold text-gray-200">
              {company.productionValue.toFixed(1)} / {company.maxProduction}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Production Bonus</p>
            {company.productionBonus ? (
              <ProductionBonusTooltip bonus={company.productionBonus}>
                <p className="font-semibold text-green-400 cursor-help">
                  {formatBonus(company.productionBonus.total)}
                </p>
              </ProductionBonusTooltip>
            ) : (
              <p className="font-semibold text-gray-500">N/A</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-400">Daily Profit</p>
            {company.dailyProfitMetrics ? (
              <p className={`font-semibold ${company.dailyProfitMetrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <CurrencyValue value={company.dailyProfitMetrics.profit} />
              </p>
            ) : (
              <p className="font-semibold text-gray-500">N/A</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompaniesList() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '')
  const [inputUserId, setInputUserId] = useState('')
  const [localCompanies, setLocalCompanies] = useState<Company[]>([])
  const [summary, setSummary] = useState<CompaniesSummaryType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['companies', userId],
    queryFn: () => companyApi.getByUserId(userId),
    enabled: !!userId,
  })

  useEffect(() => {
    if (data) {
      setLocalCompanies(data.companies)
      setSummary(data.summary)
    }
  }, [data])

  const reorderMutation = useMutation({
    mutationFn: (companyIds: string[]) => companyApi.reorder(companyIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', userId] })
    },
  })

  if (error) {
    console.error('Query error:', error)
  }

  const fetchMutation = useMutation({
    mutationFn: (uid: string) => companyApi.refreshByUserId(uid),
    onSuccess: () => refetch(),
  })

  const handleSetUserId = () => {
    if (inputUserId) {
      localStorage.setItem('userId', inputUserId)
      setUserId(inputUserId)
      fetchMutation.mutate(inputUserId)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localCompanies.findIndex((c) => c.companyId === active.id)
      const newIndex = localCompanies.findIndex((c) => c.companyId === over.id)

      const newOrder = arrayMove(localCompanies, oldIndex, newIndex)
      setLocalCompanies(newOrder)
      reorderMutation.mutate(newOrder.map(c => c.companyId))
    }
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Enter User ID</h2>
          <input
            type="text"
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetUserId()}
            placeholder="Your User ID"
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded mb-4"
          />
          <button
            onClick={handleSetUserId}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Load Companies
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Companies</h2>
        <div className="flex gap-2">
          <button
            onClick={() => fetchMutation.mutate(userId)}
            disabled={fetchMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:bg-gray-600"
          >
            {fetchMutation.isPending ? 'Reloading...' : 'Reload'}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('userId')
              setUserId('')
            }}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Change User
          </button>
        </div>
      </div>

      {isLoading && <div className="text-center py-8 text-gray-300">Loading...</div>}

      {summary && localCompanies.some(c => c.dailyProfitMetrics) && (
        <CompaniesSummary summary={summary} />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localCompanies.map(c => c.companyId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4">
            {localCompanies.map(company => (
              <SortableCompanyCard key={company.companyId} company={company} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
