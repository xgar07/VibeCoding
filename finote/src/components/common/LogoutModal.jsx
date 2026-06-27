import { useState } from 'react'
import { LogOut, AlertTriangle } from 'lucide-react'
import Modal from './Modal'

/**
 * Logout confirmation modal.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onConfirm: () => Promise<void>
 *  - loading: boolean
 */
const LogoutModal = ({ isOpen, onClose, onConfirm, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 pb-1">

        {/* Warning icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.1)' }}
        >
          <LogOut size={24} style={{ color: '#EF4444' }} />
        </div>

        {/* Text */}
        <div>
          <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Keluar dari Finote?
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Sesi aktifmu akan diakhiri. Kamu perlu login kembali untuk mengakses aplikasi.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 w-full pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              background: loading ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#fff',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(239,68,68,0.3)',
            }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            {loading ? 'Keluar...' : 'Logout'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default LogoutModal
