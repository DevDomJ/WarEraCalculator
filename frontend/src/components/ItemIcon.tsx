interface ItemIconProps {
  code: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showName?: boolean
  displayName?: string
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

export default function ItemIcon({ code, size = 'md', showName = false, displayName }: ItemIconProps) {
  // Equipment items like "gloves4" use the base slot icon "gloves.png"
  const equipSlots = /^(helmet|chest|pants|boots|gloves)\d+$/
  const iconCode = equipSlots.test(code) ? code.replace(/\d+$/, '') : code

  return (
    <div className="flex items-center gap-3">
      <img 
        src={`/icons/${iconCode}.png`} 
        alt={displayName || code} 
        className={sizeClasses[size]}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      {showName && displayName && <span className="font-semibold text-white">{displayName}</span>}
    </div>
  )
}
