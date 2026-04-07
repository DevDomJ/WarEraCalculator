import { useState, useRef, useEffect, useCallback } from 'react'

const STREAM_URL = 'https://stream.laut.fm/war-era-de'
const API_URL = 'https://api.laut.fm/station/war-era-de/current_song'
const FALLBACK_POLL_MS = 30_000

interface SongInfo {
  title: string
  artist: string
  album: string
  endsAt: number // unix ms
}

async function fetchCurrentSong(): Promise<SongInfo | null> {
  try {
    const res = await fetch(API_URL, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = await res.json()
    return {
      title: data.title ?? '',
      artist: data.artist?.name ?? '',
      album: data.album ?? '',
      endsAt: new Date(data.ends_at).getTime(),
    }
  } catch {
    return null
  }
}

/**
 * RadioPlayer - Compact embedded audio player for the Staatsradio laut.fm stream.
 * Polls the laut.fm API for now-playing info, scheduling the next poll
 * 1 second after the current song ends for near-instant updates.
 */
export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const pollRef = useRef<() => void>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('radioVolume')
    return saved ? parseFloat(saved) : 0.5
  })
  const [song, setSong] = useState<SongInfo | null>(null)

  const poll = useCallback(async () => {
    const info = await fetchCurrentSong()
    if (timerRef.current) clearTimeout(timerRef.current)
    if (info) {
      setSong(info)
      const delay = Math.max(info.endsAt - Date.now() + 1000, 3000)
      timerRef.current = setTimeout(() => pollRef.current?.(), delay)
    } else {
      timerRef.current = setTimeout(() => pollRef.current?.(), FALLBACK_POLL_MS)
    }
  }, [])

  pollRef.current = poll

  useEffect(() => {
    poll()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    }
  }, [poll])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
    localStorage.setItem('radioVolume', String(volume))
  }, [volume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      audio.src = ''
    } else {
      audio.src = STREAM_URL
      audio.play().catch(() => setPlaying(false))
    }
    setPlaying(!playing)
  }

  const nowPlaying = song
    ? `${song.artist}${song.title ? ` — ${song.title}` : ''}${song.album ? ` (${song.album})` : ''}`
    : 'Staatsradio'

  return (
    <div className="flex items-center gap-3 text-sm">
      <audio ref={audioRef} />

      <button onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-white flex-shrink-0"
        aria-label={playing ? 'Pause radio' : 'Play radio'}>
        {playing ? '⏸' : '▶'}
      </button>

      <div className="min-w-0 flex-1">
        <span className="text-gray-500 text-xs">Staatsradio</span>
        <div className="text-gray-300 truncate" title={nowPlaying} aria-live="polite">
          🎵 {nowPlaying}
        </div>
      </div>

      <span className="text-gray-500 flex-shrink-0">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
      <input
        type="range" min="0" max="1" step="0.05"
        value={volume}
        onChange={e => setVolume(parseFloat(e.target.value))}
        className="w-20 radio-volume flex-shrink-0"
        aria-label="Volume"
      />
    </div>
  )
}
