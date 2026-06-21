import { FileText, TrendingUp, TrendingDown, PiggyBank, Award } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import { getCategoryInfo } from '../../utils/categories'

const MonthlyReport = ({ income, expenses, savings, topCategory, score, monthLabel }) => {
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0

  return (
    <div className="card p-4 sm:p-5 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(99,102,241,0.08)', transform: 'translate(30%, -30%)' }} />

      <div className="flex items-center gap-2 mb-4 relative">
        <div className="p-1.5 rounded-lg bg-purple-500/10">
          <FileText size={14} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Laporan Bulanan</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{monthLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative">
        {/* Income */}
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pemasukan</span>
          </div>
          <p className="text-sm font-bold text-green-400 tabular-nums">{formatCurrency(income, true)}</p>
        </div>

        {/* Expense */}
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingDown size={12} className="text-red-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pengeluaran</span>
          </div>
          <p className="text-sm font-bold text-red-400 tabular-nums">{formatCurrency(expenses, true)}</p>
        </div>

        {/* Balance */}
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <PiggyBank size={12} className="text-indigo-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Surplus</span>
          </div>
          <p className={`text-sm font-bold tabular-nums ${balance >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance, true)}
          </p>
        </div>

        {/* Savings rate */}
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Award size={12} className="text-amber-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Rasio Tabungan</span>
          </div>
          <p className={`text-sm font-bold tabular-nums ${savingsRate >= 20 ? 'text-green-400' : savingsRate >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
            {savingsRate}%
          </p>
        </div>
      </div>

      {/* Top category */}
      {topCategory && (
        <div className="mt-3 flex items-center justify-between p-3 rounded-xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">{topCategory.icon}</span>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pengeluaran terbesar</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{topCategory.label}</p>
            </div>
          </div>
          <p className="text-xs font-bold text-red-400 tabular-nums">{formatCurrency(topCategory.amount, true)}</p>
        </div>
      )}
    </div>
  )
}

export default MonthlyReport
