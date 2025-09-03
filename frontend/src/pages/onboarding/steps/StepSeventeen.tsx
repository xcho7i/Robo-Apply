"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepSeventeenProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: () => void
}

const StepSeventeen: React.FC<StepSeventeenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectedGoal = onboardingData.jobSearchGoal

  const renderImage = () => {
    switch (selectedGoal) {
      case "a":
        return "/images/seventeen-image.png"
      case "b":
        return "/images/customer-support.png"
      case "c":
        return "/images/Hero.png"
      default:
        return "/images/seventeen-image.png"
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev
        // Add any step-specific data here if needed
      }))
      onNextStep(4)
    } catch (err) {
      console.error("Step 17 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderContent = () => {
    switch (selectedGoal) {
      case "a":
        return (
          <>
            <div className="text-3xl text-white font-bold">
              Landing interview in{" "}
              <span className="text-brand-yellow">10-14</span> days is realistic
            </div>
            <FormPara className="text-center text-white">
              Thousands of users do it with RoboApply's one-click auto-apply +
              tailored resumes
            </FormPara>
            <div className="w-full">
              <img
                src="/images/logo-with-search.svg"
                alt="Icon"
                className="h-8"
              />
            </div>
            <div className="w-full">
              <img src="/images/users.svg" alt="Icon" className="h-10" />
            </div>
            <div className="text-base text-white font-bold">
              <span className="text-brand-yellow">90%</span> of users say the
              difference is obvious within the first week
            </div>
          </>
        )

      case "b":
        return (
          <>
            <div className="text-3xl text-white font-bold text-center mb-6">
              Ready to <span className="text-brand-yellow">explore</span> new
              opportunities?
            </div>
            <FormPara className="text-center text-white">
              Thousands of users do it with RoboApply's one-click auto-apply +
              tailored resumes
            </FormPara>
            <div className="w-full">
              <img
                src="/images/logo-with-search.svg"
                alt="Icon"
                className="h-8"
              />
            </div>
            <div className="w-full">
              <img src="/images/users.svg" alt="Icon" className="h-10" />
            </div>
            <div className="text-base text-white font-bold">
              <span className="text-brand-yellow">90%</span> of users say the
              difference is obvious within the first week
            </div>
          </>
        )

      case "c":
        return (
          <>
            <div className="text-3xl text-white font-bold text-center mb-6">
              Time to <span className="text-brand-yellow">level up</span> your
              career
            </div>
            <FormPara className="text-center text-white">
              Thousands of users do it with RoboApply's one-click auto-apply +
              tailored resumes
            </FormPara>
            <div className="w-full">
              <img
                src="/images/logo-with-search.svg"
                alt="Icon"
                className="h-8"
              />
            </div>
            <div className="w-full">
              <img src="/images/users.svg" alt="Icon" className="h-10" />
            </div>
            <div className="text-base text-white font-bold">
              <span className="text-brand-yellow">90%</span> of users say the
              difference is obvious within the first week
            </div>
          </>
        )

      default:
        return (
          <>
            <div className="text-3xl text-white font-bold">
              Landing interview in{" "}
              <span className="text-brand-yellow">10-14</span> days is realistic
            </div>
            <FormPara className="text-center text-white ">
              Thousands of users do it with RoboApply's one-click auto-apply +
              tailored resumes
            </FormPara>
            <img
              src="/images/logo-with-search.svg"
              alt="Icon"
              className="h-8"
            />
            <img src="/images/users.svg" alt="Icon" className="h-10" />
            <div className="text-base text-white font-bold">
              <span className="text-brand-yellow">90%</span> of users say the
              difference is obvious within the first week
            </div>
          </>
        )
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Logo in top left corner of layout */}
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <div className="flex flex-col items-center justify-center ">
        <ProgressBar step={17} />
        <div className="relative w-full max-w-5xl">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full flex flex-col md:flex-row z-50">
              <div className="w-full md:w-1/2 flex flex-col justify-start gap-5 p-6 sm:p-10">
                {renderContent()}
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center justify-end">
                <img src={renderImage()} alt="Goal" />
              </div>
            </div>
          </FormCardLayout>
        </div>

        <div className="w-full flex justify-center mt-4">
          <StepNavigation
            currentStep={17}
            onNext={handleSubmit}
            onPrevious={onPreviousStep}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}

export default StepSeventeen
