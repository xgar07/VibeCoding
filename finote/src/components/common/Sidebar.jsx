import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, TrendingDown, PiggyBank,
  StickyNote, BarChart3, LogOut, Wallet, Trophy, MoreHorizontal
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import LogoutModal from './LogoutModal'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/income', label: 'Pemasukan', icon: TrendingUp },
  { path: '/expenses', label: 'Pengeluaran', icon: TrendingDown },
  { path: '/savings', label: 'Tabungan', icon: PiggyBank },
  { path: '/memos', label: 'Memo & Todo', icon: StickyNote },
  { path: '/statistics', label: 'Statistik', icon: BarChart3 },
  { path: '/achievements', label: 'Pencapaian', icon: Trophy },
]

const mobileNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/income', label: 'Masuk', icon: TrendingUp },
  { path: '/expenses', label: 'Keluar', icon: TrendingDown },
  { path: '/savings', label: 'Tabungan', icon: PiggyBank },
  { path: '/statistics', label: 'Statistik', icon: BarChart3 },
]

// ── Shared logout hook ────────────────────────────────────────────────────────
const useLogout = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const requestLogout = () => setShowModal(true)
  const cancelLogout  = () => setShowModal(false)

  const confirmLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      toast.success('Berhasil logout. Sampai jumpa lagi! 👋', { duration: 3000 })
      navigate('/login', { replace: true })
    } catch {
      toast.error('Gagal logout, coba lagi.')
    } finally {
      setLoading(false)
      setShowModal(false)
    }
  }

  return { showModal, loading, requestLogout, cancelLogout, confirmLogout }
}

// ── Desktop Sidebar ───────────────────────────────────────────────────────────
export const Sidebar = () => {
  const { user } = useAuth()
  const { showModal, loading, requestLogout, cancelLogout, confirmLogout } = useLogout()

  const userName    = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna'
  const userEmail   = user?.email || ''
  const avatarLetter = userName.charAt(0).toUpperCase()

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 z-40"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="p-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary flex-shrink-0">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-gradient-primary">Finote</span>
              <p className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>Finance Tracker</p>
            </div>
            <div className="ml-auto">
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon size={16} />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile + logout */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Avatar row */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl mb-2"
            style={{ background: 'var(--bg-surface)' }}>
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{userName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            id="sidebar-logout-btn"
            onClick={requestLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
              transition-all duration-200 hover:bg-red-500/10 group"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={14} className="transition-colors duration-200 group-hover:text-red-400" />
            <span className="transition-colors duration-200 group-hover:text-red-400">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Confirmation modal */}
      <LogoutModal
        isOpen={showModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        loading={loading}
      />
    </>
  )
}

// ── Mobile Bottom Navigation ──────────────────────────────────────────────────
export const BottomNav = () => {
  const { showModal, loading, requestLogout, cancelLogout, confirmLogout } = useLogout()

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-pb"
        style={{
          background: 'color-mix(in srgb, var(--bg-card) 95%, transparent)',
          borderTop: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {mobileNavItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[52px]
                ${isActive ? 'text-indigo-400' : ''}`
              }
              style={({ isActive }) => ({
                color: isActive ? '#818CF8' : 'var(--text-muted)',
                background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
              })}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </NavLink>
          ))}

          {/* Logout button in BottomNav */}
          <button
            id="mobile-logout-btn"
            onClick={requestLogout}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[52px] active:bg-red-500/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium leading-none">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Confirmation modal */}
      <LogoutModal
        isOpen={showModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        loading={loading}
      />
    </>
  )
}
