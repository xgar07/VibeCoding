import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react'

// ── Type config ──────────────────────────────────────────────────────────────

const TYPE = {
  positive: {
    Icon: TrendingUp,
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
    iconBg: 'rgba(34,197,94,0.15)',
    iconColor: '#22C55E',
    dot: '#22C55E',
    label: 'Positif',
  },
  negative: {
    Icon: TrendingDown,
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    iconBg: 'rgba(239,68,68,0.15)',
    iconColor: '#EF4444',
    dot: '#EF4444',
    label: 'Negatif',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    iconBg: 'rgba(245,158,11,0.15)',
    iconColor: '#F59E0B',
    dot: '#F59E0B',
    label: 'Perhatian',
  },
  neutral: {
    Icon: Lightbulb,
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.2)',
    iconBg: 'rgba(99,102,241,0.15)',
    iconColor: '#818CF8',
    dot: '#818CF8',
    label: 'Info',
  },
}

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'all',      label: 'Semua' },
  { id: 'warning',  label: 'Perhatian' },
  { id: 'negative', label: 'Negatif' },
  { id: 'positive', label: 'Positif' },
  { id: 'neutral',  label: 'Tips' },
]

// ── Single insight row ────────────────────────────────────────────────────────

const InsightRow = ({ insight, index }) => {
  const cfg = TYPE[insight.type] || TYPE.neutral
  const Icon = cfg.Icon

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 animate-fade-in"
      style={{
        background: cfg.bg,
        borderColor: cfg.border,
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.iconBg }}>
        <span className="text-base leading-none select-none">{insight.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {insight.text}
        </p>
      </div>

      {/* Type badge */}
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block"
        style={{ background: cfg.iconBg, color: cfg.iconColor }}>
        {cfg.label}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const SmartInsights = ({ insights = [] }) => {
  const [activeTab, setActiveTab] = useState('all')
  const [showAll, setShowAll] = useState(false)
  const PREVIEW_COUNT = 4

  if (!insights.length) return null

  // Count per type for tab badges
  const counts = insights.reduce((acc, ins) => {
    acc[ins.type] = (acc[ins.type] || 0) + 1
    acc.all = (acc.all || 0) + 1
    return acc
  }, {})

  const filtered = activeTab === 'all' ? insights : insights.filter(i => i.type === activeTab)
  const visible = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT)
  const hasMore = filtered.length > PREVIEW_COUNT

  const warningCount = (counts.warning || 0) + (counts.negative || 0)

  return (
    <div className="card p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <Sparkles size={14} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Smart Insights
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {insights.length} analisis otomatis keuanganmu
            </p>
          </div>
        </div>

        {/* Warning badge if there are alerts */}
        {warningCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
            <AlertTriangle size={11} />
            {warningCount} perlu perhatian
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5">
        {TABS.map(tab => {
          const count = tab.id === 'all' ? insights.length : (counts[tab.id] || 0)
          if (tab.id !== 'all' && count === 0) return null
          const isActive = activeTab === tab.id
          const cfg = TYPE[tab.id]

          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowAll(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all duration-150"
              style={{
                background: isActive
                  ? (cfg ? cfg.iconBg : 'rgba(99,102,241,0.12)')
                  : 'var(--bg-surface)',
                color: isActive
                  ? (cfg ? cfg.iconColor : '#818CF8')
                  : 'var(--text-muted)',
                border: `1px solid ${isActive ? (cfg ? cfg.border : 'rgba(99,102,241,0.3)') : 'var(--border)'}`,
              }}
            >
              {tab.label}
              {count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                    color: isActive ? 'inherit' : 'var(--text-muted)',
                  }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Insight list */}
      {visible.length > 0 ? (
        <div className="space-y-2">
          {visible.map((insight, i) => (
            <InsightRow key={i} insight={insight} index={i} />
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Tidak ada insight untuk kategori ini
          </p>
        </div>
      )}

      {/* Show more / less */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all duration-150"
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {showAll ? (
            <><ChevronUp size={13} /> Tampilkan lebih sedikit</>
          ) : (
            <><ChevronDown size={13} /> Lihat {filtered.length - PREVIEW_COUNT} insight lainnya</>
          )}
        </button>
      )}

      {/* Link to full insights page */}
      <Link
        to="/insights"
        className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all duration-150 rounded-xl"
        style={{ color: '#818CF8' }}
        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
      >
        Lihat semua insight <ArrowRight size={12} />
      </Link>
    </div>
  )
}

export default SmartInsights
