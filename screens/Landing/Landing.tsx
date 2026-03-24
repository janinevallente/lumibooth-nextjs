'use client'

import { useState } from 'react'
import { PETALS } from '../../components/Commons'
import PrivacyModal from '../../components/PrivacyModal'
import './Landing.css'

interface Props {
  onStart: () => void
}

export default function Landing({ onStart }: Props) {
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <div className="bg-lumi landing-root">

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      {/* Floating petal decorations */}
      {PETALS.map((p, i) => (
        <div key={i} className="landing-petal"
          style={{
            top: p.top,
            left: (p as any).left,
            right: (p as any).right,
            fontSize: p.size,
            animation: `float ${p.dur} ease-in-out ${p.delay} infinite`,
          }}>
          {p.emoji}
        </div>
      ))}

      {/* Soft glow orbs */}
      <div className="landing-orb-top" />
      <div className="landing-orb-bottom" />

      {/* Main content */}
      <div className="landing-content">

        {/* Headline */}
        <h1 className="font-serif anim-fade landing-headline">
          <em>Lumi</em>Booth
        </h1>

        {/* Ornamental divider */}
        <div className="anim-fade landing-divider">
          <div className="landing-divider-line-left" />
          <span className="landing-divider-emoji">🌸</span>
          <div className="landing-divider-line-right" />
        </div>

        {/* Subheadline */}
        <p className="anim-fade text-base leading-relaxed landing-sub">
          Strike a pose, pick your strip, add stickers —{' '}
          <em>and walk away with a photo you'll actually keep.</em>
        </p>

        {/* Feature pills */}
        <div className="anim-fade landing-pills">
          {['4 Strip Formats', '8 Filters', 'Sticker Overlays', 'Instant Download'].map(f => (
            <span key={f} className="landing-pill">{f}</span>
          ))}
        </div>

        {/* CTA */}
        <div className="anim-fade landing-cta">
          <button
            className="btn btn-primary pulse-anim landing-cta-btn"
            onClick={onStart}>
            <span>Get Started</span>
            <span style={{ fontSize: 18 }}>→</span>
          </button>
        </div>

        {/* Credit */}
        <div className="anim-fade landing-credit">
          <p>Photo Strip Booth Web App — Developed by J9</p>
        </div>

        {/* Privacy link */}
        <div className="anim-fade landing-privacy">
          <button
            onClick={() => setShowPrivacy(true)}
            className="landing-privacy-btn">
            Data Privacy Policy
          </button>
        </div>
      </div>
    </div>
  )
}