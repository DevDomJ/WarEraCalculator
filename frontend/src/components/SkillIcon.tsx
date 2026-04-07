import { inlineIconStyle } from '../utils/iconStyles'

/**
 * SkillIcon - Renders official in-game SVG icons for skills and stats.
 *
 * @param name - Skill/stat key (e.g. 'attack', 'armor', 'production')
 * @param className - Optional CSS classes (for sizing/color overrides)
 * @param size - Preset size: 'sm' (0.75em), 'md' (1em, default), 'lg' (1.5em)
 *
 * Usage:
 *   <SkillIcon name="attack" />
 *   <SkillIcon name="armor" size="lg" />
 */

const ICON_PATHS: Record<string, string> = {
  attack: 'M18.8025 2.44L6.9025 14.34L4.7825 12.22L3.3725 13.63L5.8425 16.1L2.6625 19.28C2.2725 19.67 2.2725 20.3 2.6625 20.69L3.3725 21.4C3.7625 21.79 4.3925 21.79 4.7825 21.4L8.0025 18.23L10.4425 20.7L11.8525 19.29L9.7325 17.17L21.6325 5.27V2.44H18.8025Z',
  precision: 'M19.5,3.09L20.91,4.5L16.41,9H20V11H13V4H15V7.59L19.5,3.09M20.91,19.5L19.5,20.91L15,16.41V20H13V13H20V15H16.41L20.91,19.5M4.5,3.09L9,7.59V4H11V11H4V9H7.59L3.09,4.5L4.5,3.09M3.09,19.5L7.59,15H4V13H11V20H9V16.41L4.5,20.91L3.09,19.5Z',
  criticalChance: 'M4.35 21H21V4.35L17.85 12L15.5 5L14.25 10.2L3 3L10.2 14.25L4.5 15.5L12 17.85L4.35 21Z',
  criticalDamages: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,10.84 21.79,9.69 21.39,8.61L19.79,10.21C19.93,10.8 20,11.4 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.6,4 13.2,4.07 13.79,4.21L15.4,2.6C14.31,2.21 13.16,2 12,2M19,2L15,6V7.5L12.45,10.05C12.3,10 12.15,10 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12C14,11.85 14,11.7 13.95,11.55L16.5,9H18L22,5H19V2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12H16A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8V6Z',
  armor: 'M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z',
  dodge: 'M16.5,5.5A2,2 0 0,0 18.5,3.5A2,2 0 0,0 16.5,1.5A2,2 0 0,0 14.5,3.5A2,2 0 0,0 16.5,5.5M12.9,19.4L13.9,15L16,17V23H18V15.5L15.9,13.5L16.5,10.5C17.89,12.09 19.89,13 22,13V11C20.24,11.03 18.6,10.11 17.7,8.6L16.7,7C16.34,6.4 15.7,6 15,6C14.7,6 14.5,6.1 14.2,6.1L9,8.3V13H11V9.6L12.8,8.9L11.2,17L6.3,16L5.9,18L12.9,19.4M4,9A1,1 0 0,1 3,8A1,1 0 0,1 4,7H7V9H4M5,5A1,1 0 0,1 4,4A1,1 0 0,1 5,3H10V5H5M3,13A1,1 0 0,1 2,12A1,1 0 0,1 3,11H7V13H3Z',
  health: 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z',
  lootChance: 'M5,4H19A3,3 0 0,1 22,7V11H15V10H9V11H2V7A3,3 0 0,1 5,4M11,11H13V13H11V11M2,12H9V13L11,15H13L15,13V12H22V20H2V12Z',
  hunger: 'M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z',
  entrepreneurship: 'M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z',
  energy: 'M11 15H6L13 1V9H18L11 23V15Z',
  production: 'M14.79,10.62L3.5,21.9L2.1,20.5L13.38,9.21L14.79,10.62M19.27,7.73L19.86,7.14L19.07,6.35L19.71,5.71L18.29,4.29L17.65,4.93L16.86,4.14L16.27,4.73C14.53,3.31 12.57,2.17 10.47,1.37L9.64,3.16C11.39,4.08 13,5.19 14.5,6.5L14,7L17,10L17.5,9.5C18.81,11 19.92,12.61 20.84,14.36L22.63,13.53C21.83,11.43 20.69,9.47 19.27,7.73Z',
  companies: 'M4,18V20H8V18H4M4,14V16H14V14H4M10,18V20H14V18H10M16,14V16H20V14H16M16,18V20H20V18H16M2,22V8L7,12V8L12,12V8L17,12L18,2H21L22,12V22H2Z',
  management: 'M12 3C14.21 3 16 4.79 16 7S14.21 11 12 11 8 9.21 8 7 9.79 3 12 3M16 13.54C16 14.6 15.72 17.07 13.81 19.83L13 15L13.94 13.12C13.32 13.05 12.67 13 12 13S10.68 13.05 10.06 13.12L11 15L10.19 19.83C8.28 17.07 8 14.6 8 13.54C5.61 14.24 4 15.5 4 17V21H20V17C20 15.5 18.4 14.24 16 13.54Z',
}

const ICON_COLORS: Record<string, string> = {
  attack: '#E7B098', precision: '#E7B098',
  criticalChance: '#E69494', criticalDamages: '#E69494',
  armor: '#BBC8D0', dodge: '#BBC8D0',
  health: '#8ADBA8',
  lootChance: '#A2D2A0',
  hunger: '#E8ABA3',
  entrepreneurship: '#DEADD3',
  energy: '#9EB7EE',
  production: '#E1C997', companies: '#E1C997',
  management: '#CBBAE5',
}

const SIZES: Record<string, string> = {
  sm: '0.75em',
  md: '1em',
  lg: '1.5em',
}

interface SkillIconProps {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function SkillIcon({ name, className, size = 'md' }: SkillIconProps) {
  const path = ICON_PATHS[name]
  if (!path) {
    if (import.meta.env.DEV) console.warn(`SkillIcon: unknown name "${name}"`)
    return <span>•</span>
  }

  const dim = SIZES[size]
  return (
    <svg
      viewBox="0 0 24 24"
      fill={ICON_COLORS[name] ?? 'currentColor'}
      className={className}
      style={inlineIconStyle(dim)}
    >
      <path d={path} />
    </svg>
  )
}

/** All available icon names for reference */
export const SKILL_ICON_NAMES = Object.keys(ICON_PATHS)
