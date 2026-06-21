// ─── Financial Insights Engine ───────────────────────────────────────────────
import { parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { getCategoryInfo } from './categories'
import { formatCurrency } from './formatCurrency'

const getMonthTxs = (transactions, date) =>
  transactions.filter(t => {
    try { return isWithinInterval(parseISO(t.date), { start: startOfMonth(date), end: endOfMonth(date) }) }
    catch { return false }
  })

const sumBy = (txs, type) =>
  txs.filter(t => t.type === type).reduce((s, t) => s + (t.amount || 0), 0)

const getCategoryTotal = (txs, type) => {
  const map = {}
  txs.filter(t => t.type === type).forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

/**
 * Generate smart text insights from transaction data
 * @param {Array} allTransactions
 * @param {Array} savingsGoals
 * @returns {Array<{text: string, type: 'positive'|'negative'|'neutral', icon: string}>}
 */
export const generateInsights = (allTransactions = [], savingsGoals = []) => {
  const insights = []
  const now = new Date()
  const thisMonth = getMonthTxs(allTransactions, now)
  const lastMonth = getMonthTxs(allTransactions, subMonths(now, 1))

  const thisIncome = sumBy(thisMonth, 'income')
  const lastIncome = sumBy(lastMonth, 'income')
  const thisExpense = sumBy(thisMonth, 'expense')
  const lastExpense = sumBy(lastMonth, 'expense')
  const thisBalance = thisIncome - thisExpense
  const lastBalance = lastIncome - lastExpense

  // Balance trend
  if (lastBalance !== 0 && thisIncome > 0) {
    const diff = thisBalance - lastBalance
    if (diff > 0) {
      insights.push({ text: `Saldo bulan ini meningkat ${formatCurrency(diff, true)} dibanding bulan lalu 📈`, type: 'positive', icon: '📈' })
    } else if (diff < 0) {
      insights.push({ text: `Saldo bulan ini turun ${formatCurrency(Math.abs(diff), true)} dibanding bulan lalu`, type: 'negative', icon: '📉' })
    }
  }

  // Expense by category comparison
  const thisCats = getCategoryTotal(thisMonth, 'expense')
  const lastCatMap = {}
  getCategoryTotal(lastMonth, 'expense').forEach(([cat, val]) => { lastCatMap[cat] = val })

  thisCats.slice(0, 3).forEach(([cat, val]) => {
    const prev = lastCatMap[cat]
    if (!prev || prev === 0) return
    const pct = Math.round(((val - prev) / prev) * 100)
    const info = getCategoryInfo(cat, 'expense')
    if (Math.abs(pct) >= 10) {
      if (pct > 0) {
        insights.push({ text: `Pengeluaran ${info.label} naik ${pct}% dibanding bulan lalu ${info.icon}`, type: 'negative', icon: info.icon })
      } else {
        insights.push({ text: `Pengeluaran ${info.label} turun ${Math.abs(pct)}% — bagus! ${info.icon}`, type: 'positive', icon: info.icon })
      }
    }
  })

  // Savings goal progress
  savingsGoals.forEach(g => {
    if (g.target_amount > 0) {
      const pct = Math.round((g.current_amount / g.target_amount) * 100)
      if (pct >= 100) {
        insights.push({ text: `🎉 Target "${g.title}" telah tercapai!`, type: 'positive', icon: '🎉' })
      } else if (pct >= 75) {
        insights.push({ text: `Target "${g.title}" sudah ${pct}% — hampir sampai! 🎯`, type: 'positive', icon: '🎯' })
      }
    }
  })

  // Income consistency
  if (thisIncome > 0 && lastIncome > 0) {
    const incomeGrowth = Math.round(((thisIncome - lastIncome) / lastIncome) * 100)
    if (incomeGrowth > 20) {
      insights.push({ text: `Pemasukan bulan ini meningkat ${incomeGrowth}% — pertahankan! 💪`, type: 'positive', icon: '💪' })
    }
  }

  // Top spending
  if (thisCats.length > 0) {
    const [topCat, topVal] = thisCats[0]
    const info = getCategoryInfo(topCat, 'expense')
    if (thisExpense > 0) {
      const pct = Math.round((topVal / thisExpense) * 100)
      if (pct > 40) {
        insights.push({ text: `${info.icon} ${info.label} menyumbang ${pct}% dari total pengeluaranmu bulan ini`, type: 'neutral', icon: info.icon })
      }
    }
  }

  // No spending this month
  if (thisExpense === 0 && thisIncome > 0) {
    insights.push({ text: 'Belum ada pengeluaran bulan ini — hebat! 🌟', type: 'positive', icon: '🌟' })
  }

  // Not enough data
  if (allTransactions.length === 0) {
    insights.push({ text: 'Mulai catat transaksi untuk mendapatkan insight keuangan kamu 💡', type: 'neutral', icon: '💡' })
  }

  return insights.slice(0, 5)
}

/**
 * Calculate Financial Health Score 0-100
 */
export const calculateHealthScore = (allTransactions = [], savingsGoals = []) => {
  const now = new Date()
  const thisMonth = getMonthTxs(allTransactions, now)
  const lastMonth = getMonthTxs(allTransactions, subMonths(now, 1))

  let score = 50 // base
  const breakdown = {}

  const thisIncome = sumBy(thisMonth, 'income')
  const thisExpense = sumBy(thisMonth, 'expense')
  const lastIncome = sumBy(lastMonth, 'income')
  const lastExpense = sumBy(lastMonth, 'expense')

  // 1. Savings ratio (max 25 pts)
  const savingsRatio = thisIncome > 0 ? (thisIncome - thisExpense) / thisIncome : 0
  const savingsScore = Math.max(0, Math.min(25, Math.round(savingsRatio * 25 * 4)))
  breakdown.savings = { score: savingsScore, label: 'Rasio Tabungan', max: 25 }
  score = savingsScore

  // 2. Expense control (max 25 pts)
  let expenseScore = 0
  if (thisIncome > 0) {
    const expenseRatio = thisExpense / thisIncome
    expenseScore = expenseRatio <= 0.5 ? 25 : expenseRatio <= 0.7 ? 18 : expenseRatio <= 0.9 ? 10 : 3
  } else if (thisExpense === 0) {
    expenseScore = 15
  }
  breakdown.expense = { score: expenseScore, label: 'Kontrol Pengeluaran', max: 25 }
  score += expenseScore

  // 3. Income consistency (max 20 pts)
  let consistencyScore = 0
  if (lastIncome > 0 && thisIncome > 0) {
    consistencyScore = 20
  } else if (thisIncome > 0) {
    consistencyScore = 12
  }
  breakdown.consistency = { score: consistencyScore, label: 'Konsistensi Pemasukan', max: 20 }
  score += consistencyScore

  // 4. Balance trend (max 15 pts)
  let trendScore = 0
  const thisBalance = thisIncome - thisExpense
  const lastBalance = lastIncome - lastExpense
  if (thisBalance > 0 && thisBalance >= lastBalance) trendScore = 15
  else if (thisBalance > 0) trendScore = 10
  else if (thisBalance === 0) trendScore = 5
  breakdown.trend = { score: trendScore, label: 'Tren Keuangan', max: 15 }
  score += trendScore

  // 5. Savings goal progress (max 15 pts)
  let goalScore = 0
  if (savingsGoals.length > 0) {
    const avgProgress = savingsGoals.reduce((s, g) => {
      return s + (g.target_amount > 0 ? Math.min(1, g.current_amount / g.target_amount) : 0)
    }, 0) / savingsGoals.length
    goalScore = Math.round(avgProgress * 15)
  }
  breakdown.goals = { score: goalScore, label: 'Progress Tabungan', max: 15 }
  score += goalScore

  score = Math.max(0, Math.min(100, score))

  const getStatus = (s) => {
    if (s >= 90) return { label: 'Excellent', color: '#22C55E', ring: '#16A34A' }
    if (s >= 70) return { label: 'Good', color: '#6366F1', ring: '#4F46E5' }
    if (s >= 50) return { label: 'Fair', color: '#F59E0B', ring: '#D97706' }
    return { label: 'Needs Work', color: '#EF4444', ring: '#DC2626' }
  }

  return { score, breakdown, status: getStatus(score) }
}
