"use client"

import React, { useEffect, useState } from "react"
import FormHeading from "../../../components/common/FormHeading"
import FormCardLayout from "../../../components/common/FormCardLayout"
import Step5Graph from "../../../components/common/Step5Graph"
import StepNavigation from "../../../components/common/StepNavigation"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepFiveProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: (stepMinus?: number) => void
}

const StepFive: React.FC<StepFiveProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const currentStep = 5
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async () => {
    // You can update data here if needed
    // setOnboardingData({ ...onboardingData, something: value })
    onNextStep()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-2 py-8">
      <div className="w-full max-w-3xl mb-4">
        <ProgressBar step={5} />
      </div>
      <FormCardLayout>
        <div className="flex flex-col h-full items-center p-8 sm:p-10 lg:p-12 w-full max-w-sm sm:max-w-2xl lg:max-w-3xl">
          <FormHeading
            whiteText="RoboApply delivers "
            yellowText="long-term "
            purpleText="results"
            className="text-center mb-6 sm:mb-8 lg:mb-10"
          />

          <Step5Graph />

          {/* <Button
            className="mt-4 sm:mt-6 lg:mt-8 w-32 sm:w-40 lg:w-48 h-10 sm:h-11 lg:h-12 text-sm sm:text-base lg:text-lg font-semibold"
            variant="default"
            size="lg"
            onClick={() => {
              dispatch(updateStepData({ step: 5, ...data }));
              router.push(`/onboarding/${currentStep + 1}`);
            }}
          >
            Continue
          </Button> */}
        </div>
      </FormCardLayout>
      <div className="w-full flex justify-center mt-6 sm:mt-8">
        <StepNavigation
          currentStep={currentStep}
          isLoading={false}
          onNext={handleSubmit}
          onPrevious={() => onPreviousStep(2)}
        />
      </div>
    </div>
  )
}

export default StepFive
