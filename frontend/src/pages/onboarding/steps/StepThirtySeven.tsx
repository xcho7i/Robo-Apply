"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"

interface StepThirtySevenProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepThirtySeven: React.FC<StepThirtySevenProps> = ({
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
      console.error("Step 37 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        referralCode: ""
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 37 Error:", err)
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
        <div className="max-w-5xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full max-h-[700px] flex flex-col justify-center items-center p-10 z-50 gap-5">
              <div className="flex flex-col items-center gap-5">
                <div className="text-3xl text-white font-bold mb-8">
                  Try
                  <span className="text-brand-yellow"> RoboApply </span> for
                  free
                </div>
                <div>
                  <img
                    src="/images/step-37-image.png"
                    alt="Login Image"
                    className="h-60 md:h-96 w-auto"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <img
                      src={"/images/check-white.svg"}
                      alt="check"
                      className="h-7 self-baseline"
                    />
                    <span className="text-2xl text-white font-bold">
                      No Payment Due Now
                    </span>
                  </div>
                </div>
                <div
                  className="flex items-center justify-center gap-2 px-10 py-3 rounded-full bg-brand-yellow text-black hover:scale-105 transition-all duration-300 font-semibold cursor-pointer"
                  onClick={handleSubmit}>
                  Try for $0.00
                </div>

                <p className="text-white text-lg">
                  Just $47.00 Per Month ($9.25/Week){" "}
                </p>
              </div>
            </div>
          </FormCardLayout>
          {/* <div className="w-full flex justify-center mt-1">
          <StepNavigation
            currentStep={37}
            onNext={handleSkip}
            onPrevious={onPreviousStep}
            isLoading={isSubmitting}
          />
        </div> */}
        </div>
      </div>
    </>
  )
}

export default StepThirtySeven
