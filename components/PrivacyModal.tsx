'use client'

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

interface Props {
    onClose: () => void
}

export default function PrivacyModal({ onClose }: Props) {
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
                    <h2 className="font-serif font-bold" style={{ fontSize: 18, color: 'var(--navy)' }}>
                        Data Privacy Policy
                    </h2>
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

                    <p className="mt-5 text-xs" style={{ color: 'var(--muted)' }}>
                        By using LumiBooth, you acknowledge that all data remains on your device and is never transmitted externally.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(212,104,122,0.12)' }}>
                    <button onClick={onClose} className="btn btn-primary w-full py-3 text-sm">
                        I understand
                    </button>
                </div>
            </div>
        </div>
    )
}