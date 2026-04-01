import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { battleSimApi, BuildInput, EquipmentSlotInput, ConsumablesInput, SimulationResult } from '../api/battleSimClient'
import EquipmentSetup from '../components/battle-sim/EquipmentSetup'
import SkillAllocator from '../components/battle-sim/SkillAllocator'
import BonusPanel from '../components/battle-sim/BonusPanel'
import BuildManager from '../components/battle-sim/BuildManager'
import CombatLogPanel from '../components/battle-sim/CombatLogPanel'
import BuildComparison from '../components/battle-sim/BuildComparison'

const TABS = ['Equipment', 'Skills', 'Bonuses', 'Builds', 'Combat Log', 'Compare'] as const
const TAB_ICONS = ['🛡️', '📊', '⭐', '📁', '🎯', '⚖️']
type Tab = typeof TABS[number]

function getDefaultEquipment(): Record<string, EquipmentSlotInput> {
  return {
    weapon: { code: null }, helmet: { code: null }, chest: { code: null },
    pants: { code: null }, boots: { code: null }, gloves: { code: null },
  }
}

function getDefaultConsumables(): ConsumablesInput {
  return { ammo: 'none', pill: false, food: 'bread' }
}

function getDefaultSkills(): Record<string, number> {
  return {
    energy: 0, health: 0, hunger: 0, attack: 0, companies: 0,
    entrepreneurship: 0, production: 0, criticalChance: 0, criticalDamages: 0,
    armor: 0, precision: 0, dodge: 0, lootChance: 0, management: 0,
  }
}

