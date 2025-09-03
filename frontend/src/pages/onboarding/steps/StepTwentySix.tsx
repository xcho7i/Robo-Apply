"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"

interface StepTwentySixProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepTwentySix: React.FC<StepTwentySixProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const imagesrc = "/images/WhatsApp Image 2025-07-29 at 18.46.47.jpeg"

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
      console.error("Step 26 Error:", err)
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
        <div className="flex flex-col items-center justify-center bg-brand-bgBlue-form max-w-3xl mx-auto p-5 mb-5 rounded-2xl shadow-2xl border-black border">
          <div>
            {/* <div className="text-2xl font-bold">
              You have great Potential to land  
              <span className="text-brand-yellow"> interview fast.</span>
            </div> */}
          </div>
        </div>
        <div className="max-w-3xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full flex flex-col md:flex-row p-10 z-50">
              <div className="w-full md:w-1/2 flex flex-col justify-center gap-5 p-5">
                <div className="text-2xl text-white font-bold">
                  Browser extension integrated with top
                  <span className="text-brand-yellow"> job platforms</span>
                </div>
                <FormPara>
                  Use RoboApply's browser extension to auto-fill and apply on
                  LinkedIn, Indeed, ZipRecruiter, Workday, and more — all
                  without leaving the page.
                </FormPara>
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                <img src={imagesrc} alt="Icon" className="rounded-lg w-72" />
              </div>
            </div>
          </FormCardLayout>
          <div className="w-full flex justify-center mt-4">
            <StepNavigation
              currentStep={26}
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

export default StepTwentySix
