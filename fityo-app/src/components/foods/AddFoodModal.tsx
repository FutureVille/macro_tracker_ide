"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Tabs } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAppStore, Food, calculateMacros } from "@/lib/store"
import { Search, Plus, Check } from "lucide-react"

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

    // New food form
    const [newFoodName, setNewFoodName] = useState("")
    const [newProtein, setNewProtein] = useState("")
    const [newCarbs, setNewCarbs] = useState("")
    const [newFat, setNewFat] = useState("")
    const [newCalories, setNewCalories] = useState("") // User-input calories

    const { foods, addFood, addLog, selectedDate, days } = useAppStore()
    const dayData = days.find((d) => d.date === selectedDate)
    const meal = dayData?.meals.find((m) => m.id === mealId)

    const filteredFoods = foods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddExisting = () => {
        if (!selectedFood || !grams) return

        addLog({
            foodId: selectedFood.id,
            mealId,
            grams: parseFloat(grams),
            date: selectedDate,
        })

        resetAndClose()
    }

    const handleCreateAndAdd = () => {
        if (!newFoodName || !newProtein || !newCarbs || !newFat || !newCalories || !grams) return

        const newFood: Omit<Food, 'id'> = {
            name: newFoodName,
            proteinPer100g: parseFloat(newProtein),
            carbsPer100g: parseFloat(newCarbs),
            fatPer100g: parseFloat(newFat),
            caloriesPer100g: parseFloat(newCalories), // User-input, not calculated
        }

        addFood(newFood)

        // Add log after the food is created
        setTimeout(() => {
            const createdFood = useAppStore.getState().foods.find((f) => f.name === newFoodName)
            if (createdFood) {
                addLog({
                    foodId: createdFood.id,
                    mealId,
                    grams: parseFloat(grams),
                    date: selectedDate,
                })
            }
        }, 0)

        resetAndClose()
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
        ? calculateMacros(selectedFood, parseFloat(grams))
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
                            {filteredFoods.length > 0 ? (
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
                                                    {food.caloriesPer100g} kcal • {food.proteinPer100g}p • {food.carbsPer100g}c • {food.fatPer100g}f per 100g
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
                                    disabled={!grams}
                                >
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
                            disabled={!newFoodName || !newProtein || !newCarbs || !newFat || !newCalories || !grams}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create & Add to {meal?.name || 'Meal'}
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    )
}
