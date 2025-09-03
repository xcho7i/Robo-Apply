"use client"

import { useState } from "react"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"

import StepNavigation from "../../../components/common/StepNavigation"
import FormCardLayout from "../../../components/common/FormCardLayout"
import { InputField } from "@/src/components/common/InputField"

export default function StepOne({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}: any) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!onboardingData.firstName.trim()) {
      newErrors.firstName = "First name is required."
    }

    if (!onboardingData.lastName.trim()) {
      newErrors.lastName = "Last name is required."
    }

    return newErrors
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    // Simulate async (optional)
    setTimeout(() => {
      setIsSubmitting(false)
      onNextStep() // move to next step
    }, 500)
  }

  const handleChange = (field: string, value: string) => {
    setOnboardingData((prev: any) => ({
      ...prev,
      [field]: value
    }))

    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <FormCardLayout>
      <form
        className="w-full p-3 sm:p-8 md:p-12 space-y-8"
        onSubmit={handleSubmit}>
        <div>
          <FormHeading whiteText="We're happy you're" yellowText="here." />
          <FormPara className="sm:my-5 my-3 max-w-sm">
            Let's get to know a little about you
          </FormPara>
        </div>

        <div className="sm:space-y-6 space-y-3">
          <div>
            <InputField
              label="First Name"
              id="firstName"
              type="text"
              value={onboardingData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Write your first name"
            />
            {errors.firstName && (
              <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <InputField
              label="Last Name"
              id="lastName"
              type="text"
              value={onboardingData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Write your last name"
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="w-full flex justify-end mt-12">
          <StepNavigation
            currentStep={1}
            onNext={handleSubmit}
            onPrevious={onPreviousStep}
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </FormCardLayout>
  )
}
