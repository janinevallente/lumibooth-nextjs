'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { StripType } from './StripSelector'

export type FilterId = 'none' | 'soft' | 'bloom' | 'bw' | 'cool' | 'warm' | 'film' | 'vivid'

export interface PhotoEntry {
  dataUrl: string
  filter: FilterId
  stickers: Sticker[]
}

export interface Sticker {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  rotation: number
}

export const FILTERS: { id: FilterId; label: string; css: string; accent: string }[] = [
  { id: 'none', label: 'Natural', css: 'none', accent: '#D4687A' },
  { id: 'soft', label: 'Soft', css: 'brightness(1.08) saturate(0.82) contrast(0.91)', accent: '#C4B5D4' },
  { id: 'bloom', label: 'Bloom', css: 'brightness(1.12) saturate(1.1) contrast(0.88) sepia(0.07)', accent: '#EBA8B4' },
  { id: 'bw', label: 'Mono', css: 'grayscale(100%) contrast(1.12)', accent: '#666' },
  { id: 'cool', label: 'Azure', css: 'hue-rotate(18deg) saturate(1.18) brightness(1.04)', accent: '#7EC8E3' },
  { id: 'warm', label: 'Honey', css: 'sepia(20%) saturate(1.32) brightness(1.06)', accent: '#C9A96E' },
  { id: 'film', label: 'Film', css: 'sepia(28%) contrast(1.18) brightness(0.95) saturate(0.88)', accent: '#9BB5A0' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.65) contrast(1.08)', accent: '#EBA8B4' },
]

const SHOTS_NEEDED: Record<StripType, number> = {
  single: 1, strip3: 3, strip4: 4, grid2x2: 4,
}

interface Props {
  stripType: StripType
  onComplete: (photos: PhotoEntry[]) => void
  onBack: () => void
}

