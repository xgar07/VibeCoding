import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export const useTransactions = (filterDate = null) => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const activeDate = filterDate || new Date()

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const start = format(startOfMonth(activeDate), 'yyyy-MM-dd')
      const end = format(endOfMonth(activeDate), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, activeDate.getFullYear(), activeDate.getMonth()])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (tx) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...tx, user_id: user.id }])
      .select()
      .single()
    if (!error) {
      setTransactions(prev => [data, ...prev])
    }
    return { data, error }
  }

  const updateTransaction = async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (!error) {
      setTransactions(prev => prev.map(t => t.id === id ? data : t))
    }
    return { data, error }
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
    return { error }
  }

  const income = transactions.filter(t => t.type === 'income')
  const expenses = transactions.filter(t => t.type === 'expense')
  const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0)
  const balance = totalIncome - totalExpenses

  return {
    transactions,
    income,
    expenses,
    totalIncome,
    totalExpenses,
    balance,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

export const useAllTransactions = () => {
  const { user } = useAuth()
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      setAllTransactions(data || [])
      setLoading(false)
    }
    fetch()
  }, [user])

  return { allTransactions, loading }
}
