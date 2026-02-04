'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface FoodData {
    id?: string
    name: string
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    calories_per_100g: number
}

export async function getFoods() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('foods_library')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching foods:', error)
        return []
    }

    return data || []
}

export async function addFood(food: Omit<FoodData, 'id'>) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('foods_library')
        .insert({
            user_id: user.id,
            name: food.name,
            protein_per_100g: food.protein_per_100g,
            carbs_per_100g: food.carbs_per_100g,
            fat_per_100g: food.fat_per_100g,
            calories_per_100g: food.calories_per_100g,
        })

    if (error) {
        console.error('Error adding food:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteFood(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('foods_library')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting food:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
