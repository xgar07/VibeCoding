import { Lock, Star } from 'lucide-react'

// Rarity glow colors for box-shadow
const GLOW = {
  common:    'rgba(148,163,184,0.2)',
  rare:      'rgba(96,165,250,0.25)',
  epic:      'rgba(167,139,250,0.3)',
  legendary: 'rgba(245,158,11,0.35)',
}

const AchievementCard = ({ achievement, compact = false }) => {
  const { icon, title, desc, unlocked, progressData, rarityMeta, categoryMeta, xp, tip } = achievement
  const rarity = achievement.rarity || 'common'
  const { current, max, suffix = '' } = progressData
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0

  // ── Compact (used in Dashboard sidebar) ──────────────────────────────────
  if (compact) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
        style={{
          background: unlocked ? rarityMeta?.bg || 'rgba(245,158,11,0.06)' : 'var(--bg-surface)',
          border: `1px solid ${unlocked ? (rarityMeta?.color || '#F59E0B') + '30' : 'var(--border)'}`,
          opacity: unlocked ? 1 : 0.55,
        }}
      >
        <div className={`text-2xl flex-shrink-0 ${!unlocked ? 'grayscale' : ''}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
          {!unlocked && (
            <div className="mt-1 progress-bar h-1">
              <div className="progress-fill" style={{ width: `${pct}%`, background: rarityMeta?.color || '#6366F1' }} />
            </div>
          )}
        </div>
        {unlocked ? (
          <span style={{ color: rarityMeta?.color || '#F59E0B' }} className="text-sm font-bold">✓</span>
        ) : (
          <Lock size={10} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
        )}
      </div>
    )
  }

  // ── Full card ──────────────────────────────────────────────────────────────
  return (
    <div
      className="card p-4 transition-all duration-300 relative overflow-hidden group"
      style={{
        background: unlocked
          ? `linear-gradient(135deg, ${rarityMeta?.bg || 'rgba(245,158,11,0.07)'}, var(--bg-card))`
          : 'var(--bg-card)',
        borderColor: unlocked ? (rarityMeta?.color || '#F59E0B') + '35' : 'var(--border)',
        boxShadow: unlocked ? `0 4px 24px ${GLOW[rarity]}` : 'none',
      }}
    >
      {/* Shimmer overlay on unlock */}
      {unlocked && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(105deg, transparent 40%, ${rarityMeta?.color}15 50%, transparent 60%)`,
          }}
        />
      )}

      {/* Legendary sparkle badge */}
      {rarity === 'legendary' && unlocked && (
        <div className="absolute top-2.5 right-2.5">
          <Star size={14} style={{ color: '#F59E0B' }} fill="#F59E0B" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300"
          style={{
            background: unlocked ? rarityMeta?.bg || 'rgba(245,158,11,0.12)' : 'var(--bg-surface)',
            filter: !unlocked ? 'grayscale(1) opacity(0.4)' : 'none',
            fontSize: 22,
          }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</p>
            {unlocked && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex-shrink-0"
                style={{ background: rarityMeta?.bg, color: rarityMeta?.color }}
              >
                {rarityMeta?.label}
              </span>
            )}
          </div>

          {/* Desc */}
          <p className="text-xs mb-2.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>

          {/* Category + XP row */}
          <div className="flex items-center gap-2 mb-2.5">
            {categoryMeta && (
              <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: categoryMeta.color }}>
                {categoryMeta.icon} {categoryMeta.label}
              </span>
            )}
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              +{xp} XP
            </span>
          </div>

          {/* Progress / Unlocked state */}
          {!unlocked ? (
            <div>
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Progress</span>
                <span className="tabular-nums font-semibold">{current}{suffix} / {max}{suffix}</span>
              </div>
              <div className="progress-bar h-1.5">
                <div
                  className="progress-fill"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${rarityMeta?.color || '#6366F1'}, ${rarityMeta?.color || '#8B5CF6'}cc)`,
                  }}
                />
              </div>
              {tip && (
                <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  💡 {tip}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: rarityMeta?.color || '#F59E0B' }}
              />
              <span className="text-xs font-semibold" style={{ color: rarityMeta?.color || '#F59E0B' }}>
                Achievement terbuka! +{xp} XP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AchievementCard
