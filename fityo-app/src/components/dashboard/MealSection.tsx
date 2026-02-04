"use client"

import React, { useState, useMemo, useEffect, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Edit2, GripVertical, Loader2 } from "lucide-react"
import { useAppStore, isToday, Meal } from "@/lib/store"
import { AddFoodModal } from "@/components/foods/AddFoodModal"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { getLogsForDate, deleteFoodLog, FoodLogWithFood } from "@/lib/actions/logs"
import { calculateMacros } from "@/lib/macros"

export function MealSection() {
    const { selectedDate, days, updateMealGoals, renameMeal, deleteMealFromDay, setMealsInDay } = useAppStore()
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [selectedMealId, setSelectedMealId] = useState<string>('')
    const [editGoalsModal, setEditGoalsModal] = useState<{ open: boolean; meal: Meal | null }>({ open: false, meal: null })
    const [editName, setEditName] = useState('')
    const [editCalories, setEditCalories] = useState('')
    const [editProtein, setEditProtein] = useState('')
    const [editCarbs, setEditCarbs] = useState('')
    const [editFat, setEditFat] = useState('')

    // Database logs
    const [dbLogs, setDbLogs] = useState<FoodLogWithFood[]>([])
    const [isLoadingLogs, setIsLoadingLogs] = useState(true)
    const [isPending, startTransition] = useTransition()

    // Local state for reordering
    const [localMeals, setLocalMeals] = useState<Meal[]>([])

    const canEdit = isToday(selectedDate)
    const dayData = days.find((d) => d.date === selectedDate)
    const meals = dayData?.meals || []

    // Load logs from database
    useEffect(() => {
        loadLogs()
    }, [selectedDate])

    const loadLogs = async () => {
        setIsLoadingLogs(true)
        const logs = await getLogsForDate(selectedDate)
        setDbLogs(logs)
        setIsLoadingLogs(false)
    }

    // Sync local meals with store meals when they change
    React.useEffect(() => {
        setLocalMeals(meals)
    }, [meals])

    const getMealData = (meal: Meal) => {
        // Filter logs by meal_type matching meal name
        const mealLogs = dbLogs.filter((log) =>
            log.meal_type.toLowerCase() === meal.name.toLowerCase()
        )

        const items = mealLogs.map((log) => {
            if (!log.foods_library) return null
            const food = log.foods_library
            const macros = calculateMacros(
                food.protein_per_100g,
                food.carbs_per_100g,
                food.fat_per_100g,
                food.calories_per_100g,
                log.amount_grams
            )
            return {
                id: log.id,
                name: food.name,
                grams: log.amount_grams,
                ...macros
            }
        }).filter(Boolean)

        const totals = items.reduce(
            (acc, item) => ({
                calories: acc.calories + (item?.calories || 0),
                protein: acc.protein + (item?.protein || 0),
                carbs: acc.carbs + (item?.carbs || 0),
                fat: acc.fat + (item?.fat || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )

        return { items, totals }
    }

    const handleAddClick = (mealId: string) => {
        setSelectedMealId(mealId)
        setAddModalOpen(true)
    }

    const handleDeleteLog = (logId: string) => {
        startTransition(async () => {
            await deleteFoodLog(logId)
            await loadLogs()
        })
    }

    const openEditGoals = (meal: Meal) => {
        setEditName(meal.name)
        setEditCalories(meal.goals.calories.toString())
        setEditProtein(meal.goals.protein.toString())
        setEditCarbs(meal.goals.carbs.toString())
        setEditFat(meal.goals.fat.toString())
        setEditGoalsModal({ open: true, meal })
    }

    const saveGoals = () => {
        if (!editGoalsModal.meal) return
        const mealId = editGoalsModal.meal.id

        // Rename if changed
        if (editName !== editGoalsModal.meal.name) {
            renameMeal(selectedDate, mealId, editName)
        }

        // Update goals
        updateMealGoals(selectedDate, mealId, {
            calories: parseInt(editCalories) || 0,
            protein: parseInt(editProtein) || 0,
            carbs: parseInt(editCarbs) || 0,
            fat: parseInt(editFat) || 0,
        })
        setEditGoalsModal({ open: false, meal: null })
    }

    const handleReorder = (newOrder: Meal[]) => {
        setLocalMeals(newOrder)
    }

    const handleReorderComplete = () => {
        // Only save to store when drag ends
        if (JSON.stringify(localMeals.map(m => m.id)) !== JSON.stringify(meals.map(m => m.id))) {
            setMealsInDay(selectedDate, localMeals)
        }
    }

    // Reload logs when modal closes (new food added)
    const handleModalClose = () => {
        setAddModalOpen(false)
        loadLogs()
    }

    if (!dayData) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                No data for this day
            </div>
        )
    }

    const MealCard = ({ meal }: { meal: Meal }) => {
        const { items, totals } = getMealData(meal)
        const calPercent = Math.min(100, Math.round((totals.calories / meal.goals.calories) * 100) || 0)

        return (
            <Card className="p-4 bg-card/40 border-white/5 shadow-xl shadow-black/20 rounded-2xl space-y-3">
                {/* Meal Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
                        )}
                        <h3 className="text-base font-semibold text-foreground">{meal.name}</h3>
                        {canEdit && (
                            <button
                                onClick={() => openEditGoals(meal)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <span className="text-sm font-bold text-foreground">{Math.round(totals.calories)}</span>
                            <span className="text-sm text-muted-foreground">/{meal.goals.calories}</span>
                        </div>
                        {canEdit && localMeals.length > 1 && (
                            <button
                                onClick={() => deleteMealFromDay(selectedDate, meal.id)}
                                className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Calorie Progress Bar */}
                <Progress value={calPercent} className="h-2" />

                {/* Macro Progress Row */}
                <div className="flex gap-3 text-xs">
                    <div className="flex-1 bg-white/3 rounded-lg p-2">
                        <div className="flex justify-between text-muted-foreground mb-1">
                            <span className="font-medium text-emerald-400">P</span>
                            <span>{Math.round(totals.protein)}/{meal.goals.protein}g</span>
                        </div>
                        <Progress value={Math.min(100, (totals.protein / meal.goals.protein) * 100 || 0)} className="h-1" indicatorColor="bg-emerald-500" />
                    </div>
                    <div className="flex-1 bg-white/3 rounded-lg p-2">
                        <div className="flex justify-between text-muted-foreground mb-1">
                            <span className="font-medium text-blue-400">C</span>
                            <span>{Math.round(totals.carbs)}/{meal.goals.carbs}g</span>
                        </div>
                        <Progress value={Math.min(100, (totals.carbs / meal.goals.carbs) * 100 || 0)} className="h-1" indicatorColor="bg-blue-500" />
                    </div>
                    <div className="flex-1 bg-white/3 rounded-lg p-2">
                        <div className="flex justify-between text-muted-foreground mb-1">
                            <span className="font-medium text-purple-400">F</span>
                            <span>{Math.round(totals.fat)}/{meal.goals.fat}g</span>
                        </div>
                        <Progress value={Math.min(100, (totals.fat / meal.goals.fat) * 100 || 0)} className="h-1" indicatorColor="bg-purple-500" />
                    </div>
                </div>

                {/* Food Items */}
                <div className="bg-black/20 rounded-xl overflow-hidden">
                    {isLoadingLogs ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <AnimatePresence>
                            {items.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {items.map((item) => item && (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground text-sm">{item.name}</span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {item.grams}g • {item.protein}p • {item.carbs}c • {item.fat}f
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground/80">{item.calories}</span>
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleDeleteLog(item.id)}
                                                        disabled={isPending}
                                                        className="p-1 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                                                    >
                                                        {isPending ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-3 py-4 text-center text-xs text-muted-foreground/50">
                                    No food logged yet
                                </div>
                            )}
                        </AnimatePresence>
                    )}

                    {canEdit && (
                        <button
                            onClick={() => handleAddClick(meal.id)}
                            className="w-full px-3 py-2.5 flex items-center justify-center gap-2 text-sm text-primary hover:bg-primary/5 transition-colors font-medium border-t border-white/5"
                        >
                            <Plus className="w-4 h-4" /> Add Food
                        </button>
                    )}
                </div>
            </Card>
        )
    }

    return (
        <>
            <div className="space-y-5 pb-8">
                {canEdit ? (
                    <Reorder.Group
                        axis="y"
                        values={localMeals}
                        onReorder={handleReorder}
                        className="space-y-5"
                    >
                        {localMeals.map((meal) => (
                            <Reorder.Item
                                key={meal.id}
                                value={meal}
                                className="list-none"
                                onDragEnd={handleReorderComplete}
                            >
                                <MealCard meal={meal} />
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                ) : (
                    meals.map((meal) => (
                        <MealCard key={meal.id} meal={meal} />
                    ))
                )}
            </div>

            <AddFoodModal
                isOpen={addModalOpen}
                onClose={handleModalClose}
                mealId={selectedMealId}
            />

            <Modal
                isOpen={editGoalsModal.open}
                onClose={() => setEditGoalsModal({ open: false, meal: null })}
                title="Edit Meal"
            >
                <div className="space-y-4">
                    <Input
                        label="Meal Name"
                        placeholder="e.g. Breakfast"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />
                    <Input
                        type="number"
                        label="Calories"
                        value={editCalories}
                        onChange={(e) => setEditCalories(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-3">
                        <Input
                            type="number"
                            label="Protein (g)"
                            value={editProtein}
                            onChange={(e) => setEditProtein(e.target.value)}
                        />
                        <Input
                            type="number"
                            label="Carbs (g)"
                            value={editCarbs}
                            onChange={(e) => setEditCarbs(e.target.value)}
                        />
                        <Input
                            type="number"
                            label="Fat (g)"
                            value={editFat}
                            onChange={(e) => setEditFat(e.target.value)}
                        />
                    </div>
                    <Button onClick={saveGoals} className="w-full">Save Changes</Button>
                </div>
            </Modal>
        </>
    )
}
