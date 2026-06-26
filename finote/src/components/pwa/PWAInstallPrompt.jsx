import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'

/**
 * PWA Install Prompt — shows a dismissible banner when the browser fires
 * the `beforeinstallprompt` event (Chrome/Edge on Android & desktop).
 * Also shows an iOS manual instruction sheet.
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true

  useEffect(() => {
    // Already installed — don't show
    if (isInStandaloneMode) { setIsInstalled(true); return }

    // Check if user dismissed before
    const dismissed = sessionStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    // Android / Desktop: listen for native prompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS: show manual guide after 3 seconds on first visit
    if (isIOS && !dismissed) {
      const t = setTimeout(() => setShowBanner(true), 3000)
      return () => { clearTimeout(t); window.removeEventListener('beforeinstallprompt', handler) }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setIsInstalled(true)
      setDeferredPrompt(null)
      setShowBanner(false)
    } else if (isIOS) {
      setShowIOSGuide(true)
      setShowBanner(false)
    }
  }

  const dismiss = () => {
    setShowBanner(false)
    setShowIOSGuide(false)
    sessionStorage.setItem('pwa-install-dismissed', '1')
  }

  if (isInstalled || (!showBanner && !showIOSGuide)) return null

  // ── iOS manual guide ──────────────────────────────────────────────────────
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-sm rounded-2xl p-5 animate-slide-up"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl">
                💳
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Install Finote</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tambahkan ke Home Screen</p>
              </div>
            </div>
            <button onClick={dismiss} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 mb-5">
            {[
              { step: '1', icon: '⬆️', text: 'Tap tombol Share di Safari (kotak dengan panah atas)' },
              { step: '2', icon: '➕', text: 'Gulir ke bawah dan pilih "Add to Home Screen"' },
              { step: '3', icon: '✅', text: 'Tap "Add" — Finote akan muncul di Home Screen kamu!' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-surface)' }}>
                <span className="text-base flex-shrink-0">{s.icon}</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.text}</p>
              </div>
            ))}
          </div>

          <button onClick={dismiss} className="btn-secondary w-full">Mengerti</button>
        </div>
      </div>
    )
  }

  // ── Install banner (Android/Desktop) ─────────────────────────────────────
  return (
    <div
      className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-slide-up"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}
    >
      {/* Gradient top bar */}
      <div className="h-1 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }} />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              <div className="w-full h-full flex items-center justify-center text-xl">💳</div>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Install Finote</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {isIOS ? <><Smartphone size={10} className="inline mr-1" />Tambahkan ke Home Screen</> : <><Monitor size={10} className="inline mr-1" />Install sebagai aplikasi</>}
              </p>
            </div>
          </div>
          <button onClick={dismiss} className="p-1 rounded-lg flex-shrink-0 -mt-0.5" style={{ color: 'var(--text-muted)' }}>
            <X size={15} />
          </button>
        </div>

        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Pasang Finote di perangkatmu untuk akses lebih cepat, tampilan penuh layar, dan bisa digunakan saat offline.
        </p>

        <div className="flex gap-2">
          <button onClick={dismiss} className="btn-secondary flex-1 text-xs py-2">Nanti</button>
          <button onClick={handleInstall} className="btn-primary flex-1 text-xs py-2 gap-1.5">
            <Download size={13} /> Install
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
