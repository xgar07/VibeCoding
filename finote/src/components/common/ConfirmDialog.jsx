import { AlertTriangle, Trash2 } from 'lucide-react'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Hapus', loading = false }) => {
  if (!isOpen) return null
  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-sm">
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-2.5 bg-red-500/10 rounded-xl flex-shrink-0">
            <AlertTriangle className="text-red-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Batal</button>
          <button onClick={onConfirm} className="btn-danger flex-1 flex items-center justify-center gap-2" disabled={loading}>
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Trash2 size={14} />{confirmLabel}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
