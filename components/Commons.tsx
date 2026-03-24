//Shared constants & types for LumiBooth

export const PETALS = [
    { top: '7%', left: '5%', size: 52, delay: '0s', dur: '4s', emoji: '🌸' },
    { top: '12%', right: '7%', size: 38, delay: '0.8s', dur: '5s', emoji: '✨' },
    { top: '68%', left: '3%', size: 30, delay: '1.2s', dur: '3.5s', emoji: '🌷' },
    { top: '78%', right: '5%', size: 44, delay: '0.4s', dur: '4.5s', emoji: '🌺' },
    { top: '42%', left: '1.5%', size: 24, delay: '1.8s', dur: '3s', emoji: '🌼' },
    { top: '32%', right: '2%', size: 34, delay: '0.6s', dur: '5.5s', emoji: '💮' },
    { top: '55%', right: '12%', size: 20, delay: '2.2s', dur: '4.2s', emoji: '🌸' },
    { top: '25%', left: '12%', size: 18, delay: '1.5s', dur: '3.8s', emoji: '✨' },
]

export type StripType = 'single' | 'strip3' | 'strip4' | 'grid2x2'

export const STRIP_OPTIONS: {
    id: StripType
    label: string
    desc: string
    shots: number
    tag?: string
}[] = [
        { id: 'single', label: 'Single', desc: '1 perfect shot', shots: 1 },
        { id: 'strip3', label: '3 Strip', desc: '3 photos, tall strip', shots: 3 },
        { id: 'strip4', label: '4 Strip', desc: '4 photos, classic booth', shots: 4, tag: 'Popular' },
        { id: 'grid2x2', label: '2 × 2', desc: '4 photos in a square grid', shots: 4 },
    ]