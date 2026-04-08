export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const

export const RARITY_TEXT_COLORS: Record<string, string> = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
  mythic: 'text-red-400',
}

export const RARITY_BORDER_COLORS: Record<string, string> = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
  mythic: 'border-red-500',
}

/** Combined border + text classes for rarity badges/buttons */
export const RARITY_BADGE_COLORS: Record<string, string> = {
  common: 'border-gray-500 text-gray-400',
  uncommon: 'border-green-500 text-green-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-yellow-500 text-yellow-400',
  mythic: 'border-red-500 text-red-400',
}

/** Scrap yielded per rarity when destroyed in combat */
export const SCRAP_PER_RARITY: Record<string, number> = {
  common: 2, uncommon: 6, rare: 18, epic: 54, legendary: 162, mythic: 486,
}
