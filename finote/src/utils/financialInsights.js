// ─── Financial Insights Engine ───────────────────────────────────────────────
import { parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths, differenceInDays, getMonth } from 'date-fns'
import { getCategoryInfo } from './categories'
import { formatCurrency } from './formatCurrency'

// ── Helpers ─────────────────────────────────────────────────────────────────

const getMonthTxs = (transactions, date) =>
  transactions.filter(t => {
    try { return isWithinInterval(parseISO(t.date), { start: startOfMonth(date), end: endOfMonth(date) }) }
    catch { return false }
  })

const sumBy = (txs, type) =>
  txs.filter(t => t.type === type).reduce((s, t) => s + (t.amount || 0), 0)

const getCategoryTotals = (txs, type) => {
  const map = {}
  txs.filter(t => t.type === type).forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

const pctChange = (current, prev) =>
  prev > 0 ? Math.round(((current - prev) / prev) * 100) : null

// ── Insight builder helpers ──────────────────────────────────────────────────

const ins = (text, type, icon, tag, value = null) => ({ text, type, icon, tag, value })
// types: 'positive' | 'negative' | 'neutral' | 'warning'
// tags:  'savings' | 'spending' | 'income' | 'trend' | 'goal' | 'tip'

/**
 * Generate smart financial insights from transaction history.
 * Returns up to 12 insights sorted by priority/severity.
 *
 * @param {Array} allTransactions  All user transactions (any date)
 * @param {Array} savingsGoals     All savings goal objects
 * @returns {Array<Insight>}
 */
export const generateInsights = (allTransactions = [], savingsGoals = []) => {
  const results = []
  const now = new Date()
  const today = now.getDate()
  const daysInMonth = endOfMonth(now).getDate()

  const thisMonth = getMonthTxs(allTransactions, now)
  const lastMonth = getMonthTxs(allTransactions, subMonths(now, 1))
  const twoMonthAgo = getMonthTxs(allTransactions, subMonths(now, 2))

  const thisIncome = sumBy(thisMonth, 'income')
  const lastIncome = sumBy(lastMonth, 'income')
  const twoIncome  = sumBy(twoMonthAgo, 'income')
  const thisExpense = sumBy(thisMonth, 'expense')
  const lastExpense = sumBy(lastMonth, 'expense')
  const twoExpense  = sumBy(twoMonthAgo, 'expense')
  const thisBalance = thisIncome - thisExpense
  const lastBalance = lastIncome - lastExpense

  // Category maps
  const thisCats = getCategoryTotals(thisMonth, 'expense')
  const lastCatMap = Object.fromEntries(getCategoryTotals(lastMonth, 'expense'))
  const twoCatMap  = Object.fromEntries(getCategoryTotals(twoMonthAgo, 'expense'))

  const hasThisMonth = thisMonth.length > 0
  const hasLastMonth = lastMonth.length > 0
  const hasTwoMonths = twoMonthAgo.length > 0

  // ── 1. No data ─────────────────────────────────────────────────────────────
  if (allTransactions.length === 0) {
    results.push(ins(
      'Mulai catat transaksi untuk mendapatkan insight keuangan otomatis 💡',
      'neutral', '💡', 'tip'
    ))
    return results
  }

  // ── 2. Monthly balance trend ───────────────────────────────────────────────
  if (thisIncome > 0 && lastIncome > 0) {
    const diff = thisBalance - lastBalance
    const pct = Math.abs(Math.round((diff / Math.max(1, Math.abs(lastBalance))) * 100))
    if (diff > 0) {
      results.push(ins(
        `Saldo bersih bulan ini lebih tinggi ${formatCurrency(diff, true)} (+${pct}%) dibanding bulan lalu`,
        'positive', '📈', 'trend', { diff, pct }
      ))
    } else if (diff < 0 && lastBalance > 0) {
      results.push(ins(
        `Saldo bersih turun ${formatCurrency(Math.abs(diff), true)} (${pct}%) dibanding bulan lalu`,
        'negative', '📉', 'trend', { diff, pct }
      ))
    }
  }

  // ── 3. Surplus / deficit alert ─────────────────────────────────────────────
  if (thisIncome > 0) {
    const surplusRatio = thisBalance / thisIncome
    if (surplusRatio >= 0.3) {
      results.push(ins(
        `Hebat! Kamu menyimpan ${(surplusRatio * 100).toFixed(0)}% dari pemasukanmu bulan ini`,
        'positive', '💰', 'savings', { ratio: surplusRatio }
      ))
    } else if (thisBalance < 0) {
      results.push(ins(
        `Pengeluaran melebihi pemasukan ${formatCurrency(Math.abs(thisBalance), true)} bulan ini — evaluasi segera`,
        'warning', '⚠️', 'spending', { deficit: Math.abs(thisBalance) }
      ))
    }
  }

  // ── 4. Income growth / drop ────────────────────────────────────────────────
  if (thisIncome > 0 && lastIncome > 0) {
    const p = pctChange(thisIncome, lastIncome)
    if (p >= 15) {
      results.push(ins(
        `Pemasukan bulan ini naik ${p}% dibanding bulan lalu — pertahankan! 💪`,
        'positive', '💪', 'income', { pct: p }
      ))
    } else if (p <= -20) {
      results.push(ins(
        `Pemasukan turun ${Math.abs(p)}% dari bulan lalu — perhatikan arus kas kamu`,
        'warning', '📉', 'income', { pct: p }
      ))
    }
  }

  // ── 5. Total spending vs last month ───────────────────────────────────────
  if (thisExpense > 0 && lastExpense > 0) {
    const p = pctChange(thisExpense, lastExpense)
    if (p >= 20) {
      results.push(ins(
        `Pengeluaran total naik ${p}% dari bulan lalu — cek detail kategori`,
        'negative', '🔺', 'spending', { pct: p }
      ))
    } else if (p <= -15) {
      results.push(ins(
        `Pengeluaran turun ${Math.abs(p)}% dari bulan lalu — kerja bagus! 🏅`,
        'positive', '🏅', 'spending', { pct: p }
      ))
    }
  }

  // ── 6. Category-level spending spikes ─────────────────────────────────────
  thisCats.slice(0, 4).forEach(([cat, val]) => {
    const prev = lastCatMap[cat]
    if (!prev) return
    const p = pctChange(val, prev)
    const info = getCategoryInfo(cat, 'expense')
    if (p >= 30) {
      results.push(ins(
        `${info.icon} Pengeluaran ${info.label} melonjak ${p}% dari bulan lalu (${formatCurrency(val, true)})`,
        'negative', info.icon, 'spending', { cat, pct: p, amount: val }
      ))
    } else if (p <= -25) {
      results.push(ins(
        `${info.icon} Pengeluaran ${info.label} turun ${Math.abs(p)}% — hemat ${formatCurrency(prev - val, true)}!`,
        'positive', info.icon, 'spending', { cat, pct: p, saved: prev - val }
      ))
    }
  })

  // ── 7. Dominant spending category ─────────────────────────────────────────
  if (thisCats.length > 0 && thisExpense > 0) {
    const [topCat, topVal] = thisCats[0]
    const pct = Math.round((topVal / thisExpense) * 100)
    const info = getCategoryInfo(topCat, 'expense')
    if (pct >= 45) {
      results.push(ins(
        `${info.icon} ${info.label} mengambil ${pct}% dari total pengeluaran bulan ini — pertimbangkan mengurangi`,
        'neutral', info.icon, 'spending', { cat: topCat, pct, amount: topVal }
      ))
    }
  }

  // ── 8. New category appearing ─────────────────────────────────────────────
  thisCats.forEach(([cat, val]) => {
    if (!lastCatMap[cat] && !twoCatMap[cat] && val > 0) {
      const info = getCategoryInfo(cat, 'expense')
      if (val > 50000) { // Only flag if >50k
        results.push(ins(
          `${info.icon} Kategori baru muncul bulan ini: ${info.label} sebesar ${formatCurrency(val, true)}`,
          'neutral', info.icon, 'spending', { cat, amount: val }
        ))
      }
    }
  })

  // ── 9. 3-month expense trend ──────────────────────────────────────────────
  if (thisExpense > 0 && lastExpense > 0 && twoExpense > 0) {
    const trend1 = pctChange(lastExpense, twoExpense)
    const trend2 = pctChange(thisExpense, lastExpense)
    if (trend1 > 0 && trend2 > 0) {
      results.push(ins(
        `Pengeluaran terus naik 3 bulan berturut-turut — pertimbangkan membuat anggaran`,
        'warning', '📊', 'trend'
      ))
    } else if (trend1 < 0 && trend2 < 0) {
      results.push(ins(
        `Pengeluaran terus turun 3 bulan berturut-turut — tren sangat positif! 🎉`,
        'positive', '🎉', 'trend'
      ))
    }
  }

  // ── 10. Income consistency ────────────────────────────────────────────────
  if (thisIncome > 0 && lastIncome > 0 && twoIncome > 0) {
    results.push(ins(
      'Pemasukan tercatat konsisten 3 bulan berturut-turut 🏆',
      'positive', '🏆', 'income'
    ))
  } else if (thisIncome === 0 && lastIncome > 0) {
    results.push(ins(
      'Belum ada pemasukan tercatat bulan ini — jangan lupa catat penghasilanmu',
      'warning', '⚡', 'income'
    ))
  }

  // ── 11. Savings goals ─────────────────────────────────────────────────────
  savingsGoals.forEach(g => {
    if (!g.target_amount) return
    const pct = Math.round((g.current_amount / g.target_amount) * 100)
    const remaining = g.target_amount - g.current_amount

    if (pct >= 100) {
      results.push(ins(`🎉 Target "${g.title}" sudah tercapai! Saatnya set target baru`, 'positive', '🎉', 'goal', { goal: g.title, pct }))
    } else if (pct >= 80) {
      results.push(ins(`Target "${g.title}" hampir tercapai (${pct}%) — butuh ${formatCurrency(remaining, true)} lagi`, 'positive', '🎯', 'goal', { goal: g.title, pct, remaining }))
    } else if (pct >= 50) {
      results.push(ins(`Target "${g.title}" sudah ${pct}% — terus semangat! 💪`, 'positive', '💪', 'goal', { goal: g.title, pct }))
    }
  })

  // ── 12. Month-end budget projection ───────────────────────────────────────
  if (thisIncome > 0 && thisExpense > 0 && today >= 7 && today < daysInMonth) {
    const dailyBurnRate = thisExpense / today
    const projectedMonthlyExpense = dailyBurnRate * daysInMonth
    const projectedBalance = thisIncome - projectedMonthlyExpense
    if (projectedBalance < 0 && thisBalance >= 0) {
      results.push(ins(
        `Proyeksi akhir bulan: pengeluaran bisa mencapai ${formatCurrency(projectedMonthlyExpense, true)} jika tren berlanjut`,
        'warning', '🔮', 'tip', { projected: projectedMonthlyExpense }
      ))
    } else if (projectedBalance > 0) {
      const projSavings = projectedBalance / thisIncome
      if (projSavings >= 0.2) {
        results.push(ins(
          `Proyeksi akhir bulan: kamu bisa menyimpan ~${(projSavings * 100).toFixed(0)}% dari pemasukan`,
          'positive', '🔮', 'tip', { ratio: projSavings }
        ))
      }
    }
  }

  // ── 13. Zero spending (great month) ──────────────────────────────────────
  if (thisExpense === 0 && thisIncome > 0) {
    results.push(ins('Belum ada pengeluaran tercatat bulan ini — sangat hemat! 🌟', 'positive', '🌟', 'spending'))
  }

  // ── 14. Actionable saving tip ─────────────────────────────────────────────
  if (thisIncome > 0 && thisBalance < thisIncome * 0.1 && thisBalance >= 0) {
    const toSave = Math.round(thisIncome * 0.2)
    results.push(ins(
      `💡 Tip: Coba sisihkan 20% dari pemasukan (${formatCurrency(toSave, true)}) ke tabungan setiap bulan`,
      'neutral', '💡', 'tip'
    ))
  }

  // Sort: warning first, then negative, then positive, then neutral
  const priority = { warning: 0, negative: 1, positive: 2, neutral: 3 }
  results.sort((a, b) => priority[a.type] - priority[b.type])

  return results.slice(0, 12)
}

// ── Health Score ─────────────────────────────────────────────────────────────

/**
 * Calculate Financial Health Score 0-100
 *
 * Scoring Dimensions:
 *   1. Savings Ratio        — 25 pts
 *   2. Expense Control      — 25 pts
 *   3. Income Consistency   — 20 pts
 *   4. Balance Trend        — 15 pts
 *   5. Savings Goal Progress — 15 pts
 */
export const calculateHealthScore = (allTransactions = [], savingsGoals = []) => {
  const now = new Date()
  const thisMonthTxs = getMonthTxs(allTransactions, now)
  const lastMonthTxs = getMonthTxs(allTransactions, subMonths(now, 1))
  const twoMonthsAgoTxs = getMonthTxs(allTransactions, subMonths(now, 2))

  const thisIncome = sumBy(thisMonthTxs, 'income')
  const thisExpense = sumBy(thisMonthTxs, 'expense')
  const lastIncome = sumBy(lastMonthTxs, 'income')
  const lastExpense = sumBy(lastMonthTxs, 'expense')
  const twoMonthIncome = sumBy(twoMonthsAgoTxs, 'income')

  const hasData = allTransactions.length > 0

  // 1. Savings Ratio (max 25 pts): full at 20% savings rate
  let savingsScore = 0
  let savingsRatio = 0
  let savingsTip = 'Catat pemasukan untuk menghitung rasio tabungan'
  if (thisIncome > 0) {
    const saved = thisIncome - thisExpense
    savingsRatio = Math.max(0, saved / thisIncome)
    savingsScore = Math.min(25, Math.round((savingsRatio / 0.20) * 25))
    if (savingsRatio >= 0.20) savingsTip = `Tabungan ${(savingsRatio * 100).toFixed(0)}% dari pemasukan — luar biasa!`
    else if (savingsRatio > 0) savingsTip = `Tabungan ${(savingsRatio * 100).toFixed(0)}% — target 20% untuk skor penuh`
    else savingsTip = 'Pengeluaran melebihi pemasukan bulan ini'
  } else if (!hasData) {
    savingsTip = 'Mulai catat transaksi untuk mendapatkan skor'
  }

  // 2. Expense Control (max 25 pts)
  let expenseScore = 0
  let expenseRatio = 0
  let expenseTip = 'Catat pemasukan dan pengeluaran untuk analisis'
  if (thisIncome > 0) {
    expenseRatio = thisExpense / thisIncome
    if (expenseRatio <= 0.50) { expenseScore = 25; expenseTip = `Pengeluaran hanya ${(expenseRatio*100).toFixed(0)}% dari pemasukan — sangat hemat!` }
    else if (expenseRatio <= 0.70) { expenseScore = 18; expenseTip = `Pengeluaran ${(expenseRatio*100).toFixed(0)}% dari pemasukan — cukup baik` }
    else if (expenseRatio <= 0.90) { expenseScore = 10; expenseTip = `Pengeluaran ${(expenseRatio*100).toFixed(0)}% — coba kurangi pengeluaran tidak perlu` }
    else if (expenseRatio <= 1.00) { expenseScore = 5; expenseTip = 'Pengeluaran mendekati batas pemasukan — waspada!' }
    else { expenseScore = 0; expenseTip = `Pengeluaran melebihi pemasukan ${(expenseRatio*100).toFixed(0)}% — segera evaluasi` }
  } else if (thisExpense === 0 && hasData) {
    expenseScore = 15; expenseTip = 'Belum ada data pemasukan bulan ini'
  }

  // 3. Income Consistency (max 20 pts)
  let consistencyScore = 0
  let consistencyTip = 'Belum ada riwayat pemasukan'
  const monthsWithIncome = [thisIncome > 0, lastIncome > 0, twoMonthIncome > 0].filter(Boolean).length
  if (monthsWithIncome >= 3) { consistencyScore = 20; consistencyTip = 'Pemasukan konsisten 3 bulan berturut-turut 🏆' }
  else if (monthsWithIncome === 2) { consistencyScore = 15; consistencyTip = 'Pemasukan 2 bulan berturut-turut — pertahankan!' }
  else if (monthsWithIncome === 1) { consistencyScore = 8; consistencyTip = 'Baru 1 bulan terdata — terus catat secara rutin' }

  // 4. Balance Trend (max 15 pts)
  let trendScore = 0
  let trendTip = 'Belum cukup data untuk menghitung tren'
  const thisBalance = thisIncome - thisExpense
  const lastBalance = lastIncome - lastExpense
  if (thisBalance > 0 && thisBalance >= lastBalance && lastBalance >= 0) { trendScore = 15; trendTip = 'Tren keuangan positif dan meningkat 📈' }
  else if (thisBalance > 0 && thisBalance >= lastBalance) { trendScore = 12; trendTip = 'Surplus bulan ini — pertahankan!' }
  else if (thisBalance > 0) { trendScore = 8; trendTip = 'Masih surplus meski sedikit menurun' }
  else if (thisBalance === 0 && thisIncome > 0) { trendScore = 4; trendTip = 'Impas — tidak ada tabungan bulan ini' }
  else if (thisIncome > 0) { trendScore = 0; trendTip = 'Defisit — pengeluaran melebihi pemasukan' }

  // 5. Savings Goal Progress (max 15 pts)
  let goalScore = 0
  let goalTip = 'Buat target tabungan untuk mendapatkan poin bonus'
  if (savingsGoals.length > 0) {
    const avgProgress = savingsGoals.reduce((s, g) =>
      s + (g.target_amount > 0 ? Math.min(1, g.current_amount / g.target_amount) : 0)
    , 0) / savingsGoals.length
    goalScore = Math.round(avgProgress * 15)
    const completedCount = savingsGoals.filter(g => g.target_amount > 0 && g.current_amount >= g.target_amount).length
    if (completedCount === savingsGoals.length && completedCount > 0) goalTip = 'Semua target tabungan tercapai! 🎉'
    else goalTip = `Rata-rata progres tabungan ${(avgProgress * 100).toFixed(0)}% dari target`
  }

  const total = Math.max(0, Math.min(100, savingsScore + expenseScore + consistencyScore + trendScore + goalScore))

  const breakdown = {
    savings:     { score: savingsScore,     max: 25, label: 'Rasio Tabungan',        tip: savingsTip,     icon: '💰' },
    expense:     { score: expenseScore,     max: 25, label: 'Kontrol Pengeluaran',   tip: expenseTip,     icon: '💸' },
    consistency: { score: consistencyScore, max: 20, label: 'Konsistensi Pemasukan', tip: consistencyTip, icon: '📅' },
    trend:       { score: trendScore,       max: 15, label: 'Tren Keuangan',         tip: trendTip,       icon: '📊' },
    goals:       { score: goalScore,        max: 15, label: 'Target Tabungan',       tip: goalTip,        icon: '🎯' },
  }

  const getStatus = (s) => {
    if (s >= 85) return { label: 'Excellent', labelId: 'Sangat Baik',     color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   emoji: '🏆' }
    if (s >= 70) return { label: 'Good',      labelId: 'Baik',            color: '#6366F1', bg: 'rgba(99,102,241,0.12)', emoji: '✨' }
    if (s >= 50) return { label: 'Fair',      labelId: 'Cukup',           color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', emoji: '⚡' }
    if (s >= 25) return { label: 'Poor',      labelId: 'Perlu Perbaikan', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  emoji: '⚠️' }
    return { label: 'Critical', labelId: 'Kritis', color: '#DC2626', bg: 'rgba(220,38,38,0.15)', emoji: '🆘' }
  }

  return { score: total, breakdown, status: getStatus(total), savingsRatio, expenseRatio, monthsWithIncome }
}
