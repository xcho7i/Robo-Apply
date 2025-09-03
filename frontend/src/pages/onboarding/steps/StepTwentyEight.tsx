"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"

interface StepTwentyEightProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepTwentyEight: React.FC<StepTwentyEightProps> = ({
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
      console.error("Step 28 Error:", err)
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
        <div className="max-w-3xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full flex flex-col items-center p-10 z-50 gap-5">
              <img src="/images/tick.svg" alt="Icon" className="h-32" />
              <div className="flex flex-col justify-center items-center">
                <FormHeading
                  whiteText="Welcome to "
                  yellowText="RoboApply"
                  className="mb-4"
                />
                <FormPara>
                  You're all Set to start landing better jobs-- faster.
                </FormPara>
              </div>
              <div className="flex flex-col justify-center items-center gap-2">
                <div className="flex flex-row items-center gap-2">
                  {/* <div><img src="/images/lock.svg" alt="Icon" className="h-5" /></div> */}
                  <div className="text-xl text-white font-bold">
                    We'll Guide you step-by-step.
                  </div>
                </div>
                <FormPara className="text-center">
                  Your privacy and data are protected every step of the way.
                </FormPara>
              </div>
              <div className="w-full flex justify-center mt-4">
                <StepNavigation
                  currentStep={28}
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

export default StepTwentyEight
