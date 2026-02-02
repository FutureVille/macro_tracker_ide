"use client"

import React, { useState } from "react"
import { useAppStore, Food } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Trash2, Plus, UtensilsCrossed } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FoodLibrary() {
    const { foods, addFood, deleteFood } = useAppStore()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // New food form
    const [name, setName] = useState("")
    const [protein, setProtein] = useState("")
    const [carbs, setCarbs] = useState("")
    const [fat, setFat] = useState("")
    const [calories, setCalories] = useState("") // User-input calories

    const handleCreate = () => {
        if (!name || !protein || !carbs || !fat || !calories) return

        addFood({
            name,
            proteinPer100g: parseFloat(protein),
            carbsPer100g: parseFloat(carbs),
            fatPer100g: parseFloat(fat),
            caloriesPer100g: parseFloat(calories), // User-input, not calculated
        })

        setName("")
        setProtein("")
        setCarbs("")
        setFat("")
        setCalories("")
        setIsAddModalOpen(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Food Library</h2>
                <Button variant="glass" size="sm" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Food
                </Button>
            </div>

            {foods.length === 0 ? (
                <Card className="bg-card/20">
                    <CardContent className="py-12 text-center">
                        <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">No saved foods yet.</p>
                        <p className="text-sm text-muted-foreground/60">Create your first food to get started!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    <AnimatePresence>
                        {foods.map((food) => (
                            <motion.div
                                key={food.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="bg-card/30 hover:bg-card/40 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-foreground">{food.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {food.caloriesPer100g} kcal • {food.proteinPer100g}p • {food.carbsPer100g}c • {food.fatPer100g}f per 100g
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteFood(food.id)}
                                            className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Food Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Food">
                <div className="space-y-4">
                    <Input
                        label="Food Name"
                        placeholder="e.g. Chicken Breast"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Input
                        type="number"
                        label="Calories per 100g"
                        placeholder="e.g. 165"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                    />

                    <div className="grid grid-cols-3 gap-3">
                        <Input
                            type="number"
                            label="Protein/100g"
                            placeholder="0"
                            value={protein}
                            onChange={(e) => setProtein(e.target.value)}
                        />
                        <Input
                            type="number"
                            label="Carbs/100g"
                            placeholder="0"
                            value={carbs}
                            onChange={(e) => setCarbs(e.target.value)}
                        />
                        <Input
                            type="number"
                            label="Fat/100g"
                            placeholder="0"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleCreate}
                        className="w-full"
                        disabled={!name || !protein || !carbs || !fat || !calories}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Save to Library
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
