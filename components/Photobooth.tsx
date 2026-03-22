'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterId = 'none' | 'bw' | 'soft' | 'bloom' | 'cool' | 'warm' | 'film' | 'vivid'
type AppState = 'idle' | 'countdown' | 'shooting' | 'review'

interface Sticker {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  rotation: number
}

interface PhotoEntry {
  dataUrl: string
  filter: FilterId
  stickers: Sticker[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS: { id: FilterId; label: string; labelKr: string; css: string; accent: string }[] = [
  { id: 'none',  label: 'Natural',  labelKr: "Natural",   css: 'none',                                                       accent: '#E8738A' },
  { id: 'soft',  label: 'Soft',     labelKr: "Soft", css: 'brightness(1.08) saturate(0.85) contrast(0.92)',              accent: '#C8B4E3' },
  { id: 'bloom', label: 'Bloom',    labelKr: "Bloom",   css: 'brightness(1.12) saturate(1.1) contrast(0.9) sepia(0.08)',   accent: '#F2A7BB' },
  { id: 'bw',    label: 'Mono',     labelKr: "Mono",   css: 'grayscale(100%) contrast(1.1)',                               accent: '#888'    },
  { id: 'cool',  label: 'Azure',    labelKr: "Azure", css: 'hue-rotate(20deg) saturate(1.15) brightness(1.05)',           accent: '#7EC8E3' },
  { id: 'warm',  label: 'Honey',    labelKr: "Honey",   css: 'sepia(18%) saturate(1.35) brightness(1.06)',                  accent: '#D4A853' },
  { id: 'film',  label: 'Film',     labelKr: "Film",   css: 'sepia(30%) contrast(1.15) brightness(0.96) saturate(0.9)',    accent: '#A8C5A0' },
  { id: 'vivid', label: 'Vivid',    labelKr: "Vivid", css: 'saturate(1.7) contrast(1.08)',                                accent: '#F2A7BB' },
]

const STICKER_EMOJIS = [
  '🌸','🌼','🌷','💐','✨','⭐','💫','🌟',
  '🎀','💝','💖','💗','🦋','🌙','☁️','🍒',
  '🧸','🎶','📷','🌈','🫧','🍓','🍑','🎁',
  '👑','💎','🌺','🫶',
]

const COUNTDOWN_START = 3

// ─── Petal Burst (replaces confetti) ─────────────────────────────────────────

function PetalBurst() {
  const petals = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    emoji: ['🌸','🌺','🌷','✨','💮','🌼'][i % 6],
    left: 5 + Math.random() * 90,
    delay: Math.random() * 1.0,
    duration: 2.5 + Math.random() * 2,
    drift: (Math.random() - 0.5) * 160,
    size: 14 + Math.random() * 14,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: '-30px',
          fontSize: p.size,
          animationName: 'petalFall',
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          animationTimingFunction: 'ease-in',
          animationFillMode: 'both',
          ['--drift' as string]: `${p.drift}px`,
        }}>
          {p.emoji}
        </div>
      ))}
    </div>
  )
}

// ─── Sticker Overlay ──────────────────────────────────────────────────────────

