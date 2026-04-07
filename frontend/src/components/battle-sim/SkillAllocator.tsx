import { useMemo } from 'react'
import { EquipmentSlotInput, UserSkillsResponse, UserLeveling, SkillConfig } from '../../api/battleSimClient'
import SkillIcon from '../SkillIcon'

const COMBAT_SKILLS = ['attack', 'precision', 'criticalChance', 'criticalDamages', 'armor', 'dodge', 'health', 'lootChance', 'hunger'] as const
const OTHER_SKILLS = ['entrepreneurship', 'energy', 'production', 'companies', 'management'] as const

const SKILL_LABELS: Record<string, string> = {
  attack: 'Attack', precision: 'Precision', criticalChance: 'Crit. chance',
  criticalDamages: 'Crit. damages', hunger: 'Hunger', health: 'Health',
  armor: 'Armor', dodge: 'Dodge', lootChance: 'Loot chance',
  energy: 'Energy', companies: 'Companies limit', entrepreneurship: 'Entrepreneurship',
  production: 'Production', management: 'Management',
}

/** Combat skills use blue, economic skills use orange */
const COMBAT_BAR_COLOR = 'bg-blue-500'
const ECON_BAR_COLOR = 'bg-orange-500'

interface Props {
  skills: Record<string, number>
  onSkillsChange: (skills: Record<string, number>) => void
  gameConfig?: UserSkillsResponse['gameConfig']
  leveling?: UserLeveling
  equipment: Record<string, EquipmentSlotInput>
}

export default function SkillAllocator({ skills, onSkillsChange, gameConfig, leveling, equipment }: Props) {
  const skillConfigs = gameConfig?.skills

  const spentPoints = useMemo(() => {
    if (!skillConfigs) return 0
    let total = 0
    for (const [name, level] of Object.entries(skills)) {
      total += skillConfigs[name]?.levels[String(level)]?.totalCost ?? 0
    }
    return total
  }, [skills, skillConfigs])

  const totalPoints = leveling?.totalSkillPoints ?? 0
  const remaining = totalPoints - spentPoints

  const setSkillLevel = (name: string, level: number) => {
    const cfg = skillConfigs?.[name]
    if (!cfg) return
    const currentCost = cfg.levels[String(skills[name] ?? 0)]?.totalCost ?? 0
    const newCost = cfg.levels[String(level)]?.totalCost ?? 0
    if (newCost - currentCost > remaining && level > (skills[name] ?? 0)) return
    onSkillsChange({ ...skills, [name]: level })
  }

  /** Auto-allocate skill points for war builds. Priority: Attack > Hunger > CritChance > CritDamage > Precision > Health > LootChance */
  const optimizeForWar = () => {
    if (!skillConfigs) return
    const priority = ['attack', 'hunger', 'criticalChance', 'criticalDamages', 'precision', 'health', 'lootChance']
    const newSkills: Record<string, number> = {}
    for (const name of Object.keys(skills)) newSkills[name] = 0

    let budget = totalPoints
    const playerLvl = leveling?.level ?? 0

    // Greedy: for each skill in priority order, max it out if budget allows
    for (const name of priority) {
      const cfg = skillConfigs[name]
      if (!cfg) continue
      const unlockAt = cfg.levels['1']?.unlockAtLevel ?? 1
      if (playerLvl < unlockAt) continue
      for (let lvl = 10; lvl >= 1; lvl--) {
        const cost = cfg.levels[String(lvl)]?.totalCost ?? Infinity
        if (cost <= budget) {
          newSkills[name] = lvl
          budget -= cost
          break
        }
      }
    }
    onSkillsChange(newSkills)
  }

  const resetAll = () => {
    const reset: Record<string, number> = {}
    for (const name of Object.keys(skills)) reset[name] = 0
    onSkillsChange(reset)
  }

  const getEffectiveValue = (name: string): number => {
    const level = skills[name] ?? 0
    const cfg = skillConfigs?.[name]
    const base = cfg?.levels[String(level)]?.value ?? 0
    const statMap: Record<string, string> = {
      armor: 'armor', dodge: 'dodge', precision: 'precision',
      criticalDamages: 'criticalDamages', criticalChance: 'criticalChance', attack: 'attack',
    }
    let equip = 0
    const statName = statMap[name]
    if (statName) {
      for (const slot of ['weapon', 'helmet', 'chest', 'pants', 'boots', 'gloves']) {
        equip += equipment[slot]?.stats?.[statName] ?? 0
      }
    }
    return base + equip
  }

  if (!skillConfigs) {
    return <div className="text-gray-400 text-sm">Loading skill configuration...</div>
  }

  return (
    <div>
      {/* Points bar */}
      <div className="flex items-center gap-4 mb-6 bg-gray-900 rounded px-3 py-2">
        <span className="text-sm text-gray-300">
          Skill Points: <span className={remaining < 0 ? 'text-red-400' : 'text-green-400'}>{remaining}</span> / {totalPoints}
        </span>
        <span className="text-sm text-gray-500">({spentPoints} spent)</span>
        <button onClick={resetAll} className="ml-auto px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white">
          Reset All
        </button>
        <button onClick={optimizeForWar} className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs text-white">
          ⚔️ Optimize for War
        </button>
      </div>

      {/* Combat Skills */}
      <h3 className="text-sm font-semibold text-purple-400 mb-3">Combat Skills</h3>
      <div className="space-y-3 mb-8">
        {COMBAT_SKILLS.map(name => (
          <SkillRow
            key={name}
            name={name}
            level={skills[name] ?? 0}
            effectiveValue={getEffectiveValue(name)}
            config={skillConfigs[name]}
            playerLevel={leveling?.level ?? 0}
            remaining={remaining}
            barColor={COMBAT_BAR_COLOR}
            onChange={l => setSkillLevel(name, l)}
          />
        ))}
      </div>

      {/* Economic Skills */}
      <h3 className="text-sm font-semibold text-purple-400 mb-3">Economic Skills</h3>
      <div className="space-y-3">
        {OTHER_SKILLS.map(name => (
          <SkillRow
            key={name}
            name={name}
            level={skills[name] ?? 0}
            effectiveValue={getEffectiveValue(name)}
            config={skillConfigs[name]}
            playerLevel={leveling?.level ?? 0}
            remaining={remaining}
            barColor={ECON_BAR_COLOR}
            onChange={l => setSkillLevel(name, l)}
          />
        ))}
      </div>
    </div>
  )
}

