"use client"

import { useEffect, useState } from "react"
import { DateSelector } from "@/components/dashboard/DateSelector"
import { MacroSummary } from "@/components/dashboard/MacroSummary"
import { MealSection } from "@/components/dashboard/MealSection"
import { FoodLibrary } from "@/components/foods/FoodLibrary"
import { TemplatesTab } from "@/components/templates/TemplatesTab"
import { UserMenu } from "@/components/auth/UserMenu"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { useAppStore, isToday, getTodayString, Template } from "@/lib/store"
import { BarChart3, UtensilsCrossed, Home as HomeIcon, LayoutTemplate, Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

type Tab = 'today' | 'foods' | 'templates'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [addMealModal, setAddMealModal] = useState(false)
  const [switchTemplateModal, setSwitchTemplateModal] = useState(false)
  const [selectedNewTemplate, setSelectedNewTemplate] = useState<Template | null>(null)
  const [confirmSwitchModal, setConfirmSwitchModal] = useState(false)

  // Meal form
  const [newMealName, setNewMealName] = useState("")
  const [newMealCalories, setNewMealCalories] = useState("400")
  const [newMealProtein, setNewMealProtein] = useState("30")
  const [newMealCarbs, setNewMealCarbs] = useState("33")
  const [newMealFat, setNewMealFat] = useState("12")

  const { selectedDate, addMealToDay, needsTemplateSelection, skipTemplateSelection, templates, applyTemplateToDay, days } = useAppStore()
  const canEdit = isToday(selectedDate)
  const todayString = getTodayString()

  // Auto-initialize today with default template if needed
  useEffect(() => {
    if (isToday(selectedDate) && needsTemplateSelection(todayString)) {
      // Automatically apply default template
      const defaultTemplate = templates.find(t => t.isDefault)
      if (defaultTemplate) {
        applyTemplateToDay(todayString, defaultTemplate)
      } else {
        skipTemplateSelection(todayString)
      }
    }
  }, [selectedDate, needsTemplateSelection, todayString, templates, applyTemplateToDay, skipTemplateSelection])

  const handleAddMeal = () => {
    if (!newMealName) return
    addMealToDay(selectedDate, {
      name: newMealName,
      goals: {
        calories: parseInt(newMealCalories) || 0,
        protein: parseInt(newMealProtein) || 0,
        carbs: parseInt(newMealCarbs) || 0,
        fat: parseInt(newMealFat) || 0,
      },
    })
    setNewMealName("")
    setNewMealCalories("400")
    setNewMealProtein("30")
    setNewMealCarbs("33")
    setNewMealFat("12")
    setAddMealModal(false)
  }

  const handleSelectNewTemplate = (template: Template) => {
    const dayData = days.find((d) => d.date === todayString)
    const hasData = dayData && dayData.meals.length > 0

    if (hasData) {
      setSelectedNewTemplate(template)
      setSwitchTemplateModal(false)
      setConfirmSwitchModal(true)
    } else {
      applyTemplateToDay(todayString, template)
      setSwitchTemplateModal(false)
    }
  }

  const confirmSwitch = () => {
    if (selectedNewTemplate) {
      applyTemplateToDay(todayString, selectedNewTemplate)
      setSelectedNewTemplate(null)
      setConfirmSwitchModal(false)
    }
  }

  return (
    <div className="flex flex-col h-screen relative bg-background overflow-hidden">
      <header className="flex-none z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10">
        <div className="relative flex items-center justify-between h-14 px-4">
          <span className="font-semibold text-lg tracking-tight text-white">
            fi<span className="text-primary">t</span>yo
          </span>

          {/* Centered Template Name */}
          <div className="absolute left-1/2 -translate-x-1/2 flex justify-center w-full max-w-[150px] Pointer-events-none">
            {(() => {
              const dayData = days.find((d) => d.date === selectedDate)
              const template = dayData?.appliedTemplateId
                ? templates.find((t) => t.id === dayData.appliedTemplateId)
                : null
              return template ? (
                <button
                  onClick={canEdit ? () => setSwitchTemplateModal(true) : undefined}
                  disabled={!canEdit}
                  className="pointer-events-auto text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-foreground transition-all truncate max-w-full cursor-pointer"
                >
                  {template.name}
                </button>
              ) : null
            })()}
          </div>

          <div className="flex items-center gap-1">
            <Link href="/history" className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <BarChart3 className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </Link>
            <UserMenu />
          </div>
        </div>
        <DateSelector />
      </header>

      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Tab Switcher - Fixed at top of content */}
        <div className="flex-none p-4 pb-2">
          <div className="flex bg-white/5 rounded-xl p-1 shadow-lg shadow-black/10">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'today' ? 'bg-white/10 text-foreground shadow-md' : 'text-muted-foreground'
                }`}
            >
              <HomeIcon className="w-4 h-4" />
              Day
            </button>
            <button
              onClick={() => setActiveTab('foods')}
              className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'foods' ? 'bg-white/10 text-foreground shadow-md' : 'text-muted-foreground'
                }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Foods
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'templates' ? 'bg-white/10 text-foreground shadow-md' : 'text-muted-foreground'
                }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 flex flex-col min-h-0 overflow-hidden relative"
        >
          {activeTab === 'today' ? (
            <div className="flex flex-col h-full">
              {/* Fixed Header Section for Day Tab */}
              <div className="flex-none px-4 space-y-4 pb-4">
                <MacroSummary />
                <div className="flex items-center justify-between px-1 -mb-2">
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    {isToday(selectedDate) ? "Today's Meals" : "Meals"}
                  </h3>
                </div>
              </div>

              {/* Scrollable Meal List */}
              <div className="flex-1 overflow-y-auto min-h-0 px-4 pt-6 pb-32 no-scrollbar [mask-image:linear-gradient(to_bottom,transparent_0%,black_12px,black_calc(100%-12px),transparent_100%)]">
                <MealSection />
              </div>
            </div>
          ) : activeTab === 'foods' ? (
            <div className="flex-1 min-h-0 px-4 h-full">
              <FoodLibrary />
            </div>
          ) : (
            <div className="flex-1 min-h-0 px-4 h-full">
              <TemplatesTab />
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Add Meal Button - hide when modal is open */}
      {
        activeTab === 'today' && canEdit && !addMealModal && (
          <div className="fixed bottom-8 right-1/2 translate-x-1/2 z-40Pointer-events-none">
            <div className="pointer-events-auto">
              <Button
                onClick={() => setAddMealModal(true)}
                size="icon"
                className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 bg-gradient-to-tr from-primary to-[#f3cf55] border-2 border-white/20 text-black hover:scale-105 transition-transform duration-300"
              >
                <Plus className="w-7 h-7" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        )
      }

      {/* Add Meal Modal */}
      <Modal isOpen={addMealModal} onClose={() => setAddMealModal(false)} title="Add New Meal">
        <div className="space-y-4">
          <Input
            label="Meal Name"
            placeholder="e.g. Post-Workout"
            value={newMealName}
            onChange={(e) => setNewMealName(e.target.value)}
          />
          <Input
            type="number"
            label="Calorie Goal"
            value={newMealCalories}
            onChange={(e) => setNewMealCalories(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              type="number"
              label="Protein (g)"
              value={newMealProtein}
              onChange={(e) => setNewMealProtein(e.target.value)}
            />
            <Input
              type="number"
              label="Carbs (g)"
              value={newMealCarbs}
              onChange={(e) => setNewMealCarbs(e.target.value)}
            />
            <Input
              type="number"
              label="Fat (g)"
              value={newMealFat}
              onChange={(e) => setNewMealFat(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This adds a meal to today only. To change your default meals, edit your template.
          </p>
          <Button onClick={handleAddMeal} className="w-full" disabled={!newMealName}>
            <Plus className="w-4 h-4 mr-2" /> Add Meal
          </Button>
        </div>
      </Modal>

      {/* Switch Template Modal */}
      <Modal isOpen={switchTemplateModal} onClose={() => setSwitchTemplateModal(false)} title="Switch Template">
        {/* ... Modal content ... */}
        <div className="space-y-3">
          {templates.length > 0 ? (
            templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectNewTemplate(template)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors shadow-lg shadow-black/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.dailyGoals.calories} kcal • {template.meals.length} meals
                    </p>
                  </div>
                  {template.isDefault && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Default</span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No templates available</p>
          )}
        </div>
      </Modal>

      {/* Confirm Switch Modal */}
      <Modal isOpen={confirmSwitchModal} onClose={() => setConfirmSwitchModal(false)} title="Replace Current Day?">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Your progress will be reset</p>
              <p className="text-xs text-muted-foreground mt-1">
                Switching templates will clear all food entries and reset your goals for today.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setConfirmSwitchModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={confirmSwitch} className="flex-1">
              Switch Template
            </Button>
          </div>
        </div>
      </Modal>
    </div >
  )
}
