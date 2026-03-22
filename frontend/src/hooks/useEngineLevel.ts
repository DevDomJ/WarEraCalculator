import { useState } from 'react'

const ENGINE_LEVEL_KEY = 'warera-engine-level'

export function useEngineLevel(): [number, (level: number) => void] {
  const [engineLevel, setLevel] = useState(() => {
    const stored = localStorage.getItem(ENGINE_LEVEL_KEY)
    return stored ? parseInt(stored, 10) || 4 : 4
  })

  const setEngineLevel = (level: number) => {
    setLevel(level)
    localStorage.setItem(ENGINE_LEVEL_KEY, String(level))
  }

  return [engineLevel, setEngineLevel]
}
