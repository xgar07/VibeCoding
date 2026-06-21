/**
 * Export transactions array to CSV and trigger download
 */
export const exportTransactionsCSV = (transactions, filename = 'finote-transactions.csv') => {
  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal']
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.category,
    (t.description || '').replace(/,/g, ';'),
    t.amount,
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Parse CSV text into transaction objects
 * Returns { data: [], errors: [] }
 */
export const parseTransactionsCSV = (text) => {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return { data: [], errors: ['File CSV kosong atau tidak valid'] }

  const data = []
  const errors = []

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim())
    if (cols.length < 5) { errors.push(`Baris ${i + 1}: kolom tidak lengkap`); continue }

    const [date, typeStr, category, description, amountStr] = cols
    const amount = parseInt(amountStr?.replace(/[^0-9]/g, ''))
    const type = typeStr?.toLowerCase().includes('pemasukan') ? 'income' : 'expense'

    if (!date || isNaN(new Date(date).getTime())) { errors.push(`Baris ${i + 1}: tanggal tidak valid`); continue }
    if (isNaN(amount) || amount <= 0) { errors.push(`Baris ${i + 1}: nominal tidak valid`); continue }

    data.push({ date, type, category: category || 'other', description: description?.replace(/;/g, ',') || '', amount })
  }

  return { data, errors }
}