export default function CameraScreen({ stripType, onComplete, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [streaming, setStreaming] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [filter, setFilter] = useState<FilterId>('none')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [shooting, setShooting] = useState(false)
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [currentShot, setCurrentShot] = useState(0)
  const [mirror, setMirror] = useState(true)

  const filterRef = useRef<FilterId>('none')
  const mirrorRef = useRef(true)
  const shootingRef = useRef(false)
  useEffect(() => { filterRef.current = filter }, [filter])
  useEffect(() => { mirrorRef.current = mirror }, [mirror])

  const needed = SHOTS_NEEDED[stripType]
  const getFilterCss = (f: FilterId) => FILTERS.find(x => x.id === f)?.css ?? 'none'

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStreaming(true)
        setCameraError('')
      }
    } catch {
      setCameraError('Camera access denied. Please allow camera permission in your browser settings.')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      if (videoRef.current?.srcObject)
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
  }, [startCamera])

  const captureFrame = useCallback((snapshotFilter: FilterId): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return resolve(null)
      const W = video.videoWidth || 640
      const H = video.videoHeight || 480
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, W, H)
      if (mirrorRef.current) { ctx.translate(W, 0); ctx.scale(-1, 1) }
      ctx.drawImage(video, 0, 0, W, H)
      if (mirrorRef.current) ctx.setTransform(1, 0, 0, 1, 0, 0)
      const css = getFilterCss(snapshotFilter)
      if (css !== 'none') {
        const raw = canvas.toDataURL('image/jpeg', 1)
        const img = new Image()
        img.onload = () => {
          const off = document.createElement('canvas')
          off.width = W; off.height = H
          const octx = off.getContext('2d')!
          octx.filter = css
          octx.drawImage(img, 0, 0, W, H)
          resolve(off.toDataURL('image/jpeg', 0.93))
        }
        img.onerror = () => resolve(canvas.toDataURL('image/jpeg', 0.93))
        img.src = raw
      } else {
        resolve(canvas.toDataURL('image/jpeg', 0.93))
      }
    })
  }, [])

  const startSession = useCallback(async () => {
    if (shootingRef.current || !streaming) return
    shootingRef.current = true
    setShooting(true)
    setPhotos([])
    setCurrentShot(0)
    const captured: PhotoEntry[] = []

    for (let shot = 0; shot < needed; shot++) {
      setCurrentShot(shot)
      for (let c = 3; c >= 1; c--) {
        setCountdown(c)
        await sleep(950)
      }
      setCountdown(null)
      setFlash(true)
      await sleep(100)
      setFlash(false)
      const dataUrl = await captureFrame(filterRef.current)
      if (dataUrl) {
        const entry: PhotoEntry = { dataUrl, filter: filterRef.current, stickers: [] }
        captured.push(entry)
        setPhotos([...captured])
      }
      if (shot < needed - 1) await sleep(750)
    }

    shootingRef.current = false
    setShooting(false)
    onComplete(captured)
  }, [streaming, needed, captureFrame, onComplete])

  const labelMap: Record<StripType, string> = {
    single: 'Single Photo', strip3: '3-Strip', strip4: '4-Strip', grid2x2: '2×2 Grid',
  }

  // Shared filter chips — rendered in two places (mobile & desktop)
  const FilterChips = () => (
    <>
      <p className="text-xs font-semibold mb-3 tracking-wide uppercase" style={{ color: 'var(--muted)' }}>Filter</p>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button key={f.id} className={`chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
    </>
  )

  return (
    <div className="bg-lumi min-h-screen flex flex-col">
      {flash && (
        <div className="flash-anim fixed inset-0 z-[60] pointer-events-none"
          style={{ background: 'rgba(255,245,248,0.95)' }} />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-5 anim-fade">
        <button className="btn btn-ghost px-4 text-sm" onClick={onBack}>← Back</button>
        <div className="step-bar">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`step-dot ${i === 2 ? 'active' : i < 2 ? 'done' : ''}`} />
          ))}
        </div>
        <button className="btn btn-ghost px-3 py-2 text-xs" onClick={() => setMirror(v => !v)}>
          🪞 <span className="hidden sm:inline">{mirror ? 'Mirror On' : 'Mirror Off'}</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 sm:px-6 pb-8 flex-1 max-w-[1025px] mx-auto w-full">
        {/* Status bar */}
        <div className="anim-fade" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>
                {!shooting && photos.length === 0 && 'Ready to shoot!'}
                {shooting && countdown !== null && `Shot ${currentShot + 1} of ${needed} — smile! 😊`}
                {shooting && countdown === null && 'Click! ✨'}
                {!shooting && photos.length > 0 && `${photos.length} of ${needed} captured`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {labelMap[stripType]} · {needed} shot{needed > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: needed }).map((_, i) => (
                <div key={i}
                  className={`rounded-full transition-all duration-300 ${i === currentShot && shooting && countdown !== null ? 'dot-pop' : ''}`}
                  style={{
                    width: photos[i] ? 10 : 8, height: photos[i] ? 10 : 8,
                    background: photos[i]
                      ? 'linear-gradient(135deg, var(--rose), var(--blush))'
                      : i === currentShot && shooting ? 'var(--gold)' : 'var(--petal)',
                    boxShadow: photos[i] ? '0 2px 6px rgba(212,104,122,0.4)' : 'none',
                    border: '1px solid rgba(212,104,122,0.2)',
                  }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Main area: viewport + filter side-by-side on lg ── */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1">

          {/* Left: viewport card + shoot button */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="card anim-scale overflow-hidden" style={{ animationDelay: '0.15s' }}>
              {/* Viewport */}
              <div className="relative overflow-hidden"
                style={{ aspectRatio: '4/3', borderRadius: 18, background: 'linear-gradient(135deg, #1E2235, #2A3050)' }}>

                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <span style={{ fontSize: 52 }}>🌸</span>
                    <p className="text-white text-sm font-medium leading-relaxed">{cameraError}</p>
                    <button className="btn btn-primary px-6 py-2.5 text-sm" onClick={startCamera}>Try Again</button>
                  </div>
                ) : (
                  <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: getFilterCss(filter), transform: mirror ? 'scaleX(-1)' : 'none' }}
                    playsInline muted />
                )}

                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'radial-gradient(ellipse at center, transparent 60%, rgba(30,34,53,0.28) 100%)',
                }} />

                {/* Countdown */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ background: 'rgba(30,34,53,0.38)', backdropFilter: 'blur(3px)' }}>
                    <div key={countdown} className="countdown-anim font-serif"
                      style={{
                        fontSize: 'clamp(80px,22vw,130px)', lineHeight: 1,
                        background: 'linear-gradient(135deg, #fff 0%, #F5D5DB 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 30px rgba(235,168,180,0.8))',
                      }}>
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Corner brackets */}
                {[
                  { top: 14, left: 14 }, { top: 14, right: 14 },
                  { bottom: 14, left: 14 }, { bottom: 14, right: 14 },
                ].map((pos, i) => (
                  <div key={i} className="absolute pointer-events-none"
                    style={{
                      ...pos, width: 22, height: 22,
                      borderTop: i < 2 ? '1.5px solid rgba(255,255,255,0.45)' : 'none',
                      borderBottom: i >= 2 ? '1.5px solid rgba(255,255,255,0.45)' : 'none',
                      borderLeft: i % 2 === 0 ? '1.5px solid rgba(255,255,255,0.45)' : 'none',
                      borderRight: i % 2 === 1 ? '1.5px solid rgba(255,255,255,0.45)' : 'none',
                    }} />
                ))}

                {/* Live badge */}
                {streaming && !shooting && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-dark">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #4ade80' }} />
                    <span className="text-[10px] text-white font-medium">LIVE</span>
                  </div>
                )}
              </div>

              {/* Shoot button */}
              <div className="p-4">
                <button
                  className={`btn btn-primary w-full py-4 text-base ${!shooting && streaming ? 'pulse-anim' : ''}`}
                  onClick={startSession}
                  disabled={shooting || !streaming}>
                  {shooting
                    ? <><span className="spin-anim inline-block text-lg">✨</span> Shooting…</>
                    : <><span style={{ fontSize: 15 }}>📸</span> Click to Start</>
                  }
                </button>
              </div>
            </div>

            {/* Filter — mobile only (below shoot button, hidden on lg) */}
            <div className="lg:hidden card p-4 anim-fade" style={{ animationDelay: '0.25s' }}>
              <FilterChips />
            </div>
          </div>

          {/* Right col: filter (desktop) + strip preview */}
          <div className="lg:w-72 flex flex-col gap-4">

            {/* Filter — desktop only (inline with viewport, hidden on mobile) */}
            <div className="hidden lg:block card p-4 anim-fade" style={{ animationDelay: '0.2s' }}>
              <FilterChips />
            </div>

            {/* Strip preview */}
            <div className="card p-4 anim-fade" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Preview</p>
                {photos.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,104,122,0.1)', color: 'var(--rose)' }}>
                    {photos.length}/{needed}
                  </span>
                )}
              </div>

              {stripType === 'grid2x2' ? (
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="relative overflow-hidden rounded-xl"
                      style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg,#F5D5DB22,#C4B5D418)', border: '1.5px dashed rgba(212,104,122,0.25)' }}>
                      {photos[i] ? (
                        <img src={photos[i].dataUrl} className="w-full h-full object-cover anim-pop"
                          style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: 'forwards' }} alt="" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span style={{ fontSize: 18, opacity: 0.2 }}>🌸</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: needed }).map((_, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl"
                      style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg,#F5D5DB22,#C4B5D418)', border: '1.5px dashed rgba(212,104,122,0.25)' }}>
                      {photos[i] ? (
                        <img src={photos[i].dataUrl} className="w-full h-full object-cover anim-pop"
                          style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: 'forwards' }} alt="" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span style={{ fontSize: 16, opacity: 0.2 }}>🌸</span>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1.5 font-serif text-[10px]"
                        style={{ color: photos[i] ? 'rgba(255,255,255,0.6)' : 'rgba(180,160,190,0.5)', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-center mt-3" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
                {photos.length === 0 ? 'Your photos will appear here'
                  : photos.length === needed ? 'All shots captured! ✨'
                    : `${needed - photos.length} more to go`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
