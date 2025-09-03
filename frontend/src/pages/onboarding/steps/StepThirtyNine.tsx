// "use client"

// import React, { useState, useEffect } from "react"
// import FormCardLayout from "../../../components/common/FormCardLayout"
// import FormHeading from "../../../components/common/FormHeading"
// import FormPara from "../../../components/common/FormPara"
// import { CalendarDays, Bell, Gem, Check } from "lucide-react"
// import Slider from "react-slick"
// import API_ENDPOINTS from "../../../api/endpoints"
// import { errorToast, successToast } from "../../../components/Toast"
// import CircularIndeterminate from "../../../components/loader/circular"
// import { FaTimes } from "react-icons/fa"
// import { useNavigate } from "react-router-dom"
// import {
//   GoogleOAuthProvider,
//   GoogleLogin,
//   GoogleCredentialResponse
// } from "@react-oauth/google"
// import authService from "../../../api/auth"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// // Add type declarations for Google API
// declare global {
//   interface Window {
//     google?: {
//       accounts: {
//         id: {
//           initialize: (config: any) => void
//           prompt: () => void
//         }
//       }
//     }
//   }
// }

// interface StepThirtyNineProps {
//   onboardingData: any
//   setOnboardingData: (data: any) => void
//   onNextStep: () => void
//   onPreviousStep: () => void
// }

// const StepThirtyNine: React.FC<StepThirtyNineProps> = ({
//   onboardingData,
//   setOnboardingData,
//   onNextStep,
//   onPreviousStep
// }) => {
//   const [selectedPackage, setSelectedPackage] = useState(
//     "basic_monthly_individual"
//   )
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [googleLoading, setGoogleLoading] = useState(false)
//   const [googleError, setGoogleError] = useState<string | null>(null)
//   const [awaitingGoogleSignIn, setAwaitingGoogleSignIn] = useState(false)
//   const navigate = useNavigate()

//   const externalPlans = [
//     {
//       name: "Basic Plan",
//       identifier: "basic_monthly_individual"
//     },
//     {
//       name: "Standard Plan",
//       identifier: "standard_monthly_individual"
//     },
//     {
//       name: "Premium Plan",
//       identifier: "premium_monthly_individual"
//     },
//     {
//       name: "Basic Plan",
//       identifier: "basic_yearly_individual"
//     },
//     {
//       name: "Standard Plan",
//       identifier: "standard_yearly_individual"
//     },
//     {
//       name: "Premium Plan",
//       identifier: "premium_yearly_individual"
//     }
//   ]

//   const plans = {
//     individual: [
//       {
//         title: "Basic Plan",
//         monthlyPrice: "$47",
//         yearlyPrice: "$37",
//         yearlyWeeklyPrice: "$9.25",
//         extraText: "Save $120 with yearly"
//       },
//       {
//         title: "Standard Plan",
//         monthlyPrice: "$129",
//         yearlyPrice: "$103",
//         yearlyWeeklyPrice: "$25.75",
//         extraText: "Save $312 with yearly"
//       },
//       {
//         title: "Premium Plan",
//         monthlyPrice: "$389",
//         yearlyPrice: "$311",
//         yearlyWeeklyPrice: "$77.75",
//         extraText: "Save $936 with yearly"
//       }
//     ]
//   }

//   // Initialize Google OAuth
//   useEffect(() => {
//     if (window.google && window.google.accounts) {
//       window.google.accounts.id.initialize({
//         client_id:
//           "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com",
//         callback: handleGoogleSuccess
//       })
//     }
//   }, [])

//   // Calculate date 3 days from now
//   const getDateInThreeDays = () => {
//     const today = new Date()
//     const threeDaysFromNow = new Date(today)
//     threeDaysFromNow.setDate(today.getDate() + 3)
//     return threeDaysFromNow.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric"
//     })
//   }

//   // Define types for better TypeScript support
//   interface PackageOption {
//     title: string
//     billing: string
//     price: string
//     identifier: string | undefined
//     period: string
//     monthlyPrice: string
//     yearlyPrice: string
//     yearlyWeeklyPrice: string
//     extraText: string
//   }

//   // Create grouped packages (2 per slide: monthly and yearly of same plan)
//   const groupedPackages: PackageOption[][] = []

//   plans.individual.forEach((plan) => {
//     const monthlyIdentifier = externalPlans.find(
//       (ext) => ext.name === plan.title && ext.identifier.includes("monthly")
//     )?.identifier

//     const yearlyIdentifier = externalPlans.find(
//       (ext) => ext.name === plan.title && ext.identifier.includes("yearly")
//     )?.identifier

