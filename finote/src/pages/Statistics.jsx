import { useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { useAllTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../utils/formatCurrency'
import { getLast6Months } from '../utils/dateHelpers'
import { getCategoryInfo, EXPENSE_CATEGORIES } from '../utils/categories'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'

const COLORS = ['#6366F1', '#8B5CF6', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#EF4444', '#06B6D4']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-xs border border-white/10 shadow-card">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}: </span>
          <span className="font-semibold text-slate-100">{formatCurrency(p.value, true)}</span>
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
    // Monthly bar data
    const monthlyData = months.map(m => {
      const txs = allTransactions.filter(t => {
        try { return isWithinInterval(parseISO(t.date), { start: m.start, end: m.end }) }
        catch { return false }
      })
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { name: m.label, Pemasukan: income, Pengeluaran: expenses, Surplus: income - expenses }
    })

    // Category pie for this month
    const thisMTxs = allTransactions.filter(t => {
      try { return t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: startOfMonth(now), end: endOfMonth(now) }) }
      catch { return false }
    })
    const catMap = {}
    thisMTxs.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount })
    const catData = Object.entries(catMap)
      .map(([cat, val]) => ({ name: getCategoryInfo(cat, 'expense').label, value: val, cat }))
      .sort((a, b) => b.value - a.value)

    // Line chart (balance over months)
    let running = 0
    const lineData = months.map(m => {
      const txs = allTransactions.filter(t => {
        try { return isWithinInterval(parseISO(t.date), { start: m.start, end: m.end }) }
        catch { return false }
      })
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      running += income - expenses
      return { name: m.label, Saldo: running }
    })

    // Totals
    const totals = {
      income: allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }

    // This month vs prev month
    const thisMonthTxs = allTransactions.filter(t => {
      try { return isWithinInterval(parseISO(t.date), { start: startOfMonth(now), end: endOfMonth(now) }) }
      catch { return false }
    })
    const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1))
    const prevMonthEnd = endOfMonth(prevMonthStart)
    const prevMonthTxs = allTransactions.filter(t => {
      try { return isWithinInterval(parseISO(t.date), { start: prevMonthStart, end: prevMonthEnd }) }
      catch { return false }
    })
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="text-primary" size={24} />
          Statistik
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Analisis mendalam keuanganmu</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pemasukan', value: totals.income, color: 'text-green-400', bg: 'from-green-500/10 to-emerald-600/5', border: 'border-green-500/20', icon: TrendingUp, iconColor: 'text-green-400' },
          { label: 'Total Pengeluaran', value: totals.expenses, color: 'text-red-400', bg: 'from-red-500/10 to-rose-600/5', border: 'border-red-500/20', icon: TrendingDown, iconColor: 'text-red-400' },
          { label: 'Pemasukan Bulan Ini', value: thisMonth.income, color: 'text-green-400', change: incomeChange, bg: 'from-indigo-500/10 to-purple-600/5', border: 'border-indigo-500/20', icon: TrendingUp, iconColor: 'text-indigo-400' },
          { label: 'Pengeluaran Bulan Ini', value: thisMonth.expenses, color: 'text-red-400', change: expenseChange, bg: 'from-amber-500/10 to-orange-600/5', border: 'border-amber-500/20', icon: TrendingDown, iconColor: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className={`glass-card p-4 bg-gradient-to-br ${s.bg} border ${s.border}`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon size={16} className={s.iconColor} />
              {s.change !== null && s.change !== undefined && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${parseFloat(s.change) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {parseFloat(s.change) >= 0 ? '↑' : '↓'} {Math.abs(s.change)}%
                </span>
              )}
            </div>
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{formatCurrency(s.value, true)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-slate-100 mb-1">Pemasukan vs Pengeluaran</h2>
        <p className="text-xs text-slate-500 mb-5">Perbandingan 6 bulan terakhir</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}Jt` : `${(v/1000).toFixed(0)}Rb`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }} />
            <Bar dataKey="Pemasukan" fill="#6366F1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Line Chart */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-slate-100 mb-1">Tren Saldo</h2>
          <p className="text-xs text-slate-500 mb-5">Akumulasi 6 bulan terakhir</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}Jt` : `${(v/1000).toFixed(0)}Rb`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Saldo" stroke="#22C55E" strokeWidth={2.5}
                dot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#22C55E' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-slate-100 mb-1">Kategori Pengeluaran</h2>
          <p className="text-xs text-slate-500 mb-4">Bulan ini</p>
          {catData.length > 0 ? (
            <div className="flex gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[180px] pr-1">
                {catData.map((d, i) => {
                  const total = catData.reduce((s, c) => s + c.value, 0)
                  const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-slate-400">{d.name}</span>
                        </div>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                      <div className="h-1 bg-dark-200 rounded-full">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="empty-state h-[180px]">
              <p className="text-slate-500 text-sm">Belum ada pengeluaran bulan ini</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Detail Table */}
      {catData.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-base font-semibold text-slate-100">Detail Per Kategori</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pengeluaran bulan ini</p>
          </div>
          <div className="divide-y divide-white/5">
            {catData.map((d, i) => {
              const total = catData.reduce((s, c) => s + c.value, 0)
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0
              const info = getCategoryInfo(d.cat, 'expense')
              return (
                <div key={d.name} className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors">
                  <span className="text-lg w-7 text-center">{info.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-200">{d.name}</span>
                      <span className="text-sm font-semibold text-slate-100 tabular-nums">{formatCurrency(d.value)}</span>
                    </div>
                    <div className="h-1.5 bg-dark-200 rounded-full">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Statistics
