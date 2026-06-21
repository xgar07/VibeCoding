// Expense categories
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Makan & Minum', icon: '🍔', color: '#F59E0B', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  { value: 'transport', label: 'Transportasi', icon: '🚗', color: '#3B82F6', bg: 'bg-blue-500/15', text: 'text-blue-400' },
  { value: 'entertainment', label: 'Hiburan', icon: '🎮', color: '#8B5CF6', bg: 'bg-purple-500/15', text: 'text-purple-400' },
  { value: 'education', label: 'Pendidikan', icon: '📚', color: '#06B6D4', bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  { value: 'shopping', label: 'Belanja', icon: '🛍️', color: '#EC4899', bg: 'bg-pink-500/15', text: 'text-pink-400' },
  { value: 'health', label: 'Kesehatan', icon: '💊', color: '#EF4444', bg: 'bg-red-500/15', text: 'text-red-400' },
  { value: 'utilities', label: 'Tagihan', icon: '💡', color: '#F97316', bg: 'bg-orange-500/15', text: 'text-orange-400' },
  { value: 'other', label: 'Lainnya', icon: '📌', color: '#6B7280', bg: 'bg-slate-500/15', text: 'text-slate-400' },
]

// Income categories
export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Gaji', icon: '💼', color: '#22C55E', bg: 'bg-green-500/15', text: 'text-green-400' },
  { value: 'freelance', label: 'Freelance', icon: '💻', color: '#6366F1', bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
  { value: 'business', label: 'Bisnis', icon: '🏪', color: '#F59E0B', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  { value: 'investment', label: 'Investasi', icon: '📈', color: '#06B6D4', bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  { value: 'gift', label: 'Hadiah', icon: '🎁', color: '#EC4899', bg: 'bg-pink-500/15', text: 'text-pink-400' },
  { value: 'other', label: 'Lainnya', icon: '💰', color: '#6B7280', bg: 'bg-slate-500/15', text: 'text-slate-400' },
]

// Savings goal colors
export const SAVINGS_COLORS = [
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8B5CF6', label: 'Ungu' },
  { value: '#22C55E', label: 'Hijau' },
  { value: '#F59E0B', label: 'Kuning' },
  { value: '#3B82F6', label: 'Biru' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#EF4444', label: 'Merah' },
  { value: '#06B6D4', label: 'Cyan' },
]

export const getCategoryInfo = (categoryValue, type = 'expense') => {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  return list.find(c => c.value === categoryValue) || list[list.length - 1]
}