//     // Only add packages if identifiers are found
//     if (monthlyIdentifier && yearlyIdentifier) {
//       groupedPackages.push([
//         {
//           ...plan,
//           billing: "monthly",
//           price: plan.monthlyPrice,
//           identifier: monthlyIdentifier,
//           period: "/mo"
//         },
//         {
//           ...plan,
//           billing: "yearly",
//           price: plan.yearlyWeeklyPrice,
//           identifier: yearlyIdentifier,
//           period: "/week"
//         }
//       ])
//     }
//   })

//   const sliderSettings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     responsive: [
//       {
//         breakpoint: 1024,
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1
//         }
//       },
//       {
//         breakpoint: 640,
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1
//         }
//       }
//     ]
//   }

//   // Handle Google sign-in success
//   const handleGoogleSuccess = async (credentialResponse: any) => {
//     const { credential } = credentialResponse
//     if (!credential) return errorToast("No credential received")

//     setGoogleLoading(true)
//     try {
//       // First, authenticate with Google
//       const response = await authService.googleSignIn({ idToken: credential })
//       successToast("Google sign-in successful!")

//       // Update onboarding data with user ID
//       setOnboardingData((prev: any) => ({
//         ...prev,
//         userId: response.result.user._id
//       }))

//       // Get the access token from the response
//       const accessToken =
//         response.result.accessToken ||
//         response.result.token ||
//         localStorage.getItem("access_token")

//       if (accessToken) {
//         // Store access token if not already stored
//         if (!localStorage.getItem("access_token")) {
//           localStorage.setItem("access_token", accessToken)
//         }
//       }

//       // If we were awaiting Google sign-in, proceed with trial start
//       if (awaitingGoogleSignIn) {
//         setAwaitingGoogleSignIn(false)
//         await handleStartTrial()
//       }
//     } catch (error) {
//       console.error("Google sign-in failed:", error)
//       errorToast("Google sign-in failed.")
//       setAwaitingGoogleSignIn(false)
//     } finally {
//       setGoogleLoading(false)
//     }
//   }

//   const handleGoogleError = () => {
//     console.log("Google Login Failed")
//     setGoogleError("Google sign-in failed. Please try again.")
//     setGoogleLoading(false)
//     setAwaitingGoogleSignIn(false)
//   }

//   // Trigger Google sign-in
//   const handleCustomGoogleLogin = () => {
//     const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent)

//     if (isIPhone) {
//       if (
//         window.google &&
//         window.google.accounts &&
//         window.google.accounts.id
//       ) {
//         window.google.accounts.id.prompt()
//       } else {
//         errorToast("Google login failed to initialize.")
//       }
//     } else {
//       const googleLoginButton = document.querySelector(
//         '[aria-labelledby="button-label"]'
//       )
//       if (googleLoginButton) {
//         ;(googleLoginButton as HTMLElement).click()
//       } else {
//         errorToast("Google login failed to initialize.")
//       }
//     }
//   }

//   // Function to handle trial start with API call
//   const handleStartTrial = async () => {
//     const accessToken = localStorage.getItem("access_token")

//     if (!accessToken) {
//       errorToast("Access token missing. Please login again.")
//       return
//     }

//     if (!selectedPackage) {
//       errorToast("Please select a plan to continue.")
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       console.log("=== STARTING 3-DAY FREE TRIAL ===")
//       console.log("Selected Package:", selectedPackage)

//       const response = await fetch(`${BASE_URL}${API_ENDPOINTS.Subscription}`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           identifier: selectedPackage,
//           isTrial: true
//         })
//       })

//       const data = await response.json()

//       if (response.ok && data.success) {
//         console.log("✅ Free trial started successfully!")

//         // Update onboarding data with selected plan
//         setOnboardingData((prev: any) => ({
//           ...prev,
//           selectedPlan: selectedPackage
//         }))

//         // Check if checkoutUrl is present in the response
//         if (data.checkoutUrl) {
//           console.log("Redirecting to checkout URL:", data.checkoutUrl)
//           // Redirect to checkout URL in same tab
//           window.location.href = data.checkoutUrl
//         } else {
//           // If no checkoutUrl, show success message and continue
//           successToast("Your 3-day free trial has been started successfully!")
//           navigate("/auto-apply")
//         }
//       } else {
//         console.error("API Error:", data)
//         errorToast(
//           data.message || "Failed to start free trial. Please try again."
//         )
//       }
//     } catch (error) {
//       console.error("Network Error:", error)
//       errorToast(
//         "Network error occurred. Please check your connection and try again."
//       )
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault()
//     if (isSubmitting || googleLoading) return

//     // Check if access token is present
//     const accessToken = localStorage.getItem("access_token")

//     if (!accessToken) {
//       // No access token, trigger Google sign-in first
//       setAwaitingGoogleSignIn(true)
//       setGoogleError(null)
//       handleCustomGoogleLogin()
//       return
//     }

