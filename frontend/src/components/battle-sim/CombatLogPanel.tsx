import { SimulationResult, SimulationEvent, HitLogEntry } from '../../api/battleSimClient'
import { formatCompact, formatGold } from '../../utils/format'
import SkillIcon from '../SkillIcon'
import CoinIcon from '../CoinIcon'

interface Props {
  result: SimulationResult | null
  duration: 'burst' | '8h' | '24h' | null
  loading: boolean
}

export default function CombatLogPanel({ result, duration, loading }: Props) {
  if (loading) return <div className="text-gray-400 text-center py-8">Running simulation...</div>
  if (!result) return <div className="text-gray-500 text-center py-8">Run a simulation to see results here.</div>

  const { damage, costs, revenue, netProfit, log } = result
  const durationLabel = duration === 'burst' ? 'BURST' : duration === '8h' ? '8-HOUR' : '24-HOUR'

  return (
    <div>
      {/* Duration badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded">
          ⏱ {durationLabel} SIMULATION
        </span>
        <span className="text-gray-400 text-sm">{damage.totalHits} hits</span>
      </div>

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="mb-4 bg-yellow-900/30 border border-yellow-700 rounded px-3 py-2">
          {result.warnings.map((w, i) => (
            <div key={i} className="text-yellow-400 text-xs">⚠️ {w}</div>
          ))}
        </div>
      )}

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <DamageCard damage={damage} />
        <CostsCard costs={costs} />
        <RevenueCard revenue={revenue} />
        <NetProfitCard netProfit={netProfit} />
      </div>

      {/* Combat log */}
      <div className="bg-gray-900 rounded-lg p-4 max-h-[500px] overflow-y-auto font-mono text-sm">
        {log.map((event, i) => (
          <LogEntry key={i} event={event} />
        ))}
      </div>
    </div>
  )
}

function DamageCard({ damage }: { damage: SimulationResult['damage'] }) {
  const vsExpected = damage.expectedDamage > 0
    ? ((damage.totalDamage - damage.expectedDamage) / damage.expectedDamage * 100).toFixed(1)
    : '0'
  const vsColor = parseFloat(vsExpected) >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-blue-400">⚔️ DAMAGE</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{formatCompact(damage.totalDamage)}</div>
      <div className="text-xs mb-3">
        <span className={vsColor}>{vsExpected}%</span>
        <span className="text-gray-500"> vs expected ({formatCompact(damage.expectedDamage)})</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Avg / Hit</span>
          <span className="text-white">{formatCompact(damage.avgPerHit)}</span>
        </div>
        <StatBar label="Crit" count={damage.crits} percent={damage.critPercent} color="text-red-400" barColor="bg-red-500" />
        <StatBar label="Miss" count={damage.misses} percent={damage.missPercent} color="text-gray-400" barColor="bg-gray-500" />
        <StatBar label="Dodge" count={damage.dodges} percent={damage.dodgePercent} color="text-yellow-400" barColor="bg-yellow-500" />
      </div>
    </div>
  )
}

