export const ITEM_CATEGORIES: Record<string, string[]> = {
  Cases: ['case2', 'case1'],
  Craft: ['scraps'],
  Buffs: ['cocain', 'coca'],
  Ammo: ['heavyAmmo', 'ammo', 'lightAmmo', 'lead'],
  Food: ['cookedFish', 'steak', 'bread', 'fish', 'livestock', 'grain'],
  Construction: ['oil', 'steel', 'concrete', 'petroleum', 'iron', 'limestone'],
  Equipment: [
    'knife', 'gun', 'rifle', 'sniper', 'tank', 'jet',
    'helmet1', 'helmet2', 'helmet3', 'helmet4', 'helmet5', 'helmet6',
    'chest1', 'chest2', 'chest3', 'chest4', 'chest5', 'chest6',
    'boots1', 'boots2', 'boots3', 'boots4', 'boots5', 'boots6',
    'gloves1', 'gloves2', 'gloves3', 'gloves4', 'gloves5', 'gloves6',
    'pants1', 'pants2', 'pants3', 'pants4', 'pants5', 'pants6',
  ],
};

export function getItemCategory(itemCode: string): string | null {
  for (const [category, items] of Object.entries(ITEM_CATEGORIES)) {
    if (items.includes(itemCode)) {
      return category;
    }
  }
  return null;
}
