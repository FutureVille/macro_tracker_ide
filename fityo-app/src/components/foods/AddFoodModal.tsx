"use client"

import React, { useState, useEffect, useTransition } from "react"
import { Modal } from "@/components/ui/modal"
import { Tabs } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAppStore, Meal } from "@/lib/store"
import { Search, Plus, Check, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { calculateMacros } from "@/lib/macros"

interface Food {
    id: string
    name: string
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    calories_per_100g: number
}

interface AddFoodModalProps {
    isOpen: boolean
    onClose: () => void
    mealId: string
}

export function AddFoodModal({ isOpen, onClose, mealId }: AddFoodModalProps) {
    const [activeTab, setActiveTab] = useState<string>("select")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)
    const [grams, setGrams] = useState("")
    const [foods, setFoods] = useState<Food[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const supabase = createClient()

    // New food form
    const [newFoodName, setNewFoodName] = useState("")
    const [newProtein, setNewProtein] = useState("")
    const [newCarbs, setNewCarbs] = useState("")
    const [newFat, setNewFat] = useState("")
    const [newCalories, setNewCalories] = useState("")

    const { selectedDate, days } = useAppStore()
    const dayData = days.find((d) => d.date === selectedDate)
    const meal = dayData?.meals.find((m) => m.id === mealId)

    // Load foods when modal opens
    useEffect(() => {
        if (isOpen) {
            loadFoods()
        }
    }, [isOpen])

    const loadFoods = async () => {
        setIsLoading(true)
        const { data } = await supabase.from('foods_library').select('*')
        if (data) {
            setFoods(data as Food[])
        }
        setIsLoading(false)
    }

    const filteredFoods = foods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddExisting = () => {
        if (!selectedFood || !grams) return

        startTransition(async () => {
            await supabase.from('daily_logs').insert({
                food_id: selectedFood.id,
                meal_type: meal?.name || 'meal',
                amount_grams: parseFloat(grams),
                date: selectedDate,
            })
            resetAndClose()
        })
    }

    const handleCreateAndAdd = () => {
        if (!newFoodName || !newProtein || !newCarbs || !newFat || !newCalories || !grams) return

        startTransition(async () => {
            // First create the food
            const { data: createdFood, error: createError } = await supabase.from('foods_library').insert({
                name: newFoodName,
                protein_per_100g: parseFloat(newProtein),
                carbs_per_100g: parseFloat(newCarbs),
                fat_per_100g: parseFloat(newFat),
                calories_per_100g: parseFloat(newCalories),
            }).select().single()

            if (!createError && createdFood) {
                await supabase.from('daily_logs').insert({
                    food_id: createdFood.id,
                    meal_type: meal?.name || 'meal',
                    amount_grams: parseFloat(grams),
                    date: selectedDate,
                })
            }
            resetAndClose()
        })
    }

    const resetAndClose = () => {
        setActiveTab("select")
        setSearchQuery("")
        setSelectedFood(null)
        setGrams("")
        setNewFoodName("")
        setNewProtein("")
        setNewCarbs("")
        setNewFat("")
        setNewCalories("")
        onClose()
    }

    const previewMacros = selectedFood && grams
        ? calculateMacros(
            selectedFood.protein_per_100g,
            selectedFood.carbs_per_100g,
            selectedFood.fat_per_100g,
            selectedFood.calories_per_100g,
            parseFloat(grams)
        )
        : null

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title={`Add to ${meal?.name || 'Meal'}`}>
            <div className="space-y-6">
                <Tabs
                    tabs={[
                        { id: "select", label: "Select Food" },
                        { id: "create", label: "Create New" },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {activeTab === "select" ? (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search saved foods..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11"
                            />
                        </div>

                        {/* Food List */}
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : filteredFoods.length > 0 ? (
                                filteredFoods.map((food) => (
                                    <Card
                                        key={food.id}
                                        onClick={() => setSelectedFood(food)}
                                        className={`p-3 cursor-pointer transition-all ${selectedFood?.id === food.id
                                            ? "border-primary bg-primary/10"
                                            : "hover:bg-white/5"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-foreground">{food.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {food.calories_per_100g} kcal • {food.protein_per_100g}p • {food.carbs_per_100g}c • {food.fat_per_100g}f per 100g
                                                </p>
                                            </div>
                                            {selectedFood?.id === food.id && (
                                                <Check className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-8">
                                    {foods.length === 0 ? "No saved foods yet. Create one!" : "No foods match your search."}
                                </p>
                            )}
                        </div>

                        {/* Grams Input */}
                        {selectedFood && (
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <Input
                                    type="number"
                                    label="How many grams?"
                                    placeholder="e.g. 150"
                                    value={grams}
                                    onChange={(e) => setGrams(e.target.value)}
                                />

                                {previewMacros && (
                                    <div className="flex justify-between text-sm bg-white/5 rounded-xl p-3">
                                        <span className="text-muted-foreground">This adds:</span>
                                        <span className="font-medium">
                                            {previewMacros.calories} kcal • {previewMacros.protein}p • {previewMacros.carbs}c • {previewMacros.fat}f
                                        </span>
                                    </div>
                                )}

                                <Button
                                    onClick={handleAddExisting}
                                    className="w-full"
                                    disabled={!grams || isPending}
                                >
                                    {isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    Add to {meal?.name || 'Meal'}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Input
                            label="Food Name"
                            placeholder="e.g. Chicken Breast"
                            value={newFoodName}
                            onChange={(e) => setNewFoodName(e.target.value)}
                        />

                        <Input
                            type="number"
                            label="Calories per 100g"
                            placeholder="e.g. 165"
                            value={newCalories}
                            onChange={(e) => setNewCalories(e.target.value)}
                        />

                        <div className="grid grid-cols-3 gap-3">
                            <Input
                                type="number"
                                label="Protein/100g"
                                placeholder="0"
                                value={newProtein}
                                onChange={(e) => setNewProtein(e.target.value)}
                            />
                            <Input
                                type="number"
                                label="Carbs/100g"
                                placeholder="0"
                                value={newCarbs}
                                onChange={(e) => setNewCarbs(e.target.value)}
                            />
                            <Input
                                type="number"
                                label="Fat/100g"
                                placeholder="0"
                                value={newFat}
                                onChange={(e) => setNewFat(e.target.value)}
                            />
                        </div>

                        <Input
                            type="number"
                            label="How many grams are you eating?"
                            placeholder="e.g. 150"
                            value={grams}
                            onChange={(e) => setGrams(e.target.value)}
                        />

                        <Button
                            onClick={handleCreateAndAdd}
                            className="w-full"
                            disabled={!newFoodName || !newProtein || !newCarbs || !newFat || !newCalories || !grams || isPending}
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            Create & Add to {meal?.name || 'Meal'}
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    )
}
