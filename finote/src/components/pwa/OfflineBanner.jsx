import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

/**
 * Shows a top banner when the device goes offline.
 * Briefly shows "Kembali online" when connectivity is restored, then hides.
 */
const OfflineBanner = () => {
  const [online, setOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      setShowRestored(true)
      setTimeout(() => setShowRestored(false), 3000)
    }
    const goOffline = () => {
      setOnline(false)
      setShowRestored(false)
    }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online && !showRestored) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold transition-all duration-300 animate-fade-in"
      style={{
        background: online
          ? 'linear-gradient(90deg, #16A34A, #22C55E)'
          : 'linear-gradient(90deg, #7F1D1D, #DC2626)',
        color: '#fff',
        paddingTop: `calc(0.5rem + env(safe-area-inset-top, 0px))`,
      }}
    >
      {online ? (
        <><Wifi size={13} /> Kembali online!</>
      ) : (
        <><WifiOff size={13} /> Kamu sedang offline — data mungkin tidak terkini</>
      )}
    </div>
  )
}

export default OfflineBanner
