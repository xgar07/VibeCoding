import { useState, useRef, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, PiggyBank, StickyNote, X } from 'lucide-react'

const actions = [
  { id: 'income', label: 'Pemasukan', icon: TrendingUp, color: 'bg-green-500 hover:bg-green-400', delay: 0 },
  { id: 'expense', label: 'Pengeluaran', icon: TrendingDown, color: 'bg-red-500 hover:bg-red-400', delay: 40 },
  { id: 'savings', label: 'Tabungan', icon: PiggyBank, color: 'bg-amber-500 hover:bg-amber-400', delay: 80 },
  { id: 'memo', label: 'Catatan', icon: StickyNote, color: 'bg-purple-500 hover:bg-purple-400', delay: 120 },
]

const QuickActionFAB = ({ onAction }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleAction = (id) => {
    setOpen(false)
    onAction?.(id)
  }

  return (
    <div ref={ref} className="lg:hidden fixed bottom-[76px] right-4 z-50 flex flex-col-reverse items-end gap-2.5">
      {/* Action buttons */}
      {open && actions.map((action) => {
        const Icon = action.icon
        return (
          <div
            key={action.id}
            className="flex items-center gap-2.5 animate-fab-open"
            style={{ animationDelay: `${action.delay}ms`, animationFillMode: 'both' }}
          >
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg shadow-card"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {action.label}
            </span>
            <button
              onClick={() => handleAction(action.id)}
              className={`w-11 h-11 rounded-2xl ${action.color} text-white flex items-center justify-center shadow-card
              transition-all duration-200 active:scale-90`}
              aria-label={action.label}
            >
              <Icon size={18} />
            </button>
          </div>
        )
      })}

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-fab
        transition-all duration-200 active:scale-90"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
        aria-label="Quick actions"
      >
        <div className={`transition-transform duration-200 ${open ? 'rotate-45' : 'rotate-0'}`}>
          <Plus size={22} />
        </div>
      </button>
    </div>
  )
}

export default QuickActionFAB
