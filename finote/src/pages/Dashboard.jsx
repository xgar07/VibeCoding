import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Clock, Trophy, Plus, ChevronRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { useAllTransactions } from '../hooks/useTransactions'
import { useSavings } from '../hooks/useSavings'
import { useAchievements } from '../hooks/useAchievements'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate, getLast6Months } from '../utils/dateHelpers'
import { getCategoryInfo } from '../utils/categories'
import { generateInsights, calculateHealthScore } from '../utils/financialInsights'
import { StatCardSkeleton, ChartSkeleton } from '../components/common/SkeletonLoader'
import HealthScore from '../components/dashboard/HealthScore'
import SmartInsights from '../components/dashboard/SmartInsights'
import MonthlyReport from '../components/dashboard/MonthlyReport'
import AchievementCard from '../components/achievements/AchievementCard'
import { parseISO, isWithinInterval, startOfMonth, endOfMonth, format } from 'date-fns'
import { id } from 'date-fns/locale'

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#EF4444', '#06B6D4']

const StatCard = ({ title, value, icon: Icon, gradient, trend, trendLabel, delay = 0 }) => (
  <div className="stat-card animate-slide-up" style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-xl text-white ${gradient}`} style={{ background: gradient }}>
        <Icon size={16} className="text-white" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-lg
          ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-xl sm:text-2xl font-bold tabular-nums mb-0.5" style={{ color: 'var(--text-primary)' }}>
      {formatCurrency(value, true)}
    </p>
    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{title}</p>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2.5 text-xs shadow-card" style={{ border: '1px solid var(--border-strong)' }}>
      <p className="mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}: </span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.value, true)}</span>
        </div>
      ))}
    </div>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const { allTransactions, loading } = useAllTransactions()
  const { goals, totalSaved } = useSavings()
  const { unlocked: unlockedAchievements } = useAchievements()

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna'
  const firstName = userName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam'

  const now = new Date()

  const {
    chartData, pieData, thisMonthIncome, thisMonthExpenses, totalBalance, recentTx,
    insights, health, topExpenseCategory
  } = useMemo(() => {
    const months = getLast6Months()

    const inRange = (tx, start, end) => {
      try { return isWithinInterval(parseISO(tx.date), { start, end }) }
      catch { return false }
    }

    const thisStart = startOfMonth(now)
    const thisEnd = endOfMonth(now)
    const thisMonthTxs = allTransactions.filter(t => inRange(t, thisStart, thisEnd))
    const thisMonthIncome = thisMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const thisMonthExpenses = thisMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalBalance = allTransactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)

    // Area chart
    const chartData = months.map(m => {
      const txs = allTransactions.filter(t => inRange(t, m.start, m.end))
      return {
        name: m.label,
        Pemasukan: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        Pengeluaran: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    })

    // Pie chart
    const catMap = {}
    thisMonthTxs.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount })
    const pieData = Object.entries(catMap)
      .map(([cat, val]) => ({ name: getCategoryInfo(cat, 'expense').label, value: val }))
      .sort((a, b) => b.value - a.value).slice(0, 6)

    // Top expense category
    const topCatEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]
    const topExpenseCategory = topCatEntry ? { ...getCategoryInfo(topCatEntry[0], 'expense'), amount: topCatEntry[1] } : null

    // Insights & health
    const insights = generateInsights(allTransactions, goals)
    const health = calculateHealthScore(allTransactions, goals)
    const recentTx = allTransactions.slice(0, 6)

    return { chartData, pieData, thisMonthIncome, thisMonthExpenses, totalBalance, recentTx, insights, health, topExpenseCategory }
  }, [allTransactions, goals])

  if (loading) {
    return (
      <div className="page-container">
        <div className="space-y-1">
          <div className="skeleton h-7 w-52 rounded-lg" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {greeting}, <span className="text-gradient-primary">{firstName}!</span> 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {format(now, 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
        </div>
        <Link to="/income" className="btn-primary text-sm hidden sm:flex flex-shrink-0">
          <Plus size={14} /> Transaksi
        </Link>
      </div>

      {/* Hero Balance */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-slide-up"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', boxShadow: '0 8px 40px rgba(99,102,241,0.4)' }}>
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 left-8 w-28 h-28 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-indigo-200 text-xs font-medium mb-1">Total Saldo</p>
          <p className="text-3xl sm:text-4xl font-bold text-white mb-4 tabular-nums">
            {formatCurrency(totalBalance)}
          </p>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/15 rounded-lg"><TrendingUp size={12} className="text-white" /></div>
              <div>
                <p className="text-indigo-200 text-[10px]">Pemasukan</p>
                <p className="text-white text-sm font-bold">{formatCurrency(thisMonthIncome, true)}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/15 rounded-lg"><TrendingDown size={12} className="text-white" /></div>
              <div>
                <p className="text-indigo-200 text-[10px]">Pengeluaran</p>
                <p className="text-white text-sm font-bold">{formatCurrency(thisMonthExpenses, true)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Pemasukan Bulan Ini" value={thisMonthIncome} icon={TrendingUp}
          gradient="linear-gradient(135deg,#22C55E,#16A34A)" delay={0} />
        <StatCard title="Pengeluaran Bulan Ini" value={thisMonthExpenses} icon={TrendingDown}
          gradient="linear-gradient(135deg,#EF4444,#DC2626)" delay={60} />
        <StatCard title="Surplus / Defisit" value={thisMonthIncome - thisMonthExpenses} icon={Wallet}
          gradient="linear-gradient(135deg,#6366F1,#8B5CF6)" delay={120} />
        <StatCard title="Total Tabungan" value={totalSaved} icon={PiggyBank}
          gradient="linear-gradient(135deg,#F59E0B,#D97706)" delay={180} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="card p-4 sm:p-5 lg:col-span-2 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Tren Keuangan</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" />Masuk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Keluar</span>
            </div>
          </div>
          {chartData.some(d => d.Pemasukan > 0 || d.Pengeluaran > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : `${(v/1e3).toFixed(0)}Rb`} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Pemasukan" stroke="#6366F1" strokeWidth={2} fill="url(#gi)" dot={{ r: 2.5, fill: '#6366F1', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#EF4444" strokeWidth={2} fill="url(#ge)" dot={{ r: 2.5, fill: '#EF4444', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>
              Belum ada data transaksi
            </div>
          )}
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 ? (
          <div className="card p-4 sm:p-5 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <div className="mb-3">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pengeluaran</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bulan ini per kategori</p>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={62}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i] }} />
                    <span className="text-xs truncate max-w-[90px]" style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(d.value, true)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-4 sm:p-5 animate-slide-up flex items-center justify-center" style={{ animationDelay: '80ms' }}>
            <div className="text-center py-4">
              <p className="text-3xl mb-2">🧾</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Belum ada pengeluaran</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Catat pengeluaran pertamamu</p>
            </div>
          </div>
        )}
      </div>

      {/* Insights + Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health Score — always shown */}
        <HealthScore score={health.score} status={health.status} breakdown={health.breakdown} />
        {/* Smart Insights — 2 cols wide */}
        <div className="lg:col-span-2">
          <SmartInsights insights={insights} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="card p-4 sm:p-5 lg:col-span-2 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: 'var(--text-muted)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Aktivitas Terbaru</h2>
            </div>
            <Link to="/expenses" className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:underline">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>
          {recentTx.length > 0 ? (
            <div className="space-y-1">
              {recentTx.map(tx => {
                const info = getCategoryInfo(tx.category, tx.type)
                return (
                  <div key={tx.id} className="table-row">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${info.bg}`}>{info.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description || info.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(tx.date)}</p>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, true)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state py-8">
              <p className="text-2xl mb-2">💸</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Belum ada transaksi</p>
              <Link to="/income" className="mt-3 btn-primary text-xs"><Plus size={12} /> Tambah Pertama</Link>
            </div>
          )}
        </div>

        {/* Right col: Monthly Report + Achievement preview */}
        <div className="space-y-4">
          <MonthlyReport
            income={thisMonthIncome}
            expenses={thisMonthExpenses}
            savings={totalSaved}
            topCategory={topExpenseCategory}
            score={health.score}
            monthLabel={format(now, 'MMMM yyyy', { locale: id })}
          />

          {/* Achievement snippet */}
          {unlockedAchievements.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={13} className="text-amber-400" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pencapaian</span>
                </div>
                <Link to="/achievements" className="text-xs text-indigo-400 hover:underline">Lihat</Link>
              </div>
              <div className="space-y-2">
                {unlockedAchievements.slice(-2).map(a => (
                  <AchievementCard key={a.id} achievement={a} compact />
                ))}
              </div>
            </div>
          )}

          {/* Savings Goals */}
          {goals.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Target Tabungan</span>
                <Link to="/savings" className="text-xs text-indigo-400 hover:underline">Lihat</Link>
              </div>
              {goals.slice(0, 2).map(g => {
                const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0
                return (
                  <div key={g.id} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium truncate pr-2" style={{ color: 'var(--text-primary)' }}>{g.title}</span>
                      <span className="tabular-nums flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar h-1.5">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: g.color || '#6366F1' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
