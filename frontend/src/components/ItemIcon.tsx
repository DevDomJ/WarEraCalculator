import { ITEM_NAMES } from '../utils/itemNames'

interface ItemIconProps {
  code: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

export default function ItemIcon({ code, size = 'md', showName = false }: ItemIconProps) {
  const displayName = ITEM_NAMES[code] || code

  return (
    <div className="flex items-center gap-3">
      <img 
        src={`/icons/${code}.png`} 
        alt={displayName} 
        className={sizeClasses[size]}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      {showName && <span className="font-semibold text-white">{displayName}</span>}
    </div>
  )
}
