import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns'
import { id } from 'date-fns/locale'

export const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export const formatDate = (dateStr, fmt = 'd MMM yyyy') => {
  if (!dateStr) return '-'
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, fmt, { locale: id })
  } catch {
    return '-'
  }
}

export const formatDateShort = (dateStr) => formatDate(dateStr, 'd MMM')

export const formatMonthYear = (dateStr) => formatDate(dateStr, 'MMMM yyyy')

export const getCurrentMonthRange = () => {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  }
}

export const getMonthRange = (date) => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
})

export const getLast6Months = () => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    return {
      date: d,
      label: format(d, 'MMM', { locale: id }),
      labelFull: format(d, 'MMMM yyyy', { locale: id }),
      year: d.getFullYear(),
      month: d.getMonth(),
      start: startOfMonth(d),
      end: endOfMonth(d),
    }
  })
}

export const isInMonth = (dateStr, date) => {
  if (!dateStr) return false
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return isWithinInterval(d, { start: startOfMonth(date), end: endOfMonth(date) })
  } catch {
    return false
  }
}

export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

export const monthOptions = () => {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, i)
    return {
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy', { locale: id }),
      date: d,
    }
  })
}
