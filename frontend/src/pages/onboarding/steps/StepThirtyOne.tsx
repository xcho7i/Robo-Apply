"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepThirtyOneProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: () => void
}

const StepThirtyOne: React.FC<StepThirtyOneProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const imagesrc = "/images/image-31.png"

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
      console.error("Step 31 Error:", err)
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
          <ProgressBar step={31} />
          <div>
            {/* <div className="text-2xl font-bold">
              You have great Potential to land  
              <span className="text-brand-yellow"> interview fast.</span>
            </div> */}
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
                <div className="flex flex-row items-center gap-2">
                  <div>
                    <img src="/images/check.svg" alt="Icon" className="h-5" />
                  </div>
                  <div className="text-xl text-white font-bold">All Done!!</div>
                </div>
                <div className="text-2xl text-white font-bold">
                  Time to generate your <br />
                  <span className="text-brand-yellow"> custom plan...</span>
                </div>
                <FormPara>
                  we're crafting tailored tools based on your answers
                </FormPara>
                <div className="text-brand-yellow text-xl">
                  Let's get you hired faster
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                <img src={imagesrc} alt="Icon" className="" />
              </div>
            </div>
          </FormCardLayout>
          <div className="w-full flex justify-center mt-4">
            <StepNavigation
              currentStep={31}
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

export default StepThirtyOne
