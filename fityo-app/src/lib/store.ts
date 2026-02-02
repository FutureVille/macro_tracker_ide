"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface MacroGoals {
    calories: number
    protein: number
    carbs: number
    fat: number
}

export interface Food {
    id: string
    name: string
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
    caloriesPer100g: number
}

export interface Meal {
    id: string
    name: string
    goals: MacroGoals
}

export interface FoodLog {
    id: string
    foodId: string
    mealId: string
    grams: number
    date: string
}

export interface WeightEntry {
    date: string
    weight: number
}

export interface Template {
    id: string
    name: string
    isDefault: boolean
    dailyGoals: MacroGoals
    meals: { name: string; goals: MacroGoals }[]
}

export interface DayData {
    date: string
    dailyGoals: MacroGoals
    meals: Meal[]
    templateSelected: boolean // Track if user selected a template for this day
}

interface AppState {
    // Food Library
    foods: Food[]
    addFood: (food: Omit<Food, 'id'>) => void
    deleteFood: (id: string) => void

    // Food Logs
    logs: FoodLog[]
    addLog: (log: Omit<FoodLog, 'id'>) => void
    deleteLog: (id: string) => void
    clearLogsForDate: (date: string) => void

    // Weight History
    weightHistory: WeightEntry[]
    logWeight: (date: string, weight: number) => void

    // Templates
    templates: Template[]
    addTemplate: (template: Omit<Template, 'id'>) => void
    updateTemplate: (id: string, template: Partial<Omit<Template, 'id'>>) => void
    deleteTemplate: (id: string) => void
    setDefaultTemplate: (id: string) => void
    getDefaultTemplate: () => Template | undefined

    // Day Data
    days: DayData[]
    getDayData: (date: string) => DayData | undefined
    initializeDayWithoutTemplate: (date: string) => void
    applyTemplateToDay: (date: string, template: Template) => void
    skipTemplateSelection: (date: string) => void
    setDayGoals: (date: string, goals: MacroGoals) => void
    addMealToDay: (date: string, meal: Omit<Meal, 'id'>) => void
    updateMealGoals: (date: string, mealId: string, goals: MacroGoals) => void
    deleteMealFromDay: (date: string, mealId: string) => void
    reorderMealsInDay: (date: string, fromIndex: number, toIndex: number) => void
    needsTemplateSelection: (date: string) => boolean

    // Selected Date
    selectedDate: string
    setSelectedDate: (date: string) => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const getTodayString = () => new Date().toISOString().split('T')[0]

export const isToday = (dateString: string) => dateString === getTodayString()

export const isFutureDate = (dateString: string) => dateString > getTodayString()

export const calculateMacros = (food: Food, grams: number) => ({
    protein: Math.round((food.proteinPer100g * grams) / 100 * 10) / 10,
    carbs: Math.round((food.carbsPer100g * grams) / 100 * 10) / 10,
    fat: Math.round((food.fatPer100g * grams) / 100 * 10) / 10,
    calories: Math.round((food.caloriesPer100g * grams) / 100),
})

const defaultGoals: MacroGoals = { calories: 2400, protein: 180, carbs: 200, fat: 70 }

const defaultMeals = [
    { name: 'Breakfast', goals: { calories: 600, protein: 45, carbs: 50, fat: 18 } },
    { name: 'Lunch', goals: { calories: 800, protein: 60, carbs: 67, fat: 23 } },
    { name: 'Dinner', goals: { calories: 800, protein: 60, carbs: 67, fat: 23 } },
    { name: 'Snack', goals: { calories: 200, protein: 15, carbs: 16, fat: 6 } },
]

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Food Library
            foods: [],
            addFood: (food) => set((state) => ({
                foods: [...state.foods, { ...food, id: generateId() }]
            })),
            deleteFood: (id) => set((state) => ({
                foods: state.foods.filter((f) => f.id !== id)
            })),

            // Food Logs
            logs: [],
            addLog: (log) => set((state) => ({
                logs: [...state.logs, { ...log, id: generateId() }]
            })),
            deleteLog: (id) => set((state) => ({
                logs: state.logs.filter((l) => l.id !== id)
            })),
            clearLogsForDate: (date) => set((state) => ({
                logs: state.logs.filter((l) => l.date !== date)
            })),

