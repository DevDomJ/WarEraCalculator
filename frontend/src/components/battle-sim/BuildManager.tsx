import { useState } from 'react'
import { BuildInput, SavedBuild } from '../../api/battleSimClient'
import { loadBuilds, saveBuilds } from '../../utils/buildStorage'

interface Props {
  currentBuild: BuildInput
  onLoadBuild: (build: BuildInput) => void
}

export default function BuildManager({ currentBuild, onLoadBuild }: Props) {
  const [builds, setBuilds] = useState<SavedBuild[]>(loadBuilds)
  const [newName, setNewName] = useState('')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const handleSave = () => {
    const name = newName.trim()
    if (!name) return
    const build: SavedBuild = { name, ...currentBuild }
    const updated = [...builds, build]
    setBuilds(updated)
    saveBuilds(updated)
    setNewName('')
  }

  const handleDelete = (idx: number) => {
    const updated = builds.filter((_, i) => i !== idx)
    setBuilds(updated)
    saveBuilds(updated)
  }

  const handleRename = (idx: number) => {
    if (!editName.trim()) return
    const updated = [...builds]
    updated[idx] = { ...updated[idx], name: editName.trim() }
    setBuilds(updated)
    saveBuilds(updated)
    setEditingIdx(null)
  }

  const handleLoad = (build: SavedBuild) => {
    onLoadBuild({ skills: build.skills, equipment: build.equipment, consumables: build.consumables })
  }

  return (
    <div>
      {/* Save current build */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="Build name..."
          className="bg-gray-700 text-white rounded px-3 py-2 text-sm flex-1"
        />
        <button onClick={handleSave} disabled={!newName.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-sm text-white">
          Save Current
        </button>
      </div>

      {/* Saved builds list */}
      {builds.length === 0 ? (
        <div className="text-gray-500 text-sm">No saved builds yet.</div>
      ) : (
        <div className="space-y-2">
          {builds.map((build, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-900 rounded px-3 py-2">
              {editingIdx === idx ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(idx)}
                    className="bg-gray-700 text-white rounded px-2 py-1 text-sm flex-1"
                    autoFocus
                  />
                  <button onClick={() => handleRename(idx)} className="text-xs text-green-400 hover:text-green-300">✓</button>
                  <button onClick={() => setEditingIdx(null)} className="text-xs text-gray-400 hover:text-gray-300">✕</button>
                </>
              ) : (
                <>
                  <span className="text-sm text-white flex-1">{build.name}</span>
                  <button onClick={() => handleLoad(build)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white">
                    Load
                  </button>
                  <button onClick={() => { setEditingIdx(idx); setEditName(build.name) }} className="text-xs text-gray-400 hover:text-gray-300">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(idx)} className="text-xs text-red-400 hover:text-red-300">
                    🗑️
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
