'use client'

import { StripType, STRIP_OPTIONS } from '../../components/Commons'
import StripPreview from '../../components/StripPreview'
import './StripSelector.css'
export type { StripType }

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
      <div className="text-center mb-10 anim-fade ss-title-section">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2 ss-step-label">
          Step 1 of 3
        </p>
        <h2 className="font-serif ss-headline">
          Choose your<br /><em>strip format</em>
        </h2>
        <p className="mt-3 text-sm ss-subtitle">Pick the layout that feels right for this moment.</p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto w-full anim-scale ss-grid">
        {STRIP_OPTIONS.map(opt => (
          <button
            key={opt.id}
            className={`strip-card relative ${selected === opt.id ? 'selected' : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            {opt.tag && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-semibold text-white ss-tag">
                {opt.tag}
              </div>
            )}

            <StripPreview type={opt.id} />

            <div className="mt-3">
              <div className="font-semibold text-sm ss-option-label">{opt.label}</div>
              <div className="text-[11px] mt-0.5 ss-option-desc">{opt.desc}</div>
            </div>

            {/* Check mark */}
            {selected === opt.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center anim-pop ss-checkmark">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Next button */}
      <div className="flex justify-center mt-10 anim-fade ss-next-row">
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