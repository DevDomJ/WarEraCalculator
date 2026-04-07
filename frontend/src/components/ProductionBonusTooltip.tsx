import { ProductionBonusBreakdown } from '../api/client'
import { formatBonus } from '../utils/format'
import { ReactNode } from 'react'
import SkillIcon from './SkillIcon'

interface ProductionBonusTooltipProps {
  bonus: ProductionBonusBreakdown
  children: ReactNode
}

function BonusRow({ value, description }: { value: number; description: string }) {
  return (
    <div className="flex items-start gap-2 mb-2 text-sm">
      <SkillIcon name="production" className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <span className="text-green-400 font-semibold">{formatBonus(value)}</span>
        <span className="text-gray-400"> from </span>
        <span className="text-gray-400">{description}</span>
      </div>
    </div>
  )
}

export default function ProductionBonusTooltip({ bonus, children }: ProductionBonusTooltipProps) {
  if (!bonus || bonus.total === 0) return <>{children}</>

  return (
    <div className="group relative inline-block">
      {children}
      
      <div className="invisible group-hover:visible absolute z-10 w-80 p-3 bg-[#1a1a1a] text-white rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
        <div className="font-bold mb-2">Production bonus</div>
        
        {bonus.strategicBonus > 0 && (
          <BonusRow value={bonus.strategicBonus} description="strategic resources" />
        )}
        
        {bonus.depositBonus > 0 && (
          <BonusRow value={bonus.depositBonus} description="deposit resources" />
        )}
        
        {bonus.ethicSpecializationBonus > 0 && (
          <BonusRow value={bonus.ethicSpecializationBonus} description="ethic specialization" />
        )}
        
        {bonus.ethicDepositBonus > 0 && (
          <BonusRow value={bonus.ethicDepositBonus} description="ethic deposit" />
        )}
        
        {/* Arrow pointing down */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-8 border-transparent border-t-[#1a1a1a]"></div>
        </div>
      </div>
    </div>
  )
}
