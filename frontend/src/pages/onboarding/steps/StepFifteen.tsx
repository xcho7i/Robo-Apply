"use client"

import React, { useState, useEffect } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepFifteenProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepFifteen: React.FC<StepFifteenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev
        // Add any step-specific data here if needed
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 15 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <ProgressBar step={15} />
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <FormCardLayout>
            <div className="w-full flex flex-col items-center justify-between p-6 sm:p-10">
              <div className="flex justify-center items-center w-full">
                <img src="/images/15-icon.svg" alt="Icon" className="w-48" />
              </div>

              <FormHeading whiteText="Let's Get you" yellowText="Noticed?" />

              <FormPara className="text-center">
                No matter where you're starting from, we'll help you stand out
                with tools to boost your resume, match you to the right roles,
                and land more interviews.
              </FormPara>

              <div className="w-full flex justify-center mt-4">
                <StepNavigation
                  currentStep={15}
                  onNext={handleSubmit}
                  onPrevious={onPreviousStep}
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

export default StepFifteen
