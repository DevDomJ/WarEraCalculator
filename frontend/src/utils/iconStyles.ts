import { CSSProperties } from 'react'

/** Shared inline style for in-game SVG icons (SkillIcon, CoinIcon). */
export function inlineIconStyle(size = '1em'): CSSProperties {
  return { width: size, height: size, overflow: 'visible', fontSize: '120%', filter: 'drop-shadow(black 1px 1px 0px)', display: 'inline', verticalAlign: 'middle' }
}
