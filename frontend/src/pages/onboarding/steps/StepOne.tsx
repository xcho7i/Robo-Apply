// "use client"

// import { useState } from "react"
// import FormHeading from "../../../components/common/FormHeading"
// import FormPara from "../../../components/common/FormPara"

// import StepNavigation from "../../../components/common/StepNavigation"
// import FormCardLayout from "../../../components/common/FormCardLayout"
// import { InputField } from "@/src/components/common/InputField"

// export default function StepOne({
//   onboardingData,
//   setOnboardingData,
//   onNextStep,
//   onPreviousStep
// }: any) {
//   const [errors, setErrors] = useState<{ [key: string]: string }>({})
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const validate = () => {
//     const newErrors: { [key: string]: string } = {}

//     if (!onboardingData.firstName.trim()) {
//       newErrors.firstName = "First name is required."
//     }

//     if (!onboardingData.lastName.trim()) {
//       newErrors.lastName = "Last name is required."
//     }

//     return newErrors
//   }

//   const handleSubmit = (e?: React.FormEvent) => {
//     if (e) e.preventDefault()

//     const validationErrors = validate()
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors)
//       return
//     }

//     setErrors({})
//     setIsSubmitting(true)

//     // Simulate async (optional)
//     setTimeout(() => {
//       setIsSubmitting(false)
//       onNextStep() // move to next step
//     }, 500)
//   }

//   const handleChange = (field: string, value: string) => {
//     setOnboardingData((prev: any) => ({
//       ...prev,
//       [field]: value
//     }))

//     // Clear error on change
//     if (errors[field]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev }
//         delete newErrors[field]
//         return newErrors
//       })
//     }
//   }

//   return (
//     <FormCardLayout>
//       <form
//         className="w-full p-3 sm:p-8 md:p-12 space-y-8"
//         onSubmit={handleSubmit}>
//         <div>
//           <FormHeading whiteText="We're happy you're" yellowText="here." />
//           {/* i want a video their */}
//           <FormPara className="sm:my-5 my-3 max-w-sm">
//             Let's get to know a little about you
//           </FormPara>
//         </div>

//         <div className="sm:space-y-6 space-y-3">
//           <div>
//             <InputField
//               label="First Name"
//               id="firstName"
//               type="text"
//               value={onboardingData.firstName}
//               onChange={(e) => handleChange("firstName", e.target.value)}
//               placeholder="Write your first name"
//             />
//             {errors.firstName && (
//               <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
//             )}
//           </div>

//           <div>
//             <InputField
//               label="Last Name"
//               id="lastName"
//               type="text"
//               value={onboardingData.lastName}
//               onChange={(e) => handleChange("lastName", e.target.value)}
//               placeholder="Write your last name"
//             />
//             {errors.lastName && (
//               <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
//             )}
//           </div>
//         </div>

//         <div className="w-full flex justify-end mt-12">
//           <StepNavigation
//             currentStep={1}
//             onNext={handleSubmit}
//             onPrevious={onPreviousStep}
//             isLoading={isSubmitting}
//           />
//         </div>
//       </form>
//     </FormCardLayout>
//   )
// }
"use client"

import { useState } from "react"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"

import StepNavigation from "../../../components/common/StepNavigation"
import FormCardLayout from "../../../components/common/FormCardLayout"
import { InputField } from "@/src/components/common/InputField"
import { sleep } from "@/src/utils"

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

  const onVideoDataLoaded = async (e: React.ChangeEvent<HTMLVideoElement>) => {
    let played = false
    let videoEl: HTMLVideoElement = e.target as any
    console.log("Video loaded successfully")
    videoEl.style.opacity = "1"

    while (true) {
      if (played) break
      try {
        await videoEl.play()

        played = true
      } catch (error: any) {
        console.log("No user interaction detected yet!", error.message)
      }

      // wait for user interaction
      await sleep(1000)
    }
  }

  return (
    <FormCardLayout>
      <form
        className="w-full p-3 sm:p-8 md:p-12 space-y-8"
        onSubmit={handleSubmit}>
        <div>
          <FormHeading whiteText="We're happy you're" yellowText="here." />

          {/* Welcome video - Auto play and loop */}
          <div className="my-6 rounded-lg overflow-hidden shadow-lg ">
            <div
              className="relative w-full max-w-md mx-auto"
              style={{ height: "300px" }}>
              {/* Fallback content - shown by default until video loads */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 text-gray-600 rounded-lg">
                {/* <div className="text-center p-6">
                  <div className="text-4xl mb-3">🎥</div>
                  <h3 className="text-lg font-semibold mb-2">
                    Welcome to RoboApply!
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    We're excited to help you with your job applications
                  </p>
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs mt-2 text-gray-400">Loading video...</p>
                </div> */}
              </div>

              {/* Video element - will overlay the fallback when it loads */}
              <video
                className="absolute inset-0 w-full h-full object-contain rounded-lg opacity-0 transition-opacity duration-500"
                autoPlay
                muted={false}
                loop
                playsInline
                controls={true}
                preload="auto"
                onLoadedData={onVideoDataLoaded}
                onError={(e) => {
                  let videoEl: HTMLVideoElement = e.target as any
                  console.error("Video failed to load from:", videoEl.src)
                  // Keep fallback visible
                }}
                onCanPlay={() => console.log("Video can start playing")}>
                Sorry, your browser doesn't support embedded videos.
                {/* Multiple video sources */}
                {/* <source
                  src="/src/assets/video/KennyRoboApply.mov"
                  type="video/mov"
                />
                <source
                  src="/src/assets/video/KennyRoboApply.mp4"
                  type="video/mp4"
                /> */}
                <source
                  src="https://poweredjob-bucket.s3.amazonaws.com/fileupload/1757025346620/Kennynew.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>

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
