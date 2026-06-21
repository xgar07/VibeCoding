import { Lock } from 'lucide-react'

const AchievementCard = ({ achievement, compact = false }) => {
  const { icon, title, desc, unlocked, progressData } = achievement
  const { current, max, suffix = '' } = progressData
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${unlocked ? 'achievement-unlocked border border-amber-500/20' : 'opacity-50'}
        `}
        style={{ background: unlocked ? 'rgba(245,158,11,0.06)' : 'var(--bg-surface)' }}
      >
        <div className={`text-2xl flex-shrink-0 ${!unlocked ? 'grayscale' : ''}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
          {!unlocked && (
            <div className="mt-1 progress-bar h-1">
              <div className="progress-fill" style={{ width: `${pct}%`, background: '#6366F1' }} />
            </div>
          )}
        </div>
        {unlocked ? (
          <span className="text-amber-400 text-xs">✓</span>
        ) : (
          <Lock size={10} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
        )}
      </div>
    )
  }

  return (
    <div className={`card p-4 transition-all duration-300
      ${unlocked ? 'border-amber-500/25 shadow-glow-gold animate-bounce-soft' : ''}`}
      style={{ background: unlocked ? 'linear-gradient(135deg, rgba(245,158,11,0.07), var(--bg-card))' : 'var(--bg-card)' }}
    >
      <div className="flex items-start gap-3">
        <div className={`text-3xl flex-shrink-0 ${!unlocked ? 'grayscale opacity-40' : ''} transition-all duration-300`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
            {unlocked && (
              <span className="badge text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                Terbuka!
              </span>
            )}
          </div>
          <p className="text-xs mb-2.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>

          {!unlocked ? (
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Progress</span>
                <span className="tabular-nums">{current}{suffix} / {max}{suffix}</span>
              </div>
              <div className="progress-bar h-1.5">
                <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
              <span className="text-xs text-amber-400 font-medium">Achievement terbuka!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AchievementCard