function StickerOverlay({ stickers, onMove, onRemove }: {
  stickers: Sticker[]
  onMove: (id: string, x: number, y: number) => void
  onRemove: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent, sticker: Sticker) => {
    e.preventDefault()
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    const handleMove = (ev: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100))
      onMove(sticker.id, x, y)
    }
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ touchAction: 'none' }}>
      {stickers.map(s => (
        <div key={s.id}
          style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            fontSize: s.size,
            transform: `translate(-50%,-50%) rotate(${s.rotation}deg)`,
            cursor: 'grab', userSelect: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
          onPointerDown={e => handlePointerDown(e, s)}
          onDoubleClick={() => onRemove(s.id)}
        >
          {s.emoji}
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Photobooth() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [appState, setAppState] = useState<AppState>('idle')
  const [streaming, setStreaming] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [filter, setFilter] = useState<FilterId>('none')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [currentShot, setCurrentShot] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [showPetals, setShowPetals] = useState(false)
  const [mirror, setMirror] = useState(true)
  const shootingRef = useRef(false)
  const filterRef = useRef<FilterId>('none')
  const mirrorRef = useRef(true)

  useEffect(() => { filterRef.current = filter }, [filter])
  useEffect(() => { mirrorRef.current = mirror }, [mirror])

  const getFilterCss = (f: FilterId) => FILTERS.find(x => x.id === f)?.css ?? 'none'

  // ── Camera ──────────────────────────────────────────────────────────────────

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
      setCameraError('Camera access denied. Please allow it in your browser settings.')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      if (videoRef.current?.srcObject)
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
  }, [startCamera])

  // ── Capture (reads from refs — no stale closure) ─────────────────────────────

  const captureFrame = useCallback((snapshotFilter: FilterId): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
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
      const filtered = document.createElement('canvas')
      filtered.width = W; filtered.height = H
      const fctx = filtered.getContext('2d')!
      fctx.filter = css
      const img = new Image(); img.src = raw
      fctx.drawImage(img, 0, 0, W, H)
      return filtered.toDataURL('image/jpeg', 0.93)
    }
    return canvas.toDataURL('image/jpeg', 0.93)
  }, [])

  // ── Shooting sequence ────────────────────────────────────────────────────────

  const startSession = useCallback(async () => {
    if (shootingRef.current || !streaming) return
    shootingRef.current = true
    setPhotos([])
    setCurrentShot(0)

    for (let shot = 0; shot < 4; shot++) {
      setCurrentShot(shot)
      for (let c = COUNTDOWN_START; c >= 1; c--) {
        setCountdown(c); setAppState('countdown')
        await sleep(950)
      }
      setCountdown(null); setAppState('shooting')
      setFlash(true); await sleep(100); setFlash(false)
      const snapshotFilter = filterRef.current
      const dataUrl = captureFrame(snapshotFilter)
      if (dataUrl) {
        const entry: PhotoEntry = { dataUrl, filter: snapshotFilter, stickers: [] }
        setPhotos(prev => [...prev, entry])
      }
      if (shot < 3) await sleep(700)
    }

    shootingRef.current = false
    setAppState('review')
    setSelectedPhoto(0)
    setShowPetals(true)
    setTimeout(() => setShowPetals(false), 4000)
  }, [streaming, captureFrame])

  // ── Stickers ─────────────────────────────────────────────────────────────────

  const addSticker = (emoji: string) => {
    if (selectedPhoto === null) return
    const s: Sticker = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: 25 + Math.random() * 50,
      y: 20 + Math.random() * 60,
      size: 30 + Math.floor(Math.random() * 16),
      rotation: (Math.random() - 0.5) * 24,
    }
    setPhotos(prev => prev.map((p, i) => i === selectedPhoto ? { ...p, stickers: [...p.stickers, s] } : p))
  }

  const moveSticker = (idx: number, id: string, x: number, y: number) => {
    setPhotos(prev => prev.map((p, i) =>
      i === idx ? { ...p, stickers: p.stickers.map(s => s.id === id ? { ...s, x, y } : s) } : p
    ))
  }

  const removeSticker = (idx: number, id: string) => {
    setPhotos(prev => prev.map((p, i) =>
      i === idx ? { ...p, stickers: p.stickers.filter(s => s.id !== id) } : p
    ))
  }

  // ── Download ─────────────────────────────────────────────────────────────────

  const downloadStrip = useCallback(async () => {
    if (photos.length === 0) return
    const PW = 600, PH = 450, PAD = 24, GAP = 14
    const HEADER_H = 90, FOOTER_H = 60
    const SW = PW + PAD * 2
    const SH = HEADER_H + PAD + (PH + GAP) * photos.length - GAP + PAD + FOOTER_H

    const c = document.createElement('canvas')
    c.width = SW; c.height = SH
    const ctx = c.getContext('2d')!

    // BG gradient
    const bg = ctx.createLinearGradient(0, 0, SW, SH)
    bg.addColorStop(0, '#FDF6F0'); bg.addColorStop(1, '#F5E6F0')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, SW, SH)

    // Subtle dot pattern
    ctx.fillStyle = 'rgba(242,167,187,0.18)'
    for (let dx = 20; dx < SW; dx += 28)
      for (let dy = 20; dy < SH; dy += 28) {
        ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill()
      }

    // Header
    const hGrad = ctx.createLinearGradient(0, 0, SW, HEADER_H)
    hGrad.addColorStop(0, '#E8738A'); hGrad.addColorStop(1, '#F2A7BB')
    ctx.fillStyle = hGrad; ctx.fillRect(0, 0, SW, HEADER_H)

    // Header text
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = '13px sans-serif'; ctx.textAlign = 'right'
    ctx.fillText('lumibooth', SW - 20, 24)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 38px serif'; ctx.textAlign = 'center'
    ctx.fillText('LumiBooth', SW / 2, 56)
    ctx.font = '13px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText('Capture your glowing moments', SW / 2, 76)

    // Photos
    for (let i = 0; i < photos.length; i++) {
      const img = await loadImg(photos[i].dataUrl)
      const y = HEADER_H + PAD + i * (PH + GAP), x = PAD
      ctx.save()
      ctx.shadowColor = 'rgba(28,35,64,0.15)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4
      roundRectClip(ctx, x, y, PW, PH, 12)
      ctx.drawImage(img, x, y, PW, PH)
      ctx.restore()
      ctx.strokeStyle = 'rgba(242,167,187,0.5)'; ctx.lineWidth = 2
      roundRectStroke(ctx, x, y, PW, PH, 12)
      // stickers
      for (const s of photos[i].stickers) {
        const sx = x + (s.x / 100) * PW, sy = y + (s.y / 100) * PH
        ctx.save()
        ctx.translate(sx, sy); ctx.rotate((s.rotation * Math.PI) / 180)
        ctx.font = `${s.size}px serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.emoji, 0, 0)
        ctx.restore()
      }
    }

    // Footer
    const fy = SH - FOOTER_H
    const fGrad = ctx.createLinearGradient(0, fy, SW, SH)
    fGrad.addColorStop(0, '#F2A7BB'); fGrad.addColorStop(1, '#C8B4E3')
    ctx.fillStyle = fGrad; ctx.fillRect(0, fy, SW, FOOTER_H)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '500 16px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), SW / 2, fy + 34)
    ctx.font = '13px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('🌸 A photo from LumiBooth', SW / 2, fy + 52)

    const a = document.createElement('a')
    a.href = c.toDataURL('image/jpeg', 0.95)
    a.download = `lumibooth-${Date.now()}.jpg`
    a.click()
  }, [photos])

  const retake = () => {
    setAppState('idle'); setPhotos([])
    setSelectedPhoto(null); setCurrentShot(0)
    shootingRef.current = false
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const activeFilterAccent = FILTERS.find(f => f.id === filter)?.accent ?? '#E8738A'

  return (
    <div className="relative min-h-screen z-10">
      {flash && <div className="flash-anim fixed inset-0 z-[60] pointer-events-none" style={{ background: 'rgba(255,240,245,0.95)' }} />}
      {showPetals && <PetalBurst />}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative w-10 h-10 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #E8738A, #F2A7BB)',
              borderRadius: '14px',
              boxShadow: '0 4px 16px rgba(232,115,138,0.4)',
            }}>
            <span style={{ fontSize: 20 }}>🌸</span>
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl leading-none tracking-tight" style={{ color: 'var(--navy)' }}>
              LumiBooth
            </h1>
            <p className="text-[10px] font-medium tracking-[0.2em]" style={{ color: 'var(--blush)' }}>PHOTO STRIP BOOTH</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setMirror(v => !v)}
            className="btn btn-ghost px-3 py-2 text-xs gap-1.5">
            <span>🪞</span>
            <span className="hidden sm:inline">{mirror ? 'Mirror ON' : 'Mirror OFF'}</span>
          </button>
          <div className="card-sm px-3 py-2 flex items-center gap-1.5 text-xs font-medium"
            style={{ color: streaming ? 'var(--sage)' : '#E8738A' }}>
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: streaming ? 'var(--sage)' : '#E8738A', boxShadow: streaming ? '0 0 6px var(--sage)' : 'none' }} />
            <span className="hidden sm:inline">{streaming ? 'LIVE' : 'OFF'}</span>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-5 px-4 sm:px-6 pb-10 max-w-[1180px] mx-auto">

        {/* Left column: camera + filters */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Camera card */}
          <div className="card overflow-hidden">
            {/* Shot status bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--rose)' }}>
                  {appState === 'idle'      && 'Press the shutter to start ↓'}
                  {appState === 'countdown' && `Shot ${currentShot + 1} of 4`}
                  {appState === 'shooting'  && 'Click! ✨'}
                  {appState === 'review'    && 'Add stickers to your photos 🌸'}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(28,35,64,0.4)' }}>
                  {appState === 'idle'      && 'Press shutter to begin'}
                  {appState === 'countdown' && `Shot ${currentShot + 1} of 4`}
                  {appState === 'shooting'  && 'Captured!'}
                  {appState === 'review'    && 'Tap a photo to add stickers'}
                </p>
              </div>
              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {[0,1,2,3].map(i => (
                  <div key={i}
                    className={`rounded-full transition-all duration-300 ${i === currentShot && appState === 'countdown' ? 'dot-active' : ''}`}
                    style={{
                      width:  photos[i] ? 10 : 8,
                      height: photos[i] ? 10 : 8,
                      background: photos[i]
                        ? 'linear-gradient(135deg, var(--rose), var(--blush))'
                        : i === currentShot && appState === 'countdown'
                          ? 'var(--gold)'
                          : 'rgba(200,180,210,0.4)',
                      boxShadow: photos[i] ? '0 2px 8px rgba(232,115,138,0.4)' : 'none',
                    }} />
                ))}
              </div>
            </div>

            {/* Viewport */}
            <div className="relative mx-4 mb-4 overflow-hidden"
              style={{
                borderRadius: 16,
                aspectRatio: '4/3',
                background: 'linear-gradient(135deg, #1C2340, #2A3358)',
                boxShadow: '0 8px 32px rgba(28,35,64,0.2)',
              }}>

              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <span style={{ fontSize: 48 }}>🌸</span>
                  <p className="text-white font-medium text-sm leading-relaxed">{cameraError}</p>
                  <button className="btn btn-primary px-6 py-2.5 text-sm" onClick={startCamera}>
                    Retry
                  </button>
                </div>
              ) : (
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: getFilterCss(filter), transform: mirror ? 'scaleX(-1)' : 'none' }}
                  playsInline muted />
              )}

              {/* Soft vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, transparent 65%, rgba(28,35,64,0.25) 100%)',
              }} />

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ background: 'rgba(28,35,64,0.35)', backdropFilter: 'blur(2px)' }}>
                  <div key={countdown} className="countdown-anim font-display"
                    style={{
                      fontSize: 'clamp(80px,22vw,130px)',
                      background: 'linear-gradient(135deg, #FFFFFF, #FADADD)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 30px rgba(242,167,187,0.8))',
                      lineHeight: 1,
                    }}>
                    {countdown}
                  </div>
                </div>
              )}

              {/* Elegant corner marks */}
              {[
                { top: 12, left: 12,  borderTop: '1.5px solid rgba(255,255,255,0.4)', borderLeft: '1.5px solid rgba(255,255,255,0.4)' },
                { top: 12, right: 12, borderTop: '1.5px solid rgba(255,255,255,0.4)', borderRight: '1.5px solid rgba(255,255,255,0.4)' },
                { bottom: 12, left: 12,  borderBottom: '1.5px solid rgba(255,255,255,0.4)', borderLeft: '1.5px solid rgba(255,255,255,0.4)' },
                { bottom: 12, right: 12, borderBottom: '1.5px solid rgba(255,255,255,0.4)', borderRight: '1.5px solid rgba(255,255,255,0.4)' },
              ].map((s, i) => (
                <div key={i} className="absolute pointer-events-none" style={{ ...s, width: 20, height: 20 }} />
              ))}
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-5">
              {appState === 'review' ? (
                <div className="flex gap-3">
                  <button className="btn btn-ghost flex-1 py-3.5 text-sm" onClick={retake}>
                    🔄 <span>Retake</span>
                  </button>
                  <button className="btn btn-secondary flex-1 py-3.5 text-sm" onClick={downloadStrip}>
                    💾 <span>Save</span>
                  </button>
                </div>
              ) : (
                <button
                  className={`btn btn-primary w-full py-4 text-base ${appState === 'idle' && streaming ? 'pulse-btn' : ''}`}
                  onClick={startSession}
                  disabled={!streaming || appState !== 'idle'}>
                  {appState === 'idle'      && <><span style={{ fontSize: 18 }}>📸</span> Let's Go</>}
                  {appState === 'countdown' && <><span className="spin-anim inline-block" style={{ fontSize: 16 }}>✨</span> Get ready…</>}
                  {appState === 'shooting'  && 'Click!'}
                </button>
              )}
            </div>
          </div>

          {/* Filter selector */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: 14 }}>🎨</span>
              <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--navy)' }}>FILTER</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <button key={f.id}
                  className={`filter-chip ${filter === f.id ? 'active' : ''}`}
                  style={filter === f.id ? { background: `linear-gradient(135deg, ${f.accent}, ${f.accent}cc)` } : {}}
                  onClick={() => setFilter(f.id)}>
                  {f.label}
                  
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: strip + stickers */}
        <div className="lg:w-[300px] flex flex-col gap-4">

          {/* Strip card */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14 }}>🎞️</span>
                <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--navy)' }}>STRIP</p>
              </div>
              {photos.length > 0 && (
                <div className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg, var(--rose), var(--blush))', color: 'white' }}>
                  {photos.length} / 4
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {[0,1,2,3].map(i => (
                <div key={i}
                  className="relative overflow-hidden transition-all duration-300"
                  style={{
                    aspectRatio: '4/3',
                    borderRadius: 12,
                    background: photos[i] ? 'transparent' : 'linear-gradient(135deg, #FADADD22, #C8B4E318)',
                    border: selectedPhoto === i && appState === 'review'
                      ? `2px solid var(--rose)` : '1.5px dashed rgba(242,167,187,0.35)',
                    boxShadow: selectedPhoto === i && appState === 'review'
                      ? '0 0 0 3px rgba(232,115,138,0.2)' : 'none',
                    cursor: appState === 'review' ? 'pointer' : 'default',
                  }}
                  onClick={() => appState === 'review' && setSelectedPhoto(i)}>

                  {photos[i] ? (
                    <>
                      <img src={photos[i].dataUrl} alt={`Shot ${i + 1}`}
                        className="w-full h-full object-cover pop-in"
                        style={{ animationDelay: `${i * 0.07}s`, opacity: 0, animationFillMode: 'forwards', borderRadius: 10 }} />
                      {appState === 'review' && selectedPhoto === i && (
                        <StickerOverlay
                          stickers={photos[i].stickers}
                          onMove={(id, x, y) => moveSticker(i, id, x, y)}
                          onRemove={(id) => removeSticker(i, id)}
                        />
                      )}
                      {(appState !== 'review' || selectedPhoto !== i) && photos[i].stickers.map(s => (
                        <div key={s.id} style={{
                          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
                          fontSize: s.size * 0.4,
                          transform: `translate(-50%,-50%) rotate(${s.rotation}deg)`,
                          pointerEvents: 'none',
                        }}>{s.emoji}</div>
                      ))}
                      {/* Selected highlight overlay */}
                      {appState === 'review' && selectedPhoto === i && (
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: 'linear-gradient(135deg, rgba(242,167,187,0.08), rgba(200,180,227,0.08))',
                          borderRadius: 10,
                        }} />
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span style={{ fontSize: 22, opacity: 0.2 }}>🌸</span>
                    </div>
                  )}

                  {/* Frame number */}
                  <div className="absolute bottom-1.5 right-2 text-[10px] font-semibold"
                    style={{
                      color: photos[i] ? 'rgba(255,255,255,0.7)' : 'rgba(200,180,210,0.5)',
                      textShadow: photos[i] ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                      fontFamily: 'DM Serif Display, serif',
                    }}>
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            {appState === 'review' && (
              <p className="text-center text-[10px] font-medium mt-3" style={{ color: 'rgba(28,35,64,0.4)' }}>
                Tap a photo to decorate
              </p>
            )}
          </div>

          {/* Sticker panel */}
          {appState === 'review' && selectedPhoto !== null && (
            <div className="card p-4 fade-up">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 14 }}>🌸</span>
                <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--navy)' }}>STICKERS</p>
              </div>
              <p className="text-[10px] mb-3" style={{ color: 'rgba(28,35,64,0.4)' }}>Double-tap a sticker to remove it</p>
              <div className="grid grid-cols-7 gap-1">
                {STICKER_EMOJIS.map(emoji => (
                  <button key={emoji}
                    className="flex items-center justify-center rounded-xl transition-all hover:scale-125 active:scale-95"
                    style={{ width: 36, height: 36, fontSize: 18, background: 'rgba(242,167,187,0.1)' }}
                    onClick={() => addSticker(emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Download button */}
          {photos.length === 4 && (
            <button className="btn btn-primary w-full py-4 text-sm fade-up" onClick={downloadStrip}>
              <span style={{ fontSize: 16 }}>💾</span>
              <span>Save Strip</span>
            </button>
          )}

          {/* Decorative tagline */}
          <div className="text-center py-2">
            <p className="text-[10px] tracking-[0.25em] font-medium" style={{ color: 'rgba(28,35,64,0.3)' }}>
              Capture Your Glowing Moments
            </p>
            <p className="text-[9px] tracking-wider mt-0.5" style={{ color: 'rgba(28,35,64,0.2)' }}>
              
            </p>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src
  })
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function roundRectClip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  roundRectPath(ctx, x, y, w, h, r); ctx.clip()
}

function roundRectStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  roundRectPath(ctx, x, y, w, h, r); ctx.stroke()
}
