import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ExternalLink } from 'lucide-react'

/**
 * Beautiful post-registration screen shown after a successful sign-up.
 * Props:
 *   email {string} — the registered email address
 *   onBack {function} — navigate back to login
 */
const EmailVerificationSuccess = ({ email, onBack }) => {
  const [mounted, setMounted] = useState(false)

  // Trigger entrance animation on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const isGmail = email?.toLowerCase().includes('@gmail.') || email?.toLowerCase().endsWith('@googlemail.com')
  const domain  = email?.split('@')[1]?.toLowerCase()

  const openEmail = () => {
    if (isGmail) {
      window.open('https://mail.google.com', '_blank', 'noopener,noreferrer')
    } else if (domain === 'yahoo.com' || domain === 'yahoo.co.id') {
      window.open('https://mail.yahoo.com', '_blank', 'noopener,noreferrer')
    } else if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
      window.open('https://outlook.live.com', '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = `mailto:${email}`
    }
  }

  const emailProviderLabel = () => {
    if (isGmail) return 'Buka Gmail'
    if (domain === 'yahoo.com' || domain === 'yahoo.co.id') return 'Buka Yahoo Mail'
    if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') return 'Buka Outlook'
    return 'Buka Email'
  }

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: 'opacity 0.45s cubic-bezier(.4,0,.2,1), transform 0.45s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <div className="text-center mb-8">
        {/* Animated checkmark icon */}
        <div className="inline-flex items-center justify-center relative mb-5">
          {/* Outer pulse ring */}
          <div
            className="absolute w-28 h-28 rounded-full"
            style={{
              background: 'rgba(34,197,94,0.08)',
              animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
            }}
          />
          {/* Circle container */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,163,74,0.12))',
              border: '2px solid rgba(34,197,94,0.35)',
              animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {/* Animated SVG checkmark */}
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <polyline
                points="7,19 15,27 31,11"
                stroke="#22C55E"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray="100"
                style={{
                  animation: 'checkDraw 0.45s ease-out 0.35s both',
                }}
              />
            </svg>
          </div>
        </div>

        <h2
          className="text-2xl font-bold mb-2"
          style={{
            color: 'var(--text-primary)',
            animation: 'slideUp 0.4s ease-out 0.2s both',
          }}
        >
          Akun berhasil dibuat!
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{
            color: 'var(--text-secondary)',
            animation: 'slideUp 0.4s ease-out 0.28s both',
          }}
        >
          Kami telah mengirim email verifikasi ke
        </p>
        <p
          className="text-sm font-semibold mt-1"
          style={{
            color: '#818CF8',
            animation: 'slideUp 0.4s ease-out 0.32s both',
          }}
        >
          {email}
        </p>
      </div>

      {/* Card with instructions */}
      <div
        className="card p-5 sm:p-6 shadow-card space-y-4"
        style={{ animation: 'slideUp 0.4s ease-out 0.38s both' }}
      >
        {/* Email envelope illustration */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', animation: 'floatY 3s ease-in-out infinite' }}
          >
            <Mail size={26} style={{ color: '#818CF8' }} />
          </div>
          <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Silakan buka email kamu lalu klik tombol verifikasi sebelum melakukan login.
          </p>
        </div>

        {/* Spam note */}
        <div
          className="flex items-start gap-2.5 p-3 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}
        >
          <span className="text-base flex-shrink-0 mt-0.5">📬</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tidak menemukan email?</span>
            {' '}Cek folder <span className="font-medium">Spam</span> atau <span className="font-medium">Promotions</span> di kotak masukmu.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={openEmail}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <ExternalLink size={15} />
            {emailProviderLabel()}
          </button>
          <button
            onClick={onBack}
            className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={15} />
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationSuccess
