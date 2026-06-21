import { useMemo } from 'react'
import { Info } from 'lucide-react'

const HealthScore = ({ score, status, breakdown }) => {
  const radius = 52
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getGradientId = (s) => {
    if (s >= 90) return 'scoreGreen'
    if (s >= 70) return 'scoreIndigo'
    if (s >= 50) return 'scoreAmber'
    return 'scoreRed'
  }

  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Skor Finansial</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Kesehatan keuanganmu</p>
        </div>
        <div className="relative group">
          <Info size={14} style={{ color: 'var(--text-muted)' }} className="cursor-help" />
          <div className="absolute right-0 top-5 w-56 p-3 rounded-xl text-xs z-10 hidden group-hover:block shadow-card"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Cara perhitungan skor:</p>
            <ul className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <li>• Rasio tabungan (25 pts)</li>
              <li>• Kontrol pengeluaran (25 pts)</li>
              <li>• Konsistensi pemasukan (20 pts)</li>
              <li>• Tren keuangan (15 pts)</li>
              <li>• Progress tabungan (15 pts)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ring */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width={radius * 2} height={radius * 2} className="score-ring" style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id="scoreGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
              <linearGradient id="scoreIndigo" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="scoreAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="scoreRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={radius} cy={radius} r={normalizedRadius}
              fill="none" stroke="var(--bg-surface)" strokeWidth={stroke}
            />
            {/* Progress */}
            <circle
              cx={radius} cy={radius} r={normalizedRadius}
              fill="none"
              stroke={`url(#${getGradientId(score)})`}
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'none' }}>
            <span className="text-2xl font-bold tabular-nums" style={{ color: status.color }}>{score}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-2.5">
          {breakdown && Object.values(breakdown).map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{item.score}/{item.max}</span>
              </div>
              <div className="progress-bar h-1.5">
                <div className="progress-fill" style={{
                  width: `${(item.score / item.max) * 100}%`,
                  background: item.score >= item.max * 0.7 ? '#22C55E' : item.score >= item.max * 0.4 ? '#F59E0B' : '#EF4444'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status label */}
      <div className="mt-4 flex items-center justify-center">
        <span className="text-sm font-semibold px-4 py-1.5 rounded-full"
          style={{ background: `${status.color}20`, color: status.color }}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

export default HealthScore
