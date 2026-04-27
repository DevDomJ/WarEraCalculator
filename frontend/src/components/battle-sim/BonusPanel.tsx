import { GameConfigResponse } from '../../api/battleSimClient'

interface Props {
  battleBonusPercent: number
  onBattleBonusChange: (v: number) => void
  gameConfig?: GameConfigResponse
}

export default function BonusPanel({ battleBonusPercent, onBattleBonusChange, gameConfig }: Props) {
  const battle = gameConfig?.battle

  return (
    <div>
      {/* Simplified battle bonus slider */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Battle Bonus (combined)</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={-100}
            max={100}
            value={battleBonusPercent}
            onChange={e => onBattleBonusChange(parseInt(e.target.value))}
            className="flex-1 h-2 accent-blue-500"
          />
          <span className={`text-sm w-16 text-right ${battleBonusPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {battleBonusPercent > 0 ? '+' : ''}{battleBonusPercent}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>-100%</span>
          <span>0%</span>
          <span>+100%</span>
        </div>
      </div>

      {/* Reference: individual bonuses from gameConfig */}
      {battle && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Reference: Individual Battle Bonuses</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <BonusRef label="Country Order" value={battle.countryOrderBonusPercent} />
            <BonusRef label="MU Order" value={battle.muOrderBonusPercent} />
            <BonusRef label="Patriotic" value={battle.patrioticBonusPercent} />
            <BonusRef label="Alliance" value={battle.allianceDamagesBonusPercent} />
            <BonusRef label="vs Enemy" value={battle.enemyDamagesBonusPercent} />
            <BonusRef label="Region not linked" value={battle.regionNotLinkedToCapitalMalusPercent} />
            <BonusRef label="Lost attacking region" value={battle.lostAttackingRegionMalusPercent} />
            <BonusRef label="Occupying your regions" value={battle.occupyingYourRegionsMalusPercent} />
          </div>

          {/* HQ levels */}
          {gameConfig?.hqLevels && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">MU HQ Attack Bonus</h3>
              <div className="flex gap-3 text-xs">
                {Object.values(gameConfig.hqLevels).map(hq => (
                  <span key={hq.level} className="text-gray-300">
                    Lvl {hq.level}: +{hq.stats.attackBonus}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BonusRef({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between bg-gray-900 rounded px-2 py-1">
      <span className="text-gray-400">{label}</span>
      <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
        {value > 0 ? '+' : ''}{value}%
      </span>
    </div>
  )
}
