import { ReactNode } from 'react'

interface InfoTooltipProps {
  content: string | ReactNode
  children: ReactNode
}

/**
 * Reusable tooltip component that displays additional information on hover.
 * Styled consistently with ProductionBonusTooltip.
 * 
 * @param content - The tooltip content (text or JSX)
 * @param children - The element to wrap with the tooltip
 */
export default function InfoTooltip({ content, children }: InfoTooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      
      <div className="invisible group-hover:visible absolute z-10 w-64 p-3 bg-[#1a1a1a] text-white rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
        <div className="text-sm text-gray-300">{content}</div>
        
        {/* Arrow pointing down */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-8 border-transparent border-t-[#1a1a1a]"></div>
        </div>
      </div>
    </div>
  )
}
