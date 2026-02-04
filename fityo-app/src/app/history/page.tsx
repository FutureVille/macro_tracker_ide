"use client"

import React, { useMemo, useState, useEffect, useTransition } from "react"
import { useAppStore, getTodayString } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Scale, TrendingUp, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { getLogsForRange, FoodLogWithFood } from "@/lib/actions/logs"
import { getWeightHistory, logWeight as logWeightAction, getTodayWeight, WeightEntry } from "@/lib/actions/weight"
import { calculateMacros } from "@/lib/macros"

type Period = '7d' | '30d' | '1y' | 'all'

export default function HistoryPage() {
    const [period, setPeriod] = useState<Period>('7d')
    const [weightModalOpen, setWeightModalOpen] = useState(false)
    const [newWeight, setNewWeight] = useState("")
    const [isPending, startTransition] = useTransition()

    // Database state
    const [logs, setLogs] = useState<FoodLogWithFood[]>([])
    const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
    const [todayWeight, setTodayWeight] = useState<WeightEntry | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const todayString = getTodayString()

    // Get date range based on period
    const dateRange = useMemo(() => {
        const today = new Date()
        const start = new Date()

        switch (period) {
            case '7d':
                start.setDate(today.getDate() - 7)
                break
            case '30d':
                start.setDate(today.getDate() - 30)
                break
            case '1y':
                start.setFullYear(today.getFullYear() - 1)
                break
            case 'all':
                start.setFullYear(2020) // Far enough back
                break
        }

        return {
            start: start.toISOString().split('T')[0],
            end: todayString,
        }
    }, [period, todayString])

    // Load data from database
    useEffect(() => {
        loadData()
    }, [dateRange])

    const loadData = async () => {
        setIsLoading(true)
        const [logsData, weightData, todayWeightData] = await Promise.all([
            getLogsForRange(dateRange.start, dateRange.end),
            getWeightHistory(dateRange.start, dateRange.end),
            getTodayWeight(),
        ])
        setLogs(logsData)
        setWeightHistory(weightData)
        setTodayWeight(todayWeightData)
        setIsLoading(false)
    }

    // Handle weight log
    const handleLogWeight = () => {
        if (!newWeight) return

        startTransition(async () => {
            await logWeightAction(parseFloat(newWeight))
            await loadData()
            setNewWeight("")
            setWeightModalOpen(false)
        })
    }

    // Weight data for chart
    const weightChartData = useMemo(() => {
        return weightHistory
            .sort((a, b) => a.logged_at.localeCompare(b.logged_at))
            .map((w) => ({
                date: new Date(w.logged_at + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                weight: w.weight,
            }))
    }, [weightHistory])

    // Calculate macro averages
    const macroAverages = useMemo(() => {
        // Group by date
        const dateMap = new Map<string, { protein: number; carbs: number; fat: number; calories: number }>()

        logs.forEach((log) => {
            if (!log.foods_library) return

            const macros = calculateMacros(
                log.foods_library.protein_per_100g,
                log.foods_library.carbs_per_100g,
                log.foods_library.fat_per_100g,
                log.foods_library.calories_per_100g,
                log.amount_grams
            )
            const existing = dateMap.get(log.logged_at) || { protein: 0, carbs: 0, fat: 0, calories: 0 }

            dateMap.set(log.logged_at, {
                protein: existing.protein + macros.protein,
                carbs: existing.carbs + macros.carbs,
                fat: existing.fat + macros.fat,
                calories: existing.calories + macros.calories,
            })
        })

        const days = Array.from(dateMap.values())
        const numDays = days.length || 1

        const totals = days.reduce(
            (acc, day) => ({
                protein: acc.protein + day.protein,
                carbs: acc.carbs + day.carbs,
                fat: acc.fat + day.fat,
                calories: acc.calories + day.calories,
            }),
            { protein: 0, carbs: 0, fat: 0, calories: 0 }
        )

        return {
            protein: Math.round(totals.protein / numDays),
            carbs: Math.round(totals.carbs / numDays),
            fat: Math.round(totals.fat / numDays),
            calories: Math.round(totals.calories / numDays),
            daysTracked: dateMap.size,
        }
    }, [logs])

    // Macro chart data (daily breakdown)
    const macroChartData = useMemo(() => {
        const dateMap = new Map<string, { protein: number; carbs: number; fat: number; calories: number }>()

        logs.forEach((log) => {
            if (!log.foods_library) return

            const macros = calculateMacros(
                log.foods_library.protein_per_100g,
                log.foods_library.carbs_per_100g,
                log.foods_library.fat_per_100g,
                log.foods_library.calories_per_100g,
                log.amount_grams
            )
            const existing = dateMap.get(log.logged_at) || { protein: 0, carbs: 0, fat: 0, calories: 0 }

            dateMap.set(log.logged_at, {
                protein: existing.protein + macros.protein,
                carbs: existing.carbs + macros.carbs,
                fat: existing.fat + macros.fat,
                calories: existing.calories + macros.calories,
            })
        })

        return Array.from(dateMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, macros]) => ({
                date: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                ...macros,
            }))
    }, [logs])

    const periodTabs = [
        { id: '7d', label: '7D' },
        { id: '30d', label: '30D' },
        { id: '1y', label: '1Y' },
        { id: 'all', label: 'All' },
    ]

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between h-14 px-4">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </Link>
                    <span className="font-semibold text-lg tracking-tight text-foreground">History</span>
                    <div className="w-9" />
                </div>
            </header>

            <div className="flex-1 p-4 space-y-6 pb-32">
                {/* Period Selector */}
                <Tabs
                    tabs={periodTabs}
                    activeTab={period}
                    onTabChange={(id) => setPeriod(id as Period)}
                />

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Weight Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-primary" /> Weight
                                </h2>
                                <Button variant="glass" size="sm" onClick={() => setWeightModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-1" /> Log Today
                                </Button>
                            </div>

                            {todayWeight && (
                                <p className="text-sm text-muted-foreground">Today: <span className="text-foreground font-medium">{todayWeight.weight} kg</span></p>
                            )}

                            <Card className="bg-card/30">
                                <CardContent className="p-4">
                                    {weightChartData.length > 1 ? (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <AreaChart data={weightChartData}>
                                                <defs>
                                                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                <XAxis dataKey="date" stroke="#666" fontSize={11} />
                                                <YAxis stroke="#666" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                                                <Tooltip
                                                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                                    labelStyle={{ color: '#999' }}
                                                />
                                                <Area type="monotone" dataKey="weight" stroke="#d4af37" fill="url(#weightGradient)" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                                            {weightChartData.length === 1 ? "Log more days to see trends" : "No weight data yet"}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Macro Averages */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" /> Average Macros
                            </h2>
                            <p className="text-sm text-muted-foreground">Based on {macroAverages.daysTracked} days tracked</p>

                            {/* Average Stats */}
                            <Card className="bg-card/40 border-primary/20">
                                <CardContent className="p-4">
                                    <div className="text-center mb-4">
                                        <span className="text-3xl font-bold text-foreground">{macroAverages.calories}</span>
                                        <span className="text-muted-foreground ml-1">kcal/day avg</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-lg font-bold text-emerald-400">{macroAverages.protein}g</p>
                                            <p className="text-xs text-muted-foreground">Protein</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-blue-400">{macroAverages.carbs}g</p>
                                            <p className="text-xs text-muted-foreground">Carbs</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-purple-400">{macroAverages.fat}g</p>
                                            <p className="text-xs text-muted-foreground">Fat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Calorie Chart */}
                            <Card className="bg-card/30">
                                <CardContent className="p-4">
                                    {macroChartData.length > 1 ? (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={macroChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                <XAxis dataKey="date" stroke="#666" fontSize={11} />
                                                <YAxis stroke="#666" fontSize={11} />
                                                <Tooltip
                                                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                                    labelStyle={{ color: '#999' }}
                                                />
                                                <Line type="monotone" dataKey="calories" stroke="#d4af37" strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="protein" stroke="#10b981" strokeWidth={1.5} dot={false} />
                                                <Line type="monotone" dataKey="carbs" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                                                <Line type="monotone" dataKey="fat" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                                            Log more days to see trends
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>

            {/* Log Weight Modal */}
            <Modal isOpen={weightModalOpen} onClose={() => setWeightModalOpen(false)} title="Log Today's Weight">
                <div className="space-y-4">
                    <Input
                        type="number"
                        label="Weight (kg)"
                        placeholder="e.g. 75.5"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        step="0.1"
                    />
                    {todayWeight && (
                        <p className="text-sm text-muted-foreground">This will replace your current entry: {todayWeight.weight} kg</p>
                    )}
                    <Button onClick={handleLogWeight} className="w-full" disabled={!newWeight || isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Weight
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
