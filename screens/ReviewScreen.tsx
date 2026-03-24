'use client'

import { useRef, useState, useCallback } from 'react'
import { PhotoEntry, Sticker, FILTERS, FilterId } from './CameraScreen'
import { StripType } from './StripSelector/StripSelector'

// ─── Strip design themes ──────────────────────────────────────────────────────

interface Theme {
  id: string
  label: string
  bg: string
  borderColor: string
  textColor: string
}

const THEMES: Theme[] = [
  { id: 'blossom', label: 'Blossom', bg: '#EBA8B4', borderColor: 'rgba(212,104,122,0.4)', textColor: '#D4687A' },
  { id: 'blush', label: 'Blush', bg: '#F2C4CE', borderColor: 'rgba(212,104,122,0.3)', textColor: '#B05070' },
  { id: 'cherry', label: 'Cherry', bg: '#9F1239', borderColor: 'rgba(159,18,57,0.35)', textColor: '#9F1239' },
  { id: 'lavender', label: 'Lavender', bg: '#C9B8E8', borderColor: 'rgba(150,120,210,0.4)', textColor: '#6B4FA0' },
  { id: 'midnight', label: 'Midnight', bg: '#2A3050', borderColor: 'rgba(100,90,140,0.4)', textColor: '#3B2A4A' },
  { id: 'dustyblue', label: 'Dusty Blue', bg: '#7BA7BC', borderColor: 'rgba(123,167,188,0.45)', textColor: '#3A6E87' },
  { id: 'ocean', label: 'Ocean', bg: '#0369A1', borderColor: 'rgba(3,105,161,0.35)', textColor: '#0369A1' },
  { id: 'seafoam', label: 'Seafoam', bg: '#7EC8C8', borderColor: 'rgba(126,200,200,0.45)', textColor: '#2E8B8B' },
  { id: 'mist', label: 'Mist', bg: '#B8CFCF', borderColor: 'rgba(90,150,150,0.4)', textColor: '#3A6B6B' },
  { id: 'moss', label: 'Moss', bg: '#8FA96B', borderColor: 'rgba(100,140,80,0.4)', textColor: '#4A6830' },
  { id: 'matcha', label: 'Matcha', bg: '#3D6B4F', borderColor: 'rgba(61,107,79,0.35)', textColor: '#3D6B4F' },
  { id: 'sand', label: 'Sand', bg: '#ecd29f', borderColor: 'rgba(180,150,90,0.35)', textColor: '#8B6914' },
  { id: 'white', label: 'White', bg: '#f5f2f2', borderColor: 'rgba(0,0,0,0.1)', textColor: '#374151' },
  { id: 'noir', label: 'Noir', bg: '#3F3F46', borderColor: 'rgba(24,24,27,0.4)', textColor: '#18181B' },
]

// ─── Sticker emojis ───────────────────────────────────────────────────────────

const STICKER_EMOJIS = [
  '🌸', '🌷', '🌺', '🌼', '💐', '🌹',
  '✨', '⭐', '💫', '🌟', '☁️', '🌙',
  '🎀', '💝', '💖', '💗', '❤️', '🦋',
  '🍒', '🍓', '🫧', '🎶', '📷', '👑',
  '💎', '🌈', '🧸', '🎁',
]

// ─── Sticker overlay ─────────────────────────────────────────────────────────

