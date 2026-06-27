import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Wallet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { mapAuthError } from '../utils/authErrors'
import EmailVerificationSuccess from '../components/auth/EmailVerificationSuccess'
import toast from 'react-hot-toast'

const Register = () => {
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)   // prevents double submit
  const [registered, setRegistered] = useState(false) // shows success screen
  const [fieldError, setFieldError] = useState('')    // inline error under the form
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (fieldError) setFieldError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitted || loading) return   // prevent duplicate requests

    // ── Client-side validation ─────────────────────────────────────────────
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFieldError('Isi semua kolom terlebih dahulu.')
      return
    }
    if (form.password.length < 6) {
      setFieldError('Password minimal 6 karakter.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setFieldError('Password tidak cocok, coba lagi.')
      return
    }

    setLoading(true)
    setSubmitted(true)
    setFieldError('')

    const { data, error } = await signUp({ email: form.email.trim(), password: form.password, name: form.name.trim() })

    setLoading(false)

    if (error) {
      setSubmitted(false)  // allow retry on error
      const friendly = mapAuthError(error)
      setFieldError(friendly)
    } else {
      // Supabase returns a session immediately if "Confirm email" is disabled,
      // or returns no session (requires verification) if it is enabled.
      const needsVerification = !data?.session

      // Reset form fields (requirement 4)
      setForm({ name: '', email: form.email, password: '', confirmPassword: '' })

      if (needsVerification) {
        // Show the verification success screen
        setRegistered(true)
      } else {
        // Email confirmation disabled — user is already logged in
        toast.success('Akun berhasil dibuat! Selamat datang 🎉')
        navigate('/')
      }
    }
  }

  // ── Background decoration (shared with success screen) ───────────────────
  const Background = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
    </div>
  )

  // ── Success screen ────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <Background />
        <div className="w-full max-w-md relative">
          {/* Finote wordmark stays visible */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-2xl shadow-glow-primary mb-4">
              <Wallet size={26} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient-primary">Finote</h1>
          </div>

          <EmailVerificationSuccess
            email={form.email}
            onBack={() => navigate('/login')}
          />

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            © 2025 Finote. Kelola keuanganmu dengan cerdas.
          </p>
        </div>
      </div>
    )
  }

  // ── Register form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <Background />

      <div className="w-full max-w-md animate-fade-in relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-2xl shadow-glow-primary mb-4">
            <Wallet size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary">Finote</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Buat akun baru kamu</p>
        </div>

        <div className="card p-6 sm:p-7 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Nama */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama kamu"
                  className="input-field pl-10"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="input-field pl-10"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="input-field pl-10 pr-12"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className="input-field pl-10"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Inline error message */}
            {fieldError && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#F87171',
                  animation: 'slideDown 0.25s ease-out both',
                }}
              >
                <span className="flex-shrink-0">⚠️</span>
                {fieldError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3.5 mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftar...
                </span>
              ) : 'Daftar'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sudah punya akun?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          © 2025 Finote. Kelola keuanganmu dengan cerdas.
        </p>
      </div>
    </div>
  )
}

export default Register
