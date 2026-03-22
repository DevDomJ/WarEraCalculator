/**
 * Dropdown selector for Automated Engine level (1–7).
 * Used on Market Overview and Item Detail pages.
 *
 * @param value - Current engine level
 * @param onChange - Callback when level changes
 */
export default function EngineLevelSelector({ value, onChange }: { value: number; onChange: (level: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Engine Lvl:</span>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
      >
        {[1, 2, 3, 4, 5, 6, 7].map(l => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
    </div>
  )
}
