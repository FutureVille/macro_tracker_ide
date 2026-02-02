"use client"

import React from "react"
import { useAppStore, Template, getTodayString } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, Check, SkipForward, Plus } from "lucide-react"
import { motion } from "framer-motion"

interface TemplateSelectionScreenProps {
    onComplete: () => void
    onCreateTemplate: () => void
}

export function TemplateSelectionScreen({ onComplete, onCreateTemplate }: TemplateSelectionScreenProps) {
    const { templates, applyTemplateToDay, skipTemplateSelection } = useAppStore()
    const todayString = getTodayString()

    const handleSelectTemplate = (template: Template) => {
        applyTemplateToDay(todayString, template)
        onComplete()
    }

    const handleSkip = () => {
        skipTemplateSelection(todayString)
        onComplete()
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
                        <LayoutTemplate className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Start Your Day</h1>
                    <p className="text-muted-foreground text-sm">
                        Choose a template to set up your daily goals and meals
                    </p>
                </div>

                {/* Templates List */}
                {templates.length > 0 ? (
                    <div className="space-y-3">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    onClick={() => handleSelectTemplate(template)}
                                    className="cursor-pointer bg-card/50 hover:bg-card/80 border-white/10 shadow-lg shadow-black/20 transition-all"
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-foreground">{template.name}</p>
                                                {template.isDefault && (
                                                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Default</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {template.dailyGoals.calories} kcal • {template.meals.length} meals
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-primary" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-card/30 border-white/10 shadow-lg shadow-black/20">
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground mb-4">No templates yet</p>
                            <Button variant="glass" onClick={onCreateTemplate}>
                                <Plus className="w-4 h-4 mr-2" /> Create Template
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Skip Button */}
                <div className="text-center">
                    <button
                        onClick={handleSkip}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                    >
                        <SkipForward className="w-4 h-4" />
                        Skip for now
                    </button>
                    <p className="text-xs text-muted-foreground/50 mt-2">
                        Uses default template or last settings
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
