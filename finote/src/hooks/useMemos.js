import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useMemos = () => {
  const { user } = useAuth()
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchMemos()
  }, [user])

  const fetchMemos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', user.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    setMemos(data || [])
    setLoading(false)
  }

  const addMemo = async (memo) => {
    const { data, error } = await supabase
      .from('memos')
      .insert([{ ...memo, user_id: user.id }])
      .select()
      .single()
    if (!error) {
      setMemos(prev => {
        const newMemos = [data, ...prev]
        return sortMemos(newMemos)
      })
    }
    return { data, error }
  }

  const updateMemo = async (id, updates) => {
    const { data, error } = await supabase
      .from('memos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (!error) {
      setMemos(prev => {
        const updated = prev.map(m => m.id === id ? data : m)
        return sortMemos(updated)
      })
    }
    return { data, error }
  }

  const deleteMemo = async (id) => {
    const { error } = await supabase
      .from('memos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) setMemos(prev => prev.filter(m => m.id !== id))
    return { error }
  }

  const togglePin = (id) => {
    const memo = memos.find(m => m.id === id)
    if (memo) updateMemo(id, { is_pinned: !memo.is_pinned })
  }

  const toggleComplete = (id) => {
    const memo = memos.find(m => m.id === id)
    if (memo) updateMemo(id, { is_completed: !memo.is_completed })
  }

  const sortMemos = (list) => [
    ...list.filter(m => m.is_pinned),
    ...list.filter(m => !m.is_pinned),
  ]

  const pinnedMemos = memos.filter(m => m.is_pinned)
  const regularMemos = memos.filter(m => !m.is_pinned)

  return {
    memos,
    pinnedMemos,
    regularMemos,
    loading,
    addMemo,
    updateMemo,
    deleteMemo,
    togglePin,
    toggleComplete,
    refetch: fetchMemos,
  }
}
