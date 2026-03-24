// Shared constants & types for LumiBooth 

// Floating petals (Landing page)
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

// Strip types 
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

// Camera / filter types
export type FilterId = 'none' | 'soft' | 'bloom' | 'bw' | 'cool' | 'warm' | 'film' | 'vivid'

export interface PhotoEntry {
    dataUrl: string
    filter: FilterId
    stickers: Sticker[]
}

export interface Sticker {
    id: string
    emoji: string
    x: number
    y: number
    size: number
    rotation: number
}

export const FILTERS: { id: FilterId; label: string; css: string; accent: string }[] = [
    { id: 'none', label: 'Natural', css: 'none', accent: '#D4687A' },
    { id: 'soft', label: 'Soft', css: 'brightness(1.08) saturate(0.82) contrast(0.91)', accent: '#C4B5D4' },
    { id: 'bloom', label: 'Bloom', css: 'brightness(1.12) saturate(1.1) contrast(0.88) sepia(0.07)', accent: '#EBA8B4' },
    { id: 'bw', label: 'Mono', css: 'grayscale(100%) contrast(1.12)', accent: '#666' },
    { id: 'cool', label: 'Azure', css: 'hue-rotate(18deg) saturate(1.18) brightness(1.04)', accent: '#7EC8E3' },
    { id: 'warm', label: 'Honey', css: 'sepia(20%) saturate(1.32) brightness(1.06)', accent: '#C9A96E' },
    { id: 'film', label: 'Film', css: 'sepia(28%) contrast(1.18) brightness(0.95) saturate(0.88)', accent: '#9BB5A0' },
    { id: 'vivid', label: 'Vivid', css: 'saturate(1.65) contrast(1.08)', accent: '#EBA8B4' },
]

export const SHOTS_NEEDED: Record<StripType, number> = {
    single: 1, strip3: 3, strip4: 4, grid2x2: 4,
}