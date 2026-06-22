import { useState } from 'react'
import { StickyNote, Plus, Pin, Trash2, Edit2, CheckSquare, Square, Search } from 'lucide-react'
import { useMemos } from '../hooks/useMemos'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import { formatDate } from '../utils/dateHelpers'
import toast from 'react-hot-toast'

const MEMO_COLORS = [
  { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', pin: '#818CF8', value: 'indigo' },
  { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', pin: '#A78BFA', value: 'purple' },
  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', pin: '#FCD34D', value: 'amber' },
  { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', pin: '#4ADE80', value: 'green' },
  { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)', pin: '#F472B6', value: 'pink' },
  { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', pin: '#22D3EE', value: 'cyan' },
]
const getCS = (color) => MEMO_COLORS.find(c => c.value === color) || MEMO_COLORS[0]

const MemoForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    is_todo: initialData?.is_todo || false,
    color: initialData?.color || 'indigo',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Judul <span className="text-red-400">*</span>
        </label>
        <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="Judul memo" className="input-field" autoFocus />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Catatan</label>
        <textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
          placeholder="Tulis catatan..." rows={4} className="input-field resize-none" />
      </div>
      <div>
        <button type="button" onClick={() => setForm(p => ({ ...p, is_todo: !p.is_todo }))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            border: `1px solid ${form.is_todo ? 'rgba(99,102,241,0.4)' : 'var(--border-strong)'}`,
            background: form.is_todo ? 'rgba(99,102,241,0.1)' : 'transparent',
            color: form.is_todo ? '#818CF8' : 'var(--text-muted)',
          }}>
          <CheckSquare size={15} />
          {form.is_todo ? 'Mode Todo ✓' : 'Jadikan Todo'}
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Warna</label>
        <div className="flex gap-2 flex-wrap">
          {MEMO_COLORS.map(c => (
            <button key={c.value} type="button" onClick={() => setForm(p => ({ ...p, color: c.value }))}
              className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c.value ? 'scale-125 ring-1 ring-white/30' : 'hover:scale-110'}`}
              style={{ background: c.pin, borderColor: c.border }} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>
        <button type="submit" className="btn-primary flex-1" disabled={!form.title.trim() || loading}>
          {loading ? '...' : initialData ? 'Perbarui' : 'Simpan Memo'}
        </button>
      </div>
    </form>
  )
}

const MemoCard = ({ memo, onEdit, onDelete, onPin, onToggleComplete }) => {
  const cs = getCS(memo.color || 'indigo')
  return (
    <div className="card p-4 transition-all duration-200 group"
      style={{ background: cs.bg, borderColor: cs.border }}>
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {memo.is_pinned && <Pin size={11} style={{ color: cs.pin }} className="flex-shrink-0" />}
          <h3 className={`font-semibold truncate text-sm ${memo.is_todo && memo.is_completed ? 'line-through' : ''}`}
            style={{ color: memo.is_todo && memo.is_completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            {memo.title}
          </h3>
        </div>
        {/* Actions — always visible on mobile, hover on desktop */}
        <div className="flex gap-1 flex-shrink-0 ml-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onPin(memo.id)}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: memo.is_pinned ? cs.pin : 'var(--text-muted)', background: memo.is_pinned ? `${cs.pin}15` : 'transparent' }}>
            <Pin size={12} />
          </button>
          <button onClick={() => onEdit(memo)} className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <Edit2 size={12} />
          </button>
          <button onClick={() => onDelete(memo.id)} className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {memo.content && (
        <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap line-clamp-4"
          style={{ color: 'var(--text-secondary)' }}>{memo.content}</p>
      )}

      {memo.is_todo && (
        <button
          onClick={() => onToggleComplete(memo.id)}
          className="flex items-center gap-2 text-sm transition-all mb-2"
          style={{ color: memo.is_completed ? '#4ADE80' : 'var(--text-muted)' }}>
          {memo.is_completed ? <CheckSquare size={15} /> : <Square size={15} />}
          <span className={memo.is_completed ? 'line-through' : ''}>
            {memo.is_completed ? 'Selesai!' : 'Tandai selesai'}
          </span>
        </button>
      )}

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(memo.created_at)}</p>
    </div>
  )
}

const Memos = () => {
  const { memos, loading, addMemo, updateMemo, deleteMemo, togglePin, toggleComplete } = useMemos()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = memos.filter(m =>
    !search || m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.content?.toLowerCase().includes(search.toLowerCase())
  )
  const pinned = filtered.filter(m => m.is_pinned)
  const regular = filtered.filter(m => !m.is_pinned)

  const handleSubmit = async (data) => {
    setFormLoading(true)
    const result = editData ? await updateMemo(editData.id, data) : await addMemo(data)
    setFormLoading(false)
    if (result.error) { toast.error('Gagal menyimpan') }
    else { toast.success(editData ? 'Memo diperbarui!' : 'Memo tersimpan! 📝'); setShowModal(false); setEditData(null) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    await deleteMemo(deleteId)
    setDeleteLoading(false)
    toast.success('Memo dihapus')
    setDeleteId(null)
  }

  const handleEdit = (memo) => { setEditData(memo); setShowModal(true) }
  const handleOpenAdd = () => { setEditData(null); setShowModal(true) }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <StickyNote className="text-indigo-400" size={22} />
            Memo & Todo
          </h1>
          <p className="page-subtitle mt-0.5">Catat ide dan tugasmu</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary self-start">
          <Plus size={15} /> Buat Memo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari memo..." className="input-field pl-10" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : memos.length === 0 ? (
        <div className="card">
          <EmptyState variant="memos" onCta={handleOpenAdd} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState variant="generic" title="Tidak ada hasil" desc={`Tidak ada memo dengan kata kunci "${search}"`} />
        </div>
      ) : (
        <div className="space-y-5">
          {pinned.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Pin size={11} /> Disematkan
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinned.map(m => (
                  <MemoCard key={m.id} memo={m} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)}
                    onPin={togglePin} onToggleComplete={toggleComplete} />
                ))}
              </div>
            </div>
          )}
          {regular.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Lainnya</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {regular.map(m => (
                  <MemoCard key={m.id} memo={m} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)}
                    onPin={togglePin} onToggleComplete={toggleComplete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }}
        title={editData ? 'Edit Memo' : 'Buat Memo Baru'}>
        <MemoForm initialData={editData} onSubmit={handleSubmit}
          onCancel={() => { setShowModal(false); setEditData(null) }} loading={formLoading} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} title="Hapus Memo?" message="Memo ini akan dihapus permanen." loading={deleteLoading} />
    </div>
  )
}

export default Memos
