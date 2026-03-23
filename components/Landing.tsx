'use client'

import { useState } from 'react'

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

function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(30,34,53,0.55)', backdropFilter: 'blur(8px)' }}>
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden anim-scale"
        style={{ background: 'white', boxShadow: '0 24px 64px rgba(30,34,53,0.22)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(212,104,122,0.12)' }}>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif font-bold" style={{ fontSize: 18, color: 'var(--navy)' }}>
              Data Privacy Policy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ width: 30, height: 30, background: 'rgba(212,104,122,0.1)', color: 'var(--rose)', fontSize: 14, fontWeight: 700 }}>
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto px-6 py-5 text-sm leading-relaxed" style={{ color: 'var(--ink)', scrollbarWidth: 'none' }}>

          <p className="mb-4" style={{ color: 'var(--muted)', fontSize: 12 }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <p className="mb-5">
            LumiBooth is a browser-based photo strip application. We are committed to protecting your privacy. This policy explains how your data is handled when you use LumiBooth.
          </p>

          <Section emoji="📸" title="Camera Access">
            LumiBooth requests access to your device camera solely to capture photos for your strip. Camera access is used only while you are actively on the camera screen. We do not record, store, or transmit your camera feed to any server.
          </Section>

          <Section emoji="🖼️" title="Photo Data">
            All photos you take are processed entirely within your browser. Your photos are never uploaded to any server, cloud storage, or third-party service. Once you close or refresh the page, all photo data is permanently gone.
          </Section>

          <Section emoji="💾" title="Downloads">
            When you download your finished strip, the image is generated locally in your browser and saved directly to your device. LumiBooth does not retain a copy of your downloaded images.
          </Section>

          <Section emoji="🍪" title="Cookies & Tracking">
            LumiBooth does not use cookies, analytics trackers, or any form of user tracking. We do not collect browsing behavior, usage statistics, or any personally identifiable information.
          </Section>

          <Section emoji="🔗" title="Third-Party Services">
            LumiBooth does not share any data with third parties. There are no advertisements, affiliate links, or external data processors involved in the operation of this app.
          </Section>

          <Section emoji="🧒" title="Children's Privacy">
            LumiBooth is safe for use by all ages. Because we collect no personal data, there is no risk of children's information being stored or misused.
          </Section>

          {/* <Section emoji="📬" title="Contact">
            If you have any questions about this privacy policy, please reach out to the developer at <span style={{ color: 'var(--rose)' }}>lumibooth@support.dev</span>.
          </Section> */}

          <p className="mt-5 text-xs" style={{ color: 'var(--muted)' }}>
            By using LumiBooth, you acknowledge that all data remains on your device and is never transmitted externally.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(212,104,122,0.12)' }}>
          <button
            onClick={onClose}
            className="btn btn-primary w-full py-3 text-sm">
            I understand
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ fontSize: 15 }}>{emoji}</span>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{title}</h3>
      </div>
      <p style={{ color: 'var(--ink)', fontSize: 13, lineHeight: 1.65 }}>{children}</p>
    </div>
  )
}

export default function Landing({ onStart }: Props) {
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <div className="bg-lumi min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

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

        {/* Footer row: credit + privacy link */}
        <div className="anim-fade flex items-center justify-center gap-3 mt-8" style={{ animationDelay: '0.75s' }}>
          <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: 'rgb(139, 135, 153)' }}>
            Photo Strip Booth Web App — Developed by J9
          </p>
        </div>
        <div className="anim-fade flex items-center justify-center gap-3 mt-8" style={{ animationDelay: '0.75s' }}>
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-[10px] tracking-[0.12em] uppercase transition-all hover:opacity-80"
            style={{ color: 'var(--rose)', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
            Data Privacy Policy
          </button>
        </div>
      </div>
    </div>
  )
}