import { useMemo } from 'react'
import { Info } from 'lucide-react'

const HealthScore = ({ score, status, breakdown }) => {
  const radius = 56
  const stroke = 9
  const normalizedR = radius - stroke / 2
  const circumference = normalizedR * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  const gradId = score >= 85 ? 'hGreen' : score >= 70 ? 'hIndigo' : score >= 50 ? 'hAmber' : 'hRed'

  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Skor Finansial</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Kesehatan keuanganmu</p>
        </div>
        <div className="relative group">
          <Info size={14} style={{ color: 'var(--text-muted)' }} className="cursor-help" />
          <div className="absolute right-0 top-5 w-60 p-3 rounded-xl text-xs z-20 hidden group-hover:block shadow-card"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Cara perhitungan skor:</p>
            <ul className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <li>💰 Rasio Tabungan — 25 poin</li>
              <li>💸 Kontrol Pengeluaran — 25 poin</li>
              <li>📅 Konsistensi Pemasukan — 20 poin</li>
              <li>📊 Tren Keuangan — 15 poin</li>
              <li>🎯 Progress Tabungan — 15 poin</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ring + breakdown side by side */}
      <div className="flex items-center gap-4">
        {/* SVG Ring */}
        <div className="relative flex-shrink-0">
          <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id="hGreen"  x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#22C55E" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
              <linearGradient id="hIndigo" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="hAmber"  x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="hRed"    x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx={radius} cy={radius} r={normalizedR}
              fill="none" stroke="var(--bg-surface)" strokeWidth={stroke} />
            {/* Progress */}
            <circle cx={radius} cy={radius} r={normalizedR}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: status.color }}>{score}</span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>/100</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-2 min-w-0">
          {breakdown && Object.values(breakdown).map(item => {
            const fillPct = (item.score / item.max) * 100
            const barColor = fillPct >= 70 ? '#22C55E' : fillPct >= 40 ? '#F59E0B' : '#EF4444'
            return (
              <div key={item.label} className="group relative">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <span>{item.icon}</span>{item.label}
                  </span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {item.score}<span className="font-normal text-[9px]">/{item.max}</span>
                  </span>
                </div>
                <div className="progress-bar h-1.5">
                  <div className="progress-fill" style={{ width: `${fillPct}%`, background: barColor }} />
                </div>
                {/* Tooltip on hover */}
                {item.tip && (
                  <div className="absolute left-0 -bottom-8 z-20 w-56 px-2.5 py-1.5 rounded-lg text-[11px] hidden group-hover:block shadow-card leading-snug"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                    {item.tip}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-center">
        <span className="text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5"
          style={{ background: status.bg || `${status.color}20`, color: status.color }}>
          {status.emoji} {status.labelId || status.label}
        </span>
      </div>
    </div>
  )
}

export default HealthScore
