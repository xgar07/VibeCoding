import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useSavings = () => {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchGoals()
  }, [user])

  const fetchGoals = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }

  const addGoal = async (goal) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{ ...goal, user_id: user.id }])
      .select()
      .single()
    if (!error) setGoals(prev => [data, ...prev])
    return { data, error }
  }

  const updateGoal = async (id, updates) => {
    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (!error) setGoals(prev => prev.map(g => g.id === id ? data : g))
    return { data, error }
  }

  const addFunds = async (id, amount) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return { error: 'Goal not found' }
    const newAmount = Math.min(goal.current_amount + amount, goal.target_amount)
    return updateGoal(id, { current_amount: newAmount })
  }

  const deleteGoal = async (id) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) setGoals(prev => prev.filter(g => g.id !== id))
    return { error }
  }

  const totalSaved = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0)

  return { goals, loading, totalSaved, addGoal, updateGoal, addFunds, deleteGoal, refetch: fetchGoals }
}
