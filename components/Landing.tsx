'use client'

interface Props {
  onStart: () => void
}

export default function Landing({ onStart }: Props) {
  return (
    <div className="bg-lumi min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Floating petal decorations */}
      {[
        { top: '8%', left: '6%', size: 48, delay: '0s', dur: '4s' },
        { top: '15%', right: '8%', size: 36, delay: '0.8s', dur: '5s' },
        { top: '70%', left: '4%', size: 28, delay: '1.2s', dur: '3.5s' },
        { top: '80%', right: '6%', size: 42, delay: '0.4s', dur: '4.5s' },
        { top: '45%', left: '2%', size: 22, delay: '1.8s', dur: '3s' },
        { top: '35%', right: '3%', size: 32, delay: '0.6s', dur: '5.5s' },
      ].map((p, i) => (
        <div key={i} className="absolute pointer-events-none select-none opacity-40"
          style={{
            top: p.top, left: (p as any).left, right: (p as any).right,
            fontSize: p.size,
            animation: `float ${p.dur} ease-in-out ${p.delay} infinite`,
          }}>
          {['🌸', '🌷', '🌺', '✨', '🌼', '💮'][i]}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">

        {/* Logo badge */}
        {/* <div className="anim-fade mb-8" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass"
            style={{ border: '1px solid rgba(212,104,122,0.25)' }}>
            <span className="text-base">🌸</span>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--rose)' }}>
              LumiBooth
            </span>
          </div>
        </div> */}

        {/* Headline */}
        <h1 className="font-serif anim-fade"
          style={{
            fontSize: 'clamp(52px, 10vw, 88px)',
            fontWeight: 300,
            lineHeight: 1.05,
            color: 'var(--navy)',
            animationDelay: '0.2s',
            letterSpacing: '-0.01em',
          }}>
          <em style={{ color: 'var(--rose)', fontStyle: 'italic' }}>Lumi</em>Booth
        </h1>

        {/* Subheadline */}
        <p className="anim-fade mt-6 text-base leading-relaxed max-w-sm"
          style={{ color: 'var(--muted)', animationDelay: '0.35s', fontWeight: 400 }}>
          Strike a pose, pick your strip, add stickers — and walk away with a photo you'll actually keep.
        </p>

        {/* CTA */}
        <div className="anim-fade mt-10" style={{ animationDelay: '0.5s' }}>
          <button
            className="btn btn-primary pulse-anim text-base px-10 py-4"
            style={{ fontSize: 15, letterSpacing: '0.04em' }}
            onClick={onStart}>
            <span>Get Started</span>
            <span style={{ fontSize: 18 }}>→</span>
          </button>
        </div>

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

        {/* Sample strip preview */}
        <div className="anim-scale mt-12 flex gap-2 opacity-70" style={{ animationDelay: '0.75s' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{
                width: 52, height: 40,
                background: `linear-gradient(135deg, hsl(${340 + i * 15},60%,${82 - i * 4}%) 0%, hsl(${310 + i * 10},40%,88%) 100%)`,
                border: '1.5px solid rgba(255,255,255,0.8)',
                boxShadow: '0 2px 8px rgba(30,34,53,0.1)',
              }} />
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'var(--muted)', letterSpacing: '0.15em' }}>
          PHOTO STRIP BOOTH
        </p>
      </div>
    </div>
  )
}
