"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"

interface StepTwentyNineProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: (step: number) => void
}

const StepTwentyNine: React.FC<StepTwentyNineProps> = ({
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
      console.error("Step 29 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }
  const avatarImages = [
    {
      src: "/images/4fa2c921dc3256adf329f8880d4c3f232fb6e7eb.png",
      bgColor: "bg-yellow-400"
    },
    {
      src: "/images/06b55b7821f5f67dc387840e0ef280be86c37382.png",
      bgColor: "bg-pink-400"
    },
    {
      src: "/images/c11172d3ad2bf0bd73eefb8f87c5dca41cd18f88.png",
      bgColor: "bg-green-400"
    },
    {
      src: "/images/e02dad193b14375a541b38979f28727a9d3cd223.png",
      bgColor: "bg-orange-400"
    },
    {
      src: "/images/e9c38f8efb09bf2bb63b8bf7ff9f6661679975f0.png",
      bgColor: "bg-red-400"
    }
  ]

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full flex flex-col items-center p-10 z-50 gap-5 md:gap-10">
              <div className="text-2xl text-white font-bold">
                Give Us a Rating
              </div>
              <div className="flex flex-row items-center gap-1">
                <div>
                  <img src="/images/star.svg" alt="Icon" className="h-10" />
                </div>
                <div className="text-3xl text-white font-bold">5.0</div>
              </div>
              {/* <FormPara>10K+ Happy Job Seekers</FormPara> */}
              <div className="text-2xl text-white font-semibold">
                RoboApply is made for job seekers like you
              </div>

              <div>
                <div className="flex -space-x-3 mb-3">
                  {avatarImages.map((avatar, i) => (
                    <div
                      key={i}
                      className={`border-2 border-white w-16 h-16 rounded-full overflow-hidden ${avatar.bgColor}`}>
                      <img
                        src={avatar.src}
                        alt={`User ${i + 1}`}
                        className="rounded-full object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <FormPara>10K+ Users and counting</FormPara>
              {/* <div className="text-2xl text-white font-semibold">
                RoboApply is made for job seekers like you
              </div> */}

              <div className="w-full flex justify-center mt-4">
                <StepNavigation
                  currentStep={29}
                  onNext={handleSubmit}
                  onPrevious={() => onPreviousStep(2)}
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

export default StepTwentyNine
