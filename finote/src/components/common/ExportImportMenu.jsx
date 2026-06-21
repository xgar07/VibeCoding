import { useRef, useState } from 'react'
import { Download, Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import { exportTransactionsCSV, parseTransactionsCSV } from '../../utils/csvExport'
import toast from 'react-hot-toast'

const ExportImportMenu = ({ transactions = [], onImport }) => {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState(null) // { data, errors }
  const fileRef = useRef(null)

  const handleExport = () => {
    if (!transactions.length) { toast.error('Tidak ada data untuk diexport'); return }
    exportTransactionsCSV(transactions)
    toast.success(`${transactions.length} transaksi berhasil diexport!`)
    setOpen(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = parseTransactionsCSV(ev.target.result)
      setPreview(result)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const handleConfirmImport = async () => {
    if (!preview?.data?.length) return
    setImporting(true)
    try {
      await onImport?.(preview.data)
      toast.success(`${preview.data.length} transaksi berhasil diimport!`)
      setPreview(null)
      setOpen(false)
    } catch {
      toast.error('Gagal import data')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <FileText size={14} />
        Export/Import
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-52 rounded-2xl shadow-card overflow-hidden animate-slide-down"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
          <button onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-green-500/5 text-left"
            style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
            <Download size={15} className="text-green-400" />
            <div>
              <p className="font-medium">Export CSV</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{transactions.length} transaksi</p>
            </div>
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-indigo-500/5 text-left"
            style={{ color: 'var(--text-primary)' }}>
            <Upload size={15} className="text-indigo-400" />
            <div>
              <p className="font-medium">Import CSV</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload file CSV</p>
            </div>
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

      {/* Import Preview Modal */}
      {preview && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setPreview(null)}>
          <div className="modal-content max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Preview Import</h3>
              <button onClick={() => setPreview(null)} className="btn-icon"><X size={16} /></button>
            </div>

            {preview.data.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-3">
                <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-400">{preview.data.length} transaksi siap diimport</p>
              </div>
            )}

            {preview.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{preview.errors.length} baris bermasalah</p>
                </div>
                <ul className="text-xs text-red-300 space-y-0.5 pl-5">
                  {preview.errors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {preview.data.length > 0 && (
              <div className="mb-4 max-h-40 overflow-y-auto space-y-1">
                {preview.data.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg"
                    style={{ background: 'var(--bg-surface)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.date} · {t.category}</span>
                    <span className={t.type === 'income' ? 'text-green-400' : 'text-red-400'} >
                      {t.type === 'income' ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                {preview.data.length > 5 && (
                  <p className="text-xs text-center py-1" style={{ color: 'var(--text-muted)' }}>...dan {preview.data.length - 5} lainnya</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setPreview(null)} className="btn-secondary flex-1">Batal</button>
              <button onClick={handleConfirmImport} className="btn-primary flex-1" disabled={!preview.data.length || importing}>
                {importing ? '...' : 'Import Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportImportMenu
