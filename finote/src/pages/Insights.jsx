import { useMemo } from 'react'
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAllTransactions } from '../hooks/useTransactions'
import { useSavings } from '../hooks/useSavings'
import { generateInsights } from '../utils/financialInsights'
import { ChartSkeleton } from '../components/common/SkeletonLoader'

const TYPE_META = {
  positive: { Icon: TrendingUp,    color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   iconBg: 'rgba(34,197,94,0.15)',   label: 'Positif',    tag: '✅' },
  negative: { Icon: TrendingDown,  color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   iconBg: 'rgba(239,68,68,0.15)',   label: 'Negatif',    tag: '❌' },
  warning:  { Icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', iconBg: 'rgba(245,158,11,0.15)', label: 'Perhatian',  tag: '⚠️' },
  neutral:  { Icon: Lightbulb,     color: '#818CF8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  iconBg: 'rgba(99,102,241,0.15)', label: 'Tips',       tag: '💡' },
}

const InsightCard = ({ insight, index }) => {
  const cfg = TYPE_META[insight.type] || TYPE_META.neutral
  const Icon = cfg.Icon
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 animate-slide-up"
      style={{ background: cfg.bg, borderColor: cfg.border, animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: cfg.iconBg }}>
        {insight.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {insight.text}
        </p>
        {insight.tag && (
          <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: cfg.iconBg, color: cfg.color }}>
            {cfg.label}
          </span>
        )}
      </div>
    </div>
  )
}

const SectionHeader = ({ title, count, icon }) => (
  <div className="flex items-center gap-2 mb-3 mt-2">
    <span className="text-base">{icon}</span>
    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
      {title}
    </h2>
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
      {count}
    </span>
  </div>
)

const Insights = () => {
  const { allTransactions, loading } = useAllTransactions()
  const { goals } = useSavings()

  const { warnings, negatives, positives, neutrals, all } = useMemo(() => {
    const all = generateInsights(allTransactions, goals)
    return {
      all,
      warnings:  all.filter(i => i.type === 'warning'),
      negatives: all.filter(i => i.type === 'negative'),
      positives: all.filter(i => i.type === 'positive'),
      neutrals:  all.filter(i => i.type === 'neutral'),
    }
  }, [allTransactions, goals])

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-7 w-52 rounded-lg" />
        <ChartSkeleton height={120} />
        <ChartSkeleton height={120} />
        <ChartSkeleton height={120} />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={22} />
            Smart Insights
          </h1>
          <p className="page-subtitle mt-0.5">
            {all.length} analisis otomatis dari riwayat transaksimu
          </p>
        </div>
        <Link to="/" className="btn-secondary text-sm flex items-center gap-1.5 flex-shrink-0">
          <ArrowLeft size={14} /> Dashboard
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Perhatian', count: warnings.length,  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Negatif',   count: negatives.length, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Positif',   count: positives.length, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Tips',      count: neutrals.length,  color: '#818CF8', bg: 'rgba(99,102,241,0.1)' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center" style={{ background: s.bg, borderColor: s.color + '30' }}>
            <p className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* No data */}
      {all.length === 0 && (
        <div className="card">
          <div className="empty-state py-12">
            <p className="text-4xl mb-3">💡</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Belum cukup data untuk analisis
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Catat transaksi selama beberapa bulan untuk mendapatkan insight
            </p>
            <Link to="/income" className="mt-4 btn-primary text-sm">Catat Transaksi</Link>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div>
          <SectionHeader title="Perlu Perhatian" count={warnings.length} icon="⚠️" />
          <div className="space-y-2.5">
            {warnings.map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)}
          </div>
        </div>
      )}

      {/* Negatives */}
      {negatives.length > 0 && (
        <div>
          <SectionHeader title="Hal yang Perlu Diperbaiki" count={negatives.length} icon="❌" />
          <div className="space-y-2.5">
            {negatives.map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)}
          </div>
        </div>
      )}

      {/* Positives */}
      {positives.length > 0 && (
        <div>
          <SectionHeader title="Pencapaian Baik" count={positives.length} icon="✅" />
          <div className="space-y-2.5">
            {positives.map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)}
          </div>
        </div>
      )}

      {/* Neutral / Tips */}
      {neutrals.length > 0 && (
        <div>
          <SectionHeader title="Tips & Saran" count={neutrals.length} icon="💡" />
          <div className="space-y-2.5">
            {neutrals.map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default Insights