function CostsCard({ costs }: { costs: SimulationResult['costs'] }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-red-400">💰 COSTS</span>
        <span className="text-red-400 text-sm">{formatGold(costs.total)}</span>
      </div>
      <div className="space-y-1.5 text-sm">
        <CostRow icon="🗡️" label={`Weapon (${costs.weaponsUsed}x)`} value={costs.weaponCost} />
        <CostRow icon={<SkillIcon name="armor" size="sm" />} label={`Armor (${costs.armorSetsUsed}x)`} value={costs.armorCost} />
        <CostRow icon={<SkillIcon name="criticalDamages" size="sm" />} label={`Ammo (${costs.ammoUsed})`} value={costs.ammoCost} />
        <CostRow icon="🍞" label={`Food (${costs.foodUsed})`} value={costs.foodCost} />
        <CostRow icon="💊" label="Booster" value={costs.boosterCost} />
        <div className="border-t border-gray-700 pt-1 mt-1">
          <div className="flex justify-between text-gray-500 text-xs">
            <span>⚙️ Steel consumed</span><span>{costs.steelConsumed}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>🔩 Scrap consumed</span><span>{costs.scrapConsumed}</span>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Cost / 1k Dmg</span>
            <span className="text-white font-bold">{formatGold(costs.costPer1kDmg)} <span className="text-gray-500 text-xs">(th. {formatGold(costs.theoreticalCostPer1kDmg)})</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RevenueCard({ revenue }: { revenue: SimulationResult['revenue'] }) {
  const total = revenue.total
  const bountyPct = total > 0 ? (revenue.bounty / total * 100) : 0
  const casesPct = total > 0 ? ((revenue.casesHitValue + revenue.casesDmgValue) / total * 100) : 0
  const scrapPct = total > 0 ? (revenue.scrapValue / total * 100) : 0

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-green-400">📈 REVENUE</span>
        <span className="text-green-400 text-sm">{formatGold(total)}</span>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300"><CoinIcon /> Bounty</span>
          <span className="text-white">{formatGold(revenue.bounty)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">📦 Cases (Hit) ({revenue.casesHit})</span>
          <span className="text-white">{formatGold(revenue.casesHitValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">📦 Cases (Dmg) ({revenue.casesDmg})</span>
          <span className="text-white">{formatGold(revenue.casesDmgValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">🔩 Scrap ({revenue.scrapCount})</span>
          <span className="text-white">{formatGold(revenue.scrapValue)}</span>
        </div>
        {/* Revenue bar */}
        <div className="flex h-3 rounded overflow-hidden mt-2">
          <div className="bg-green-500" style={{ width: `${bountyPct}%` }} />
          <div className="bg-yellow-500" style={{ width: `${casesPct}%` }} />
          <div className="bg-gray-500" style={{ width: `${scrapPct}%` }} />
        </div>
        <div className="flex gap-3 text-xs text-gray-500">
          <span>🟢 Bounty</span><span>🟡 Cases</span><span>⚪ Scrap</span>
        </div>
      </div>
    </div>
  )
}

function NetProfitCard({ netProfit }: { netProfit: SimulationResult['netProfit'] }) {
  const profitColor = netProfit.netProfit >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-purple-400">⭐ NET PROFIT</span>
      </div>
      <div className={`text-3xl font-bold ${profitColor} mb-1`}>
        {netProfit.netProfit >= 0 ? '+' : ''}{formatGold(netProfit.netProfit)} G
      </div>
      <div className="flex items-center gap-2 text-xs mb-3">
        <span className="text-gray-400">{netProfit.profitPer1k} G/1k</span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${netProfit.roi >= 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
          ROI {netProfit.roi}%
        </span>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">↑ Revenue</span>
          <span className="text-green-400">{formatGold(netProfit.revenue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">↓ Costs</span>
          <span className="text-red-400">-{formatGold(netProfit.costs)}</span>
        </div>
        <div className="border-t border-gray-700 pt-1 flex justify-between text-xs text-gray-500">
          <span><SkillIcon name="precision" size="sm" /> {netProfit.hitRate}%</span>
          <span><SkillIcon name="dodge" size="sm" /> {netProfit.dodgeRate}%</span>
        </div>
      </div>
    </div>
  )
}

function StatBar({ label, count, percent, color, barColor }: {
  label: string; count: number; percent: number; color: string; barColor: string
}) {
  return (
    <div>
      <div className="flex justify-between">
        <span className={color}>{label === 'Crit' ? <SkillIcon name="criticalChance" size="sm" /> : label === 'Miss' ? '✕' : <SkillIcon name="dodge" size="sm" />} {label}</span>
        <span className="text-white">{count} ({percent}%)</span>
      </div>
      <div className="h-1 bg-gray-700 rounded mt-0.5">
        <div className={`h-full rounded ${barColor}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  )
}

function CostRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-300">{icon} {label}</span>
      <span className="text-white">{formatGold(value)}</span>
    </div>
  )
}

function LogEntry({ event }: { event: SimulationEvent }) {
  if (event.type === 'hit' && event.data) {
    return <HitEntry hit={event.data} />
  }

  const colorMap: Record<string, string> = {
    header: 'text-blue-400 font-bold',
    pill: 'text-red-400',
    health: 'text-green-400',
    regen: 'text-green-300',
    food_regen: 'text-yellow-400',
    total_hp: 'text-cyan-400',
    end: 'text-blue-400 font-bold mt-2',
  }

  const iconMap: Record<string, string> = {
    header: '🎮', pill: '💊', health: '💚', regen: '🔄',
    food_regen: '🍖', total_hp: '💙', end: '🏁',
  }

  return (
    <div className={`${colorMap[event.type] ?? 'text-gray-300'} py-0.5`}>
      {iconMap[event.type] ?? '•'} {event.message}
    </div>
  )
}

function HitEntry({ hit }: { hit: HitLogEntry }) {
  const typeConfig = {
    hit: { icon: '⚔️', color: 'text-orange-400', label: 'HIT' },
    miss: { icon: '✕', color: 'text-gray-400', label: 'MISS' },
    crit: { icon: '⚡', color: 'text-red-400', label: 'CRIT' },
  }
  const cfg = typeConfig[hit.type]

  return (
    <div className="py-0.5">
      <div>
        <span className="text-gray-500">#{hit.hitNumber}</span>{' '}
        <span className={`font-bold ${cfg.color}`}>{cfg.label}</span>{' '}
        <span className="text-white font-bold">{formatCompact(hit.damage)} Dmg</span>
        {hit.critMultiplier && <span className="text-gray-400"> (×{hit.critMultiplier.toFixed(2)})</span>}
        {hit.dodged && <span className="ml-2 bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded">DODGED</span>}
      </div>
      <div className="text-xs text-gray-500 ml-6">
        {!hit.dodged && <span>-{hit.hpLost} HP  </span>}
        HP: {hit.hpRemaining}  Total Dmg: {formatCompact(hit.totalDamage)}
      </div>
      {hit.foodEaten && (
        <div className="text-xs text-yellow-400 ml-6">
          🍖 Eating {hit.foodEaten} → +{hit.hpHealed} HP
        </div>
      )}
    </div>
  )
}
