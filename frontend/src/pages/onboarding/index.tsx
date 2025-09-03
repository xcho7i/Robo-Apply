import React, { useEffect, useState } from "react"
import OnboardingLayout from "./layout/OnboardingLayout"
import OnboardingLayoutA from "./layout/OnboardingLayoutA"
import OnboardingLayoutB from "./layout/OnboardingLayoutB"
import StepOne from "./steps/StepOne"
import StepTwo from "./steps/StepTwo"
import StepThree from "./steps/StepThree"
import StepFour from "./steps/StepFour"
import StepFive from "./steps/StepFive"
import StepSix from "./steps/StepSix"
import StepSeven from "./steps/StepSeven"
import StepEight from "./steps/StepEight"
import StepNine from "./steps/StepNine"
import StepTen from "./steps/StepTen"
import StepEleven from "./steps/StepEleven"
import StepTwelve from "./steps/StepTwelve"
import StepThirteen from "./steps/StepThirteen"
import StepFourteen from "./steps/StepFourteen"
import StepFifteen from "./steps/StepFifteen"
import StepSixteen from "./steps/StepSixteen"
import StepSeventeen from "./steps/StepSeventeen"
import StepEighteen from "./steps/StepEighteen"
import StepNineteen from "./steps/StepNineteen"
import StepTwenty from "./steps/StepTwenty"
import StepTwentyOne from "./steps/StepTwentyOne"
import StepTwentyTwo from "./steps/StepTwentyTwo"
import StepTwentyThree from "./steps/StepTwentyThree"
import StepTwentyFour from "./steps/StepTwentyFour"
import StepTwentyFive from "./steps/StepTwentyFive"
import StepTwentySix from "./steps/StepTwentySix"
import StepTwentySeven from "./steps/StepTwentySeven"
import StepTwentyEight from "./steps/StepTwentyEight"
import StepTwentyNine from "./steps/StepTwentyNine"
import StepThirty from "./steps/StepThirty"
import StepThirtyOne from "./steps/StepThirtyOne"
import StepThirtyTwo from "./steps/StepThirtyTwo"
import StepThirtyThree from "./steps/StepThirtyThree"
import StepThirtyFour from "./steps/StepThirtyFour"
import StepThirtyFive from "./steps/StepThirtyFive"
import StepThirtySix from "./steps/StepThirtySix"
import StepThirtySeven from "./steps/StepThirtySeven"
import StepThirtyEight from "./steps/StepThirtyEight"
import StepThirtyNine from "./steps/StepThirtyNine"
import { redirect, useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import { errorToast, successToast } from "@/src/components/Toast"
import { getStepMapping } from "@/src/utils/stepMapping"

interface GoogleUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

const { mapping, reverseMapping } = getStepMapping()

export default function Onboarding() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const Steps = [
    StepOne,
    StepTwo,
    StepThree,
    StepFour,
    StepFive,
    StepSix,
    StepSeven,
    StepEight,
    StepNine,
    StepTen,
    StepEleven,
    StepTwelve,
    StepThirteen,
    StepFourteen,
    StepFifteen,
    StepSixteen,
    StepSeventeen,
    StepEighteen,
    StepNineteen,
    StepTwenty,
    StepTwentyOne,
    StepTwentyTwo,
    StepTwentyThree,
    StepTwentyFour,
    StepTwentyFive,
    StepTwentySix,
    StepTwentySeven,
    StepTwentyEight,
    StepTwentyNine,
    StepThirty,
    StepThirtyOne,
    StepThirtyTwo,
    StepThirtyThree,
    StepThirtyFour,
    StepThirtyFive,
    StepThirtySix,
    StepThirtySeven,
    StepThirtyEight,
    StepThirtyNine
  ]

  const maxStep = Steps.length

  const urlStepId = searchParams.get("step") || reverseMapping[1]

  const [step, setStep] = useState(() => {
    const stepNumber = mapping[urlStepId] || 1

    const normalizedStep = Math.max(1, Math.min(stepNumber, maxStep))
    return Steps[normalizedStep - 1] ? normalizedStep : 1
  })
  const [loading, setLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState<any>({
    activeCard: step,
    activeCardName: urlStepId,
    firstName: "",
    lastName: "",
    jobSearchStatus: "",
    challenges: [],
    hearAboutUs: [],
    employmentStatus: "",
    jobTitle: "",
    salary: 0,
    country: "",
    phone: "",
    resumeName: "",
    resumeData: "",
    resumeType: "",
    selectedOption: "",
    selectedExperienceLevels: [],
    educationLevel: "",
    yearsOfExperience: 0,
    jobSearchGoal: "",
    selectedBlockers: [],
    selectedGoal: "",
    jobsPerWeek: 0,
    referralCode: "",
    googleUser: undefined,
    selectedPlan: ""
  })

  const updateStepInUrl = (newStep: number) => {
    const stepId = reverseMapping[newStep]
    setSearchParams({ step: stepId })
  }

  useEffect(() => {
    const wasSubscriptionInProgress =
      localStorage.getItem("subscription-in-progress") === "true"

    if (wasSubscriptionInProgress) {
      localStorage.removeItem("subscription-in-progress")
      // errorToast("Please restart the onboarding process.")
      navigate("/plan-purchase-failure")
    }
  }, [])

  useEffect(() => {
    const currentUrlStepId = searchParams.get("step") || reverseMapping[1]
    const currentStepNumber = mapping[currentUrlStepId] || 1
    if (currentStepNumber !== step) {
      setStep(currentStepNumber)
    }
  }, [searchParams, step, mapping, reverseMapping])

  useEffect(() => {
    const currentUrlStepId = searchParams.get("step") || reverseMapping[1]
    setOnboardingData((prev) => ({
      ...prev,
      activeCard: step,
      activeCardName: currentUrlStepId
    }))
  }, [step, searchParams, reverseMapping])

  const findNextAvailableStep = (
    currentStep: number,
    direction: "next" | "prev" = "next"
  ) => {
    if (direction === "next") {
      for (let i = currentStep; i <= maxStep; i++) {
        if (Steps[i - 1]) {
          return i
        }
      }
      return maxStep
    } else {
      for (let i = currentStep; i >= 1; i--) {
        if (Steps[i - 1]) {
          return i
        }
      }
      return 1
    }
  }

  const validateAndNormalizeStep = (stepNumber: number): number => {
    if (stepNumber < 1) return 1
    if (stepNumber > maxStep) return maxStep

    if (!Steps[stepNumber - 1]) {
      const nextStep = findNextAvailableStep(stepNumber, "next")
      const prevStep = findNextAvailableStep(stepNumber, "prev")

      const nextDistance = nextStep - stepNumber
      const prevDistance = stepNumber - prevStep

      return nextDistance <= prevDistance ? nextStep : prevStep
    }

    return stepNumber
  }

  useEffect(() => {
    const normalizedStep = validateAndNormalizeStep(step)
    if (normalizedStep !== step) {
      setStep(normalizedStep)
      updateStepInUrl(normalizedStep)
    }
  }, [step, maxStep, Steps])

  const goToStep = (targetStep: number) => {
    const normalizedStep = validateAndNormalizeStep(targetStep)
    setStep(normalizedStep)
    updateStepInUrl(normalizedStep)
  }

  const StepComponent: any = Steps[step - 1]

  // const handleNextStep = async (stepPlus = 1) => {
  //   if (step === 39) {
  //     try {
  //       setLoading(true)

  //       const response2 = await axios.post(
  //         "https://roboplay-backend.projectco.space/api/onboarding",
  //         {
  //           ...onboardingData,
  //           status: "Completed"
  //         }
  //       )
  //       successToast("Onboarding completed successfully!")
  //       if (response2.status === 200) {
  //         // navigate("/dashboard");
  //       }
  //       // navigate("/dashboard");
  //     } catch (error) {
  //       errorToast("Onboarding failed!")
  //       // alert("Onboarding failed!")
  //     }
  //     setLoading(false)
  //   } else if (step < maxStep) {
  //     const targetStep = step + stepPlus

  //     if (targetStep >= maxStep) {
  //       const finalStep = findNextAvailableStep(maxStep, "prev")
  //       setStep(finalStep)
  //       updateStepInUrl(finalStep)
  //     } else {
  //       const nextStep = findNextAvailableStep(targetStep, "next")
  //       setStep(nextStep)
  //       updateStepInUrl(nextStep)
  //     }
  //   }
  // }

  const handlePreviousStep = (stepMinus = 1) => {
    const targetStep = step - stepMinus
    if (targetStep < 1) {
      const firstStep = findNextAvailableStep(1, "next")
      setStep(firstStep)
      updateStepInUrl(firstStep)
    } else {
      const prevStep = findNextAvailableStep(targetStep, "prev")
      setStep(prevStep)
      updateStepInUrl(prevStep)
    }
  }

  // state
  // const [loading, setLoading] = useState(false)
  const [onboardingId, setOnboardingId] = useState(
    () => localStorage.getItem("onboardingId") || null
  )

  // endpoints
  const CREATE_URL = "https://roboplay-backend.projectco.space/api/onboarding"
  const GET_URL = (id: string) =>
    `https://roboplay-backend.projectco.space/api/onboarding/${id}`
  const UPDATE_URL = (id: string) =>
    `https://roboplay-backend.projectco.space/api/onboarding/${id}`

  // api helpers
  const createOnboarding = async (payload) => {
    const res = await axios.post(CREATE_URL, payload)
    console.log("res", res)
    const id = res?.data?.onboarding?._id || res?.data?._id
    console.log("id", id)
    if (id) {
      setOnboardingId(id)
      localStorage.setItem("onboardingId", id)
    }
    return res
  }

  const getOnboarding = async (id: string) => {
    const res = await axios.get(GET_URL(id))
    setOnboardingData(res.data.onboarding)
    return res.data.onboarding
  }

  useEffect(() => {
    if (onboardingId) {
      getOnboarding(onboardingId)
    }
  }, [onboardingId])

  useEffect(() => {
    console.log("onboardingData", onboardingData)
  }, [onboardingData])

  const updateOnboarding = (id, payload) => axios.patch(UPDATE_URL(id), payload)

  // central save (decides create vs update)
  const saveStep = async ({ stepNumber, isCompleting }) => {
    console.log("saveStep called with stepNumber:", stepNumber)
    console.log("Current onboardingData:", onboardingData)

    const payloadUpdate = {
      ...onboardingData,
      currentStep: stepNumber,
      status: isCompleting ? "Completed" : "In Progress",
      hearAboutUs: onboardingData.hearAboutUs?.toString() || "",
      _id: undefined
    }

    const payloadCreate = {
      firstName: onboardingData.firstName,
      lastName: onboardingData.lastName,
      currentStep: stepNumber,
      status: isCompleting ? "Completed" : "In Progress"
    }

    // Dynamically add all the data that has been collected so far
    Object.keys(onboardingData).forEach((key) => {
      if (
        key !== "firstName" &&
        key !== "lastName" &&
        key !== "activeCard" &&
        key !== "activeCardName"
      ) {
        if (
          onboardingData[key] !== undefined &&
          onboardingData[key] !== null &&
          onboardingData[key] !== ""
        ) {
          payloadCreate[key] = onboardingData[key]
        }
      }
    })

    console.log("payloadCreate:", payloadCreate)
    console.log("payloadUpdate:", payloadUpdate)

    if (!onboardingId) {
      console.log("Creating new onboarding...")
      await createOnboarding(payloadCreate)
    } else {
      console.log("Updating existing onboarding...")
      await updateOnboarding(onboardingId, payloadUpdate)
    }
  }

  const [pendingStepData, setPendingStepData] = useState<{
    stepPlus: number
  } | null>(null)
  const [shouldProceed, setShouldProceed] = useState(false)

  // Watch for onboardingData changes and proceed when ready
  useEffect(() => {
    if (shouldProceed && pendingStepData) {
      const proceedWithStep = async () => {
        setShouldProceed(false)
        setPendingStepData(null)

        const rawTarget = step + pendingStepData.stepPlus
        const isCompleting = rawTarget >= maxStep + 1

        await saveStep({ stepNumber: step, isCompleting })

        // on success, navigate
        if (isCompleting) {
          successToast("Onboarding completed successfully!")
          setOnboardingId(null)
          localStorage.removeItem("onboardingId")
          const finalStep = findNextAvailableStep(maxStep, "prev")
          if (typeof finalStep === "number") {
            setStep(finalStep)
            updateStepInUrl(finalStep)
          }
        } else {
          const direction = pendingStepData.stepPlus >= 0 ? "next" : "prev"
          const nextCandidate =
            pendingStepData.stepPlus >= 0
              ? Math.min(rawTarget, maxStep)
              : Math.max(rawTarget, 1)
          const nextStep = findNextAvailableStep(nextCandidate, direction)

          if (typeof nextStep === "number") {
            setStep(nextStep)
            updateStepInUrl(nextStep)
          } else {
            errorToast("No available step to navigate to")
          }
        }
        setLoading(false)
      }

      proceedWithStep()
    }
  }, [shouldProceed, pendingStepData, onboardingData])

  const handleNextStep = async (stepPlus = 1) => {
    console.log("handleNextStep")
    if (loading) return
    setLoading(true)

    // Store the step info and wait for state update
    setPendingStepData({ stepPlus })
    setShouldProceed(true)
  }

  const stepProps = {
    onNextStep: handleNextStep,
    onPreviousStep: handlePreviousStep,
    goToStep,
    onboardingData,
    setOnboardingData
  }

  return (
    <>
      {/* <OnboardingLayout> */}
      {step <= 10 ? (
        <OnboardingLayoutA currentStep={step}>
          {StepComponent ? <StepComponent {...stepProps} /> : null}
        </OnboardingLayoutA>
      ) : (
        <OnboardingLayoutB>
          {StepComponent ? <StepComponent {...stepProps} /> : null}
        </OnboardingLayoutB>
      )}
      {/* </OnboardingLayout> */}
    </>
  )
}
