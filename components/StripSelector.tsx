'use client'

export type StripType = 'single' | 'strip3' | 'strip4' | 'grid2x2'

interface StripOption {
  id: StripType
  label: string
  desc: string
  count: number
  preview: React.ReactNode
}

function StripPreview({ type }: { type: StripType }) {
  const slot = (w: number, h: number, r = 6) => (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(135deg, #F5D5DB 0%, #E8D5F0 100%)',
      border: '1.5px solid rgba(212,104,122,0.25)',
      flexShrink: 0,
    }} />
  )

  if (type === 'single') return (
    <div className="flex items-center justify-center" style={{ height: 100 }}>
      {slot(90, 100)}
    </div>
  )

  if (type === 'strip3') return (
    <div className="flex items-center justify-center" style={{ height: 100 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, border: '1px solid rgba(212,104,122,0.15)' }}>
        {slot(64, 26)}
        {slot(64, 26)}
        {slot(64, 26)}
      </div>
    </div>
  )

  if (type === 'strip4') return (
    <div className="flex items-center justify-center" style={{ height: 100 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, border: '1px solid rgba(212,104,122,0.15)' }}>
        {slot(64, 18)}
        {slot(64, 18)}
        {slot(64, 18)}
        {slot(64, 18)}
      </div>
    </div>
  )

  // grid 2x2
  return (
    <div className="flex items-center justify-center" style={{ height: 100 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '8px', background: 'rgba(255,255,255,0.6)', borderRadius: 10, border: '1px solid rgba(212,104,122,0.15)' }}>
        {slot(44, 36)}
        {slot(44, 36)}
        {slot(44, 36)}
        {slot(44, 36)}
      </div>
    </div>
  )
}

const OPTIONS: { id: StripType; label: string; desc: string; shots: number; tag?: string }[] = [
  { id: 'single', label: 'Single', desc: '1 perfect shot', shots: 1 },
  { id: 'strip3', label: '3 Strip', desc: '3 photos, tall strip', shots: 3 },
  { id: 'strip4', label: '4 Strip', desc: '4 photos, classic booth', shots: 4, tag: 'Popular' },
  { id: 'grid2x2', label: '2 × 2', desc: '4 photos in a square grid', shots: 4 },
]

interface Props {
  selected: StripType | null
  onSelect: (t: StripType) => void
  onNext: () => void
  onBack: () => void
}

export default function StripSelector({ selected, onSelect, onNext, onBack }: Props) {
  return (
    <div className="bg-lumi min-h-screen flex flex-col px-5 sm:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 anim-fade">
        <button className="btn btn-ghost px-4 py-2 text-sm" onClick={onBack}>
          ← Back
        </button>
        <div className="step-bar">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`step-dot ${i === 1 ? 'active' : i < 1 ? 'done' : ''}`} />
          ))}
        </div>
        <div className="w-20" />
      </div>

      {/* Title */}
      <div className="text-center mb-10 anim-fade" style={{ animationDelay: '0.1s' }}>
        <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--rose)' }}>
          Step 1 of 3
        </p>
        <h2 className="font-serif" style={{ fontSize: 'clamp(32px,6vw,52px)', fontWeight: 300, color: 'var(--navy)', lineHeight: 1.1 }}>
          Choose your<br /><em style={{ color: 'var(--rose)' }}>strip format</em>
        </h2>
        <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>Pick the layout that feels right for this moment.</p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto w-full anim-scale" style={{ animationDelay: '0.2s' }}>
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            className={`strip-card relative ${selected === opt.id ? 'selected' : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            {opt.tag && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-semibold text-white"
                style={{ background: 'linear-gradient(90deg, var(--rose), var(--blush))', whiteSpace: 'nowrap' }}>
                {opt.tag}
              </div>
            )}

            <StripPreview type={opt.id} />

            <div className="mt-3">
              <div className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{opt.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{opt.desc}</div>
            </div>

            {/* Check mark */}
            {selected === opt.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center anim-pop"
                style={{ background: 'var(--rose)' }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Next button */}
      <div className="flex justify-center mt-10 anim-fade" style={{ animationDelay: '0.35s' }}>
        <button
          className="btn btn-primary px-10 py-4 text-sm"
          disabled={!selected}
          onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  )
}
