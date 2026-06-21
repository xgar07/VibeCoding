import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingDown, Filter, Search } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate, monthOptions } from '../utils/dateHelpers'
import CategoryBadge from '../components/common/CategoryBadge'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import TransactionForm from '../components/common/TransactionForm'
import EmptyState from '../components/common/EmptyState'
import ExportImportMenu from '../components/common/ExportImportMenu'
import { TransactionSkeleton } from '../components/common/SkeletonLoader'
import { EXPENSE_CATEGORIES } from '../utils/categories'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Expenses = () => {
  const months = monthOptions()
  const [selectedMonth, setSelectedMonth] = useState(months[0].date)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { user } = useAuth()

  const { expenses, totalExpenses, loading, addTransaction, updateTransaction, deleteTransaction, refetch } = useTransactions(selectedMonth)

  const filtered = expenses.filter(t => {
    const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'all' || t.category === filterCat
    return matchSearch && matchCat
  })

  const handleSubmit = async (data) => {
    setFormLoading(true)
    const result = editData ? await updateTransaction(editData.id, data) : await addTransaction(data)
    setFormLoading(false)
    if (result.error) { toast.error('Gagal menyimpan') }
    else { toast.success(editData ? 'Diperbarui!' : 'Pengeluaran dicatat! 📝'); setShowModal(false); setEditData(null) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    const { error } = await deleteTransaction(deleteId)
    setDeleteLoading(false)
    if (error) { toast.error('Gagal menghapus') } else { toast.success('Dihapus'); setDeleteId(null) }
  }

  const handleImport = async (rows) => {
    const expenseRows = rows.filter(r => r.type === 'expense')
    for (const row of expenseRows) {
      await supabase.from('transactions').insert([{ ...row, user_id: user.id }])
    }
    refetch()
  }

  const openAdd = () => { setEditData(null); setShowModal(true) }
  const openEdit = (tx) => { setEditData(tx); setShowModal(true) }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <TrendingDown className="text-red-400" size={22} />
            Pengeluaran
          </h1>
          <p className="page-subtitle mt-0.5">Pantau dan kendalikan pengeluaranmu</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ExportImportMenu transactions={expenses} onImport={handleImport} />
          <button onClick={openAdd} className="btn-primary text-sm">
            <Plus size={14} /> Tambah
          </button>
        </div>
      </div>

      <div className="card p-4 sm:p-5" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), var(--bg-card))', borderColor: 'rgba(239,68,68,0.2)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Pengeluaran Bulan Ini</p>
        <p className="text-2xl sm:text-3xl font-bold text-red-400 mt-1 tabular-nums">{formatCurrency(totalExpenses)}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{expenses.length} transaksi</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="input-field pl-10" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input-field cursor-pointer min-w-[150px]">
          <option value="all">Semua Kategori</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
        </select>
        <div className="relative">
          <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <select
            value={months.findIndex(m => m.date.getMonth() === selectedMonth.getMonth() && m.date.getFullYear() === selectedMonth.getFullYear())}
            onChange={e => setSelectedMonth(months[parseInt(e.target.value)].date)}
            className="input-field pl-9 pr-8 appearance-none cursor-pointer min-w-[170px]"
          >
            {months.map((m, i) => <option key={i} value={i}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TransactionSkeleton count={5} />
        ) : filtered.length > 0 ? (
          <div>
            {filtered.map((tx, i) => (
              <div key={tx.id} className="flex items-center gap-3 p-3 sm:p-4 group transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <CategoryBadge category={tx.category} type="expense" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description || 'Pengeluaran'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(tx.date)}</p>
                </div>
                <span className="text-sm font-bold text-red-400 tabular-nums whitespace-nowrap">-{formatCurrency(tx.amount)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(tx)} className="btn-icon"><Edit2 size={13} /></button>
                  <button onClick={() => setDeleteId(tx.id)} className="p-2 rounded-xl transition-all"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState variant="expenses" onCta={openAdd} ctaLabel="Tambah Pengeluaran" />
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }}
        title={editData ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}>
        <TransactionForm type="expense" initialData={editData} onSubmit={handleSubmit}
          onCancel={() => { setShowModal(false); setEditData(null) }} loading={formLoading} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Hapus Pengeluaran?" message="Transaksi ini akan dihapus permanen." loading={deleteLoading} />
    </div>
  )
}

export default Expenses
