// "use client"

// import React, { useEffect, useState } from "react"
// import FormCardLayout from "../../../components/common/FormCardLayout"
// import FormHeading from "../../../components/common/FormHeading"
// import FormPara from "../../../components/common/FormPara"
// import StepNavigation from "../../../components/common/StepNavigation"
// import { CheckIcon } from "lucide-react"
// import ProgressBar from "@/src/components/common/ProgressBar"

// interface StepSixProps {
//   onboardingData: any
//   setOnboardingData: (data: any) => void
//   onNextStep: (stepPlus?: number) => void
//   onPreviousStep: () => void
// }

// const HEAR_ABOUT_US_OPTIONS = [
//   "Google Search",
//   "TikTok",
//   "LinkedIn",
//   "Instagram",
//   "YouTube",
//   "Friend or colleague",
//   "Career Coach",
//   "Reddit",
//   "Job board or marketplace (e.g. Product Hunt)",
//   "Other"
// ]

// const HearAboutUsOptionButton = ({
//   option,
//   selected,
//   onSelect
// }: {
//   option: string
//   selected: boolean
//   onSelect: (option: string) => void
// }) => (
//   <button
//     type="button"
//     onClick={() => onSelect(option)}
//     className={`flex items-center w-full h-16 px-4 rounded-xl border-2 hover:bg-brand-purple transition-all duration-200 text-white text-left font-medium hover:border-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-yellow/60
//       ${
//         selected
//           ? "border-brand-purple bg-brand-purple text-black shadow-lg"
//           : "border-brand-yellow"
//       }
//     `}>
//     <div
//       className={`flex items-center justify-center h-4 w-4 rounded border-2 border-brand-yellow mr-2 ${
//         selected ? "bg-brand-purple" : "bg-transparent"
//       }`}>
//       {selected && <CheckIcon className="w-4 h-4 text-white" />}
//     </div>
//     <span className="ml-2">{option}</span>
//   </button>
// )

// const StepSix: React.FC<StepSixProps> = ({
//   onboardingData,
//   setOnboardingData,
//   onNextStep,
//   onPreviousStep
// }) => {
//   const [selected, setSelected] = useState<string[]>(() => {
//     const hearAboutUs = onboardingData.hearAboutUs
//     if (hearAboutUs && Array.isArray(hearAboutUs)) {
//       return hearAboutUs
//     } else if (
//       hearAboutUs &&
//       typeof hearAboutUs === "string" &&
//       hearAboutUs.trim() !== ""
//     ) {
//       return [hearAboutUs]
//     }
//     return []
//   })
//   const [error, setError] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   useEffect(() => {
//     const hearAboutUs = onboardingData?.hearAboutUs
//     if (hearAboutUs && Array.isArray(hearAboutUs)) {
//       setSelected(hearAboutUs)
//     } else if (
//       hearAboutUs &&
//       typeof hearAboutUs === "string" &&
//       hearAboutUs.trim() !== ""
//     ) {
//       setSelected([hearAboutUs])
//     } else {
//       setSelected([])
//     }
//   }, [onboardingData?.hearAboutUs])

//   const handleSelect = (option: string) => {
//     console.log("handleSelect called with option:", option)
//     console.log("current selected state:", selected)

//     setSelected((prev) => {
//       const newSelected = prev.includes(option)
//         ? prev.filter((item) => item !== option)
//         : [...prev, option]

//       console.log("new selected state:", newSelected)
//       return newSelected
//     })
//     setError("")
//   }

//   const handleSubmit = () => {
//     console.log("handleSubmit called with selected:", selected)

//     if (selected.length === 0) {
//       setError("Please select at least one option before continuing.")
//       return
//     }

//     console.log("saving to onboardingData:", selected)
//     setOnboardingData((prev: any) => ({
//       ...prev,
//       hearAboutUs: selected
//     }))

//     setIsSubmitting(true)
//     setTimeout(() => {
//       setIsSubmitting(false)
//       onNextStep(2)
//     }, 300)
//   }

