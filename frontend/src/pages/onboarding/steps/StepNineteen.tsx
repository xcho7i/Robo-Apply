"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"

interface StepNineteenProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepNineteen: React.FC<StepNineteenProps> = ({
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
      console.error("Step 19 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="w-full">
        <div className="flex w-full justify-start">
          <img src="/images/logo.png" alt="" className="mb-5" />
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col items-center justify-center bg-brand-bgBlue-form max-w-3xl mx-auto p-5 mb-5 rounded-2xl shadow-2xl border-black border">
              <div>
                <div className="text-2xl text-white font-bold">
                  You're not alone- and you're in the{" "}
                  <span className="text-brand-yellow">right place.</span>
                </div>
              </div>
            </div>

            <FormCardLayout>
              <img
                src="/images/lines.svg"
                alt="lines"
                className="opacity-60 absolute"
              />
              <div className="w-full flex flex-col md:flex-row z-50 justify-center">
                <div className="flex flex-col gap-5 p-6 justify-center items-center sm:p-10 w-full">
                  <div className="text-2xl text-white font-bold">
                    Why Most job searches Fail-and how RoboApply Helps
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5">
                    <div>
                      <img
                        src="/images/19-image-1.png"
                        alt="Icon"
                        className="h-80"
                      />
                    </div>
                    <div>
                      <img
                        src="/images/19-image-2.png"
                        alt="Icon"
                        className="h-80"
                      />
                    </div>
                  </div>
                  <FormPara className="text-center text-white">
                    Most job seekers face the same struggles, burnout,
                    application fatigue and silence from recruiters.
                  </FormPara>
                  <div className="w-fit flex flex-col sm:flex-row justify-center items gap-2 bg-black py-2 px-5 rounded-md">
                    <div className="flex flex-col justify-center items-center">
                      <img src="/images/logo.png" alt="Icon" className="h-5" />
                    </div>
                    <div className="text-lg text-white font-bold">
                      is Build Change that
                    </div>
                  </div>
                </div>
              </div>
            </FormCardLayout>

            <div className="w-full flex justify-center mt-6">
              <StepNavigation
                currentStep={19}
                onNext={handleSubmit}
                onPrevious={onPreviousStep}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StepNineteen
