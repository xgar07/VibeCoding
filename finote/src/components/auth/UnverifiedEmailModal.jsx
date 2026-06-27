import { useState } from 'react'
import { Mail, X, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

/**
 * Modal shown when login fails due to unverified email.
 * Props:
 *   email {string}
 *   onClose {function}
 */
const UnverifiedEmailModal = ({ email, onClose }) => {
  const { resendVerification } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    if (!email) {
      toast.error('Masukkan email terlebih dahulu')
      return
    }
    setSending(true)
    const { error } = await resendVerification(email)
    setSending(false)
    if (error) {
      toast.error('Gagal mengirim ulang email verifikasi. Coba lagi.')
    } else {
      setSent(true)
      toast.success('Email verifikasi terkirim! Cek kotak masukmu.', { duration: 4000 })
    }
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Amber accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.12)' }}
              >
                <Mail size={18} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Email belum diverifikasi
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Akun kamu memerlukan verifikasi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Tutup"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-3 mb-5">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Email kamu belum diverifikasi. Silakan buka email yang digunakan saat mendaftar lalu klik tautan verifikasi.
            </p>

            {email && (
              <div
                className="flex items-center gap-2 p-2.5 rounded-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {email}
                </span>
              </div>
            )}

            {/* Spam note */}
            <div
              className="flex items-start gap-2 p-2.5 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <span className="text-sm flex-shrink-0">📬</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Tidak menemukan email? Cek folder{' '}
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Spam</span>{' '}
                atau{' '}
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Promotions</span>.
              </p>
            </div>

            {sent && (
              <div
                className="flex items-center gap-2 p-2.5 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <span className="text-sm">✅</span>
                <p className="text-xs font-medium" style={{ color: '#22C55E' }}>
                  Email verifikasi berhasil dikirim ulang!
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleResend}
              disabled={sending || sent}
              className="w-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={{
                background: sending || sent
                  ? 'rgba(99,102,241,0.3)'
                  : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#fff',
                boxShadow: sending || sent ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
              }}
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {sending ? 'Mengirim...' : sent ? 'Email Terkirim ✓' : 'Kirim ulang Email Verifikasi'}
            </button>
            <button
              onClick={onClose}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnverifiedEmailModal
