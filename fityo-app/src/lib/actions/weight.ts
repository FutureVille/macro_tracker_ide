'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface WeightEntry {
    id?: string
    weight: number
    logged_at: string
}

export async function logWeight(weight: number, date?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const today = date || new Date().toISOString().split('T')[0]

    // Upsert: insert or update if exists for this date
    const { error } = await supabase
        .from('weight_history')
        .upsert({
            user_id: user.id,
            weight: weight,
            logged_at: today,
        }, {
            onConflict: 'user_id,logged_at'
        })

    if (error) {
        console.error('Error logging weight:', error)
        return { error: error.message }
    }

    revalidatePath('/history')
    return { success: true }
}

export async function getWeightHistory(startDate?: string, endDate?: string): Promise<WeightEntry[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase
        .from('weight_history')
        .select('id, weight, logged_at')
        .order('logged_at', { ascending: true })

    if (startDate) {
        query = query.gte('logged_at', startDate)
    }
    if (endDate) {
        query = query.lte('logged_at', endDate)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching weight history:', error)
        return []
    }

    return data || []
}

export async function getTodayWeight(): Promise<WeightEntry | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('weight_history')
        .select('id, weight, logged_at')
        .eq('logged_at', today)
        .single()

    if (error) {
        // PGRST116 means no rows found, which is fine
        if (error.code !== 'PGRST116') {
            console.error('Error fetching today weight:', error)
        }
        return null
    }

    return data
}