//     // Access token exists, proceed with trial start
//     await handleStartTrial()
//   }

//   // Handle close button click
//   const handleClose = () => {
//     navigate("/signIn")
//   }

//   return (
//     <>
//       {/* Loading Overlay */}
//       {(isSubmitting || googleLoading) && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-70 flex justify-center items-center text-white z-50">
//           <CircularIndeterminate />
//         </div>
//       )}

//       <div className="flex w-full justify-start">
//         <img src="/images/logo.png" alt="" className="mb-5" />
//       </div>
//       <div className="w-full">
//         <div className="max-w-5xl mx-auto">
//           <FormCardLayout>
//             <img
//               src="/images/lines.svg"
//               alt="lines"
//               className="opacity-50 absolute top-0 left-0 w-full h-full object-cover z-0"
//             />

//             <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-10 text-white">
//               <button
//                 onClick={handleClose}
//                 className="absolute top-4 right-4 text-primary  transition-colors duration-200 z-20 w-8 h-8 flex items-center justify-center rounded-full border bg-purple hover:bg-primary hover:text-purple"
//                 aria-label="Close">
//                 <FaTimes className="w-5 h-5" />
//               </button>
//               <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
//                 Start your 3-day <span className="text-brand-yellow">Free</span>{" "}
//                 trial to continue
//               </h2>

//               {/* Timeline */}
//               <div className="relative w-full max-w-md mb-10">
//                 {/* Vertical line */}
//                 <div className="absolute top-4 bottom-0 left-4 w-4 bg-brand-yellow z-0 rounded-4xl" />

//                 <div className="relative flex items-start gap-4 mb-10 z-10">
//                   <div>
//                     <div className="relative z-10 w-12 h-12 bg-brand-yellow text-black rounded-full flex items-center justify-center border-4 border-white">
//                       <CalendarDays size={16} />
//                     </div>
//                   </div>
//                   <div className="ml-4">
//                     <p className="font-semibold text-base md:text-lg">Today</p>
//                     <p className="text-sm text-gray-300">
//                       Unlock all the app's features like AI Tailored Apply and
//                       more.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="relative flex items-start gap-4 mb-10 z-10">
//                   <div>
//                     <div className="relative z-10 w-12 h-12 bg-brand-yellow text-black rounded-full flex items-center justify-center border-4 border-white">
//                       <Bell size={16} />
//                     </div>
//                   </div>
//                   <div className="ml-4">
//                     <p className="font-semibold text-base md:text-lg">
//                       In 2 Days - Reminder
//                     </p>
//                     <p className="text-sm text-gray-300">
//                       We'll send you a reminder that your trial is ending soon.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="relative flex items-start gap-4 z-10">
//                   <div>
//                     <div className="relative z-10 w-12 h-12 bg-gray-500 text-gray-400 rounded-full flex items-center justify-center border-4 border-white">
//                       <Gem size={16} />
//                     </div>
//                   </div>
//                   <div className="ml-4">
//                     <p className="font-semibold text-base md:text-lg">
//                       In 3 Days - Billing Starts
//                     </p>
//                     <p className="text-sm text-gray-300">
//                       You'll be charged on {getDateInThreeDays()} unless you
//                       cancel anytime before.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Pricing Packages Slider */}
//               <div className="mb-8 w-full max-w-lg">
//                 <h3 className="text-white text-xl font-semibold mb-4 text-center">
//                   Choose Your Plan
//                 </h3>
//                 <Slider {...sliderSettings}>
//                   {groupedPackages.map((packagePair, slideIndex) => (
//                     <div key={slideIndex} className="px-4">
//                       <div className="flex gap-4 justify-center">
//                         {packagePair.map((pkg, index) => {
//                           const isSelected = selectedPackage === pkg.identifier

//                           // Skip rendering if identifier is undefined
//                           if (!pkg.identifier) return null

//                           return (
//                             <div key={index} className="w-full max-w-48">
//                               <div
//                                 className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-start ${
//                                   isSelected
//                                     ? "border-brand-yellow bg-brand-yellow/10"
//                                     : "border-brand-yellow bg-gray-800/50 hover:border-brand-yellow/70"
//                                 }`}
//                                 onClick={() =>
//                                   pkg.identifier &&
//                                   setSelectedPackage(pkg.identifier)
//                                 }>
//                                 <div className="text-left">
//                                   <div className="text-brand-yellow text-2xl font-bold mb-2">
//                                     {pkg.price}
//                                     <span className="text-sm text-gray-300">
//                                       {pkg.period}
//                                     </span>
//                                   </div>
//                                   <div
//                                     className={`text-xs px-3 py-1 rounded-full mb-3 inline-block text-nowrap ${
//                                       pkg.billing === "monthly"
//                                         ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
//                                         : "bg-green-500/20 text-green-300 border border-green-400/30"
//                                     }`}>
//                                     {pkg.billing === "monthly"
//                                       ? "Monthly Billing"
//                                       : "Yearly Billing"}
//                                   </div>
//                                   <p className="text-xs text-gray-400">
//                                     {pkg.title}
//                                   </p>
//                                 </div>
//                                 <div
//                                   className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
//                                     isSelected
//                                       ? "border-brand-yellow bg-brand-yellow"
//                                       : "border-gray-500 bg-transparent"
//                                   }`}>
//                                   {isSelected && (
//                                     <Check size={12} className="text-black" />
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           )
//                         })}
//                       </div>
//                     </div>
//                   ))}
//                 </Slider>
//               </div>

