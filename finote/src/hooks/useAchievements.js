import { useMemo } from 'react'
import { useAllTransactions } from './useTransactions'
import { useSavings } from './useSavings'
import { useMemos } from './useMemos'

const ACHIEVEMENTS = [
  {
    id: 'first_transaction',
    title: 'Transaksi Pertama',
    desc: 'Catat transaksi pertamamu',
    icon: '🎯',
    check: ({ transactions }) => transactions.length >= 1,
    progress: ({ transactions }) => ({ current: Math.min(transactions.length, 1), max: 1 }),
  },
  {
    id: 'ten_transactions',
    title: 'Rajin Mencatat',
    desc: 'Catat 10 transaksi',
    icon: '📝',
    check: ({ transactions }) => transactions.length >= 10,
    progress: ({ transactions }) => ({ current: Math.min(transactions.length, 10), max: 10 }),
  },
  {
    id: 'thirty_transactions',
    title: 'Finansial Master',
    desc: 'Catat 30 transaksi',
    icon: '🏆',
    check: ({ transactions }) => transactions.length >= 30,
    progress: ({ transactions }) => ({ current: Math.min(transactions.length, 30), max: 30 }),
  },
  {
    id: 'first_savings_goal',
    title: 'Pemimpi Ambisius',
    desc: 'Buat target tabungan pertama',
    icon: '🐷',
    check: ({ goals }) => goals.length >= 1,
    progress: ({ goals }) => ({ current: Math.min(goals.length, 1), max: 1 }),
  },
  {
    id: 'goal_completed',
    title: 'Impian Terwujud',
    desc: 'Capai 100% satu target tabungan',
    icon: '🎉',
    check: ({ goals }) => goals.some(g => g.current_amount >= g.target_amount),
    progress: ({ goals }) => {
      const best = goals.reduce((max, g) => {
        const pct = g.target_amount > 0 ? g.current_amount / g.target_amount : 0
        return Math.max(max, pct)
      }, 0)
      return { current: Math.round(Math.min(best, 1) * 100), max: 100, suffix: '%' }
    },
  },
  {
    id: 'first_memo',
    title: 'Pemikir Terorganisir',
    desc: 'Buat catatan pertama',
    icon: '💡',
    check: ({ memos }) => memos.length >= 1,
    progress: ({ memos }) => ({ current: Math.min(memos.length, 1), max: 1 }),
  },
  {
    id: 'savings_champion',
    title: 'Savings Champion',
    desc: 'Buat 3 target tabungan',
    icon: '👑',
    check: ({ goals }) => goals.length >= 3,
    progress: ({ goals }) => ({ current: Math.min(goals.length, 3), max: 3 }),
  },
  {
    id: 'budget_master',
    title: 'Budget Master',
    desc: 'Catat pemasukan dan pengeluaran dalam satu bulan',
    icon: '⚡',
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
  },
]

export const useAchievements = () => {
  const { allTransactions } = useAllTransactions()
  const { goals } = useSavings()
  const { memos } = useMemos()

  const achievements = useMemo(() => {
    const ctx = { transactions: allTransactions, goals, memos }
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: a.check(ctx),
      progressData: a.progress(ctx),
    }))
  }, [allTransactions, goals, memos])

  const unlocked = achievements.filter(a => a.unlocked)
  const locked = achievements.filter(a => !a.unlocked)

  return { achievements, unlocked, locked, total: ACHIEVEMENTS.length, unlockedCount: unlocked.length }
}

export { ACHIEVEMENTS }