//   return (
//     <div className="mb-10">
//       <div className="w-full max-w-3xl mt-8">
//         <ProgressBar step={6} />
//       </div>
//       <FormHeading
//         whiteText="How did you hear "
//         yellowText="about us"
//         className="mb-4"
//       />
//       <FormPara className="mb-4 text-lg">
//         Select all options that apply (you can select multiple)
//       </FormPara>

//       <FormCardLayout>
//         <div className="w-full max-w-3xl p-4 sm:p-8 md:p-12 flex flex-col items-center text-center">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 w-full mb-4">
//             {HEAR_ABOUT_US_OPTIONS.map((option) => (
//               <HearAboutUsOptionButton
//                 key={option}
//                 option={option}
//                 selected={selected.includes(option)}
//                 onSelect={handleSelect}
//               />
//             ))}
//           </div>
//           {error && <div className="text-red-500 mb-2">{error}</div>}
//         </div>
//       </FormCardLayout>

//       <div className="flex w-full justify-end mt-6">
//         <StepNavigation
//           currentStep={6}
//           onNext={handleSubmit}
//           onPrevious={onPreviousStep}
//           isLoading={isSubmitting}
//           disabled={false}
//         />
//       </div>
//     </div>
//   )
// }

// export default StepSix

"use client"

import React, { useEffect, useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import { CheckIcon } from "lucide-react"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepSixProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: () => void
}

const HEAR_ABOUT_US_OPTIONS = [
  "Google Search",
  "TikTok",
  "LinkedIn",
  "Instagram",
  "YouTube",
  "Friend or colleague",
  "Career Coach",
  "Reddit",
  "Job board or marketplace (e.g. Product Hunt)",
  "Other"
]

const HearAboutUsOptionButton = ({
  option,
  selected,
  onSelect
}: {
  option: string
  selected: boolean
  onSelect: (option: string) => void
}) => (
  <button
    type="button"
    onClick={() => onSelect(option)}
    className={`flex items-center w-full h-16 px-4 rounded-xl border-2 hover:bg-brand-purple transition-all duration-200 text-white text-left font-medium hover:border-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-yellow/60
      ${
        selected
          ? "border-brand-purple bg-brand-purple text-black shadow-lg"
          : "border-brand-yellow"
      }
    `}>
    <div
      className={`flex items-center justify-center h-4 w-4 rounded-full border-2 border-brand-yellow mr-2 ${
        selected ? "bg-brand-purple" : "bg-transparent"
      }`}>
      {selected && <CheckIcon className="w-4 h-4 text-white" />}
    </div>
    <span className="ml-2">{option}</span>
  </button>
)

const StepSix: React.FC<StepSixProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [selected, setSelected] = useState<string>(
    onboardingData.hearAboutUs || ""
  )
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (onboardingData?.hearAboutUs) {
      setSelected(onboardingData.hearAboutUs)
    }
  }, [onboardingData])

  const handleSelect = (option: string) => {
    setSelected(option)
    setError("")
    setOnboardingData((prev: any) => ({
      ...prev,
      hearAboutUs: option
    }))
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onNextStep(2)
    }, 300)
  }

  const handleSubmit = () => {
    if (!selected) {
      setError("Please select one option before continuing.")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onNextStep(2)
    }, 300)
  }

  return (
    <div className="mb-10">
      <div className="w-full max-w-3xl mt-8">
        <ProgressBar step={6} />
      </div>
      <FormHeading
        whiteText="How did you hear "
        yellowText="about us"
        className="mb-4"
      />
      <FormPara className="mb-4 text-lg">
        Select the option that applies best
      </FormPara>

      <FormCardLayout>
        <div className="w-full max-w-3xl p-4 sm:p-8 md:p-12 flex flex-col items-center text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 w-full mb-4">
            {HEAR_ABOUT_US_OPTIONS.map((option) => (
              <HearAboutUsOptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={handleSelect}
              />
            ))}
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
        </div>
      </FormCardLayout>

      <div className="flex w-full justify-end mt-6">
        <StepNavigation
          currentStep={6}
          onNext={handleSubmit}
          onPrevious={onPreviousStep}
          isLoading={isSubmitting}
          disabled={false}
        />
      </div>
    </div>
  )
}

export default StepSix
