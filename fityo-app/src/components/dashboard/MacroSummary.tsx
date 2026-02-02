"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { useAppStore, calculateMacros, isToday } from "@/lib/store"
import { Settings } from "lucide-react"

export function MacroSummary() {
    const { logs, foods, selectedDate, days, setDayGoals } = useAppStore()
    const [goalsModalOpen, setGoalsModalOpen] = useState(false)
    const [editCalories, setEditCalories] = useState('')
    const [editProtein, setEditProtein] = useState('')
    const [editCarbs, setEditCarbs] = useState('')
    const [editFat, setEditFat] = useState('')

    const canEdit = isToday(selectedDate)
    const dayData = days.find((d) => d.date === selectedDate)
    const goals = dayData?.dailyGoals || { calories: 2400, protein: 180, carbs: 200, fat: 70 }

    // Calculate totals for selected date
    const totals = useMemo(() => {
        const logsForDate = logs.filter((log) => log.date === selectedDate)

        let totalProtein = 0
        let totalCarbs = 0
        let totalFat = 0
        let totalCalories = 0

        logsForDate.forEach((log) => {
            const food = foods.find((f) => f.id === log.foodId)
            if (food) {
                const macros = calculateMacros(food, log.grams)
                totalProtein += macros.protein
                totalCarbs += macros.carbs
                totalFat += macros.fat
                totalCalories += macros.calories
            }
        })

        return {
            protein: Math.round(totalProtein),
            carbs: Math.round(totalCarbs),
            fat: Math.round(totalFat),
            calories: totalCalories,
        }
    }, [logs, foods, selectedDate])

    const caloriePercent = Math.min(100, Math.round((totals.calories / goals.calories) * 100))

    const macros = [
        { label: "Protein", current: totals.protein, target: goals.protein, unit: "g", color: "bg-emerald-500" },
        { label: "Carbs", current: totals.carbs, target: goals.carbs, unit: "g", color: "bg-blue-500" },
        { label: "Fat", current: totals.fat, target: goals.fat, unit: "g", color: "bg-purple-500" },
    ]

    const openGoalsModal = () => {
        setEditCalories(goals.calories.toString())
        setEditProtein(goals.protein.toString())
        setEditCarbs(goals.carbs.toString())
        setEditFat(goals.fat.toString())
        setGoalsModalOpen(true)
    }

    const saveGoals = () => {
        setDayGoals(selectedDate, {
            calories: parseInt(editCalories) || 0,
            protein: parseInt(editProtein) || 0,
            carbs: parseInt(editCarbs) || 0,
            fat: parseInt(editFat) || 0,
        })
        setGoalsModalOpen(false)
    }

    return (
        <>
            <div className="space-y-4">
                {/* Calories Main Card */}
                <Card className="bg-card/40 border-primary/20 bg-gradient-to-br from-card/40 to-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-4xl font-bold tracking-tighter text-foreground">{totals.calories}</span>
                                <span className="text-muted-foreground ml-1">/ {goals.calories} kcal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">{caloriePercent}%</span>
                                {canEdit && (
                                    <button
                                        onClick={openGoalsModal}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <Progress value={caloriePercent} className="h-3" />
                    </CardContent>
                </Card>

                {/* Macros Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {macros.map((macro, i) => {
                        const percentage = Math.min(100, Math.round((macro.current / macro.target) * 100))
                        return (
                            <Card key={i} className="bg-card/30">
                                <CardContent className="p-4 flex flex-col gap-2">
                                    <span className="text-xs text-muted-foreground font-medium uppercase">{macro.label}</span>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-lg font-bold text-foreground">{macro.current}</span>
                                        <span className="text-[10px] text-muted-foreground">/{macro.target}{macro.unit}</span>
                                    </div>
                                    <Progress value={percentage} className="h-1.5" indicatorColor={macro.color} />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Set Goals Modal */}
            <Modal isOpen={goalsModalOpen} onClose={() => setGoalsModalOpen(false)} title="Set Daily Goals">
                <div className="space-y-4">
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
                    <Button onClick={saveGoals} className="w-full">Save Goals</Button>
                </div>
            </Modal>
        </>
    )
}