//               {/* Google Error Display */}
//               {googleError && (
//                 <p className="text-red-400 text-sm text-center max-w-md mb-4">
//                   {googleError}
//                 </p>
//               )}

//               {/* No Payment Info */}
//               <div className="flex items-center gap-2 mb-6">
//                 <Check size={20} className="text-white" />
//                 <span className="font-bold text-sm">No Payment Due Now</span>
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting || googleLoading}
//                 className={`bg-brand-yellow text-black px-6 py-3 rounded-full font-semibold hover:opacity-90 transition w-full max-w-xs text-center ${
//                   isSubmitting || googleLoading
//                     ? "opacity-75 cursor-not-allowed"
//                     : ""
//                 }`}>
//                 {googleLoading
//                   ? "Signing in..."
//                   : isSubmitting
//                   ? "Starting Trial..."
//                   : awaitingGoogleSignIn
//                   ? "Sign in to Continue"
//                   : "Start My 3-Day Free Trial"}
//               </button>

//               {/* Small Print */}
//               <p className="text-gray-400 text-xs mt-4 text-center">
//                 3-day free trial, then billing starts with selected plan
//               </p>

//               {/* Hidden Google Login Component */}
//               <div className="hidden">
//                 <GoogleLogin
//                   onSuccess={handleGoogleSuccess}
//                   onError={handleGoogleError}
//                 />
//               </div>
//             </div>
//           </FormCardLayout>
//         </div>
//       </div>
//     </>
//   )
// }

// export default StepThirtyNine

"use client"

import React, { useState, useEffect, useMemo } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import { CalendarDays, Bell, Gem, Check } from "lucide-react"
import Slider from "react-slick"
import API_ENDPOINTS from "../../../api/endpoints"
import { errorToast, successToast } from "../../../components/Toast"
import CircularIndeterminate from "../../../components/loader/circular"
import { FaTimes } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import {
  GoogleOAuthProvider,
  GoogleLogin,
  GoogleCredentialResponse,
  useGoogleLogin
} from "@react-oauth/google"
import authService from "../../../api/auth"
import { toast } from "../../AIBulkResumeGenerator/components/ui/use-toast"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// Add type declarations for Google API
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

