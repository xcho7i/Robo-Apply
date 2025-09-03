"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"

interface StepTwentySevenProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: (stepMinus?: number) => void
}

const StepTwentySeven: React.FC<StepTwentySevenProps> = ({
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
      onNextStep(2)
    } catch (err) {
      console.error("Step 27 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8 lg:p-10 z-50 gap-6 sm:gap-10">
              <img src="/images/trust.svg" alt="Icon" className="h-32" />
              <div className="flex flex-col justify-center items-center text-center">
                <FormHeading
                  whiteText="Thank you for trusting "
                  yellowText="RoboApply"
                  className="mb-3 sm:mb-4 text-center"
                />
                <FormPara className="text-center px-2 sm:px-0">
                  Now let's Personalize your job search journey...
                </FormPara>
              </div>
              <div className="flex flex-col justify-center items-center text-center">
                <div className="flex flex-row items-center gap-2 mb-2 sm:mb-3">
                  <div>
                    <img
                      src="/images/lock.svg"
                      alt="Icon"
                      className="h-4 sm:h-5"
                    />
                  </div>
                  <div className="text-lg sm:text-xl text-white font-bold text-center">
                    Your data is private and secure.
                  </div>
                </div>
                <FormPara className="text-center px-2 sm:px-0">
                  We'll never share your information — your job hunt stays
                  yours.
                </FormPara>
              </div>
              <div className="w-full flex justify-center mt-4 sm:mt-6">
                <StepNavigation
                  currentStep={27}
                  onNext={handleSubmit}
                  onPrevious={() => onPreviousStep(4)}
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

export default StepTwentySeven
