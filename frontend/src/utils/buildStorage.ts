import { SavedBuild } from '../api/battleSimClient'

const BUILDS_KEY = 'warera-battle-builds'

export function loadBuilds(): SavedBuild[] {
  try { return JSON.parse(localStorage.getItem(BUILDS_KEY) || '[]') }
  catch { return [] }
}

export function saveBuilds(builds: SavedBuild[]) {
  localStorage.setItem(BUILDS_KEY, JSON.stringify(builds))
}
