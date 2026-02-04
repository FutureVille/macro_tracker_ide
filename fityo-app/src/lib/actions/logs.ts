'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface FoodLogData {
    food_id: string
    meal_type: string
    amount_grams: number
    logged_at?: string // Date string YYYY-MM-DD
}

export interface FoodLogWithFood {
    id: string
    food_id: string
    meal_type: string
    amount_grams: number
    logged_at: string
    foods_library: {
        id: string
        name: string
        protein_per_100g: number
        carbs_per_100g: number
        fat_per_100g: number
        calories_per_100g: number
    } | null
}

export async function addFoodLog(log: FoodLogData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
        .from('daily_logs')
        .insert({
            user_id: user.id,
            food_id: log.food_id,
            meal_type: log.meal_type,
            amount_grams: log.amount_grams,
            logged_at: log.logged_at || today,
        })

    if (error) {
        console.error('Error adding food log:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteFoodLog(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting food log:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function getLogsForDate(date: string): Promise<FoodLogWithFood[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('daily_logs')
        .select(`
      id,
      food_id,
      meal_type,
      amount_grams,
      logged_at,
      foods_library (
        id,
        name,
        protein_per_100g,
        carbs_per_100g,
        fat_per_100g,
        calories_per_100g
      )
    `)
        .eq('logged_at', date)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching logs:', error)
        return []
    }

    return (data as unknown as FoodLogWithFood[]) || []
}

export async function getLogsForRange(startDate: string, endDate: string): Promise<FoodLogWithFood[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('daily_logs')
        .select(`
      id,
      food_id,
      meal_type,
      amount_grams,
      logged_at,
      foods_library (
        id,
        name,
        protein_per_100g,
        carbs_per_100g,
        fat_per_100g,
        calories_per_100g
      )
    `)
        .gte('logged_at', startDate)
        .lte('logged_at', endDate)
        .order('logged_at', { ascending: true })

    if (error) {
        console.error('Error fetching logs for range:', error)
        return []
    }

    return (data as unknown as FoodLogWithFood[]) || []
}
