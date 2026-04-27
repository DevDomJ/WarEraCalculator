import { useState, useMemo } from 'react'
import { EquipmentSlotInput, ConsumablesInput, GameItemConfig, GameConfigResponse } from '../../api/battleSimClient'
import ItemIcon from '../ItemIcon'
import SkillIcon from '../SkillIcon'
import { RARITIES, RARITY_BADGE_COLORS, SCRAP_PER_RARITY } from '../../utils/rarity'

const EQUIPMENT_SLOTS = ['helmet', 'gloves', 'chest', 'weapon', 'pants', 'boots'] as const

const AMMO_OPTIONS = [
  { code: 'none', label: 'None (Knife)' },
  { code: 'lightAmmo', label: 'Light Ammo' },
  { code: 'ammo', label: 'Normal Ammo' },
  { code: 'heavyAmmo', label: 'Heavy Ammo' },
]

const FOOD_OPTIONS = [
  { code: 'bread', label: 'Bread', heal: '10%' },
  { code: 'steak', label: 'Steak', heal: '15%' },
  { code: 'cookedFish', label: 'Cooked Fish', heal: '20%' },
]

function getItemsForSlot(slot: string, items: Record<string, GameItemConfig>): GameItemConfig[] {
  const usage = slot === 'weapon' ? 'weapon' : slot
  return Object.values(items)
    .filter(i => i.usage === usage)
    .sort((a, b) => RARITIES.indexOf(a.rarity as any) - RARITIES.indexOf(b.rarity as any))
}

function getMidStats(item: GameItemConfig): Record<string, number> {
  if (!item.dynamicStats) return {}
  const stats: Record<string, number> = {}
  for (const [stat, [min, max]] of Object.entries(item.dynamicStats)) {
    stats[stat] = Math.round((min + max) / 2)
  }
  return stats
}

interface Props {
  equipment: Record<string, EquipmentSlotInput>
  consumables: ConsumablesInput
  onEquipmentChange: (eq: Record<string, EquipmentSlotInput>) => void
  onConsumablesChange: (c: ConsumablesInput) => void
  gameConfig?: GameConfigResponse
}

