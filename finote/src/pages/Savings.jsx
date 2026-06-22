import { useState } from 'react'
import { PiggyBank, Plus, Target, Trash2, Edit2, PlusCircle } from 'lucide-react'
import { useSavings } from '../hooks/useSavings'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dateHelpers'
import { SAVINGS_COLORS } from '../utils/categories'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { GoalCardSkeleton } from '../components/common/SkeletonLoader'
import toast from 'react-hot-toast'
import { differenceInDays, parseISO } from 'date-fns'

const SavingGoalForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    target_amount: initialData?.target_amount?.toString() || '',
    current_amount: initialData?.current_amount?.toString() || '0',
    deadline: initialData?.deadline || '',
    color: initialData?.color || SAVINGS_COLORS[0].value,
  })

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const handleAmountChange = (field) => (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title || !form.target_amount) return
    onSubmit({
      title: form.title,
      target_amount: parseInt(form.target_amount),
      current_amount: parseInt(form.current_amount || '0'),
      deadline: form.deadline || null,
      color: form.color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Nama Target <span className="text-red-400">*</span>
        </label>
        <input type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="Contoh: Beli HP baru" className="input-field" autoFocus />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Target Nominal <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>Rp</span>
          <input type="text" value={form.target_amount ? parseInt(form.target_amount).toLocaleString('id-ID') : ''}
            onChange={handleAmountChange('target_amount')} placeholder="0" className="input-field pl-10" />
        </div>
      </div>
      {!initialData && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Dana Awal (opsional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>Rp</span>
            <input type="text" value={form.current_amount ? parseInt(form.current_amount).toLocaleString('id-ID') : ''}
              onChange={handleAmountChange('current_amount')} placeholder="0" className="input-field pl-10" />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Deadline (opsional)</label>
        <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Warna</label>
        <div className="flex gap-2 flex-wrap">
          {SAVINGS_COLORS.map(c => (
            <button key={c.value} type="button" onClick={() => setForm(prev => ({ ...prev, color: c.value }))}
              className={`w-8 h-8 rounded-full transition-all duration-150 ${form.color === c.value ? 'ring-2 ring-white ring-offset-2 scale-110' : 'hover:scale-105'}`}
              style={{ background: c.value, ringOffsetColor: 'var(--bg-card)' }} title={c.label} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>
        <button type="submit" className="btn-primary flex-1" disabled={!form.title || !form.target_amount || loading}>
          {loading
            ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</span>
            : initialData ? 'Perbarui' : 'Buat Target'}
        </button>
      </div>
    </form>
  )
}

const AddFundsForm = ({ goal, onSubmit, onCancel, loading }) => {
  const [amount, setAmount] = useState('')
  const remaining = goal.target_amount - goal.current_amount
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-surface)' }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Terkumpul</span>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(goal.current_amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Sisa</span>
          <span className="text-amber-400 font-medium">{formatCurrency(remaining)}</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tambah Dana</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>Rp</span>
          <input type="text"
            value={amount ? parseInt(amount).toLocaleString('id-ID') : ''}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="0" className="input-field pl-10 text-lg font-semibold" autoFocus />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>
        <button
          onClick={() => onSubmit(parseInt(amount))}
          className="btn-primary flex-1" disabled={!amount || parseInt(amount) <= 0 || loading}
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Tambahkan 💰'}
        </button>
      </div>
    </div>
  )
}

const Savings = () => {
  const { goals, totalSaved, loading, addGoal, updateGoal, addFunds, deleteGoal } = useSavings()
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [addFundsGoal, setAddFundsGoal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSubmit = async (data) => {
    setFormLoading(true)
    const result = editData ? await updateGoal(editData.id, data) : await addGoal(data)
    setFormLoading(false)
    if (result.error) { toast.error('Gagal menyimpan') }
    else { toast.success(editData ? 'Target diperbarui!' : 'Target tabungan dibuat! 🎯'); setShowModal(false); setEditData(null) }
  }

  const handleAddFunds = async (amount) => {
    setFormLoading(true)
    const { error } = await addFunds(addFundsGoal.id, amount)
    setFormLoading(false)
    if (error) { toast.error('Gagal menambah dana') }
    else {
      const goal = goals.find(g => g.id === addFundsGoal.id)
      const newAmt = Math.min((goal?.current_amount || 0) + amount, goal?.target_amount || 0)
      if (newAmt >= (goal?.target_amount || 0)) toast.success('🎉 Target tercapai! Selamat!')
      else toast.success(`+${formatCurrency(amount)} berhasil ditambahkan!`)
      setAddFundsGoal(null)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    await deleteGoal(deleteId)
    setDeleteLoading(false)
    toast.success('Target dihapus')
    setDeleteId(null)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <PiggyBank className="text-amber-400" size={22} />
            Tabungan
          </h1>
          <p className="page-subtitle mt-0.5">Wujudkan impianmu satu langkah</p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary self-start">
          <Plus size={15} /> Buat Target
        </button>
      </div>

      {/* Summary */}
      <div className="card p-4 sm:p-5" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), var(--bg-card))', borderColor: 'rgba(245,158,11,0.25)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Dana Terkumpul</p>
        <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 tabular-nums">{formatCurrency(totalSaved)}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{goals.length} target aktif</p>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <GoalCardSkeleton key={i} />)}
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = goal.target_amount > 0
              ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0
            const isCompleted = progress >= 100
            const remaining = goal.target_amount - goal.current_amount
            const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null

            return (
              <div key={goal.id} className="card p-4 sm:p-5 hover:shadow-card transition-all duration-200">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: goal.color }} />
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{goal.title}</h3>
                    {isCompleted && (
                      <span className="badge bg-green-500/15 text-green-400 text-[10px] flex-shrink-0">✅ Tercapai</span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button onClick={() => { setEditData(goal); setShowModal(true) }} className="btn-icon"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteId(goal.id)}
                      className="p-2 rounded-xl transition-all"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(goal.current_amount)}</span>
                    <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{formatCurrency(goal.target_amount)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: isCompleted ? '#22C55E' : goal.color }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{progress.toFixed(1)}% tercapai</span>
                    {!isCompleted && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sisa {formatCurrency(remaining, true)}</span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs min-w-0">
                    {daysLeft !== null && (
                      <span className={daysLeft < 0 ? 'text-red-400' : daysLeft < 30 ? 'text-amber-400' : ''} style={{ color: daysLeft >= 30 ? 'var(--text-muted)' : undefined }}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlambat` : `${daysLeft} hari lagi`}
                        {goal.deadline && ` · ${formatDate(goal.deadline, 'd MMM')}`}
                      </span>
                    )}
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => setAddFundsGoal(goal)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                      style={{ background: `${goal.color}20`, color: goal.color }}
                    >
                      <PlusCircle size={12} />
                      Tambah Dana
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState variant="savings" onCta={() => setShowModal(true)} />
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }}
        title={editData ? 'Edit Target' : 'Buat Target Tabungan'}>
        <SavingGoalForm initialData={editData} onSubmit={handleSubmit}
          onCancel={() => { setShowModal(false); setEditData(null) }} loading={formLoading} />
      </Modal>

      <Modal isOpen={!!addFundsGoal} onClose={() => setAddFundsGoal(null)}
        title={`Tambah Dana — ${addFundsGoal?.title}`} size="sm">
        {addFundsGoal && (
          <AddFundsForm goal={addFundsGoal} onSubmit={handleAddFunds}
            onCancel={() => setAddFundsGoal(null)} loading={formLoading} />
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} title="Hapus Target?" message="Target ini beserta progressnya akan dihapus permanen." loading={deleteLoading} />
    </div>
  )
}

export default Savings
