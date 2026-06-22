import { useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { useAllTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../utils/formatCurrency'
import { getLast6Months } from '../utils/dateHelpers'
import { getCategoryInfo } from '../utils/categories'
import EmptyState from '../components/common/EmptyState'
import { ChartSkeleton, StatCardSkeleton } from '../components/common/SkeletonLoader'
import { parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'

const COLORS = ['#6366F1', '#8B5CF6', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#EF4444', '#06B6D4']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2.5 text-xs shadow-card" style={{ border: '1px solid var(--border-strong)' }}>
      <p className="mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}: </span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.value, true)}</span>
        </div>
      ))}
    </div>
  )
}

const Statistics = () => {
  const { allTransactions, loading } = useAllTransactions()
  const months = getLast6Months()
  const now = new Date()

  const { monthlyData, catData, lineData, totals, thisMonth, prevMonth } = useMemo(() => {
    const inRange = (tx, start, end) => {
      try { return isWithinInterval(parseISO(tx.date), { start, end }) }
      catch { return false }
    }

    const monthlyData = months.map(m => {
      const txs = allTransactions.filter(t => inRange(t, m.start, m.end))
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { name: m.label, Pemasukan: income, Pengeluaran: expenses }
    })

    const thisMTxs = allTransactions.filter(t =>
      t.type === 'expense' && inRange(t, startOfMonth(now), endOfMonth(now))
    )
    const catMap = {}
    thisMTxs.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount })
    const catData = Object.entries(catMap)
      .map(([cat, val]) => ({ name: getCategoryInfo(cat, 'expense').label, value: val, cat }))
      .sort((a, b) => b.value - a.value)

    let running = 0
    const lineData = months.map(m => {
      const txs = allTransactions.filter(t => inRange(t, m.start, m.end))
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      running += income - expenses
      return { name: m.label, Saldo: running }
    })

    const totals = {
      income: allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }

    const thisMonthTxs = allTransactions.filter(t => inRange(t, startOfMonth(now), endOfMonth(now)))
    const prevStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1))
    const prevMonthTxs = allTransactions.filter(t => inRange(t, prevStart, endOfMonth(prevStart)))

    const thisMonth = {
      income: thisMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: thisMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
    const prevMonth = {
      income: prevMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: prevMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }

    return { monthlyData, catData, lineData, totals, thisMonth, prevMonth }
  }, [allTransactions])

  const incomeChange = prevMonth.income > 0
    ? (((thisMonth.income - prevMonth.income) / prevMonth.income) * 100).toFixed(1) : null
  const expenseChange = prevMonth.expenses > 0
    ? (((thisMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100).toFixed(1) : null

  const yTickFmt = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}Jt` : `${(v / 1000).toFixed(0)}Rb`

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-7 w-36 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <ChartSkeleton height={220} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={180} />
          <ChartSkeleton height={180} />
        </div>
      </div>
    )
  }

  const hasData = allTransactions.length > 0

  return (
    <div className="page-container">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 className="text-indigo-400" size={22} />
          Statistik
        </h1>
        <p className="page-subtitle mt-0.5">Analisis mendalam keuanganmu</p>
      </div>

      {!hasData ? (
        <div className="card">
          <EmptyState variant="statistics" />
        </div>
      ) : (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Pemasukan', value: totals.income, color: 'text-green-400', accent: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: TrendingUp, iconColor: '#22C55E' },
              { label: 'Total Pengeluaran', value: totals.expenses, color: 'text-red-400', accent: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: TrendingDown, iconColor: '#EF4444' },
              { label: 'Pemasukan Bulan Ini', value: thisMonth.income, color: 'text-indigo-400', accent: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', icon: TrendingUp, iconColor: '#818CF8', change: incomeChange },
              { label: 'Pengeluaran Bulan Ini', value: thisMonth.expenses, color: 'text-amber-400', accent: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: TrendingDown, iconColor: '#FCD34D', change: expenseChange },
            ].map((s, i) => (
              <div key={i} className="card p-4" style={{ background: s.accent, borderColor: s.border }}>
                <div className="flex items-center justify-between mb-2">
                  <s.icon size={15} style={{ color: s.iconColor }} />
                  {s.change != null && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-lg ${parseFloat(s.change) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {parseFloat(s.change) >= 0 ? '↑' : '↓'} {Math.abs(s.change)}%
                    </span>
                  )}
                </div>
                <p className={`text-lg sm:text-xl font-bold tabular-nums ${s.color}`}>{formatCurrency(s.value, true)}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="card p-4 sm:p-5">
            <h2 className="text-sm sm:text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Pemasukan vs Pengeluaran</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Perbandingan 6 bulan terakhir</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                  tickFormatter={yTickFmt} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Pemasukan" fill="#6366F1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line + Pie — stack on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Line Chart */}
            <div className="card p-4 sm:p-5">
              <h2 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Tren Saldo</h2>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Akumulasi 6 bulan terakhir</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={lineData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                    tickFormatter={yTickFmt} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Saldo" stroke="#22C55E" strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#22C55E', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="card p-4 sm:p-5">
              <h2 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Kategori Pengeluaran</h2>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Bulan ini</p>
              {catData.length > 0 ? (
                <div className="flex gap-3 items-center">
                  <div className="flex-shrink-0">
                    <ResponsiveContainer width={130} height={130}>
                      <PieChart>
                        <Pie data={catData} cx="50%" cy="50%" innerRadius={36} outerRadius={58}
                          paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[130px] min-w-0">
                    {catData.map((d, i) => {
                      const total = catData.reduce((s, c) => s + c.value, 0)
                      const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0
                      return (
                        <div key={d.name}>
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                            </div>
                            <span className="text-xs flex-shrink-0 ml-1" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                          </div>
                          <div className="progress-bar h-1">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Belum ada pengeluaran bulan ini
                </div>
              )}
            </div>
          </div>

          {/* Category Detail — cards on mobile instead of table */}
          {catData.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 sm:p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Detail Per Kategori</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Pengeluaran bulan ini</p>
              </div>
              <div>
                {catData.map((d, i) => {
                  const total = catData.reduce((s, c) => s + c.value, 0)
                  const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0
                  const info = getCategoryInfo(d.cat, 'expense')
                  return (
                    <div key={d.name} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-colors"
                      style={{ borderBottom: i < catData.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span className="text-lg w-7 text-center flex-shrink-0">{info.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium truncate pr-2" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                          <span className="text-sm font-semibold tabular-nums flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{formatCurrency(d.value, true)}</span>
                        </div>
                        <div className="progress-bar h-1.5">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                      <span className="text-xs w-9 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Statistics