export default function EquipmentSetup({ equipment, consumables, onEquipmentChange, onConsumablesChange, gameConfig }: Props) {
  const items = gameConfig?.items
  const [modalSlot, setModalSlot] = useState<string | null>(null)

  const totalStats = useMemo(() => {
    let armor = 0, attack = 0
    for (const slot of EQUIPMENT_SLOTS) {
      const eq = equipment[slot]
      if (eq?.stats) {
        armor += (eq.stats.armor ?? 0)
        attack += (eq.stats.attack ?? 0)
      }
    }
    return { armor, attack }
  }, [equipment])

  const setSlot = (slot: string, code: string | null) => {
    if (!code) {
      onEquipmentChange({ ...equipment, [slot]: { code: null } })
    } else {
      const item = items?.[code]
      onEquipmentChange({ ...equipment, [slot]: { code, stats: item ? getMidStats(item) : {} } })
    }
    setModalSlot(null)
  }

  const quickSetRarity = (rarity: string) => {
    if (!items) return
    const newEquip = { ...equipment }
    for (const slot of EQUIPMENT_SLOTS) {
      const slotItems = getItemsForSlot(slot, items)
      const match = slotItems.find(i => i.rarity === rarity)
      if (match) {
        newEquip[slot] = { code: match.code, stats: getMidStats(match) }
      }
    }
    onEquipmentChange(newEquip)
  }

  const clearAll = () => {
    const newEquip: Record<string, EquipmentSlotInput> = {}
    for (const slot of EQUIPMENT_SLOTS) newEquip[slot] = { code: null }
    onEquipmentChange(newEquip)
  }

  return (
    <div>
      {/* Stat summary */}
      <div className="flex items-center gap-4 mb-4 text-sm bg-gray-900 rounded px-3 py-2">
        <span className="text-gray-300"><SkillIcon name="armor" /> {totalStats.armor}</span>
        <span className="text-gray-300"><SkillIcon name="attack" /> {totalStats.attack}</span>
        <span className="text-gray-400">💰 —</span>
      </div>

      {/* Quick Set Rarity */}
      <div className="mb-4">
        <span className="text-sm font-semibold text-gray-400">Quick Set Rarity</span>
        <div className="flex gap-2 mt-1">
          {RARITIES.map(r => (
            <button key={r} onClick={() => quickSetRarity(r)}
              className={`px-3 py-1 rounded text-sm border ${RARITY_BADGE_COLORS[r]} border-current hover:opacity-80`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
          <button onClick={clearAll} className="px-2 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600 text-gray-300">🗑️</button>
        </div>
      </div>

      {/* Equipment grid */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex justify-center">
          <SlotCard slot="helmet" equipment={equipment} items={items} onClick={() => setModalSlot('helmet')} />
        </div>
        <div className="flex items-center gap-8">
          <SlotCard slot="gloves" equipment={equipment} items={items} onClick={() => setModalSlot('gloves')} />
          <SlotCard slot="chest" equipment={equipment} items={items} onClick={() => setModalSlot('chest')} />
          <SlotCard slot="weapon" equipment={equipment} items={items} onClick={() => setModalSlot('weapon')} />
        </div>
        <div className="flex justify-center">
          <SlotCard slot="pants" equipment={equipment} items={items} onClick={() => setModalSlot('pants')} />
        </div>
        <div className="flex justify-center">
          <SlotCard slot="boots" equipment={equipment} items={items} onClick={() => setModalSlot('boots')} />
        </div>
      </div>

      <hr className="border-gray-600 mb-4" />

      {/* Consumables */}
      <div className="flex justify-center gap-8">
        <div className="text-center cursor-pointer" onClick={() => setModalSlot('ammo')}>
          <div className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center bg-gray-900 hover:opacity-80 ${consumables.ammo !== 'none' ? 'border-blue-500' : 'border-gray-600'}`}>
            {consumables.ammo !== 'none' && <ItemIcon code={consumables.ammo} size="md" />}
          </div>
          <div className="text-xs mt-1 text-gray-400">{AMMO_OPTIONS.find(o => o.code === consumables.ammo)?.label ?? 'Ammo'}</div>
        </div>

        <div className="text-center cursor-pointer" onClick={() => onConsumablesChange({ ...consumables, pill: !consumables.pill })}>
          <div className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center bg-gray-900 hover:opacity-80 ${consumables.pill ? 'border-red-500' : 'border-gray-600'}`}>
            <ItemIcon code="cocain" size="md" />
          </div>
          <div className={`text-xs mt-1 ${consumables.pill ? 'text-red-400' : 'text-gray-500'}`}>{consumables.pill ? 'Pill Active' : 'Pill'}</div>
        </div>

        <div className="text-center cursor-pointer" onClick={() => setModalSlot('food')}>
          <div className="w-20 h-20 rounded-lg border-2 border-blue-500 flex items-center justify-center bg-gray-900 hover:opacity-80">
            <ItemIcon code={consumables.food} size="md" />
          </div>
          <div className="text-xs mt-1 text-gray-400">{FOOD_OPTIONS.find(o => o.code === consumables.food)?.label ?? 'Food'}</div>
        </div>
      </div>

      {/* Selection Modal */}
      {modalSlot && (
        <SelectionModal
          slot={modalSlot}
          equipment={equipment}
          consumables={consumables}
          items={items}
          onSelectEquipment={setSlot}
          onSelectAmmo={code => { onConsumablesChange({ ...consumables, ammo: code as ConsumablesInput['ammo'] }); setModalSlot(null) }}
          onSelectFood={code => { onConsumablesChange({ ...consumables, food: code as ConsumablesInput['food'] }); setModalSlot(null) }}
          onClose={() => setModalSlot(null)}
        />
      )}
    </div>
  )
}

/** Clickable equipment slot in the visual layout */
function SlotCard({ slot, equipment, items, onClick }: {
  slot: string
  equipment: Record<string, EquipmentSlotInput>
  items?: Record<string, GameItemConfig>
  onClick: () => void
}) {
  const eq = equipment[slot]
  const item = eq?.code && items ? items[eq.code] : null
  const rarity = item?.rarity ?? null
  const borderClass = rarity ? RARITY_BADGE_COLORS[rarity] : 'border-gray-600 text-gray-500'

  const hasStats = eq?.stats && Object.keys(eq.stats).length > 0

  return (
    <div className="group text-center cursor-pointer" onClick={onClick}>
      <div className={`w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center overflow-hidden bg-gray-900 hover:opacity-80 ${borderClass}`}>
        {eq?.code ? <ItemIcon code={eq.code} size="md" /> : <span className="text-gray-600 text-xs capitalize">{slot}</span>}
        {hasStats && (
          <div className="text-[10px] leading-tight mt-1 hidden group-hover:block">
            {Object.entries(eq.stats).map(([stat, val]) => {
              const range = item?.dynamicStats?.[stat]
              return (
                <div key={stat} className="text-gray-300">
                  <SkillIcon name={stat} size="sm" /> {range ? `${range[0]}-${range[1]}` : val}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className={`text-xs mt-1 truncate w-20 ${rarity ? RARITY_BADGE_COLORS[rarity].split(' ')[1] : 'text-gray-500'}`}>
        {item ? item.code : slot}
      </div>
    </div>
  )
}

/** Modal for selecting equipment, ammo, or food */
function SelectionModal({ slot, equipment, consumables, items, onSelectEquipment, onSelectAmmo, onSelectFood, onClose }: {
  slot: string
  equipment: Record<string, EquipmentSlotInput>
  consumables: ConsumablesInput
  items?: Record<string, GameItemConfig>
  onSelectEquipment: (slot: string, code: string | null) => void
  onSelectAmmo: (code: string) => void
  onSelectFood: (code: string) => void
  onClose: () => void
}) {
  const isAmmo = slot === 'ammo'
  const isFood = slot === 'food'
  const title = isAmmo ? 'Select Ammo' : isFood ? 'Select Food' : `Select ${slot.charAt(0).toUpperCase() + slot.slice(1)}`

  const slotItems = (!isAmmo && !isFood && items) ? getItemsForSlot(slot, items) : []
  const currentCode = isAmmo ? consumables.ammo : isFood ? consumables.food : equipment[slot]?.code

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Equipment items */}
        {!isAmmo && !isFood && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {slotItems.map(item => {
              const selected = currentCode === item.code
              const rarity = item.rarity
              const borderColor = RARITY_BADGE_COLORS[rarity] ?? 'border-gray-600 text-gray-400'
              const stats = item.dynamicStats ?? {}
              const scraps = SCRAP_PER_RARITY[rarity] ?? 0

              return (
                <button
                  key={item.code}
                  onClick={() => onSelectEquipment(slot, item.code)}
                  className={`p-3 rounded-lg border-2 text-center hover:opacity-80 transition-all bg-gray-900 ${
                    selected ? 'border-blue-400 ring-1 ring-blue-400' : borderColor
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <ItemIcon code={item.code} size="md" />
                  </div>
                  <div className={`text-sm font-medium ${RARITY_BADGE_COLORS[rarity]?.split(' ')[1] ?? 'text-white'}`}>
                    {item.code}
                  </div>
                  <div className="text-xs text-gray-500">({rarity})</div>
                  {Object.entries(stats).map(([stat, [min, max]]) => (
                    <div key={stat} className="text-xs text-gray-300 mt-0.5">
                      <SkillIcon name={stat} size="sm" /> {min}–{max}
                    </div>
                  ))}
                  <div className="flex justify-center gap-2 mt-1 text-xs text-gray-500">
                    <span>🔩 {scraps}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Ammo options */}
        {isAmmo && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {AMMO_OPTIONS.map(opt => {
              const selected = currentCode === opt.code
              const ammoItem = items?.[opt.code]
              const bonus = ammoItem?.flatStats?.percentAttack
              return (
                <button
                  key={opt.code}
                  onClick={() => onSelectAmmo(opt.code)}
                  className={`p-3 rounded-lg border-2 text-center hover:opacity-80 bg-gray-900 ${
                    selected ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-600'
                  }`}
                >
                  {opt.code !== 'none' && <div className="flex justify-center mb-1"><ItemIcon code={opt.code} size="md" /></div>}
                  <div className="text-sm text-white">{opt.label}</div>
                  {bonus && <div className="text-xs text-green-400">+{bonus}% Attack</div>}
                </button>
              )
            })}
          </div>
        )}

        {/* Food options */}
        {isFood && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {FOOD_OPTIONS.map(opt => {
              const selected = currentCode === opt.code
              return (
                <button
                  key={opt.code}
                  onClick={() => onSelectFood(opt.code)}
                  className={`p-3 rounded-lg border-2 text-center hover:opacity-80 bg-gray-900 ${
                    selected ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-600'
                  }`}
                >
                  <div className="flex justify-center mb-1"><ItemIcon code={opt.code} size="md" /></div>
                  <div className="text-sm text-white">{opt.label}</div>
                  <div className="text-xs text-green-400">{opt.heal} HP</div>
                </button>
              )
            })}
          </div>
        )}

        {/* Unequip button (equipment only) */}
        {!isAmmo && !isFood && (
          <button
            onClick={() => onSelectEquipment(slot, null)}
            className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium"
          >
            Unequip Item
          </button>
        )}
      </div>
    </div>
  )
}
