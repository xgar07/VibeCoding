import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

const typeConfig = {
  positive: { icon: TrendingUp, bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', iconColor: '#22C55E' },
  negative: { icon: TrendingDown, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', iconColor: '#EF4444' },
  neutral: { icon: Lightbulb, bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', iconColor: '#6366F1' },
}

const SmartInsights = ({ insights = [] }) => {
  if (!insights.length) return null

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-500/10">
          <Lightbulb size={14} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Smart Insights</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Analisis otomatis keuanganmu</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {insights.map((insight, i) => {
          const cfg = typeConfig[insight.type] || typeConfig.neutral
          const Icon = cfg.icon
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border} animate-fade-in`}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: `${cfg.iconColor}20` }}>
                <Icon size={12} style={{ color: cfg.iconColor }} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {insight.text}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SmartInsights
