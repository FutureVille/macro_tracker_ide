// Macro calculation utilities
// Based on PRD formula: Macro_total = (g_consumed * m_reference) / 100

export function calculateMacros(
    protein_per_100g: number,
    carbs_per_100g: number,
    fat_per_100g: number,
    calories_per_100g: number,
    grams: number
) {
    return {
        protein: Math.round((protein_per_100g * grams) / 100 * 10) / 10,
        carbs: Math.round((carbs_per_100g * grams) / 100 * 10) / 10,
        fat: Math.round((fat_per_100g * grams) / 100 * 10) / 10,
        calories: Math.round((calories_per_100g * grams) / 100),
    }
}
