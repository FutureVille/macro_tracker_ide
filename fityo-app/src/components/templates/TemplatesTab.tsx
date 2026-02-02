"use client"

import React, { useState } from "react"
import { useAppStore, Template, MacroGoals } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Plus, Star, Trash2, Edit2, GripVertical } from "lucide-react"
import { motion, AnimatePresence, Reorder } from "framer-motion"

interface MealConfig {
    id: string // Add id for reorder tracking
    name: string
    goals: MacroGoals
}

const generateMealId = () => Math.random().toString(36).substring(2, 9)

export function TemplatesTab() {
    const { templates, addTemplate, updateTemplate, deleteTemplate, setDefaultTemplate } = useAppStore()
    const [editorOpen, setEditorOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

    // Editor state
    const [templateName, setTemplateName] = useState("")
    const [dailyCalories, setDailyCalories] = useState("2400")
    const [dailyProtein, setDailyProtein] = useState("180")
    const [dailyCarbs, setDailyCarbs] = useState("200")
    const [dailyFat, setDailyFat] = useState("70")
    const [meals, setMeals] = useState<MealConfig[]>([
        { id: generateMealId(), name: "Breakfast", goals: { calories: 600, protein: 45, carbs: 50, fat: 18 } },
        { id: generateMealId(), name: "Lunch", goals: { calories: 800, protein: 60, carbs: 67, fat: 23 } },
        { id: generateMealId(), name: "Dinner", goals: { calories: 800, protein: 60, carbs: 67, fat: 23 } },
    ])

    const openNewTemplate = () => {
        setEditingTemplate(null)
        setTemplateName("")
        setDailyCalories("2400")
        setDailyProtein("180")
        setDailyCarbs("200")
        setDailyFat("70")
        setMeals([
            { id: generateMealId(), name: "Breakfast", goals: { calories: 600, protein: 45, carbs: 50, fat: 18 } },
            { id: generateMealId(), name: "Lunch", goals: { calories: 800, protein: 60, carbs: 67, fat: 23 } },
            { id: generateMealId(), name: "Dinner", goals: { calories: 800, protein: 60, carbs: 67, fat: 23 } },
        ])
        setEditorOpen(true)
    }

    const openEditTemplate = (template: Template) => {
        setEditingTemplate(template)
        setTemplateName(template.name)
        setDailyCalories(template.dailyGoals.calories.toString())
        setDailyProtein(template.dailyGoals.protein.toString())
        setDailyCarbs(template.dailyGoals.carbs.toString())
        setDailyFat(template.dailyGoals.fat.toString())
        setMeals(template.meals.map((m) => ({ id: generateMealId(), name: m.name, goals: { ...m.goals } })))
        setEditorOpen(true)
    }

    const addMeal = () => {
        setMeals([...meals, { id: generateMealId(), name: "New Meal", goals: { calories: 400, protein: 30, carbs: 33, fat: 12 } }])
    }

    const updateMeal = (id: string, updates: Partial<MealConfig>) => {
        setMeals(meals.map((m) => m.id === id ? { ...m, ...updates } : m))
    }

    const updateMealGoals = (id: string, field: keyof MacroGoals, value: string) => {
        setMeals(meals.map((m) => {
            if (m.id !== id) return m
            return {
                ...m,
                goals: { ...m.goals, [field]: parseInt(value) || 0 }
            }
        }))
    }

    const removeMeal = (id: string) => {
        if (meals.length > 1) {
            setMeals(meals.filter((m) => m.id !== id))
        }
    }

    const saveTemplate = () => {
        const templateData = {
            name: templateName || "Untitled Template",
            isDefault: editingTemplate?.isDefault || templates.length === 0,
            dailyGoals: {
                calories: parseInt(dailyCalories) || 0,
                protein: parseInt(dailyProtein) || 0,
                carbs: parseInt(dailyCarbs) || 0,
                fat: parseInt(dailyFat) || 0,
            },
            meals: meals.map((m) => ({ name: m.name, goals: m.goals })),
        }

        if (editingTemplate) {
            updateTemplate(editingTemplate.id, templateData)
        } else {
            addTemplate(templateData)
        }

        setEditorOpen(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Templates</h2>
                <Button variant="glass" size="sm" onClick={openNewTemplate}>
                    <Plus className="w-4 h-4 mr-1" /> New Template
                </Button>
            </div>

            <p className="text-sm text-muted-foreground">
                Templates define your day structure. The default template is used for each new day.
            </p>

            {templates.length === 0 ? (
                <Card className="bg-card/20">
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No templates yet.</p>
                        <p className="text-sm text-muted-foreground/60">Create one to set up your daily structure!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    <AnimatePresence>
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Card className={`bg-card/30 ${template.isDefault ? 'border-primary/30' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-foreground">{template.name}</p>
                                                    {template.isDefault && (
                                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {template.dailyGoals.calories} kcal • {template.meals.length} meals
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Meals: {template.meals.map((m) => m.name).join(", ")}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!template.isDefault && (
                                                    <button
                                                        onClick={() => setDefaultTemplate(template.id)}
                                                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                                        title="Set as default"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditTemplate(template)}
                                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteTemplate(template.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Template Editor Modal */}
            <Modal
                isOpen={editorOpen}
                onClose={() => setEditorOpen(false)}
                title={editingTemplate ? "Edit Template" : "Create Template"}
            >
                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Template Name */}
                    <Input
                        label="Template Name"
                        placeholder="e.g. Cutting Phase"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                    />

                    {/* Daily Goals */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground">Daily Goals</h3>
                        <Input
                            type="number"
                            label="Calories"
                            value={dailyCalories}
                            onChange={(e) => setDailyCalories(e.target.value)}
                        />
                        <div className="grid grid-cols-3 gap-2">
                            <Input
                                type="number"
                                label="Protein (g)"
                                value={dailyProtein}
                                onChange={(e) => setDailyProtein(e.target.value)}
                            />
                            <Input
                                type="number"
                                label="Carbs (g)"
                                value={dailyCarbs}
                                onChange={(e) => setDailyCarbs(e.target.value)}
                            />
                            <Input
                                type="number"
                                label="Fat (g)"
                                value={dailyFat}
                                onChange={(e) => setDailyFat(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Meals - Reorderable */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-foreground">Meals</h3>
                            <button onClick={addMeal} className="text-xs text-primary hover:underline">
                                + Add Meal
                            </button>
                        </div>

                        <p className="text-xs text-muted-foreground">Drag to reorder meals</p>

                        <Reorder.Group axis="y" values={meals} onReorder={setMeals} className="space-y-2">
                            {meals.map((meal) => (
                                <Reorder.Item key={meal.id} value={meal} className="list-none">
                                    <Card className="bg-white/5 p-3 space-y-2 cursor-grab active:cursor-grabbing">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                                            <Input
                                                placeholder="Meal name"
                                                value={meal.name}
                                                onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                                                className="flex-1"
                                            />
                                            {meals.length > 1 && (
                                                <button
                                                    onClick={() => removeMeal(meal.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <Input
                                                type="number"
                                                label="Cal"
                                                value={meal.goals.calories.toString()}
                                                onChange={(e) => updateMealGoals(meal.id, 'calories', e.target.value)}
                                            />
                                            <Input
                                                type="number"
                                                label="P"
                                                value={meal.goals.protein.toString()}
                                                onChange={(e) => updateMealGoals(meal.id, 'protein', e.target.value)}
                                            />
                                            <Input
                                                type="number"
                                                label="C"
                                                value={meal.goals.carbs.toString()}
                                                onChange={(e) => updateMealGoals(meal.id, 'carbs', e.target.value)}
                                            />
                                            <Input
                                                type="number"
                                                label="F"
                                                value={meal.goals.fat.toString()}
                                                onChange={(e) => updateMealGoals(meal.id, 'fat', e.target.value)}
                                            />
                                        </div>
                                    </Card>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>

                    <Button onClick={saveTemplate} className="w-full">
                        {editingTemplate ? "Save Changes" : "Create Template"}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
