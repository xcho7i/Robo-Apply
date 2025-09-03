"use client"

import React, { useState, useEffect } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import { InputField } from "../../../components/common/InputField"
import StepNavigation from "../../../components/common/StepNavigation"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepEightProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: (stepMinus?: number) => void
}

const StepEight: React.FC<StepEightProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [jobTitle, setJobTitle] = useState(onboardingData.jobTitle || "")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setJobTitle(onboardingData.jobTitle || "")
  }, [onboardingData])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    if (!jobTitle.trim()) {
      setError("Job title is required.")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        jobTitle: jobTitle.trim()
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 8 Error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="w-full mb-4">
        <ProgressBar step={8} />
      </div>
      <FormHeading
        whiteText="What's your desired "
        yellowText="job title?"
        className="mb-10"
      />

      <FormCardLayout>
        <form
          onSubmit={handleSubmit}
          className="min-h-[500px] w-full max-w-3xl p-4 sm:p-8 md:p-12 flex flex-col justify-between h-full items-center text-center">
          <div className="w-full mb-8">
            <InputField
              label=""
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., UX Designer, Software Engineer, Product Manager"
              className="bg-transparent border-2 border-brand-bgBlue-form-input-border text-white placeholder:text-gray-400"
            />
            {error && (
              <p className="text-sm text-red-500 mt-2 text-left">{error}</p>
            )}
          </div>

          <div className="w-full justify-end mt-8">
            <StepNavigation
              currentStep={8}
              isLoading={isSubmitting}
              onNext={handleSubmit}
              onPrevious={() => onPreviousStep(2)}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </FormCardLayout>
    </div>
  )
}

export default StepEight
