/** Rarity display order */
export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;

/** Scrap yielded per equipment rarity when destroyed in combat (0% durability) */
export const SCRAP_PER_RARITY: Record<string, number> = {
  common: 2,
  uncommon: 6,
  rare: 18,
  epic: 54,
  legendary: 162,
  mythic: 486,
};

/** Dismantling at 100% durability yields 3× the combat destruction scrap */
export const DISMANTLE_MULTIPLIER = 3;
