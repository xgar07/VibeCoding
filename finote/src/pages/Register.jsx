import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Wallet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Isi semua kolom terlebih dahulu')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }
    setLoading(true)
    const { error } = await signUp({ email: form.email, password: form.password, name: form.name })
    setLoading(false)
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        toast.error('Email sudah terdaftar — coba login')
      } else if (error.message.includes('rate limit') || error.message.includes('email rate limit') || error.status === 429) {
        toast.error('Terlalu banyak permintaan email. Coba lagi dalam 1 jam, atau matikan "Confirm email" di Supabase Auth settings.', { duration: 8000 })
      } else if (error.message.includes('Invalid email')) {
        toast.error('Format email tidak valid')
      } else {
        toast.error('Gagal daftar: ' + error.message)
      }
    } else {
      toast.success('Akun berhasil dibuat! Selamat datang 🎉')
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-dark-200 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-2xl shadow-glow-primary mb-4">
            <Wallet size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary">Finote</h1>
          <p className="text-slate-400 mt-1">Buat akun baru kamu</p>
        </div>

        <div className="glass-card p-7 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama kamu"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="input-field pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className="input-field pl-10"
                />
              </div>
            </div>

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
            <p className="text-slate-400 text-sm">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary hover:text-primary-400 font-medium transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>

          {/* Rate limit tip */}
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-400 leading-relaxed">
              <span className="font-semibold">💡 Tips:</span> Jika muncul error "email rate limit", matikan{' '}
              <span className="font-medium">"Confirm email"</span> di{' '}
              <span className="font-medium">Supabase → Authentication → Providers → Email</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
