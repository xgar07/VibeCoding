import { Trophy } from 'lucide-react'
import { useAchievements } from '../hooks/useAchievements'
import AchievementCard from '../components/achievements/AchievementCard'

const Achievements = () => {
  const { achievements, unlockedCount, total } = useAchievements()
  const pct = Math.round((unlockedCount / total) * 100)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Trophy className="text-amber-400" size={24} />
            Pencapaian
          </h1>
          <p className="page-subtitle mt-0.5">Raih semua badge dan tunjukkan kehebatanmu!</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-amber-400 tabular-nums">{unlockedCount}<span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/{total}</span></p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>terbuka</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Progress Keseluruhan</p>
          <span className="text-sm font-bold text-amber-400">{pct}%</span>
        </div>
        <div className="progress-bar h-3">
          <div className="progress-fill" style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
            boxShadow: '0 0 12px rgba(245,158,11,0.4)'
          }} />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {unlockedCount === total ? '🎊 Semua achievement terbuka! Luar biasa!' : `${total - unlockedCount} achievement tersisa untuk dibuka`}
        </p>
      </div>

      {/* Unlocked */}
      {achievements.filter(a => a.unlocked).length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            ✅ Sudah Terbuka ({unlockedCount})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.filter(a => a.unlocked).map(a => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {achievements.filter(a => !a.unlocked).length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            🔒 Belum Terbuka ({total - unlockedCount})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.filter(a => !a.unlocked).map(a => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Achievements
