import { StripType } from './Commons'
import './Components.css'

function Slot({ w, h, r = 6 }: { w: number; h: number; r?: number }) {
    return (
        <div
            className="strip-slot"
            style={{ width: w, height: h, borderRadius: r, }}
        />
    )
}

export default function StripPreview({ type }: { type: StripType }) {
    if (type === 'single') return (
        <div className="strip-preview-wrapper">
            <Slot w={100} h={120} />
        </div>
    )

    if (type === 'strip3') return (
        <div className="strip-preview-wrapper">
            <div
                className="strip-inner strip-inner-col"
                style={{ '--gap': '5px' } as React.CSSProperties}
            >
                <Slot w={37} h={33} />
                <Slot w={37} h={33} />
                <Slot w={37} h={33} />
            </div>
        </div>
    )

    if (type === 'strip4') return (
        <div className="strip-preview-wrapper">
            <div
                className="strip-inner strip-inner-col"
                style={{ '--gap': '4px' } as React.CSSProperties}
            >
                <Slot w={29} h={24} />
                <Slot w={29} h={24} />
                <Slot w={29} h={24} />
                <Slot w={29} h={24} />
            </div>
        </div>
    )

    // grid 2x2
    return (
        <div className="strip-preview-wrapper">
            <div className="strip-inner strip-inner-grid">
                <Slot w={54} h={46} />
                <Slot w={54} h={46} />
                <Slot w={54} h={46} />
                <Slot w={54} h={46} />
            </div>
        </div>
    )
}