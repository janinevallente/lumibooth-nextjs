import { StripType } from './Commons'

function Slot({ w, h, r = 6 }: { w: number; h: number; r?: number }) {
    return (
        <div style={{
            width: w, height: h, borderRadius: r,
            background: 'linear-gradient(135deg, #F5D5DB 0%, #E8D5F0 100%)',
            border: '1.5px solid rgba(212,104,122,0.25)',
            flexShrink: 0,
        }} />
    )
}

export default function StripPreview({ type }: { type: StripType }) {
    if (type === 'single') return (
        <div className="flex items-center justify-center" style={{ height: 100 }}>
            <Slot w={90} h={68} />
        </div>
    )

    if (type === 'strip3') return (
        <div className="flex items-center justify-center" style={{ height: 100 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, border: '1px solid rgba(212,104,122,0.15)' }}>
                <Slot w={64} h={26} />
                <Slot w={64} h={26} />
                <Slot w={64} h={26} />
            </div>
        </div>
    )

    if (type === 'strip4') return (
        <div className="flex items-center justify-center" style={{ height: 100 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, border: '1px solid rgba(212,104,122,0.15)' }}>
                <Slot w={64} h={18} />
                <Slot w={64} h={18} />
                <Slot w={64} h={18} />
                <Slot w={64} h={18} />
            </div>
        </div>
    )

    // grid 2x2
    return (
        <div className="flex items-center justify-center" style={{ height: 100 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: '8px', background: 'rgba(255,255,255,0.6)', borderRadius: 10, border: '1px solid rgba(212,104,122,0.15)' }}>
                <Slot w={44} h={36} />
                <Slot w={44} h={36} />
                <Slot w={44} h={36} />
                <Slot w={44} h={36} />
            </div>
        </div>
    )
}