function StickerOverlay({ stickers, onMove, onRemove, onResize, onRotate }: {
  stickers: Sticker[]
  onMove: (id: string, x: number, y: number) => void
  onRemove: (id: string) => void
  onResize: (id: string, size: number) => void
  onRotate: (id: string, rotation: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleDragPointerDown = (e: React.PointerEvent, s: Sticker) => {
    const role = (e.target as HTMLElement).dataset.role
    if (role === 'resize-handle' || role === 'rotate-handle' || role === 'remove-btn') return
    e.preventDefault(); e.stopPropagation()
    setSelectedId(s.id)
      ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect(); if (!r) return
      onMove(s.id,
        Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100)),
        Math.max(0, Math.min(100, ((ev.clientY - r.top) / r.height) * 100)),
      )
    }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }

  const handleResizePointerDown = (e: React.PointerEvent, s: Sticker) => {
    e.preventDefault(); e.stopPropagation()
      ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const startX = e.clientX; const startSize = s.size as number
    const move = (ev: PointerEvent) => { onResize(s.id, Math.max(16, Math.min(80, startSize + (ev.clientX - startX) * 0.6))) }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }

  // ── Rotate handle (top-left) ──────────────────────────────────────────────
  // Computes angle from sticker center to pointer; delta from drag-start angle
  // is added to the sticker's rotation at drag start.
  const handleRotatePointerDown = (e: React.PointerEvent, s: Sticker) => {
    e.preventDefault(); e.stopPropagation()
      ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const r = ref.current?.getBoundingClientRect(); if (!r) return

    // Sticker center in viewport coords
    const cx = r.left + (s.x / 100) * r.width
    const cy = r.top + (s.y / 100) * r.height
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
    const startRotation = s.rotation
    const move = (ev: PointerEvent) => {
      onRotate(s.id, startRotation + (Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) - startAngle))
    }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }

  return (
    <div ref={ref} className="absolute inset-0"
      style={{ touchAction: selectedId !== null ? 'none' : 'auto' }}
      onClick={e => { if ((e.target as HTMLElement) === ref.current) setSelectedId(null) }}>
      {stickers.map(s => {
        const isSelected = selectedId === s.id
        return (
          <div key={s.id}
            onPointerDown={e => handleDragPointerDown(e, s)}
            onDoubleClick={() => { onRemove(s.id); setSelectedId(null) }}
            style={{
              position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
              transform: `translate(-50%,-50%) rotate(${s.rotation}deg)`,
              cursor: 'grab', userSelect: 'none',
              outline: isSelected ? '2px dashed rgba(212,104,122,0.8)' : 'none',
              outlineOffset: 6, borderRadius: 4, zIndex: isSelected ? 20 : 10,
            }}>
            <span style={{ fontSize: s.size, display: 'block', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))', transition: 'font-size 0.05s linear' }}>
              {s.emoji}
            </span>
            {isSelected && (<>
              <button data-role="remove-btn" onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onRemove(s.id); setSelectedId(null) }}
                style={{ position: 'absolute', top: -12, right: -12, width: 20, height: 20, borderRadius: '50%', background: '#E11D48', border: '1.5px solid white', color: 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, boxShadow: '0 1px 4px rgba(0,0,0,0.25)', padding: 0 }}>✕</button>
              <div data-role="rotate-handle" onPointerDown={e => handleRotatePointerDown(e, s)} title="Drag to rotate"
                style={{ position: 'absolute', top: -12, left: -12, width: 20, height: 20, borderRadius: '50%', background: 'white', border: '1.5px solid rgba(107,72,255,0.7)', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', fontSize: 12, color: 'rgba(107,72,255,0.9)', touchAction: 'none' }}>↺</div>
              <div data-role="resize-handle" onPointerDown={e => handleResizePointerDown(e, s)} title="Drag to resize"
                style={{ position: 'absolute', bottom: -12, right: -12, width: 20, height: 20, borderRadius: '50%', background: 'white', border: '1.5px solid rgba(212,104,122,0.8)', cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', fontSize: 10, color: 'rgba(212,104,122,0.9)', touchAction: 'none' }}>⤡</div>
            </>)}
          </div>
        )
      })}
    </div>
  )
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function rrPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
const rrClip = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { rrPath(ctx, x, y, w, h, r); ctx.clip() }
const rrStroke = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { rrPath(ctx, x, y, w, h, r); ctx.stroke() }

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
  const sa = img.naturalWidth / img.naturalHeight, da = dw / dh
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
  if (sa > da) { sw = img.naturalHeight * da; sx = (img.naturalWidth - sw) / 2 }
  else { sh = img.naturalWidth / da; sy = (img.naturalHeight - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

async function applyFilterToDataUrl(dataUrl: string, css: string): Promise<string> {
  if (css === 'none') return dataUrl
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d')!
      ctx.filter = css
      ctx.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/jpeg', 0.93))
    }
    img.src = dataUrl
  })
}

// ─── Petal burst ─────────────────────────────────────────────────────────────

function PetalBurst() {
  const petals = Array.from({ length: 30 }, (_, i) => ({
    id: i, left: 5 + Math.random() * 90, delay: Math.random() * 1, dur: 2.5 + Math.random() * 2,
    drift: (Math.random() - 0.5) * 160, size: 14 + Math.random() * 12,
    emoji: ['🌸', '🌷', '🌺', '✨', '🌼', '💮'][i % 6],
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: '-30px', fontSize: p.size,
          animationName: 'petalFall', animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`, animationTimingFunction: 'ease-in',
          animationFillMode: 'both', ['--drift' as string]: `${p.drift}px`,
        }}>{p.emoji}</div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  photos: PhotoEntry[]
  stripType: StripType
  onRetake: () => void
}

export default function ReviewScreen({ photos: initialPhotos, stripType, onRetake }: Props) {
  const [photos, setPhotos] = useState<PhotoEntry[]>(initialPhotos)
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0)
  const [selectedTheme, setSelectedTheme] = useState<string>('blossom')
  const [showPetals, setShowPetals] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState<FilterId>('none')

  const theme = THEMES.find(t => t.id === selectedTheme) ?? THEMES[0]
  const isWhite = theme.id === 'white'
  const stripLabelColor = isWhite ? '#1f2336' : 'white'
  const stripSubColor = isWhite ? 'rgba(31,35,54,0.55)' : 'rgba(255,255,255,0.55)'
  const roseAccent = '#D4687A'

  const getFilterCss = (f: FilterId) => FILTERS.find(x => x.id === f)?.css ?? 'none'
  const globalFilterCss = getFilterCss(globalFilter)

  // ── Sticker handlers ─────────────────────────────────────────────────────
  const addSticker = (emoji: string) => {
    const s: Sticker = {
      id: `${Date.now()}-${Math.random()}`, emoji,
      size: 30 + Math.floor(Math.random() * 16),
      x: 25 + Math.random() * 50, y: 20 + Math.random() * 60,
      rotation: (Math.random() - 0.5) * 24,
    }
    setPhotos(prev => prev.map((p, i) => i === selectedPhoto ? { ...p, stickers: [...p.stickers, s] } : p))
  }

  const moveSticker = (idx: number, id: string, x: number, y: number) =>
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, stickers: p.stickers.map(s => s.id === id ? { ...s, x, y } : s) } : p))

  const removeSticker = (idx: number, id: string) =>
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, stickers: p.stickers.filter(s => s.id !== id) } : p))

  const resizeSticker = (idx: number, id: string, size: number) =>
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, stickers: p.stickers.map(s => s.id === id ? { ...s, size } : s) } : p))

  const rotateSticker = (idx: number, id: string, rotation: number) =>
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, stickers: p.stickers.map(s => s.id === id ? { ...s, rotation } : s) } : p))

  // ── Footer draw ───────────────────────────────────────────────────────────
  const drawFooter = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = theme.bg; ctx.fillRect(x, y, w, h)
    const cx = x + w / 2
    const date = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }).replace(/\//g, '.')
    ctx.textBaseline = 'middle'
    const titleY = y + h * 0.28
    ctx.font = 'italic bold 34px serif'
    const lumiW = ctx.measureText('Lumi').width
    ctx.font = 'bold 34px serif'
    const boothW = ctx.measureText('Booth').width
    const startX = cx - (lumiW + boothW) / 2
    ctx.font = 'italic bold 34px serif'; ctx.fillStyle = roseAccent; ctx.textAlign = 'left'
    ctx.fillText('Lumi', startX, titleY)
    ctx.font = 'bold 34px serif'; ctx.fillStyle = stripLabelColor
    ctx.fillText('Booth', startX + lumiW, titleY)
    ctx.font = '500 18px sans-serif'; ctx.fillStyle = stripLabelColor
    ctx.globalAlpha = 0.9; ctx.textAlign = 'center'
    ctx.fillText('Capture your glowing moments 🌸', cx, y + h * 0.58)
    ctx.font = '13px sans-serif'; ctx.fillStyle = stripSubColor
    ctx.globalAlpha = 1; ctx.fillText(date, cx, y + h * 0.82)
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic'
  }

  // ── Build canvas ──────────────────────────────────────────────────────────
  const buildCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    const PW = 640, PH = 480, PAD = 24, GAP = 14, FOOTER_H = 110
    let c: HTMLCanvasElement, ctx: CanvasRenderingContext2D

    if (stripType === 'grid2x2') {
      const cols = 2
      const totalW = PW * cols + PAD * (cols + 1)
      const totalH = PAD + PH + GAP + PH + PAD + FOOTER_H
      c = document.createElement('canvas'); c.width = totalW; c.height = totalH
      ctx = c.getContext('2d')!
      ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, totalW, totalH)

      const positions = [[PAD, PAD], [PW + PAD * 2, PAD], [PAD, PAD + PH + GAP], [PW + PAD * 2, PAD + PH + GAP]]
      for (let i = 0; i < Math.min(photos.length, 4); i++) {
        const [px, py] = positions[i]
        const filteredUrl = await applyFilterToDataUrl(photos[i].dataUrl, globalFilterCss)
        const img = await loadImg(filteredUrl)
        ctx.save(); ctx.shadowColor = 'rgba(30,34,53,0.15)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4
        rrClip(ctx, px, py, PW, PH, 12); drawImageCover(ctx, img, px, py, PW, PH); ctx.restore()
        ctx.strokeStyle = theme.borderColor; ctx.lineWidth = 2; rrStroke(ctx, px, py, PW, PH, 12)
        for (const s of photos[i].stickers) {
          const sx = px + (s.x / 100) * PW, sy = py + (s.y / 100) * PH
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(s.rotation * Math.PI / 180)
          ctx.font = `${s.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(s.emoji, 0, 0); ctx.restore()
        }
      }
      drawFooter(ctx, 0, totalH - FOOTER_H, totalW, FOOTER_H)
    } else {
      const aspectMap: Record<string, number> = { single: 5 / 4, strip3: 1, strip4: 1 }
      const photoH = Math.round(PW * (aspectMap[stripType] ?? 1))
      const stripW = PW + PAD * 2
      const n = photos.length
      const stripH = PAD + (photoH + GAP) * n - GAP + PAD + FOOTER_H
      c = document.createElement('canvas'); c.width = stripW; c.height = stripH
      ctx = c.getContext('2d')!
      ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, stripW, stripH)

      for (let i = 0; i < photos.length; i++) {
        const py = PAD + i * (photoH + GAP), px = PAD
        const filteredUrl = await applyFilterToDataUrl(photos[i].dataUrl, globalFilterCss)
        const img = await loadImg(filteredUrl)
        ctx.save(); ctx.shadowColor = 'rgba(30,34,53,0.14)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4
        rrClip(ctx, px, py, PW, photoH, 12); drawImageCover(ctx, img, px, py, PW, photoH); ctx.restore()
        ctx.strokeStyle = theme.borderColor; ctx.lineWidth = 2; rrStroke(ctx, px, py, PW, photoH, 12)
        for (const s of photos[i].stickers) {
          const sx = px + (s.x / 100) * PW, sy = py + (s.y / 100) * photoH
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(s.rotation * Math.PI / 180)
          ctx.font = `${s.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(s.emoji, 0, 0); ctx.restore()
        }
      }
      drawFooter(ctx, 0, stripH - FOOTER_H, stripW, FOOTER_H)
    }
    return c
  }, [photos, stripType, theme, stripLabelColor, stripSubColor, roseAccent, globalFilterCss])

  const downloadStrip = useCallback(async () => {
    setDownloading(true)
    try {
      const c = await buildCanvas()
      const a = document.createElement('a')
      a.href = c.toDataURL('image/jpeg', 0.95)
      a.download = `lumibooth-${Date.now()}.jpg`
      a.click()
    } finally { setDownloading(false) }
  }, [buildCanvas])

  const isGrid = stripType === 'grid2x2'
  const photoAspect: Record<string, string> = { single: '4/5', strip3: '2/2', strip4: '2/2', grid2x2: '4/3' }
  const slotAspect = photoAspect[stripType] ?? '4/3'

  return (
    <div className="bg-lumi min-h-screen flex flex-col">
      {showPetals && <PetalBurst />}

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-5 anim-fade">
        <button className="btn btn-ghost px-4 py-2 text-sm" onClick={onRetake}>← Retake</button>
        <div className="step-bar">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`step-dot ${i === 3 ? 'active' : 'done'}`} />
          ))}
        </div>
        <div className="w-20" />
      </div>

      {/* Heading */}
      <div className="flex flex-col lg:flex-row gap-5 px-4 sm:px-6 pb-3 max-w-[1200px] mx-auto w-full">
        <div className="anim-fade" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--rose)' }}>Step 3 of 3</p>
          <h2 className="font-serif" style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 300, color: 'var(--navy)', lineHeight: 1.1 }}>
            Design your <em style={{ color: 'var(--rose)' }}>strip</em>
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Pick a theme, add filters & stickers, then save.</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-5 px-4 sm:px-6 pb-10 max-w-[1200px] mx-auto w-full">

        {/* Left: strip preview */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="card p-4 anim-scale" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Your Strip</p>
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Tap a photo to add stickers</p>
            </div>

            {isGrid ? (
              <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(212,104,122,0.15)', background: theme.bg }}>
                <div className="grid grid-cols-2 gap-2 p-3">
                  {photos.map((p, i) => (
                    <div key={i} onClick={() => setSelectedPhoto(i)}
                      className="relative overflow-hidden rounded-xl cursor-pointer transition-all"
                      style={{
                        aspectRatio: slotAspect,
                        border: selectedPhoto === i ? `2px solid var(--rose)` : '2px solid transparent',
                        boxShadow: selectedPhoto === i ? '0 0 0 3px rgba(212,104,122,0.2)' : '0 2px 8px rgba(30,34,53,0.1)',
                      }}>
                      <img src={p.dataUrl} className="w-full h-full object-cover" alt=""
                        style={{ filter: globalFilterCss }} />
                      <StickerOverlay stickers={p.stickers}
                        onMove={(id, x, y) => moveSticker(i, id, x, y)}
                        onRemove={id => removeSticker(i, id)}
                        onResize={(id, size) => resizeSticker(i, id, size)}
                        onRotate={(id, r) => rotateSticker(i, id, r)} />
                      {selectedPhoto === i && (
                        <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--rose)' }}>
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center justify-center py-2 gap-0.5" style={{ background: theme.bg }}>
                  <span className="text-[23px] font-serif font-bold tracking-wide">
                    <em style={{ color: roseAccent, fontStyle: 'italic' }}>Lumi</em>
                    <span style={{ color: stripLabelColor }}>Booth</span>
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: stripLabelColor, opacity: 0.9 }}>Capture your glowing moments 🌸</span>
                  <span className="text-[9px]" style={{ color: stripLabelColor, opacity: 0.55 }}>
                    {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }).replace(/\//g, '.')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="overflow-hidden rounded-2xl mx-auto"
                  style={{
                    border: '1px solid rgba(212,104,122,0.15)', background: theme.bg,
                    width: '100%', maxWidth: stripType === 'single' ? 420 : 320,
                  }}>
                  <div className="flex flex-col gap-2 p-3">
                    {photos.map((p, i) => (
                      <div key={i} onClick={() => setSelectedPhoto(i)}
                        className="relative overflow-hidden rounded-xl cursor-pointer transition-all"
                        style={{
                          aspectRatio: slotAspect,
                          ...(stripType === 'single' ? { minHeight: 200 } : {}),
                          width: '100%',
                          border: selectedPhoto === i ? `2px solid var(--rose)` : '2px solid transparent',
                          boxShadow: selectedPhoto === i ? '0 0 0 3px rgba(212,104,122,0.2)' : '0 2px 8px rgba(30,34,53,0.1)',
                        }}>
                        <img src={p.dataUrl} className="w-full h-full object-cover" alt=""
                          style={{ filter: globalFilterCss }} />
                        <StickerOverlay stickers={p.stickers}
                          onMove={(id, x, y) => moveSticker(i, id, x, y)}
                          onRemove={id => removeSticker(i, id)}
                          onResize={(id, size) => resizeSticker(i, id, size)}
                          onRotate={(id, r) => rotateSticker(i, id, r)} />
                        {selectedPhoto === i && (
                          <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--rose)' }}>
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1.5 font-serif text-[10px]"
                          style={{ color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                          {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center justify-center mb-2 gap-0.5" style={{ background: theme.bg }}>
                    <span className="text-[20px] font-serif font-bold tracking-wide">
                      <em style={{ color: roseAccent, fontStyle: 'italic' }}>Lumi</em>
                      <span style={{ color: stripLabelColor }}>Booth</span>
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: stripLabelColor, opacity: 0.9 }}>Capture your glowing moments 🌸</span>
                    <span className="text-[8px]" style={{ color: stripLabelColor, opacity: 0.55 }}>
                      {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }).replace(/\//g, '.')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: filter + stickers + theme + actions */}
        <div className="lg:w-72 flex flex-col gap-4">

          {/* ── Filter section ── */}
          <div className="card p-4 anim-fade" style={{ animationDelay: '0.18s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Filter</p>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Applies to all photos</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setGlobalFilter(f.id)}
                  style={{
                    fontSize: 10, padding: '3px 9px', borderRadius: 20, fontWeight: 600,
                    background: globalFilter === f.id ? f.accent : 'rgba(212,104,122,0.07)',
                    color: globalFilter === f.id ? 'white' : 'var(--muted)',
                    border: globalFilter === f.id ? `1px solid ${f.accent}` : '1px solid rgba(212,104,122,0.15)',
                    transition: 'all 0.15s',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sticker panel ── */}
          <div className="card p-4 anim-fade" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Stickers</p>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Adding to photo {selectedPhoto + 1}</span>
            </div>
            <p className="text-[10px] mb-3" style={{ color: 'var(--muted)' }}>
              Tap to select · Drag to move · ↺ rotate · ⤡ resize · ✕ remove
            </p>
            <div className="grid grid-cols-7 gap-1">
              {STICKER_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => addSticker(emoji)}
                  className="flex items-center justify-center rounded-xl transition-all hover:scale-125 active:scale-90"
                  style={{ width: 36, height: 36, fontSize: 18, background: 'rgba(212,104,122,0.06)' }}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* ── Theme picker ── */}
          <div className="card p-4 anim-fade" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Strip Theme</p>
              <span className="text-[10px] font-medium" style={{ color: 'var(--rose)' }}>
                {THEMES.findIndex(t => t.id === selectedTheme) + 1} / {THEMES.length}
              </span>
            </div>
            <div className="relative">
              <button className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full w-6 h-5 flex items-center justify-center text-xs font-bold z-10 rounded-full"
                style={{ background: 'white', border: '1px solid rgba(212,104,122,0.25)', boxShadow: '0 2px 6px rgba(30,34,53,0.1)', color: 'var(--rose)' }}
                onClick={() => { const el = document.getElementById('theme-carousel-v'); if (el) el.scrollBy({ top: -(el.scrollHeight / Math.ceil(THEMES.length / 3)), behavior: 'smooth' }) }}>︿</button>
              <div id="theme-carousel-v" className="overflow-y-auto"
                style={{ maxHeight: 160, scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}>
                {Array.from({ length: Math.ceil(THEMES.length / 3) }, (_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-3 gap-2 mb-2">
                    {THEMES.slice(rowIdx * 3, rowIdx * 3 + 3).map(t => (
                      <button key={t.id}
                        className={`theme-card p-0 overflow-hidden ${selectedTheme === t.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTheme(t.id)}>
                        <div style={{ height: 28, background: t.bg }} />
                        <p className="text-[9px] font-semibold text-center py-1 leading-none" style={{ color: 'var(--ink)' }}>{t.label}</p>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full w-6 h-5 flex items-center justify-center text-xs font-bold z-10 rounded-full"
                style={{ background: 'white', border: '1px solid rgba(212,104,122,0.25)', boxShadow: '0 2px 6px rgba(30,34,53,0.1)', color: 'var(--rose)' }}
                onClick={() => { const el = document.getElementById('theme-carousel-v'); if (el) el.scrollBy({ top: el.scrollHeight / Math.ceil(THEMES.length / 3), behavior: 'smooth' }) }}>﹀</button>
            </div>
            <p className="text-[10px] text-center mt-3 font-medium" style={{ color: 'var(--rose)' }}>
              {THEMES.find(t => t.id === selectedTheme)?.label}
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="card p-4 flex flex-row gap-3 anim-fade" style={{ animationDelay: '0.3s' }}>
            <button className="btn btn-outline flex-1 py-3.5 text-sm" onClick={onRetake}>🔄 Retake</button>
            <button className="btn btn-primary flex-1 py-3.5 text-sm" onClick={downloadStrip} disabled={downloading}>
              {downloading ? <><span className="spin-anim inline-block">✨</span> Saving…</> : <>💾 Download</>}
            </button>
          </div>

          <div className="px-2 anim-fade" style={{ animationDelay: '0.4s' }}>
            <p className="text-center text-[10px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              ✨ Filters, stickers and your chosen theme are<br />baked into the downloaded image.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}