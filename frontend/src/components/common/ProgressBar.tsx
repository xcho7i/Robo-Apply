"use client"

import { useEffect, useState } from "react"
import { getStepMapping } from "../../utils/stepMapping"

export default function ProgressBar({ step: stepProp }: { step: number }) {
  const [step, setStep] = useState(stepProp)
  const { mapping } = getStepMapping()
  const properSteps = Object.entries(mapping).filter(([key]) => {
    return /^[a-zA-Z]+$/.test(key) && key.length > 2 && key.length < 20
  })
  const getProperStepCount = (currentStep: number) => {
    let properStepCount = 0
    for (let i = 1; i <= currentStep; i++) {
      const stepKey = Object.keys(mapping).find((key) => mapping[key] === i)
      if (
        stepKey &&
        /^[a-zA-Z]+$/.test(stepKey) &&
        stepKey.length > 2 &&
        stepKey.length < 20
      ) {
        properStepCount++
      }
    }
    return properStepCount
  }
  const currentProperStep = getProperStepCount(step)
  const totalProperSteps = properSteps.length
  const getFirstSectionProperSteps = () => {
    let firstSectionCount = 0
    for (let i = 1; i <= 18; i++) {
      const stepKey = Object.keys(mapping).find((key) => mapping[key] === i)
      if (
        stepKey &&
        /^[a-zA-Z]+$/.test(stepKey) &&
        stepKey.length > 2 &&
        stepKey.length < 20
      ) {
        firstSectionCount++
      }
    }
    return firstSectionCount
  }

  const firstSectionSteps = getFirstSectionProperSteps()
  const firstBarProgress =
    currentProperStep <= firstSectionSteps
      ? (currentProperStep / firstSectionSteps) * 100
      : 100

  // Calculate progress for second section (steps after first section)
  const secondSectionSteps = totalProperSteps - firstSectionSteps
  const secondBarProgress =
    currentProperStep <= firstSectionSteps
      ? 0
      : Math.min(
          ((currentProperStep - firstSectionSteps) / secondSectionSteps) * 100,
          100
        )

  useEffect(() => {
    setStep(stepProp)
  }, [stepProp])

  return (
    <div className="w-full flex flex-row gap-5 max-w-3xl mx-auto">
      <div className="w-1/2 flex flex-col items-center justify-center">
        <div className="w-full flex justify-between items-center mb-8 text-sm text-white/80">
          <div className="w-full">
            <div className="flex justify-between mb-1 text-xs sm:text-sm">
              <span>A little bit about you</span>
              <span>
                {currentProperStep <= firstSectionSteps
                  ? currentProperStep
                  : firstSectionSteps}
                /{firstSectionSteps}
              </span>
            </div>
            <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
              <div
                className="h-full rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${firstBarProgress}%`,
                  background:
                    "linear-gradient(to right, var(--brand-yellow), #fbbf24)"
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2 flex flex-col items-center justify-center">
        <div className="w-full flex justify-between items-center mb-8 text-sm text-white/80">
          <div className="w-full">
            <div className="flex justify-between mb-1 text-xs sm:text-sm">
              <span>How we can help you</span>
              <span>
                {currentProperStep > firstSectionSteps
                  ? currentProperStep - firstSectionSteps
                  : 0}
                /{secondSectionSteps}
              </span>
            </div>
            <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
              <div
                className="h-full rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${secondBarProgress}%`,
                  background:
                    "linear-gradient(to right, var(--brand-yellow), #fbbf24)"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