interface StepThirtyNineProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepThirtyNine: React.FC<StepThirtyNineProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [selectedPackage, setSelectedPackage] = useState(
    "basic_monthly_individual"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [awaitingGoogleSignIn, setAwaitingGoogleSignIn] = useState(false)
  const [oneTapInProgress, setOneTapInProgress] = useState(false)
  const [googleInitialized, setGoogleInitialized] = useState(false)
  const navigate = useNavigate()

  const isSafariOrIPhone = useMemo(
    () =>
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      /iPhone|iPad|iPod/i.test(navigator.userAgent),
    []
  )

  // Google login hook for programmatic triggering
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("useGoogleLogin success:", tokenResponse)
      // Convert token response to credential format expected by handleGoogleSuccess
      try {
        setGoogleLoading(true)

        // Use the access token to get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`
        )
        const userInfo = await userInfoResponse.json()

        // Create a credential-like response for our existing handler
        const credentialResponse = {
          credential: tokenResponse.access_token,
          userInfo: userInfo
        }

        await handleGoogleSuccess(credentialResponse)
      } catch (error) {
        console.error("Error processing Google login:", error)
        handleGoogleError()
      }
    },
    onError: (error) => {
      console.error("useGoogleLogin error:", error)
      handleGoogleError()
    },
    onNonOAuthError: (error) => {
      console.error("useGoogleLogin non-OAuth error:", error)
      handleGoogleError()
    }
  })

  const externalPlans = [
    {
      name: "Basic Plan",
      identifier: "basic_monthly_individual"
    },
    {
      name: "Standard Plan",
      identifier: "standard_monthly_individual"
    },
    {
      name: "Premium Plan",
      identifier: "premium_monthly_individual"
    },
    {
      name: "Basic Plan",
      identifier: "basic_yearly_individual"
    },
    {
      name: "Standard Plan",
      identifier: "standard_yearly_individual"
    },
    {
      name: "Premium Plan",
      identifier: "premium_yearly_individual"
    }
  ]

  const plans = {
    individual: [
      {
        title: "Basic Plan",
        monthlyPrice: "$47",
        yearlyPrice: "$37",
        yearlyWeeklyPrice: "$9.25",
        extraText: "Save $120 with yearly"
      },
      {
        title: "Standard Plan",
        monthlyPrice: "$129",
        yearlyPrice: "$103",
        yearlyWeeklyPrice: "$25.75",
        extraText: "Save $312 with yearly"
      },
      {
        title: "Premium Plan",
        monthlyPrice: "$389",
        yearlyPrice: "$311",
        yearlyWeeklyPrice: "$77.75",
        extraText: "Save $936 with yearly"
      }
    ]
  }

  // Simplified Google OAuth initialization
  const initializeGoogleOAuth = async () => {
    console.log("Checking Google OAuth initialization...")

    // The GoogleOAuthProvider should handle initialization automatically
    // We just need to verify it's working
    if (window.google?.accounts?.id) {
      console.log("✅ Google OAuth is available and ready")
      setGoogleInitialized(true)
      return true
    } else {
      console.log(
        "⏳ Google OAuth not ready yet, but GoogleOAuthProvider should handle it"
      )
      setGoogleInitialized(true) // Trust that GoogleOAuthProvider will handle it
      return true
    }
  }

  // Custom popup window for Google OAuth as fallback
  const openGooglePopup = () => {
    console.log("Opening custom Google OAuth popup window...")

    try {
      // Build Google OAuth URL
      const clientId =
        "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com"
      const redirectUri = encodeURIComponent(
        `${window.location.origin}/auth/google/callback`
      )
      const scope = encodeURIComponent("openid email profile")
      const responseType = "code"
      const state = encodeURIComponent(
        JSON.stringify({
          source: "trial_signup",
          timestamp: Date.now()
        })
      )

      const googleAuthUrl =
        `https://accounts.google.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=${responseType}&` +
        `scope=${scope}&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`

      // Calculate center position for popup
      const screenWidth = window.screen.width
      const screenHeight = window.screen.height
      const popupWidth = 500
      const popupHeight = 600
      const left = (screenWidth - popupWidth) / 2
      const top = (screenHeight - popupHeight) / 2

      // Open popup window
      const popup = window.open(
        googleAuthUrl,
        "googleOAuthPopup",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},` +
          `scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no`
      )

      if (!popup) {
        console.error("Popup was blocked by browser")
        errorToast(
          "Popup blocked. Please allow popups for this site and try again."
        )
        setGoogleLoading(false)
        return
      }

      console.log("Google OAuth popup opened successfully")

      // Monitor popup for completion
      let popupCheckInterval: NodeJS.Timeout
      let popupTimeout: NodeJS.Timeout

      const checkPopupStatus = () => {
        try {
          if (popup.closed) {
            console.log("Google OAuth popup was closed")
            clearInterval(popupCheckInterval)
            clearTimeout(popupTimeout)

            // Check if we received the OAuth callback
            // In a real implementation, you'd check for success/failure
            // For now, we'll assume closure means completion
            setTimeout(() => {
              setGoogleLoading(false)
              // You could add logic here to check if authentication was successful
            }, 1000)
            return
          }

          // Try to check popup URL (will throw error due to same-origin policy after redirect)
          try {
            if (popup.location.href.includes("/auth/google/callback")) {
              console.log("OAuth callback detected")
              popup.close()
            }
          } catch (e) {
            // Expected error due to same-origin policy after OAuth redirect
            // This actually indicates the OAuth flow is proceeding
          }
        } catch (error) {
          console.error("Error checking popup status:", error)
        }
      }

      // Check popup status every second
      popupCheckInterval = setInterval(checkPopupStatus, 1000)

      // Timeout after 5 minutes
      popupTimeout = setTimeout(() => {
        console.log("Google OAuth popup timed out")
        if (!popup.closed) {
          popup.close()
        }
        clearInterval(popupCheckInterval)
        setGoogleLoading(false)
        errorToast("Google sign-in timed out. Please try again.")
      }, 300000) // 5 minutes

      // Focus the popup
      if (popup.focus) {
        popup.focus()
      }
    } catch (error) {
      console.error("Error opening Google OAuth popup:", error)
      setGoogleLoading(false)
      errorToast("Failed to open Google sign-in popup. Please try again.")
    }
  } // Initialize component (GoogleOAuthProvider will handle Google initialization)
  useEffect(() => {
    console.log("StepThirtyNine component mounted")

    // Debug: Check if Google Identity Services is available
    console.log("=== GOOGLE OAUTH DEBUG ===")
    console.log("window.google exists:", !!window.google)
    console.log("window.google.accounts exists:", !!window.google?.accounts)
    console.log(
      "window.google.accounts.id exists:",
      !!window.google?.accounts?.id
    )

    // Check if Google script is loaded
    const googleScript = document.querySelector(
      'script[src*="accounts.google.com"]'
    )
    console.log("Google script element found:", !!googleScript)
    if (googleScript) {
      console.log("Google script src:", googleScript.getAttribute("src"))
    }

    // Check if @react-oauth/google has loaded the script
    const gsiScript = document.querySelector('script[src*="gsi"]')
    console.log("GSI script found:", !!gsiScript)

    // Wait a bit and try to initialize if Google is available
    const tryInitialize = () => {
      if (window.google?.accounts?.id) {
        console.log("✅ Google Identity Services available, initializing...")
        try {
          window.google.accounts.id.initialize({
            client_id:
              "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com",
            callback: handleGoogleSuccess,
            ux_mode: "popup"
          })
          setGoogleInitialized(true)
          console.log("✅ Google OAuth initialized successfully")
        } catch (error) {
          console.error("❌ Failed to initialize Google OAuth:", error)
        }
      } else {
        console.log("❌ Google Identity Services not available yet")
      }
    }

    // Try immediately
    tryInitialize()

    // Also try after a delay in case the script is still loading
    const timeouts = [500, 1000, 2000, 5000]
    timeouts.forEach((delay) => {
      setTimeout(() => {
        console.log(`Retry Google init after ${delay}ms...`)
        tryInitialize()
      }, delay)
    })
  }, [])

  // Calculate date 3 days from now
  const getDateInThreeDays = () => {
    const today = new Date()
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(today.getDate() + 3)
    return threeDaysFromNow.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  // Define types for better TypeScript support
  interface PackageOption {
    title: string
    billing: string
    price: string
    identifier: string | undefined
    period: string
    monthlyPrice: string
    yearlyPrice: string
    yearlyWeeklyPrice: string
    extraText: string
  }

  // Create grouped packages (2 per slide: monthly and yearly of same plan)
  const groupedPackages: PackageOption[][] = []

  plans.individual.forEach((plan) => {
    const monthlyIdentifier = externalPlans.find(
      (ext) => ext.name === plan.title && ext.identifier.includes("monthly")
    )?.identifier

    const yearlyIdentifier = externalPlans.find(
      (ext) => ext.name === plan.title && ext.identifier.includes("yearly")
    )?.identifier

    // Only add packages if identifiers are found
    if (monthlyIdentifier && yearlyIdentifier) {
      groupedPackages.push([
        {
          ...plan,
          billing: "monthly",
          price: plan.monthlyPrice,
          identifier: monthlyIdentifier,
          period: "/mo"
        },
        {
          ...plan,
          billing: "yearly",
          price: plan.yearlyWeeklyPrice,
          identifier: yearlyIdentifier,
          period: "/week"
        }
      ])
    }
  })

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }

  // Function to post onboarding data after successful authentication
  const postOnboardingDataFromStorage = async (accessToken: string) => {
    try {
      console.log("Posting onboarding data after Google sign-in...")

      // Post the current onboarding data to the API
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.OnBoardingData}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            ...onboardingData,
            status: "In Progress"
          })
        }
      )

      if (response.ok) {
        const result = await response.json()
        console.log("Onboarding data posted successfully:", result)
        successToast("Progress saved successfully!")

        // Optionally remove any stored data from localStorage after successful post
        localStorage.removeItem("onboarding_data")
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error posting onboarding data:", error)
      // errorToast("Failed to save progress")
    }
  }

  // Handle Google sign-in success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log("handleGoogleSuccess called with:", credentialResponse)

    // Extract credential from either GoogleLogin (credential) or useGoogleLogin (access_token)
    const credential =
      credentialResponse.credential || credentialResponse.access_token

    if (!credential) {
      console.error("No credential or access token received")
      return errorToast("No credential received")
    }

    setGoogleLoading(true)
    setOneTapInProgress(false) // Reset One Tap flag on successful authentication
    try {
      // First, authenticate with Google
      const response = await authService.googleSignIn({
        access_token: credential
      })

      successToast("Google sign-in successful!")

      // Update onboarding data with user ID
      setOnboardingData((prev: any) => ({
        ...prev,
        userId: response.result.user._id
      }))

      // Get the access token from the response
      const accessToken =
        response.result.accessToken ||
        response.result.token ||
        localStorage.getItem("access_token")

      if (accessToken) {
        // Store access token if not already stored
        if (!localStorage.getItem("access_token")) {
          localStorage.setItem("access_token", accessToken)
        }

        const hasSubscription = response.result.user?.subscribed || false

        // Check if onboarding is completed
        const onboardingCompleted =
          response.result.onboardingCompleted ||
          response.result.user?.onboardingCompleted ||
          response.onboardingCompleted

        if (onboardingCompleted === true && hasSubscription) {
          // If onboarding is completed, navigate to auto-apply
          // console.log("Onboarding completed, navigating to /auto-apply")
          // navigate("/auto-apply")
          errorToast("You have used your free trial.")
          return
        }

        // Post the onboarding data after successful authentication (only if onboarding not completed)
        await postOnboardingDataFromStorage(accessToken)
      }

      // If we were awaiting Google sign-in, proceed with trial start
      if (awaitingGoogleSignIn) {
        setAwaitingGoogleSignIn(false)
        await handleStartTrial()
      }
    } catch (error) {
      console.error("Google sign-in failed:", error)
      errorToast("Google sign-in failed.")
      setAwaitingGoogleSignIn(false)
      setOneTapInProgress(false) // Reset One Tap flag on error
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    console.log("Google Login Failed")

    if (isSafariOrIPhone) {
      console.log("Detected Safari/iPhone, reloading page...")
      return window.location.reload()
    }
    setGoogleError("Google sign-in failed. Please try again.")
    setGoogleLoading(false)
    setAwaitingGoogleSignIn(false)
    setOneTapInProgress(false) // Reset One Tap flag on error
  }

  // Trigger Google sign-in using useGoogleLogin hook
  const handleCustomGoogleLogin = async () => {
    console.log("Triggering Google sign-in using useGoogleLogin...")
    setGoogleLoading(true)

    try {
      // Call the googleLogin function from useGoogleLogin hook
      googleLogin()
    } catch (error) {
      console.error("Error triggering Google login:", error)
      setGoogleLoading(false)
      errorToast("Failed to start Google sign-in. Please try again.")
    }
  }

  // Function to handle trial start with API call
  const handleStartTrial = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      errorToast("Access token missing. Please login again.")
      return
    }

    if (!selectedPackage) {
      errorToast("Please select a plan to continue.")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("=== STARTING 3-DAY FREE TRIAL ===")
      console.log("Selected Package:", selectedPackage)

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.Subscription}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: selectedPackage,
          isTrial: true
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log("✅ Free trial started successfully!")

        // Update onboarding data with selected plan
        setOnboardingData((prev: any) => ({
          ...prev,
          selectedPlan: selectedPackage
        }))

        // Check if checkoutUrl is present in the response
        if (data.checkoutUrl) {
          console.log("Redirecting to checkout URL:", data.checkoutUrl)
          localStorage.setItem("subscription-in-progress", "true")
          // Redirect to checkout URL in same tab
          window.location.href = data.checkoutUrl
        } else {
          // If no checkoutUrl, show success message and continue
          successToast("Your 3-day free trial has been started successfully!")
          navigate("/auto-apply")
          // onNextStep()
        }
      } else {
        console.error("API Error:", data)
        errorToast(
          data.message || "Failed to start free trial. Please try again."
        )
      }
    } catch (error) {
      console.error("Network Error:", error)
      errorToast(
        "Network error occurred. Please check your connection and try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting || googleLoading) return

    // Check if access token is present
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      // No access token, trigger Google sign-in first
      setAwaitingGoogleSignIn(true)
      setGoogleError(null)
      handleCustomGoogleLogin()
      return
    }

    // Access token exists, proceed with trial start
    await handleStartTrial()
  }

  // Handle close button click
  const handleClose = () => {
    navigate("/signIn")
  }

  return (
    <GoogleOAuthProvider clientId="637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com">
      {/* Loading Overlay */}
      {(isSubmitting || googleLoading) && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-70 flex justify-center items-center text-white z-50">
          <CircularIndeterminate />
        </div>
      )}

      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <div className="w-full">
        <div className="max-w-5xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-50 absolute top-0 left-0 w-full h-full object-cover z-0"
            />

            <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-10 text-white">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-primary  transition-colors duration-200 z-20 w-8 h-8 flex items-center justify-center rounded-full  hover:text-purple"
                aria-label="Close">
                <FaTimes className="w-5 h-5" />
              </button>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Start your 3-day <span className="text-brand-yellow">Free</span>{" "}
                trial to continue
              </h2>

              {/* Timeline */}
              <div className="relative w-full max-w-md mb-10">
                {/* Vertical line */}
                <div className="absolute top-4 bottom-0 left-4 w-4 bg-brand-yellow z-0 rounded-4xl" />

                <div className="relative flex items-start gap-4 mb-10 z-10">
                  <div>
                    <div className="relative z-10 w-12 h-12 bg-brand-yellow text-black rounded-full flex items-center justify-center border-4 border-white">
                      <CalendarDays size={16} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-base md:text-lg">Today</p>
                    <p className="text-sm text-gray-300">
                      Unlock all the app's features like AI Tailored Apply and
                      more.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 mb-10 z-10">
                  <div>
                    <div className="relative z-10 w-12 h-12 bg-brand-yellow text-black rounded-full flex items-center justify-center border-4 border-white">
                      <Bell size={16} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-base md:text-lg">
                      In 2 Days - Reminder
                    </p>
                    <p className="text-sm text-gray-300">
                      We'll send you a reminder that your trial is ending soon.
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 z-10">
                  <div>
                    <div className="relative z-10 w-12 h-12 bg-gray-500 text-gray-400 rounded-full flex items-center justify-center border-4 border-white">
                      <Gem size={16} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-base md:text-lg">
                      In 3 Days - Billing Starts
                    </p>
                    <p className="text-sm text-gray-300">
                      You'll be charged on {getDateInThreeDays()} unless you
                      cancel anytime before.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Packages Slider */}
              <div className="mb-8 w-full max-w-lg">
                <h3 className="text-white text-xl font-semibold mb-4 text-center">
                  Choose Your Plan
                </h3>
                <Slider {...sliderSettings}>
                  {groupedPackages.map((packagePair, slideIndex) => (
                    <div key={slideIndex} className="px-4">
                      <div className="flex gap-4 justify-center">
                        {packagePair.map((pkg, index) => {
                          const isSelected = selectedPackage === pkg.identifier

                          // Skip rendering if identifier is undefined
                          if (!pkg.identifier) return null

                          return (
                            <div key={index} className="w-full max-w-48">
                              <div
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-start ${
                                  isSelected
                                    ? "border-brand-yellow bg-brand-yellow/10"
                                    : "border-brand-yellow bg-gray-800/50 hover:border-brand-yellow/70"
                                }`}
                                onClick={() =>
                                  pkg.identifier &&
                                  setSelectedPackage(pkg.identifier)
                                }>
                                <div className="text-left">
                                  <div className="text-brand-yellow text-2xl font-bold mb-2">
                                    {pkg.price}
                                    <span className="text-sm text-gray-300">
                                      {pkg.period}
                                    </span>
                                  </div>
                                  <div
                                    className={`text-xs px-1 md:px-3 py-1 rounded-full mb-3 inline-block text-nowrap ${
                                      pkg.billing === "monthly"
                                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                                        : "bg-green-500/20 text-green-300 border border-green-400/30"
                                    }`}>
                                    {pkg.billing === "monthly"
                                      ? "Monthly Billing"
                                      : "Yearly Billing"}
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    {pkg.title}
                                  </p>
                                </div>
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "border-brand-yellow bg-brand-yellow"
                                      : "border-gray-500 bg-transparent"
                                  }`}>
                                  {isSelected && (
                                    <Check size={12} className="text-black" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>

              {/* Google Error Display */}
              {googleError && (
                <p className="text-red-400 text-sm text-center max-w-md mb-4">
                  {googleError}
                </p>
              )}

              {/* No Payment Info */}
              <div className="flex items-center gap-2 mb-6">
                <Check size={28} className="text-white self-baseline" />
                <span className="font-bold text-2xl">No Payment Due Now</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || googleLoading}
                className={`bg-brand-yellow text-black px-6 py-3 rounded-full font-semibold hover:opacity-90 transition w-full max-w-xs text-center ${
                  isSubmitting || googleLoading
                    ? "opacity-75 cursor-not-allowed"
                    : ""
                }`}>
                {googleLoading ? (
                  "Signing in..."
                ) : isSubmitting ? (
                  "Starting Trial..."
                ) : awaitingGoogleSignIn ? (
                  "Sign in to Continue"
                ) : (
                  <>
                    <span className="flex items-center justify-center flex-nowrap whitespace-nowrap">
                      <span className="text-lg">Start My 3-Day Free Trial</span>
                      <span
                        aria-hidden="true"
                        className="mx-2 h-[2px] w-8 bg-black/50 inline-block"
                      />
                      <span className="text-2xl">$0</span>
                    </span>
                  </>
                )}
              </button>

              {/* Small Print */}
              <p className="text-gray-400 text-xs mt-4 text-center">
                3-day free trial, then billing starts with selected plan
              </p>

              {/* Hidden Google Login Component */}
              <div
                className="google-login-hidden"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  pointerEvents: "none"
                }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  auto_select={false}
                  size="large"
                  theme="outline"
                  type="standard"
                  shape="rectangular"
                  logo_alignment="left"
                  context="signin"
                  ux_mode="popup"
                />
              </div>
            </div>
          </FormCardLayout>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default StepThirtyNine
