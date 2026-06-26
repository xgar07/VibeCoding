import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

/**
 * Shows a toast-style banner when a new service worker is waiting to take over.
 * User clicks "Perbarui" to reload with the new version.
 */
const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      className="fixed bottom-24 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-slide-up"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(99,102,241,0.2)',
      }}
    >
      {/* Accent bar */}
      <div className="h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }} />

      <div className="flex items-start gap-3 p-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.12)' }}>
          <RefreshCw size={16} className="text-indigo-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Pembaruan tersedia!
          </p>
          <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--text-muted)' }}>
            Finote versi terbaru siap digunakan.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setNeedRefresh(false)}
              className="btn-secondary text-xs py-1.5 flex-1"
            >
              Nanti
            </button>
            <button
              onClick={() => updateServiceWorker(true)}
              className="btn-primary text-xs py-1.5 flex-1 gap-1.5"
            >
              <RefreshCw size={11} /> Perbarui
            </button>
          </div>
        </div>

        <button
          onClick={() => setNeedRefresh(false)}
          className="p-1 -mt-0.5 flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export default PWAUpdatePrompt
