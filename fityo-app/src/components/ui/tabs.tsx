"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TabsProps {
    tabs: { id: string; label: string }[]
    activeTab: string
    onTabChange: (id: string) => void
    className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
    return (
        <div className={cn("flex bg-white/5 rounded-xl p-1", className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "relative flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors",
                        activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                    )}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="active-tab"
                            className="absolute inset-0 bg-white/10 rounded-lg"
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                </button>
            ))}
        </div>
    )
}
