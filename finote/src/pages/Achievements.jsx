import { Trophy, Zap, Lock } from 'lucide-react'
import { useAchievements, RARITY, CATEGORIES } from '../hooks/useAchievements'
import AchievementCard from '../components/achievements/AchievementCard'

// ── XP Level system ───────────────────────────────────────────────────────────
const getLevel = (xp) => {
  const levels = [
    { min: 0,    label: 'Pemula',        color: '#94A3B8' },
    { min: 200,  label: 'Pencatat',      color: '#60A5FA' },
    { min: 500,  label: 'Penabung',      color: '#A78BFA' },
    { min: 1000, label: 'Finansial Pro', color: '#F59E0B' },
    { min: 2000, label: 'Master',        color: '#EF4444' },
  ]
  let current = levels[0]
  let next = levels[1]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].min) { current = levels[i]; next = levels[i + 1] || null; break }
  }
  const toNext = next ? next.min - xp : 0
  const pct = next ? ((xp - current.min) / (next.min - current.min)) * 100 : 100
  return { ...current, toNext, nextLabel: next?.label, pct: Math.min(pct, 100) }
}

// ── Rarity legend row ─────────────────────────────────────────────────────────
const RarityLegend = () => (
  <div className="flex flex-wrap gap-2">
    {Object.entries(RARITY).map(([key, r]) => (
      <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
        style={{ background: r.bg, color: r.color, border: `1px solid ${r.color}30` }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
        {r.label} <span className="opacity-70">+{r.xp}XP</span>
      </div>
    ))}
  </div>
)

// ── Category section ──────────────────────────────────────────────────────────
const CategorySection = ({ catKey, catMeta, achievements }) => {
  const unlocked = achievements.filter(a => a.unlocked).length
  const total    = achievements.length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{catMeta.icon}</span>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{catMeta.label}</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
            {unlocked}/{total}
          </span>
        </div>
        {/* mini progress */}
        <div className="flex items-center gap-2">
          <div className="progress-bar w-20 h-1.5">
            <div className="progress-fill" style={{
              width: `${total > 0 ? (unlocked / total) * 100 : 0}%`,
              background: catMeta.color
            }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map(a => <AchievementCard key={a.id} achievement={a} />)}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const Achievements = () => {
  const { byCategory, unlockedCount, total, totalXP, maxXP } = useAchievements()
  const overallPct = Math.round((unlockedCount / total) * 100)
  const level = getLevel(totalXP)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Trophy className="text-amber-400" size={22} />
            Pencapaian
          </h1>
          <p className="page-subtitle mt-0.5">Raih semua badge dan tunjukkan kehebatanmu!</p>
        </div>
        {/* XP badge */}
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold tabular-nums" style={{ color: level.color }}>
            {totalXP} <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>XP</span>
          </p>
          <p className="text-xs font-semibold" style={{ color: level.color }}>{level.label}</p>
        </div>
      </div>

      {/* XP + Level card */}
      <div className="card p-4 sm:p-5"
        style={{ background: `linear-gradient(135deg, ${level.color}10, var(--bg-card))`, borderColor: level.color + '30' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: level.color + '20' }}>
              <Zap size={18} style={{ color: level.color }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: level.color }}>{level.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {level.nextLabel ? `${level.toNext} XP lagi → ${level.nextLabel}` : 'Level maksimal! 🏆'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalXP} / {maxXP} XP</p>
          </div>
        </div>
        <div className="progress-bar h-2.5 rounded-full">
          <div className="progress-fill" style={{
            width: `${level.pct}%`,
            background: `linear-gradient(90deg, ${level.color}, ${level.color}aa)`,
            boxShadow: `0 0 10px ${level.color}60`,
          }} />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Trophy size={13} className="text-amber-400" />
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {unlockedCount}/{total}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>achievement terbuka</span>
          </div>
          <span className="text-sm font-bold" style={{ color: overallPct === 100 ? '#22C55E' : 'var(--text-secondary)' }}>
            {overallPct === 100 ? '🎊 Sempurna!' : `${overallPct}%`}
          </span>
        </div>
        {/* Overall progress bar */}
        <div className="progress-bar h-1.5 mt-2">
          <div className="progress-fill" style={{
            width: `${overallPct}%`,
            background: overallPct === 100 ? 'linear-gradient(90deg, #22C55E, #16A34A)' : 'linear-gradient(90deg, #F59E0B, #EF4444)',
            boxShadow: overallPct === 100 ? '0 0 12px rgba(34,197,94,0.5)' : '0 0 8px rgba(245,158,11,0.4)',
          }} />
        </div>
      </div>

      {/* Rarity legend */}
      <div className="card p-3.5 sm:p-4">
        <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
          Tingkatan Kelangkaan
        </p>
        <RarityLegend />
      </div>

      {/* Category sections */}
      {Object.entries(CATEGORIES).map(([catKey, catMeta]) => {
        const catAchievements = byCategory[catKey] || []
        if (catAchievements.length === 0) return null
        return (
          <CategorySection
            key={catKey}
            catKey={catKey}
            catMeta={catMeta}
            achievements={catAchievements}
          />
        )
      })}

      {/* Completion message */}
      {unlockedCount === total && (
        <div className="card p-5 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), var(--bg-card))', borderColor: '#F59E0B40' }}>
          <p className="text-3xl mb-2">🎊</p>
          <p className="text-base font-bold" style={{ color: '#F59E0B' }}>Semua Achievement Terbuka!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Kamu adalah Financial Master sejati!</p>
        </div>
      )}
    </div>
  )
}

export default Achievements
