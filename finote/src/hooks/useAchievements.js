import { useMemo, useEffect, useState, useCallback } from 'react'
import { useAllTransactions } from './useTransactions'
import { useSavings } from './useSavings'
import { useMemos } from './useMemos'
import { parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

// ── localStorage key scoped per user ─────────────────────────────────────────
const seenKey = (uid) => `finote_seen_achievements_${uid ?? 'anon'}`

const loadSeen = (uid) => {
  try { return new Set(JSON.parse(localStorage.getItem(seenKey(uid)) || '[]')) }
  catch { return new Set() }
}

const saveSeen = (uid, set) => {
  try { localStorage.setItem(seenKey(uid), JSON.stringify([...set])) }
  catch { /* storage full — ignore */ }
}

// ── Rarity tiers ─────────────────────────────────────────────────────────────
export const RARITY = {
  common:    { label: 'Common',    color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', xp: 50  },
  rare:      { label: 'Rare',      color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  xp: 100 },
  epic:      { label: 'Epic',      color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', xp: 200 },
  legendary: { label: 'Legendary', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', xp: 500 },
}

// ── Categories ────────────────────────────────────────────────────────────────
export const CATEGORIES = {
  transactions: { label: 'Pencatatan',      icon: '📝', color: '#6366F1' },
  savings:      { label: 'Tabungan',        icon: '🐷', color: '#22C55E' },
  habits:       { label: 'Kebiasaan Baik',  icon: '⚡', color: '#F59E0B' },
  health:       { label: 'Kesehatan Finansial', icon: '📊', color: '#EC4899' },
}

// ── Helper ────────────────────────────────────────────────────────────────────
const getMonthTxs = (txs, date) =>
  txs.filter(t => {
    try { return isWithinInterval(parseISO(t.date), { start: startOfMonth(date), end: endOfMonth(date) }) }
    catch { return false }
  })

// ── Achievement definitions ───────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  // ── TRANSACTIONS ──────────────────────────────────────────────────────────
  {
    id: 'first_transaction',
    category: 'transactions',
    rarity: 'common',
    title: 'Langkah Pertama',
    desc: 'Catat transaksi pertamamu',
    icon: '🎯',
    xpBonus: 0,
    check: ({ transactions }) => transactions.length >= 1,
    progress: ({ transactions }) => ({ current: Math.min(transactions.length, 1), max: 1 }),
    tip: 'Catat satu transaksi apa saja',
  },
  {
    id: 'ten_transactions',
    category: 'transactions',
    rarity: 'common',
    title: 'Rajin Mencatat',
    desc: 'Catat 10 transaksi',
    icon: '📝',
    xpBonus: 0,
    check: ({ transactions }) => transactions.length >= 10,
    progress: ({ transactions }) => ({ current: Math.min(transactions.length, 10), max: 10 }),
    tip: 'Catat setiap pemasukan dan pengeluaranmu',
  },
  {
    id: 'thirty_transactions',
    category: 'transactions',
    rarity: 'rare',
    title: 'Finansial Master',
    desc: 'Catat 30 transaksi',
    icon: '🏆',
    xpBonus: 50,
    check: ({ transactions }) => transactions.length >= 30,
    progress: ({ transactions }) => ({ current: Math.min(transactions.length, 30), max: 30 }),
    tip: 'Konsisten mencatat hingga 30 transaksi',
  },
  {
    id: 'hundred_transactions',
    category: 'transactions',
    rarity: 'epic',
    title: 'Catatan Legenda',
    desc: 'Catat 100 transaksi — kamu luar biasa!',
    icon: '💎',
    xpBonus: 150,
    check: ({ transactions }) => transactions.length >= 100,
    progress: ({ transactions }) => ({ current: Math.min(transactions.length, 100), max: 100 }),
    tip: 'Terus catat setiap hari',
  },
  {
    id: 'both_types',
    category: 'transactions',
    rarity: 'common',
    title: 'Budget Master',
    desc: 'Catat pemasukan dan pengeluaran dalam satu bulan',
    icon: '⚡',
    xpBonus: 0,
    check: ({ transactions }) => {
      const monthMap = {}
      transactions.forEach(t => {
        const key = t.date?.slice(0, 7)
        if (!monthMap[key]) monthMap[key] = { income: false, expense: false }
        if (t.type === 'income') monthMap[key].income = true
        if (t.type === 'expense') monthMap[key].expense = true
      })
      return Object.values(monthMap).some(m => m.income && m.expense)
    },
    progress: ({ transactions }) => {
      const hasIncome = transactions.some(t => t.type === 'income')
      const hasExpense = transactions.some(t => t.type === 'expense')
      return { current: (hasIncome ? 1 : 0) + (hasExpense ? 1 : 0), max: 2 }
    },
    tip: 'Catat setidaknya satu pemasukan dan satu pengeluaran',
  },

  // ── SAVINGS ────────────────────────────────────────────────────────────────
  {
    id: 'first_savings_goal',
    category: 'savings',
    rarity: 'common',
    title: 'Pemimpi Ambisius',
    desc: 'Buat target tabungan pertama',
    icon: '🐷',
    xpBonus: 0,
    check: ({ goals }) => goals.length >= 1,
    progress: ({ goals }) => ({ current: Math.min(goals.length, 1), max: 1 }),
    tip: 'Buat satu target tabungan di halaman Tabungan',
  },
  {
    id: 'goal_completed',
    category: 'savings',
    rarity: 'epic',
    title: 'Impian Terwujud',
    desc: 'Capai 100% satu target tabungan',
    icon: '🎉',
    xpBonus: 100,
    check: ({ goals }) => goals.some(g => g.target_amount > 0 && g.current_amount >= g.target_amount),
    progress: ({ goals }) => {
      const best = goals.reduce((max, g) => {
        const pct = g.target_amount > 0 ? g.current_amount / g.target_amount : 0
        return Math.max(max, pct)
      }, 0)
      return { current: Math.round(Math.min(best, 1) * 100), max: 100, suffix: '%' }
    },
    tip: 'Selesaikan satu target tabungan hingga 100%',
  },
  {
    id: 'savings_champion',
    category: 'savings',
    rarity: 'rare',
    title: 'Savings Champion',
    desc: 'Buat 3 target tabungan',
    icon: '👑',
    xpBonus: 50,
    check: ({ goals }) => goals.length >= 3,
    progress: ({ goals }) => ({ current: Math.min(goals.length, 3), max: 3 }),
    tip: 'Buat total 3 target tabungan',
  },
  {
    id: 'savings_legend',
    category: 'savings',
    rarity: 'legendary',
    title: 'Penabung Sejati',
    desc: 'Selesaikan 3 target tabungan berbeda',
    icon: '🌟',
    xpBonus: 300,
    check: ({ goals }) => goals.filter(g => g.target_amount > 0 && g.current_amount >= g.target_amount).length >= 3,
    progress: ({ goals }) => ({
      current: Math.min(goals.filter(g => g.target_amount > 0 && g.current_amount >= g.target_amount).length, 3),
      max: 3,
    }),
    tip: 'Selesaikan 3 target tabungan berbeda',
  },

  // ── HABITS ─────────────────────────────────────────────────────────────────
  {
    id: 'first_memo',
    category: 'habits',
    rarity: 'common',
    title: 'Pemikir Terorganisir',
    desc: 'Buat catatan pertama',
    icon: '💡',
    xpBonus: 0,
    check: ({ memos }) => memos.length >= 1,
    progress: ({ memos }) => ({ current: Math.min(memos.length, 1), max: 1 }),
    tip: 'Buat satu catatan di halaman Memo',
  },
  {
    id: 'consistent_month',
    category: 'habits',
    rarity: 'rare',
    title: 'Disiplin Finansial',
    desc: 'Catat transaksi di 2 bulan berturut-turut',
    icon: '📅',
    xpBonus: 75,
    check: ({ transactions }) => {
      const now = new Date()
      const thisMonth = getMonthTxs(transactions, now)
      const lastMonth = getMonthTxs(transactions, subMonths(now, 1))
      return thisMonth.length > 0 && lastMonth.length > 0
    },
    progress: ({ transactions }) => {
      const now = new Date()
      const thisMonth = getMonthTxs(transactions, now)
      const lastMonth = getMonthTxs(transactions, subMonths(now, 1))
      return { current: (thisMonth.length > 0 ? 1 : 0) + (lastMonth.length > 0 ? 1 : 0), max: 2 }
    },
    tip: 'Catat transaksi di bulan ini dan bulan lalu',
  },
  {
    id: 'three_months_streak',
    category: 'habits',
    rarity: 'epic',
    title: 'Tiga Bulan Beruntun',
    desc: 'Catat transaksi di 3 bulan berturut-turut',
    icon: '🔥',
    xpBonus: 150,
    check: ({ transactions }) => {
      const now = new Date()
      return [0, 1, 2].every(n => getMonthTxs(transactions, subMonths(now, n)).length > 0)
    },
    progress: ({ transactions }) => {
      const now = new Date()
      const filled = [0, 1, 2].filter(n => getMonthTxs(transactions, subMonths(now, n)).length > 0).length
      return { current: filled, max: 3 }
    },
    tip: 'Catat transaksi di 3 bulan berturut-turut',
  },

  // ── FINANCIAL HEALTH ───────────────────────────────────────────────────────
  {
    id: 'positive_balance',
    category: 'health',
    rarity: 'common',
    title: 'Arus Positif',
    desc: 'Pemasukan lebih besar dari pengeluaran bulan ini',
    icon: '💚',
    xpBonus: 0,
    check: ({ transactions }) => {
      const now = new Date()
      const txs = getMonthTxs(transactions, now)
      const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return income > 0 && income > expense
    },
    progress: ({ transactions }) => {
      const now = new Date()
      const txs = getMonthTxs(transactions, now)
      const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const ratio = income > 0 ? Math.min((income - expense) / income, 1) : 0
      return { current: Math.round(Math.max(0, ratio) * 100), max: 100, suffix: '%' }
    },
    tip: 'Pastikan pemasukan bulan ini lebih besar dari pengeluaran',
  },
  {
    id: 'saver_20',
    category: 'health',
    rarity: 'rare',
    title: 'Penabung 20%',
    desc: 'Simpan minimal 20% dari pemasukan dalam satu bulan',
    icon: '💰',
    xpBonus: 100,
    check: ({ transactions }) => {
      const now = new Date()
      const txs = getMonthTxs(transactions, now)
      const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return income > 0 && (income - expense) / income >= 0.20
    },
    progress: ({ transactions }) => {
      const now = new Date()
      const txs = getMonthTxs(transactions, now)
      const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const ratio = income > 0 ? Math.min((income - expense) / income, 0.20) : 0
      return { current: Math.round(Math.max(0, ratio / 0.20) * 100), max: 100, suffix: '%' }
    },
    tip: 'Hemat pengeluaran agar sisa pemasukan ≥ 20%',
  },
  {
    id: 'wealth_builder',
    category: 'health',
    rarity: 'legendary',
    title: 'Wealth Builder',
    desc: 'Total saldo positif dan punya 2+ target tabungan aktif',
    icon: '🚀',
    xpBonus: 400,
    check: ({ transactions, goals }) => {
      const balance = transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
      const activeGoals = goals.filter(g => g.target_amount > 0 && g.current_amount < g.target_amount)
      return balance > 0 && activeGoals.length >= 2
    },
    progress: ({ transactions, goals }) => {
      const balance = transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
      const activeGoals = goals.filter(g => g.target_amount > 0 && g.current_amount < g.target_amount)
      return { current: (balance > 0 ? 1 : 0) + Math.min(activeGoals.length, 2), max: 3 }
    },
    tip: 'Miliki saldo positif + 2 target tabungan aktif',
  },
]

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAchievements = () => {
  const { user } = useAuth()
  const { allTransactions } = useAllTransactions()
  const { goals } = useSavings()
  const { memos } = useMemos()

  // Seen IDs — persisted in localStorage per user so they survive page refresh / login
  const [seenIds, setSeenIds] = useState(() => loadSeen(user?.id))

  // Re-load from storage when user changes (login / logout)
  useEffect(() => {
    setSeenIds(loadSeen(user?.id))
  }, [user?.id])

  const ctx = useMemo(() => ({ transactions: allTransactions, goals, memos }), [allTransactions, goals, memos])

  const achievements = useMemo(() =>
    ACHIEVEMENTS.map(a => ({
      ...a,
      rarityMeta: RARITY[a.rarity],
      categoryMeta: CATEGORIES[a.category],
      unlocked: a.check(ctx),
      progressData: a.progress(ctx),
      xp: RARITY[a.rarity].xp + (a.xpBonus || 0),
    }))
  , [ctx])

  // Achievements that are unlocked but the user hasn't seen the popup for yet
  const newlyUnlocked = useMemo(
    () => achievements.filter(a => a.unlocked && !seenIds.has(a.id)),
    [achievements, seenIds]
  )

  // Call this after the popup is shown so it never appears again
  const markSeen = useCallback((id) => {
    setSeenIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveSeen(user?.id, next)
      return next
    })
  }, [user?.id])

  const unlocked = achievements.filter(a => a.unlocked)
  const locked   = achievements.filter(a => !a.unlocked)
  const totalXP  = unlocked.reduce((s, a) => s + a.xp, 0)

  // Group by category
  const byCategory = Object.keys(CATEGORIES).reduce((acc, cat) => {
    acc[cat] = achievements.filter(a => a.category === cat)
    return acc
  }, {})

  return {
    achievements,
    unlocked,
    locked,
    byCategory,
    total: ACHIEVEMENTS.length,
    unlockedCount: unlocked.length,
    totalXP,
    maxXP: ACHIEVEMENTS.reduce((s, a) => s + RARITY[a.rarity].xp + (a.xpBonus || 0), 0),
    newlyUnlocked,
    markSeen,
  }
}

export { ACHIEVEMENTS as default }
