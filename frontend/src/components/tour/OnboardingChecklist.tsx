// FILE: src/components/OnboardingChecklistDrawer.tsx
import React, { useState, useEffect } from "react"
import { IoMdClose } from "react-icons/io"
import { useTour, fullTourSteps, mapStepToChecklist } from "../../stores/tours"
import { QUICK_LIST, FULL_GROUPS } from "../../stores/checklistItems"

import GradientButton from "../GradientButton"
import "./OnboardingChecklist.css"

const OnboardingChecklistDrawer: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const { 
    checklist, 
    toggleItem, 
    setChecklist, 
    steps, 
    started, 
    currentIndex,
    resetFor,
    openWelcome,
    setSteps,
    reset
  } = useTour()

  // Flatten items for progress
  const allQuick = QUICK_LIST
  const allFull = FULL_GROUPS.flatMap((g) => g.items)

  const completedQuick = allQuick.filter(it => checklist[it.id]).length
  const uniqueFullIds = Array.from(new Set(allFull.map(it => it.id)))
  const completedFull = uniqueFullIds.filter(id => checklist[id]).length

  // Auto-update checklist based on tour progress
  useEffect(() => {
    if (steps.length > 0 && started) {
      // Get current step
      const currentStep = steps[currentIndex]
      if (currentStep) {
        const checklistId = mapStepToChecklist(currentStep.id)
        if (checklistId && !checklist[checklistId]) {
          toggleItem(checklistId)
        }
      }
    }
  }, [currentIndex, steps, started])

  // Auto-update checklist when tour step is visited
  useEffect(() => {
    if (steps.length > 0) {
      const completedSteps = steps.slice(0, currentIndex + 1)
      
      completedSteps.forEach(step => {
        const checklistId = mapStepToChecklist(step.id)
        if (checklistId && !checklist[checklistId]) {
          toggleItem(checklistId)
        }
      })
    }
  }, [currentIndex, steps])

  // Load saved checklist on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_checklist")
    if (saved) {
      try {
        setChecklist(JSON.parse(saved))
      } catch {}
    }
  }, [setChecklist])

  // Save checklist changes
  useEffect(() => {
    localStorage.setItem("onboarding_checklist", JSON.stringify(checklist))
  }, [checklist])

  // Reset all tour data and restart
  const handleResetTour = () => {
    // Clear all tour status from localStorage
    const keysToRemove:any = []
    for (let i = 0; i < localStorage.length; i++) {
      const key:any = localStorage.key(i)
      if (key && key.startsWith('ra_tour_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Also clear welcome and skip flags
    localStorage.removeItem('ra_welcome_shown')
    localStorage.removeItem('ra_any_skip')
    
    // Reset tour state
    reset()
    setSteps(fullTourSteps)
    
    // Clear checklist
    const clearedChecklist: Record<string, boolean> = {}
    Object.keys(checklist).forEach(key => {
      clearedChecklist[key] = false
    })
    setChecklist(clearedChecklist)
    
    // Open welcome dialog
    openWelcome()
    
    // Close drawer
    setOpen(false)
  }

  return (
    <>
      <GradientButton onClick={() => setOpen(true)}>
        {advanced
          ? `Getting Started (${completedFull}/${uniqueFullIds.length})`
          : `Getting Started (${completedQuick}/${allQuick.length})`}
      </GradientButton>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed right-0 top-1/2 -translate-y-1/2 
        h-[72%] w-80 bg-[#1A1A1A] border-l border-white/10 z-50 shadow-xl 
        transform transition-transform duration-300 
        ${open ? "translate-x-0" : "translate-x-full"}
        sm:w-96 w-full max-w-sm`}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-extrabold text-white">
            {advanced ? "Full Checklist" : "Quick Start Checklist"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-white text-2xl font-bold hover:text-purple-400 transition"
          >
            <IoMdClose />
          </button>
        </div>

        <div className="checklist-body">
          {!advanced ? (
            <>
              {QUICK_LIST.map(it => (
                <label key={it.id} className={`checklist-item ${checklist[it.id] ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={!!checklist[it.id]}
                    onChange={() => toggleItem(it.id)}
                  />
                  <span>{it.label}</span>
                </label>
              ))}
              <p className="mt-4 text-gray-400 text-sm">
                👉 Complete these 8 steps to unlock your best job chances today.
              </p>
              <button 
                className="text-green-500 mt-2 text-sm flex items-center gap-1"
                onClick={() => setAdvanced(true)}
              >
                See Full Checklist →
              </button>
            </>
          ) : (
            FULL_GROUPS.map((group) => {
              const groupChecked = group.items.every(it => checklist[it.id])
              return (
                <div key={group.title} className="checklist-section">
                  <label className={`checklist-heading ${groupChecked ? "active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={groupChecked}
                      onChange={() => group.items.forEach(it => toggleItem(it.id))}
                    />
                    <span>{group.title}</span>
                  </label>
                  {group.items.map(it => (
                    <label key={it.label} className={`checklist-item ${checklist[it.id] ? "active" : ""}`}>
                      <input
                        type="checkbox"
                        checked={!!checklist[it.id]}
                        onChange={() => toggleItem(it.id)}
                      />
                      <span>{it.label}</span>
                    </label>
                  ))}
                </div>
              )
            })
          )}
        </div>

        <div className="checklist-footer">
          <div className="flex flex-col gap-2">
            {/* Reset Tour Button */}
            <GradientButton
              id="reset-tour-btn"
              onClick={handleResetTour}
              className="w-full text-center bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              🔄 Reset Tour
            </GradientButton>
            
            <div className="flex gap-2">
              {advanced && (
                <button 
                  className="btn-yellow flex-1"
                  onClick={() => setAdvanced(false)}
                >
                  Back to Quick List
                </button>
              )}
              <button className="btn-purple flex-1">Save Preferences</button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default OnboardingChecklistDrawer