"use client"

import React, { useState, useEffect, useCallback } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import StepNavigation from "../../../components/common/StepNavigation"
import AnimatedCircularProgress from "../../../components/common/AnimatedCircularProgress"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepThirtyThreeProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: (stepMinus?: number) => void
}

const StepThirtyThree: React.FC<StepThirtyThreeProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const points = [
    "Resume Optimization",
    "Cover Letter Setup",
    "Job Preferences Matched",
    "Smart Auto-Apply Enabled",
    "Dashboard Personalization"
  ]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [animationStarted, setAnimationStarted] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)

  // Calculate how many points to show based on percentage
  const getVisiblePointsCount = (percentage: number) => {
    if (percentage <= 0) return 0
    if (percentage <= 20) return 1
    if (percentage <= 40) return 2
    if (percentage <= 60) return 3
    if (percentage <= 80) return 4
    if (percentage > 80) return 5 // Show all 5 points after 80%
    return 0
  }

  // Start animation after a short delay for better visual effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Handle progress updates from the circular progress component
  const handleProgressUpdate = useCallback((progress: number) => {
    setCurrentProgress(progress)
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev
        // Add any step-specific data here if needed
      }))
      onNextStep(2)
    } catch (err) {
      console.error("Step 33 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center bg-brand-bgBlue-form max-w-4xl mx-auto p-5 mb-5 rounded-2xl shadow-2xl border border-black">
          <ProgressBar step={33} />
          <div>{/* Progress bar placeholder */}</div>
        </div>

        <div className="max-w-4xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full flex flex-col items-center justify-center p-10 gap-8 z-50">
              <div className="w-full flex items-center justify-center">
                {animationStarted ? (
                  <AnimatedCircularProgress
                    percentage={100}
                    duration={2500}
                    size={180}
                    strokeWidth={16}
                    onProgressUpdate={handleProgressUpdate}
                  />
                ) : (
                  <div className="w-45 h-45 flex items-center justify-center">
                    <div className="text-2xl font-bold text-gray-400">0%</div>
                  </div>
                )}
              </div>
              <div className="text-2xl text-white font-bold">
                We're customizing{" "}
                <span className="text-brand-yellow">RoboApply</span> just for
                you
              </div>

              <div className="flex flex-wrap max-w-xl gap-4 items-center justify-start md:justify-center min-h-[120px]">
                {points.map((point, index) => {
                  const shouldShow =
                    index < getVisiblePointsCount(currentProgress)
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 transition-all duration-500 ${
                        shouldShow
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4 pointer-events-none"
                      }`}
                      style={{
                        transitionDelay: shouldShow ? `${index * 150}ms` : "0ms"
                      }}>
                      <img
                        src="/images/check.svg"
                        alt="Check"
                        className="h-5"
                      />
                      <span className="text-lg text-white">{point}</span>
                    </div>
                  )
                })}
              </div>

              <div className="w-full flex justify-center mt-4">
                <StepNavigation
                  currentStep={33}
                  onNext={handleSubmit}
                  onPrevious={() => onPreviousStep(2)}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </FormCardLayout>
        </div>
      </div>
    </>
  )
}

export default StepThirtyThree
