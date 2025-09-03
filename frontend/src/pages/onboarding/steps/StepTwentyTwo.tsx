"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import ProgressGraph from "../../../components/common/ProgressGraph"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepTwentyTwoProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepTwentyTwo: React.FC<StepTwentyTwoProps> = ({
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
      console.error("Step 22 Error:", err)
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
        <div className="flex flex-col items-center justify-center bg-brand-bgBlue-form max-w-4xl mx-auto p-5 mb-5 rounded-2xl shadow-2xl border-black border">
          <ProgressBar step={22} />
          <div>
            <div className="text-2xl text-white font-bold">
              You have great Potential to land
              <span className="text-brand-yellow"> interviews fast.</span>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full flex flex-col md:flex-row p-10 z-50">
              <div className="w-full md:w-1/2 flex flex-col gap-5 p-5">
                <div className="text-2xl text-white font-bold">
                  Your Progress
                  <span className="text-brand-yellow"> over time</span>
                </div>
                <FormPara>
                  Based on RoboApply's user data, most people start seeing
                  interview invites within 7–10 days of consistent auto-applying
                </FormPara>
                <FormPara>
                  Stay on track — your breakthrough is coming.
                </FormPara>
              </div>
              <div className="w-full md:w-1/2">
                <ProgressGraph />
                {/* <img src="/images/step-graph.jfif" alt="Icon" className="" /> */}
              </div>
            </div>
          </FormCardLayout>
          <div className="w-full flex justify-center mt-4">
            <StepNavigation
              currentStep={22}
              onNext={handleSubmit}
              onPrevious={onPreviousStep}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default StepTwentyTwo
