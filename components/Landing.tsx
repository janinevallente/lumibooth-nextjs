'use client'

interface Props {
  onStart: () => void
}

const PETALS = [
  { top: '7%', left: '5%', size: 52, delay: '0s', dur: '4s', emoji: '🌸' },
  { top: '12%', right: '7%', size: 38, delay: '0.8s', dur: '5s', emoji: '✨' },
  { top: '68%', left: '3%', size: 30, delay: '1.2s', dur: '3.5s', emoji: '🌷' },
  { top: '78%', right: '5%', size: 44, delay: '0.4s', dur: '4.5s', emoji: '🌺' },
  { top: '42%', left: '1.5%', size: 24, delay: '1.8s', dur: '3s', emoji: '🌼' },
  { top: '32%', right: '2%', size: 34, delay: '0.6s', dur: '5.5s', emoji: '💮' },
  { top: '55%', right: '12%', size: 20, delay: '2.2s', dur: '4.2s', emoji: '🌸' },
  { top: '25%', left: '12%', size: 18, delay: '1.5s', dur: '3.8s', emoji: '✨' },
]

export default function Landing({ onStart }: Props) {
  return (
    <div className="bg-lumi min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Floating petal decorations */}
      {PETALS.map((p, i) => (
        <div key={i} className="absolute pointer-events-none select-none"
          style={{
            top: p.top,
            left: (p as any).left,
            right: (p as any).right,
            fontSize: p.size,
            opacity: 0.35,
            animation: `float ${p.dur} ease-in-out ${p.delay} infinite`,
          }}>
          {p.emoji}
        </div>
      ))}

      {/* Soft glow orbs */}
      <div className="absolute pointer-events-none" style={{
        top: '-10%', left: '-5%', width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,104,122,0.12) 0%, transparent 70%)',
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: '-5%', right: '-5%', width: 360, height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,181,212,0.14) 0%, transparent 70%)',
      }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">

        {/* Headline */}
        <h1 className="font-serif anim-fade"
          style={{
            fontSize: 'clamp(58px, 11vw, 96px)',
            fontWeight: 300,
            lineHeight: 1.0,
            color: 'var(--navy)',
            animationDelay: '0.15s',
            letterSpacing: '-0.02em',
          }}>
          <em style={{ color: 'var(--rose)', fontStyle: 'italic' }}>Lumi</em>Booth
        </h1>

        {/* Ornamental divider */}
        <div className="anim-fade flex items-center gap-3 mt-5 mb-5" style={{ animationDelay: '0.25s' }}>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, transparent, rgba(212,104,122,0.35))' }} />
          <span style={{ fontSize: 16 }}>🌸</span>
          <div style={{ height: 1, width: 40, background: 'linear-gradient(to left, transparent, rgba(212,104,122,0.35))' }} />
        </div>

        {/* Subheadline */}
        <p className="anim-fade text-base leading-relaxed max-w-sm"
          style={{ color: 'var(--muted)', animationDelay: '0.3s', fontWeight: 400 }}>
          Strike a pose, pick your strip, add stickers —{' '}
          <em style={{ color: 'var(--rose)', fontStyle: 'italic', fontWeight: 400 }}>
            and walk away with a photo you'll actually keep.
          </em>
        </p>

        {/* Feature pills */}
        <div className="anim-fade flex flex-wrap items-center justify-center gap-2 mt-8"
          style={{ animationDelay: '0.65s' }}>
          {['4 Strip Formats', '8 Filters', 'Sticker Overlays', 'Instant Download'].map(f => (
            <span key={f} className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: 'rgba(212,104,122,0.08)', color: 'var(--rose)', border: '1px solid rgba(212,104,122,0.15)' }}>
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="anim-fade mt-10" style={{ animationDelay: '0.55s' }}>
          <button
            className="btn btn-primary pulse-anim"
            style={{ fontSize: 15, letterSpacing: '0.04em', padding: '16px 44px' }}
            onClick={onStart}>
            <span>Get Started</span>
            <span style={{ fontSize: 18 }}>→</span>
          </button>
        </div>

        {/* Credit */}
        <p className="anim-fade text-[10px] mt-8 tracking-[0.18em] uppercase"
          style={{ color: 'rgb(139, 135, 153)', animationDelay: '0.75s' }}>
          Photo Strip Booth Web App — Developed by J9
        </p>
      </div>
    </div>
  )
}