export default function BattleSimulator() {
  const [activeTab, setActiveTab] = useState<Tab>('Equipment')
  // Reuse the shared userId from localStorage (same key as Companies/MU pages)
  const userId = localStorage.getItem('userId') || ''

  // Build state
  const [skills, setSkills] = useState<Record<string, number>>(getDefaultSkills())
  const [equipment, setEquipment] = useState<Record<string, EquipmentSlotInput>>(getDefaultEquipment())
  const [consumables, setConsumables] = useState<ConsumablesInput>(getDefaultConsumables())

  // Simulation state
  const [bountyPer1kDmg, setBountyPer1kDmg] = useState(0.3)
  const [battleBonusPercent, setBattleBonusPercent] = useState(0)
  const [simResult, setSimResult] = useState<SimulationResult | null>(null)
  const [simDuration, setSimDuration] = useState<'burst' | '8h' | '24h' | null>(null)
  const [simLoading, setSimLoading] = useState(false)

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['battle-sim-user', userId],
    queryFn: () => battleSimApi.getUserSkills(userId),
    enabled: !!userId,
  })

  // Auto-load current build when user data arrives for the first time
  const [autoLoaded, setAutoLoaded] = useState(false)
  const loadCurrentBuild = useCallback(() => {
    if (!userData) return
    const currentSkills: Record<string, number> = {}
    for (const [name, data] of Object.entries(userData.skills)) {
      currentSkills[name] = data.level
    }
    setSkills(currentSkills)

    const eq = userData.equipment
    const newEquip: Record<string, EquipmentSlotInput> = getDefaultEquipment()
    for (const slot of ['weapon', 'helmet', 'chest', 'pants', 'boots', 'gloves'] as const) {
      const item = eq[slot]
      if (item && typeof item === 'object') {
        newEquip[slot] = { code: item.code, stats: item.skills }
      }
    }
    setEquipment(newEquip)
    setConsumables({
      ammo: (eq.ammo as ConsumablesInput['ammo']) || 'none',
      pill: false,
      food: 'bread',
    })
  }, [userData])

  useEffect(() => {
    if (userData && !autoLoaded) {
      loadCurrentBuild()
      setAutoLoaded(true)
    }
  }, [userData, autoLoaded, loadCurrentBuild])

  const handleSimulate = async (duration: 'burst' | '8h' | '24h') => {
    if (!userData) return
    setSimLoading(true)
    setSimDuration(duration)
    try {
      const result = await battleSimApi.simulate({
        build: { skills, equipment, consumables },
        militaryRank: userData.militaryRank,
        militaryRankPercent: userData.militaryRankPercent,
        duration,
        bountyPer1kDmg,
        battleBonusPercent,
      })
      setSimResult(result)
      setActiveTab('Combat Log')
    } catch (e) {
      console.error('Simulation failed:', e)
    } finally {
      setSimLoading(false)
    }
  }

  const handleClearSim = () => {
    setSimResult(null)
    setSimDuration(null)
  }

  const currentBuild: BuildInput = { skills, equipment, consumables }

  const handleLoadBuild = (build: BuildInput) => {
    setSkills(build.skills)
    setEquipment(build.equipment)
    setConsumables(build.consumables)
  }

  if (!userId) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No User ID found. Please set your User ID on the <a href="/companies" className="text-blue-400 hover:text-blue-300">Companies</a> page first.</p>
      </div>
    )
  }

  return (
    <div>
      {/* User info bar */}
      <div className="flex items-center gap-3 mb-4">
        {userData && (
          <>
            <span className="text-gray-300 text-sm">
              {userData.username} (Lvl {userData.leveling.level}, Rank {userData.militaryRank})
            </span>
            <button onClick={loadCurrentBuild} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs text-white">
              Load Current Build
            </button>
          </>
        )}
        {isLoading && <span className="text-gray-400 text-sm">Loading user data...</span>}
        {error && <span className="text-red-400 text-sm">Failed to load user data</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {TAB_ICONS[i]} {tab}
          </button>
        ))}
      </div>

      {/* Simulation controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => handleSimulate('burst')}
          disabled={!userData || simLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm text-white font-medium"
        >
          ⚔️ Run Burst
        </button>
        <button
          onClick={() => handleSimulate('8h')}
          disabled={!userData || simLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm text-white font-medium"
        >
          ⏱ Run 8h
        </button>
        <button
          onClick={() => handleSimulate('24h')}
          disabled={!userData || simLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm text-white font-medium"
        >
          ⏱ Run 24h
        </button>
        <button
          onClick={handleClearSim}
          disabled={!simResult}
          className="px-2 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded text-sm text-white"
        >
          🗑️
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-400">Bounty / 1k Dmg:</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">🪙</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={bountyPer1kDmg}
              onChange={e => setBountyPer1kDmg(parseFloat(e.target.value) || 0)}
              className="bg-gray-700 text-white rounded px-2 py-1 text-sm w-20"
            />
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-gray-800 rounded-lg p-4">
        {activeTab === 'Equipment' && (
          <EquipmentSetup
            equipment={equipment}
            consumables={consumables}
            onEquipmentChange={setEquipment}
            onConsumablesChange={setConsumables}
            gameConfig={userData?.gameConfig}
          />
        )}
        {activeTab === 'Skills' && (
          <SkillAllocator
            skills={skills}
            onSkillsChange={setSkills}
            gameConfig={userData?.gameConfig}
            leveling={userData?.leveling}
            equipment={equipment}
          />
        )}
        {activeTab === 'Bonuses' && (
          <BonusPanel
            battleBonusPercent={battleBonusPercent}
            onBattleBonusChange={setBattleBonusPercent}
            gameConfig={userData?.gameConfig}
          />
        )}
        {activeTab === 'Builds' && (
          <BuildManager
            currentBuild={currentBuild}
            onLoadBuild={handleLoadBuild}
          />
        )}
        {activeTab === 'Combat Log' && (
          <CombatLogPanel
            result={simResult}
            duration={simDuration}
            loading={simLoading}
          />
        )}
        {activeTab === 'Compare' && userData && (
          <BuildComparison
            militaryRank={userData.militaryRank}
            militaryRankPercent={userData.militaryRankPercent}
            bountyPer1kDmg={bountyPer1kDmg}
            battleBonusPercent={battleBonusPercent}
          />
        )}
      </div>
    </div>
  )
}
