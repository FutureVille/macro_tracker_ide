"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAppStore, getTodayString, isFutureDate } from "@/lib/store"

// Generate days: show past 6 days + today (no future)
const generateDays = () => {
    const dates = []
    const today = new Date()
    for (let i = -6; i <= 0; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        dates.push(d)
    }
    return dates
}

// Convert Date to YYYY-MM-DD string
const toDateString = (date: Date) => date.toISOString().split('T')[0]

export function DateSelector() {
    const { selectedDate, setSelectedDate } = useAppStore()
    const days = generateDays()
    const todayString = getTodayString()

    // Helper to check if same day
    const isSameDay = (dateString: string, date: Date) => {
        return dateString === toDateString(date)
    }

    const handleDateSelect = (date: Date) => {
        const dateString = toDateString(date)
        // Block future dates
        if (isFutureDate(dateString)) return
        setSelectedDate(dateString)
    }

    return (
        <div className="w-full flex flex-col items-center py-4">
            <div className="relative flex items-center justify-between w-full px-2 overflow-x-auto no-scrollbar gap-1">
                {days.map((date, index) => {
                    const dateString = toDateString(date)
                    const isSelected = selectedDate === dateString
                    const isTodayDate = dateString === todayString
                    const isFuture = isFutureDate(dateString)

                    return (
                        <button
                            key={index}
                            onClick={() => handleDateSelect(date)}
                            disabled={isFuture}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-12 h-16 shrink-0 rounded-xl transition-colors z-10",
                                isFuture && "opacity-30 cursor-not-allowed",
                                isSelected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="selected-day"
                                    className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] z-[-1]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <span className="text-[10px] font-medium uppercase tracking-wider mb-0.5">
                                {date.toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                            <span className="text-lg font-bold">
                                {date.getDate()}
                            </span>

                            {isTodayDate && !isSelected && (
                                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Show selected date info */}
            <div className="mt-2 text-xs text-muted-foreground">
                {selectedDate === todayString ? (
                    <span className="text-primary font-medium">Today</span>
                ) : (
                    <span>Viewing {new Date(selectedDate + 'T12:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric" })} (read-only)</span>
                )}
            </div>
        </div>
    )
}
