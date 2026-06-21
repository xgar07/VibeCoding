import { useState } from 'react'
import { StickyNote, Plus, Pin, Trash2, Edit2, CheckSquare, Square, Search } from 'lucide-react'
import { useMemos } from '../hooks/useMemos'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/dateHelpers'
import toast from 'react-hot-toast'

const MEMO_COLORS = [
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', pin: 'text-indigo-400', value: 'indigo' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', pin: 'text-purple-400', value: 'purple' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/20', pin: 'text-amber-400', value: 'amber' },
  { bg: 'bg-green-500/10', border: 'border-green-500/20', pin: 'text-green-400', value: 'green' },
  { bg: 'bg-pink-500/10', border: 'border-pink-500/20', pin: 'text-pink-400', value: 'pink' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', pin: 'text-cyan-400', value: 'cyan' },
]
const getColorStyle = (color) => MEMO_COLORS.find(c => c.value === color) || MEMO_COLORS[0]

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
        <label className="block text-sm font-medium text-slate-300 mb-2">Judul <span className="text-red-400">*</span></label>
        <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="Judul memo" className="input-field" autoFocus />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Catatan</label>
        <textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
          placeholder="Tulis catatan..." rows={4} className="input-field resize-none" />
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setForm(p => ({ ...p, is_todo: !p.is_todo }))}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
            ${form.is_todo ? 'bg-primary/10 border-primary/30 text-primary' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
          <CheckSquare size={15} />
          {form.is_todo ? 'Mode Todo ✓' : 'Jadikan Todo'}
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Warna</label>
        <div className="flex gap-2">
          {MEMO_COLORS.map(c => (
            <button key={c.value} type="button" onClick={() => setForm(p => ({ ...p, color: c.value }))}
              className={`w-7 h-7 rounded-full border-2 transition-all ${c.border} ${c.bg}
                ${form.color === c.value ? 'scale-125 ring-1 ring-white/30' : 'hover:scale-110'}`} />
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

  if (loading) return <LoadingSpinner />

  const MemoCard = ({ memo }) => {
    const cs = getColorStyle(memo.color || 'indigo')
    return (
      <div className={`glass-card p-4 border ${cs.border} ${cs.bg} hover:shadow-card-hover transition-all duration-200 group`}>
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {memo.is_pinned && <Pin size={12} className={`${cs.pin} flex-shrink-0`} />}
            <h3 className={`font-semibold truncate ${memo.is_todo && memo.is_completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {memo.title}
            </h3>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
            <button onClick={() => togglePin(memo.id)}
              className={`p-1.5 rounded-lg transition-all ${memo.is_pinned ? `${cs.pin} bg-current/10` : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
              <Pin size={12} />
            </button>
            <button onClick={() => { setEditData(memo); setShowModal(true) }} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
              <Edit2 size={12} />
            </button>
            <button onClick={() => setDeleteId(memo.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {memo.content && (
          <p className="text-sm text-slate-400 leading-relaxed mb-3 whitespace-pre-wrap">{memo.content}</p>
        )}

        {memo.is_todo && (
          <button
            onClick={() => toggleComplete(memo.id)}
            className={`flex items-center gap-2 text-sm transition-all ${memo.is_completed ? 'text-green-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {memo.is_completed ? <CheckSquare size={15} /> : <Square size={15} />}
            <span className={memo.is_completed ? 'line-through' : ''}>{memo.is_completed ? 'Selesai!' : 'Tandai selesai'}</span>
          </button>
        )}

        <p className="text-xs text-slate-600 mt-2">{formatDate(memo.created_at)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <StickyNote className="text-primary" size={24} />
            Memo & Todo
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Catat ide dan tugasmu</p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 self-start">
          <Plus size={16} /> Buat Memo
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari memo..." className="input-field pl-10" />
      </div>

      {memos.length === 0 ? (
        <div className="glass-card empty-state">
          <StickyNote size={48} className="text-slate-700 mb-3" />
          <p className="text-slate-400 font-medium">Belum ada memo</p>
          <p className="text-slate-600 text-sm mt-1">Buat catatan atau todo list pertamamu</p>
          <button onClick={() => setShowModal(true)} className="mt-5 btn-primary flex items-center gap-2">
            <Plus size={16} /> Buat Memo Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {pinned.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Pin size={11} /> Disematkan
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinned.map(m => <MemoCard key={m.id} memo={m} />)}
              </div>
            </div>
          )}
          {regular.length > 0 && (
            <div>
              {pinned.length > 0 && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Lainnya</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {regular.map(m => <MemoCard key={m.id} memo={m} />)}
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
