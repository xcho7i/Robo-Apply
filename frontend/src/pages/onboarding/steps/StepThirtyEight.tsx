"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"

interface StepThirtyEightProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepThirtyEight: React.FC<StepThirtyEightProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    console.log("first")
    try {
      setOnboardingData((prev: any) => ({
        ...prev
        // Add any step-specific data here if needed
      }))
      console.log("second")
      onNextStep()
    } catch (err) {
      console.error("Step 38 Error:", err)
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
        ...prev
        // Add any step-specific data here if needed
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 38 Error:", err)
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
            <div className="w-full min-h-[700px] flex flex-col justify-center items-center p-4 md:p-10 z-50 gap-5">
              <div className="flex flex-col items-center gap-5">
                <div className="text-2xl md:text-3xl text-white font-bold text-center max-w-xl">
                  <div className="block md:hidden">
                    Land an Interview in
                    <br /> 7 days <br />
                    Start Your{" "}
                    <span className="text-brand-yellow">Free Trial</span>
                    <br /> Now
                  </div>

                  <div className="hidden md:block">
                    Land an Interview in 7 days <br />
                    Start Your{" "}
                    <span className="text-brand-yellow">Free Trial</span> Now
                  </div>
                </div>

                <div className="max-w-4xl">
                  {/* <img
                   src="/images/bell.png"
                   alt="Login Image"
                   className="h-60 md:h-80 w-auto"
                 /> */}
                  <video
                    src="/images/Compressed AutoApply Demo.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/images/VideoDemo.png"
                    className="h-60 md:h-80 w-auto rounded-lg"
                    // style={{ objectFit: "cover" }}
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
                  Continue for Free
                </div>

                <p className="text-white text-lg">
                  Starting at $47/month or $9.25/week
                </p>
              </div>
            </div>
          </FormCardLayout>
          {/* <div className="w-full flex justify-center mt-1">
          <StepNavigation
            currentStep={38}
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

export default StepThirtyEight
