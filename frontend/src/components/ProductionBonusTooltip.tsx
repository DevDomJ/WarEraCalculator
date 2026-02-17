import { ProductionBonusBreakdown } from '../api/client'
import { formatBonus } from '../utils/format'
import { ReactNode } from 'react'

interface ProductionBonusTooltipProps {
  bonus: ProductionBonusBreakdown
  children: ReactNode
}

function BonusRow({ value, description }: { value: number; description: string }) {
  return (
    <div className="flex items-start gap-2 mb-2 text-sm">
      <svg className="w-5 h-5 flex-shrink-0" fill="#E1C997" viewBox="0 0 24 24">
        <path d="M14.79,10.62L3.5,21.9L2.1,20.5L13.38,9.21L14.79,10.62M19.27,7.73L19.86,7.14L19.07,6.35L19.71,5.71L18.29,4.29L17.65,4.93L16.86,4.14L16.27,4.73C14.53,3.31 12.57,2.17 10.47,1.37L9.64,3.16C11.39,4.08 13,5.19 14.5,6.5L14,7L17,10L17.5,9.5C18.81,11 19.92,12.61 20.84,14.36L22.63,13.53C21.83,11.43 20.69,9.47 19.27,7.73Z"></path>
      </svg>
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
        
        {bonus.deposit && (
          <BonusRow value={bonus.deposit.bonus} description={`deposit resources (${bonus.deposit.depositType})`} />
        )}
        
        {bonus.country && (
          <BonusRow value={bonus.country.bonus} description={`${bonus.country.countryName} strategic resources production bonus`} />
        )}
        
        {bonus.party && (
          <BonusRow value={bonus.party.bonus} description={`${bonus.party.ethicName} ethics specialization bonus`} />
        )}
        
        {/* Arrow pointing down */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-8 border-transparent border-t-[#1a1a1a]"></div>
        </div>
      </div>
    </div>
  )
}
