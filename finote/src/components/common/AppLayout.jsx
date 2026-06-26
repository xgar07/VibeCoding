import { Sidebar, BottomNav } from './Sidebar'
import QuickActionFAB from './QuickActionFAB'
import { useState } from 'react'
import Modal from './Modal'
import TransactionForm from './TransactionForm'
import { useTransactions } from '../../hooks/useTransactions'
import toast from 'react-hot-toast'

const AppLayout = ({ children }) => {
  const [fabAction, setFabAction] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const { addTransaction } = useTransactions()

  const handleFabAction = (action) => setFabAction(action)
  const closeModal = () => setFabAction(null)

  const handleTxSubmit = async (data) => {
    setFormLoading(true)
    try {
      const { error } = await addTransaction(data)
      if (error) { toast.error('Gagal menyimpan') }
      else { toast.success(data.type === 'income' ? 'Pemasukan ditambahkan! 💰' : 'Pengeluaran dicatat! 📝'); closeModal() }
    } catch {
      toast.error('Terjadi kesalahan, coba lagi')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="lg:ml-60 min-h-screen pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto p-4 sm:p-5 lg:p-8">
          {children}
        </div>
      </main>
      <BottomNav />

      {/* FAB */}
      <QuickActionFAB onAction={handleFabAction} />

      {/* FAB Modals */}
      <Modal
        isOpen={fabAction === 'income'}
        onClose={closeModal}
        title="Tambah Pemasukan"
      >
        <TransactionForm type="income" onSubmit={handleTxSubmit} onCancel={closeModal} loading={formLoading} />
      </Modal>

      <Modal
        isOpen={fabAction === 'expense'}
        onClose={closeModal}
        title="Tambah Pengeluaran"
      >
        <TransactionForm type="expense" onSubmit={handleTxSubmit} onCancel={closeModal} loading={formLoading} />
      </Modal>
    </div>
  )
}

export default AppLayout
