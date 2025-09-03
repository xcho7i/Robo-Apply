"use client"

import React, { useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"

interface StepThirtyProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepThirty: React.FC<StepThirtyProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [referralCode, setReferralCode] = useState(
    onboardingData?.referralCode || ""
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReferral = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!referralCode.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        referralCode: referralCode.trim()
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 30 Error:", err)
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
      console.error("Step 30 Error:", err)
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
        <div className="max-w-4xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />
            <div className="w-full h-[500px] flex flex-col justify-center items-center p-10 z-50 gap-5 md:gap-10">
              <div className="flex flex-col items-center">
                <FormHeading
                  whiteText="Enter Referral"
                  yellowText="Code"
                  className="mb-4"
                />
                <FormPara>You can skip this step</FormPara>
              </div>
              {/* <div className="flex items-center justify-between bg-[#1f1f1f] p-2 rounded-lg w-full max-w-md shadow-md">
                <input
                  type="text"
                  placeholder="Referral Code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-transparent text-white placeholder-white border-none focus:border-none focus:ring-0 px-4 py-2 outline-none flex-1"
                />
                <button
                  onClick={handleSubmitReferral}
                  disabled={!referralCode.trim() || isSubmitting}
                  className="ml-4 px-4 py-2 border border-yellow-600 text-yellow-400 hover:text-yellow-600 rounded-full hover:bg-yellow-400  transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? "..." : "Submit"}
                </button>
              </div> */}

              <div className="flex flex-col sm:flex-row items-center justify-between bg-[#1f1f1f] p-2 rounded-lg w-full max-w-md shadow-md gap-2 sm:gap-0">
  <input
    type="text"
    placeholder="Referral Code"
    value={referralCode}
    onChange={(e) => setReferralCode(e.target.value)}
    className="bg-transparent text-white placeholder-white border-none focus:border-none focus:ring-0 px-4 py-2 outline-none flex-1 w-full"
  />
  <button
    onClick={handleSubmitReferral}
    disabled={!referralCode.trim() || isSubmitting}
    className="w-full sm:w-auto ml-0 sm:ml-4 px-4 py-2 border border-yellow-600 text-yellow-400 hover:text-yellow-600 rounded-full hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isSubmitting ? "..." : "Submit"}
  </button>
</div>

              <div className="w-full flex justify-center mt-4">
                <StepNavigation
                  currentStep={30}
                  onNext={handleSkip}
                  onPrevious={onPreviousStep}
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

export default StepThirty