            // Weight History
            weightHistory: [],
            logWeight: (date, weight) => set((state) => {
                const existing = state.weightHistory.findIndex((w) => w.date === date)
                if (existing >= 0) {
                    const updated = [...state.weightHistory]
                    updated[existing] = { date, weight }
                    return { weightHistory: updated }
                }
                return { weightHistory: [...state.weightHistory, { date, weight }] }
            }),

            // Templates
            templates: [],
            addTemplate: (template) => set((state) => ({
                templates: [...state.templates, { ...template, id: generateId() }]
            })),
            updateTemplate: (id, updates) => set((state) => ({
                templates: state.templates.map((t) => t.id === id ? { ...t, ...updates } : t)
            })),
            deleteTemplate: (id) => set((state) => ({
                templates: state.templates.filter((t) => t.id !== id)
            })),
            setDefaultTemplate: (id) => set((state) => ({
                templates: state.templates.map((t) => ({ ...t, isDefault: t.id === id }))
            })),
            getDefaultTemplate: () => get().templates.find((t) => t.isDefault),

            // Day Data
            days: [],
            getDayData: (date) => get().days.find((d) => d.date === date),

            needsTemplateSelection: (date) => {
                const dayData = get().days.find((d) => d.date === date)
                // Needs selection if day doesn't exist OR exists but hasn't selected template yet
                return !dayData || !dayData.templateSelected
            },

            initializeDayWithoutTemplate: (date) => {
                const existing = get().days.find((d) => d.date === date)
                if (existing) return

                const newDay: DayData = {
                    date,
                    dailyGoals: defaultGoals,
                    meals: defaultMeals.map((m) => ({ id: generateId(), name: m.name, goals: m.goals })),
                    templateSelected: false,
                }
                set((state) => ({ days: [...state.days, newDay] }))
            },

            applyTemplateToDay: (date, template) => {
                const existing = get().days.find((d) => d.date === date)

                // Clear existing food logs for this date
                get().clearLogsForDate(date)

                const newDayData: DayData = {
                    date,
                    dailyGoals: template.dailyGoals,
                    meals: template.meals.map((m) => ({ id: generateId(), name: m.name, goals: m.goals })),
                    templateSelected: true,
                }

                if (existing) {
                    set((state) => ({
                        days: state.days.map((d) => d.date === date ? newDayData : d)
                    }))
                } else {
                    set((state) => ({ days: [...state.days, newDayData] }))
                }
            },

            skipTemplateSelection: (date) => {
                const existing = get().days.find((d) => d.date === date)

                if (existing) {
                    set((state) => ({
                        days: state.days.map((d) => d.date === date ? { ...d, templateSelected: true } : d)
                    }))
                } else {
                    const defaultTemplate = get().getDefaultTemplate()
                    const newDay: DayData = {
                        date,
                        dailyGoals: defaultTemplate?.dailyGoals || defaultGoals,
                        meals: (defaultTemplate?.meals || defaultMeals).map((m) => ({
                            id: generateId(), name: m.name, goals: m.goals
                        })),
                        templateSelected: true,
                    }
                    set((state) => ({ days: [...state.days, newDay] }))
                }
            },

            setDayGoals: (date, goals) => set((state) => ({
                days: state.days.map((d) => d.date === date ? { ...d, dailyGoals: goals } : d)
            })),
            addMealToDay: (date, meal) => set((state) => ({
                days: state.days.map((d) => d.date === date
                    ? { ...d, meals: [...d.meals, { ...meal, id: generateId() }] }
                    : d
                )
            })),
            updateMealGoals: (date, mealId, goals) => set((state) => ({
                days: state.days.map((d) => d.date === date
                    ? { ...d, meals: d.meals.map((m) => m.id === mealId ? { ...m, goals } : m) }
                    : d
                )
            })),
            deleteMealFromDay: (date, mealId) => set((state) => ({
                days: state.days.map((d) => d.date === date
                    ? { ...d, meals: d.meals.filter((m) => m.id !== mealId) }
                    : d
                )
            })),
            reorderMealsInDay: (date, fromIndex, toIndex) => set((state) => ({
                days: state.days.map((d) => {
                    if (d.date !== date) return d
                    const newMeals = [...d.meals]
                    const [removed] = newMeals.splice(fromIndex, 1)
                    newMeals.splice(toIndex, 0, removed)
                    return { ...d, meals: newMeals }
                })
            })),

            // Selected Date
            selectedDate: getTodayString(),
            setSelectedDate: (date) => {
                if (!isFutureDate(date)) {
                    set({ selectedDate: date })
                }
            },
        }),
        {
            name: 'fityo-storage-v3',
        }
    )
)
