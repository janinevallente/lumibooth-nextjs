'use client'

import { useState } from 'react'
import Landing from '@/components/Landing'
import StripSelector, { StripType } from '@/components/StripSelector'
import CameraScreen, { PhotoEntry } from '@/components/CameraScreen'
import ReviewScreen from '@/components/ReviewScreen'

type Step = 'landing' | 'strip-select' | 'camera' | 'review'

export default function Home() {
  const [step, setStep] = useState<Step>('landing')
  const [stripType, setStripType] = useState<StripType | null>('strip4')
  const [photos, setPhotos] = useState<PhotoEntry[]>([])

  const handlePhotosComplete = (captured: PhotoEntry[]) => {
    setPhotos(captured)
    setStep('review')
  }

  const handleRetake = () => {
    setPhotos([])
    setStep('camera')
  }

  const handleBackToStrip = () => {
    setPhotos([])
    setStep('strip-select')
  }

  return (
    <>
      {step === 'landing' && (
        <Landing onStart={() => setStep('strip-select')} />
      )}
      {step === 'strip-select' && (
        <StripSelector
          selected={stripType}
          onSelect={setStripType}
          onNext={() => setStep('camera')}
          onBack={() => setStep('landing')}
        />
      )}
      {step === 'camera' && stripType && (
        <CameraScreen
          stripType={stripType}
          onComplete={handlePhotosComplete}
          onBack={handleBackToStrip}
        />
      )}
      {step === 'review' && stripType && photos.length > 0 && (
        <ReviewScreen
          photos={photos}
          stripType={stripType}
          onRetake={handleRetake}
        />
      )}
    </>
  )
}