function SkillRow({ name, level, effectiveValue, config, playerLevel, remaining, barColor, onChange }: {
  name: string
  level: number
  effectiveValue: number
  config: SkillConfig | undefined
  playerLevel: number
  remaining: number
  barColor: string
  onChange: (level: number) => void
}) {
  if (!config) return null
  const unlockLevel = config.levels['1']?.unlockAtLevel ?? 1
  const locked = playerLevel < unlockLevel
  const nextCost = config.levels[String(level + 1)]?.cost
  const canIncrease = !locked && level < 10 && nextCost !== undefined && nextCost <= remaining
  const canDecrease = !locked && level > 0

  return (
    <div className={`flex items-center gap-3 ${locked ? 'opacity-30' : ''}`}>
      {/* Effective value */}
      <span className="text-lg font-bold text-white w-12 text-right">{effectiveValue}</span>

      {/* Icon */}
      <span className="text-lg w-6 text-center"><SkillIcon name={name} /></span>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium">{SKILL_LABELS[name] ?? name}</div>
        {/* Segmented bar: 10 segments */}
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-sm ${i < level ? barColor : 'bg-gray-700'}`}
            />
          ))}
        </div>
      </div>

      {/* -/+ buttons */}
      <button
        onClick={() => canDecrease && onChange(level - 1)}
        disabled={!canDecrease}
        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white text-lg flex items-center justify-center"
      >−</button>
      <button
        onClick={() => canIncrease && onChange(level + 1)}
        disabled={!canIncrease}
        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white text-lg flex items-center justify-center"
      >+</button>
    </div>
  )
}
