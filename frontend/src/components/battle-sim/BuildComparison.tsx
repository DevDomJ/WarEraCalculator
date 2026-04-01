import { useState } from 'react'
import { battleSimApi, CompareResult } from '../../api/battleSimClient'
import { loadBuilds } from '../../utils/buildStorage'
import { formatCompact, formatGold } from '../../utils/format'

interface Props {
  militaryRank: number
  militaryRankPercent: number
  bountyPer1kDmg: number
  battleBonusPercent: number
}

export default function BuildComparison({ militaryRank, militaryRankPercent, bountyPer1kDmg, battleBonusPercent }: Props) {
  const builds = loadBuilds()
  const [selectedA, setSelectedA] = useState(0)
  const [selectedB, setSelectedB] = useState(Math.min(1, builds.length - 1))
  const [duration, setDuration] = useState<'burst' | '8h' | '24h'>('8h')
  const [results, setResults] = useState<CompareResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  // Clamp indices to valid range in case builds were deleted
  const idxA = Math.min(selectedA, builds.length - 1)
  const idxB = Math.min(selectedB, builds.length - 1)

  const runCompare = async () => {
    if (builds.length < 2) return
    setLoading(true)
    try {
      const res = await battleSimApi.compare({
        builds: [
          { name: builds[idxA].name, build: builds[idxA] },
          { name: builds[idxB].name, build: builds[idxB] },
        ],
        militaryRank, militaryRankPercent, duration, bountyPer1kDmg, battleBonusPercent,
      })
      setResults(res)
    } catch (e) {
      console.error('Compare failed:', e)
    } finally {
      setLoading(false)
    }
  }

  if (builds.length < 2) {
    return <div className="text-gray-400 text-sm">Save at least 2 builds in the Builds tab to compare them.</div>
  }

  return (
    <div>
      {/* Build selectors + duration */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Build A:</span>
          <select value={idxA} onChange={e => setSelectedA(+e.target.value)} className="bg-gray-700 text-white rounded px-2 py-1 text-sm">
            {builds.map((b, i) => <option key={i} value={i}>{b.name}</option>)}
          </select>
        </div>
        <span className="text-gray-500">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Build B:</span>
          <select value={idxB} onChange={e => setSelectedB(+e.target.value)} className="bg-gray-700 text-white rounded px-2 py-1 text-sm">
            {builds.map((b, i) => <option key={i} value={i}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex gap-1">
          {(['burst', '8h', '24h'] as const).map(d => (
            <button key={d} onClick={() => setDuration(d)}
              className={`px-3 py-1 rounded text-sm ${duration === d ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              {d}
            </button>
          ))}
        </div>
        <button onClick={runCompare} disabled={loading || idxA === idxB}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm text-white font-medium">
          {loading ? 'Running...' : '⚔️ Compare'}
        </button>
      </div>

      {idxA === idxB && <div className="text-yellow-400 text-xs mb-2">Select two different builds to compare.</div>}

      {/* Results table */}
      {results && results.length === 2 && (
        <CompareTable a={results[0]} b={results[1]} />
      )}
    </div>
  )
}

function CompareTable({ a, b }: { a: CompareResult; b: CompareResult }) {
  const ra = a.result
  const rb = b.result

  const rows: { label: string; valA: string; valB: string; diff: number; format?: 'num' | 'g' | 'pct' }[] = [
    { label: 'Total Damage', valA: formatCompact(ra.damage.totalDamage), valB: formatCompact(rb.damage.totalDamage), diff: ra.damage.totalDamage - rb.damage.totalDamage, format: 'num' },
    { label: 'Avg / Hit', valA: formatCompact(ra.damage.avgPerHit), valB: formatCompact(rb.damage.avgPerHit), diff: ra.damage.avgPerHit - rb.damage.avgPerHit, format: 'num' },
    { label: 'Total Hits', valA: String(ra.damage.totalHits), valB: String(rb.damage.totalHits), diff: ra.damage.totalHits - rb.damage.totalHits, format: 'num' },
    { label: 'Crit Rate', valA: ra.damage.critPercent + '%', valB: rb.damage.critPercent + '%', diff: ra.damage.critPercent - rb.damage.critPercent, format: 'pct' },
    { label: 'Miss Rate', valA: ra.damage.missPercent + '%', valB: rb.damage.missPercent + '%', diff: ra.damage.missPercent - rb.damage.missPercent, format: 'pct' },
    { label: 'Dodge Rate', valA: ra.damage.dodgePercent + '%', valB: rb.damage.dodgePercent + '%', diff: ra.damage.dodgePercent - rb.damage.dodgePercent, format: 'pct' },
    { label: 'Total Costs', valA: formatGold(ra.costs.total), valB: formatGold(rb.costs.total), diff: ra.costs.total - rb.costs.total, format: 'g' },
    { label: 'Total Revenue', valA: formatGold(ra.revenue.total), valB: formatGold(rb.revenue.total), diff: ra.revenue.total - rb.revenue.total, format: 'g' },
    { label: 'Net Profit', valA: formatGold(ra.netProfit.netProfit), valB: formatGold(rb.netProfit.netProfit), diff: ra.netProfit.netProfit - rb.netProfit.netProfit, format: 'g' },
    { label: 'ROI', valA: ra.netProfit.roi + '%', valB: rb.netProfit.roi + '%', diff: ra.netProfit.roi - rb.netProfit.roi, format: 'pct' },
    { label: 'Cost / 1k Dmg', valA: formatGold(ra.costs.costPer1kDmg), valB: formatGold(rb.costs.costPer1kDmg), diff: ra.costs.costPer1kDmg - rb.costs.costPer1kDmg, format: 'g' },
  ]

  const fmtDiff = (diff: number, format?: string) => {
    const prefix = diff > 0 ? '+' : ''
    if (format === 'g') return prefix + diff.toFixed(3)
    if (format === 'pct') return prefix + diff.toFixed(1) + '%'
    return prefix + formatCompact(Math.round(diff))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-400 py-2 pr-4">Metric</th>
            <th className="text-right text-blue-400 py-2 px-4">{a.name}</th>
            <th className="text-right text-purple-400 py-2 px-4">{b.name}</th>
            <th className="text-right text-gray-400 py-2 pl-4">Diff</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            // For costs, lower is better (invert color). For most metrics, higher is better.
            const costMetric = row.label.includes('Cost') || row.label === 'Miss Rate'
            const diffColor = row.diff === 0 ? 'text-gray-500'
              : (costMetric ? (row.diff < 0 ? 'text-green-400' : 'text-red-400') : (row.diff > 0 ? 'text-green-400' : 'text-red-400'))

            return (
              <tr key={row.label} className="border-b border-gray-800">
                <td className="text-gray-300 py-1.5 pr-4">{row.label}</td>
                <td className="text-right text-white py-1.5 px-4">{row.valA}</td>
                <td className="text-right text-white py-1.5 px-4">{row.valB}</td>
                <td className={`text-right py-1.5 pl-4 font-medium ${diffColor}`}>{fmtDiff(row.diff, row.format)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
