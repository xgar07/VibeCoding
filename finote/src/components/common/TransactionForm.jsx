import { useState, useEffect } from 'react'
import { Calendar, FileText, Tag, DollarSign } from 'lucide-react'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/categories'
import { todayISO } from '../../utils/dateHelpers'

const TransactionForm = ({ type = 'expense', initialData = null, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: todayISO(),
  })

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  useEffect(() => {
    if (initialData) {
      setForm({
        amount: initialData.amount?.toString() || '',
        category: initialData.category || '',
        description: initialData.description || '',
        date: initialData.date || todayISO(),
      })
    } else {
      setForm({ amount: '', category: categories[0].value, description: '', date: todayISO() })
    }
  }, [initialData, type])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setForm(prev => ({ ...prev, amount: val }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || !form.category || !form.date) return
    onSubmit({
      type,
      amount: parseInt(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
    })
  }

  const isValid = form.amount && form.category && form.date

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Nominal <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-sm" style={{ color: 'var(--text-muted)' }}>Rp</span>
          <input
            type="text"
            name="amount"
            value={form.amount ? parseInt(form.amount).toLocaleString('id-ID') : ''}
            onChange={handleAmountChange}
            placeholder="0"
            className="input-field pl-10 text-lg font-semibold"
            autoFocus
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Kategori <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, category: cat.value }))}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-150 text-xs
                ${form.category === cat.value ? `${cat.bg} ${cat.text}` : ''}`}
              style={form.category !== cat.value ? { borderColor: 'var(--border-strong)', color: 'var(--text-muted)' } : undefined}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-medium leading-none text-center">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Keterangan</label>
        <div className="relative">
          <FileText size={15} className="absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tambahkan catatan... (opsional)"
            rows={2}
            className="input-field pl-10 resize-none"
          />
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Tanggal <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input-field pl-10"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Batal
        </button>
        <button
          type="submit"
          className={`flex-1 font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${type === 'income'
              ? 'bg-gradient-accent text-white hover:opacity-90 shadow-glow-accent'
              : 'btn-primary'
            }`}
          disabled={!isValid || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : (initialData ? 'Perbarui' : 'Simpan')}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
