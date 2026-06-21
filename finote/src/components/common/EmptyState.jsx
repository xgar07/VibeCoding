import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, PiggyBank, StickyNote, BarChart3, Inbox, Plus } from 'lucide-react'

const VARIANTS = {
  transactions: {
    icon: TrendingUp,
    emoji: '💸',
    title: 'Belum ada transaksi',
    desc: 'Mulai catat pemasukan atau pengeluaran pertamamu',
    cta: 'Catat Transaksi',
    link: '/income',
  },
  income: {
    icon: TrendingUp,
    emoji: '💰',
    title: 'Belum ada pemasukan',
    desc: 'Tambahkan sumber penghasilan pertamamu',
    cta: 'Tambah Pemasukan',
    link: null,
  },
  expenses: {
    icon: TrendingDown,
    emoji: '🧾',
    title: 'Belum ada pengeluaran',
    desc: 'Tidak ada pengeluaran pada periode ini',
    cta: 'Catat Pengeluaran',
    link: null,
  },
  savings: {
    icon: PiggyBank,
    emoji: '🐷',
    title: 'Belum ada target tabungan',
    desc: 'Buat target tabungan dan wujudkan impianmu!',
    cta: 'Buat Target',
    link: null,
  },
  memos: {
    icon: StickyNote,
    emoji: '📝',
    title: 'Belum ada catatan',
    desc: 'Tulis ide, rencana, atau to-do list kamu',
    cta: 'Buat Catatan',
    link: null,
  },
  statistics: {
    icon: BarChart3,
    emoji: '📊',
    title: 'Data belum tersedia',
    desc: 'Mulai catat transaksi untuk melihat statistik',
    cta: 'Catat Transaksi',
    link: '/income',
  },
  generic: {
    icon: Inbox,
    emoji: '📭',
    title: 'Tidak ada data',
    desc: 'Mulai tambahkan data untuk melihat konten',
    cta: null,
    link: null,
  },
}

const EmptyState = ({
  variant = 'generic',
  title,
  desc,
  ctaLabel,
  onCta,
  link,
}) => {
  const v = VARIANTS[variant]
  const Icon = v.icon
  const displayTitle = title || v.title
  const displayDesc = desc || v.desc
  const displayCta = ctaLabel || v.cta
  const displayLink = link || v.link

  return (
    <div className="empty-state">
      {/* Illustration */}
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          {v.emoji}
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Plus size={12} className="text-indigo-400" />
        </div>
      </div>

      <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
        {displayTitle}
      </h3>
      <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {displayDesc}
      </p>

      {displayCta && (
        <div className="mt-5">
          {displayLink ? (
            <Link to={displayLink} className="btn-primary text-sm">
              <Plus size={14} />
              {displayCta}
            </Link>
          ) : onCta ? (
            <button onClick={onCta} className="btn-primary text-sm">
              <Plus size={14} />
              {displayCta}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default EmptyState
