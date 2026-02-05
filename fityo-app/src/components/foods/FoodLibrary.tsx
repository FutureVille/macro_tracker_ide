"use client"

import React, { useState, useEffect, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Trash2, Plus, UtensilsCrossed, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

interface Food {
    id: string
    name: string
    protein_per_100g: number
    carbs_per_100g: number
    fat_per_100g: number
    calories_per_100g: number
}

export function FoodLibrary() {
    const [foods, setFoods] = useState<Food[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const supabase = createClient()

    // New food form
    const [name, setName] = useState("")
    const [protein, setProtein] = useState("")
    const [carbs, setCarbs] = useState("")
    const [fat, setFat] = useState("")
    const [calories, setCalories] = useState("")

    // Load foods on mount
    useEffect(() => {
        loadFoods()
    }, [])

    const loadFoods = async () => {
        setIsLoading(true)
        const { data, error } = await supabase.from('foods_library').select('*')
        if (data) {
            setFoods(data as Food[])
        }
        setIsLoading(false)
    }

    const handleCreate = () => {
        if (!name || !protein || !carbs || !fat || !calories) return

        startTransition(async () => {
            const { error } = await supabase.from('foods_library').insert({
                name,
                protein_per_100g: parseFloat(protein),
                carbs_per_100g: parseFloat(carbs),
                fat_per_100g: parseFloat(fat),
                calories_per_100g: parseFloat(calories),
            })

            if (!error) {
                await loadFoods()
                setName("")
                setProtein("")
                setCarbs("")
                setFat("")
                setCalories("")
                setIsAddModalOpen(false)
            }
        })
    }

    const handleDelete = (id: string) => {
        startTransition(async () => {
            const { error } = await supabase.from('foods_library').delete().eq('id', id)
            if (!error) {
                await loadFoods()
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex-none flex items-center justify-between pb-4">
                <h2 className="text-xl font-bold text-foreground">Food Library</h2>
                <Button variant="glass" size="sm" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Food
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pt-6 pb-20 no-scrollbar [mask-image:linear-gradient(to_bottom,transparent_0%,black_12px,black_calc(100%-12px),transparent_100%)]">
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
                                                    {food.calories_per_100g} kcal • {food.protein_per_100g}p • {food.carbs_per_100g}c • {food.fat_per_100g}f per 100g
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(food.id)}
                                                disabled={isPending}
                                                className="p-2 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                                            >
                                                {isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

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
                        disabled={!name || !protein || !carbs || !fat || !calories || isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        Save to Library
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
