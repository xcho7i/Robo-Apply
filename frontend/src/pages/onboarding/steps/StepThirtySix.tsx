// "use client"

// import React, { useEffect, useState } from "react"
// import FormCardLayout from "../../../components/common/FormCardLayout"
// import FormHeading from "../../../components/common/FormHeading"
// import FormPara from "../../../components/common/FormPara"
// import StepNavigation from "../../../components/common/StepNavigation"
// import {
//   GoogleOAuthProvider,
//   GoogleLogin,
//   GoogleCredentialResponse
// } from "@react-oauth/google"
// import { useNavigate } from "react-router-dom"
// import { errorToast } from "../../../components/Toast"
// import { successToast } from "../../../components/Toast"
// import authService from "../../../api/auth"
// import API_ENDPOINTS from "../../../api/endpoints"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// // Add type declarations for Google API
// declare global {
//   interface Window {
//     google?: {
//       accounts: {
//         id: {
//           initialize: (config: any) => void
//           prompt: (callback?: (notification: any) => void) => void
//           renderButton: (element: HTMLElement, config: any) => void
//         }
//       }
//     }
//   }
// }

// interface StepThirtySixProps {
//   onboardingData: any
//   setOnboardingData: (data: any) => void
//   onNextStep: () => void
//   onPreviousStep: () => void
// }

// const StepThirtySix: React.FC<StepThirtySixProps> = ({
//   onboardingData,
//   setOnboardingData,
//   onNextStep,
//   onPreviousStep
// }) => {
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [googleLoading, setGoogleLoading] = useState(false)
//   const [googleError, setGoogleError] = useState<string | null>(null)
//   const [userData, setUserData] = useState<any>(null)
//   const [showGoogleLogin, setShowGoogleLogin] = useState(false)
//   const navigate = useNavigate()

//   function decodeJWT(token: string): any {
//     try {
//       // Split the token into parts
//       const parts = token.split(".")
//       if (parts.length !== 3) {
//         throw new Error("Invalid JWT token format")
//       }

//       // Decode the payload (second part)
//       const payload = parts[1]
//       const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))

//       return JSON.parse(decodedPayload)
//     } catch (error) {
//       console.error("Error decoding JWT token:", error)
//       throw new Error("Failed to decode JWT token")
//     }
//   }

//   function extractGoogleUserData(
//     credentialResponse: GoogleCredentialResponse
//   ): any {
//     try {
//       const decodedToken = decodeJWT(credentialResponse.credential || "")

//       // Extract the relevant user data
//       const userData: any = {
//         sub: decodedToken.sub,
//         email: decodedToken.email,
//         email_verified: decodedToken.email_verified,
//         name: decodedToken.name,
//         given_name: decodedToken.given_name,
//         family_name: decodedToken.family_name,
//         picture: decodedToken.picture,
//         iat: decodedToken.iat,
//         exp: decodedToken.exp
//       }

//       return userData
//     } catch (error) {
//       console.error("Error extracting Google user data:", error)
//       throw new Error("Failed to extract user data from Google credential")
//     }
//   }

//   // Function to post onboarding data after successful authentication
//   const postOnboardingDataFromStorage = async (accessToken: string) => {
//     try {
//       console.log("Posting onboarding data after Google sign-in...")

//       // Post the current onboarding data to the API
//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.OnBoardingData}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${accessToken}`
//           },
//           body: JSON.stringify({
//             ...onboardingData,
//             status: "In Progress"
//           })
//         }
//       )

//       if (response.ok) {
//         const result = await response.json()
//         console.log("Onboarding data posted successfully:", result)
//         successToast("Progress saved successfully!")

//         // Optionally remove any stored data from localStorage after successful post
//         localStorage.removeItem("onboarding_data")
//       } else {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//     } catch (error) {
//       console.error("Error posting onboarding data:", error)
//       errorToast("Failed to save progress")
//     }
//   }

//   useEffect(() => {
//     localStorage.clear()

//     const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent)
//     setShowGoogleLogin(false) // Always hide the default Google button

//     // Initialize Google Sign-In with better configuration for staging
//     const initializeGoogleSignIn = () => {
//       if (window.google && window.google.accounts) {
//         try {
//           window.google.accounts.id.initialize({
//             client_id:
//               "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com",
//             callback: handleGoogleSuccess,
//             auto_select: false,
//             cancel_on_tap_outside: false,
//             use_fedcm_for_prompt: false, // Disable FedCM for staging compatibility
//             ux_mode: "popup" // Force popup mode for better staging compatibility
//           })

//           // For staging environments, pre-render a button
//           setTimeout(() => {
//             const container = document.querySelector(
//               ".google-login-hidden"
//             ) as HTMLElement
//             if (
//               container &&
//               !container.querySelector("button") &&
//               window.google?.accounts?.id
//             ) {
//               try {
//                 window.google.accounts.id.renderButton(container, {
//                   theme: "outline",
//                   size: "large",
//                   width: 300
//                 })
//                 console.log("Google button pre-rendered successfully")
//               } catch (error) {
//                 console.log("Pre-render failed, will try on click:", error)
//               }
//             }
//           }, 1000)
//         } catch (error) {
//           console.error("Google Sign-In initialization failed:", error)
//         }
//       } else {
//         // Retry initialization if Google SDK not loaded yet
//         setTimeout(initializeGoogleSignIn, 500)
//       }
//     }

//     initializeGoogleSignIn()
//   }, [])

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

//         // Check if onboarding is completed
//         const onboardingCompleted =
//           response.result.onboardingCompleted ||
//           response.result.user?.onboardingCompleted ||
//           response.onboardingCompleted

//         if (onboardingCompleted === true) {
//           // If onboarding is completed, navigate to auto-apply
//           console.log("Onboarding completed, navigating to /auto-apply")
//           navigate("/auto-apply")
//           return
//         }

//         // Post the onboarding data after successful authentication (only if onboarding not completed)
//         await postOnboardingDataFromStorage(accessToken)
//       }

//       // Proceed to next step (only if onboarding not completed)
//       onNextStep()
//     } catch (error) {
//       console.error("Google sign-in failed:", error)
//       errorToast("Google sign-in failed.")
//     } finally {
//       setGoogleLoading(false)
//     }
//   }

//   const handleCustomGoogleLogin = () => {
//     console.log("Attempting Google sign-in...")

//     // First, try to click the hidden Google Login button (works for both mobile and web)
//     const googleLoginButton = document.querySelector(
//       ".google-login-hidden button"
//     )
//     console.log("Found Google login button:", googleLoginButton)

//     if (googleLoginButton) {
//       console.log("Clicking Google login button...")
//       ;(googleLoginButton as HTMLElement).click()
//       return
//     }

//     // Fallback 1: Try other common Google button selectors
//     const fallbackSelectors = [
//       '[data-testid="google-login-button"]',
//       '[role="button"][aria-label*="Google"]',
//       'button[aria-label*="Sign in with Google"]',
//       ".google-login button",
//       '[aria-labelledby="button-label"]',
//       'iframe[src*="accounts.google.com"] ~ div button',
//       '[data-testid="GoogleLoginButton"]'
//     ]

//     for (const selector of fallbackSelectors) {
//       const button = document.querySelector(selector)
//       if (button) {
//         console.log(`Found button with selector ${selector}:`, button)
//         ;(button as HTMLElement).click()
//         return
//       }
//     }

//     // Fallback 2: Wait for Google button to load and retry
//     console.log("Waiting for Google button to load...")
//     setTimeout(() => {
//       const delayedButton = document.querySelector(
//         ".google-login-hidden button"
//       )
//       if (delayedButton) {
//         console.log("Found delayed Google button:", delayedButton)
//         ;(delayedButton as HTMLElement).click()
//         return
//       }

//       // Fallback 3: Try Google One Tap with better error handling
//       const isMobile =
//         /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(
//           navigator.userAgent
//         )

//       if (window.google?.accounts?.id) {
//         console.log("Trying Google One Tap...")
//         try {
//           // For staging environments, try to render the button manually
//           const container = document.querySelector(
//             ".google-login-hidden"
//           ) as HTMLElement
//           if (container) {
//             window.google.accounts.id.renderButton(container, {
//               theme: "outline",
//               size: "large",
//               width: 300
//             })
//           }

//           // Then try to prompt
//           if (!isMobile) {
//             window.google.accounts.id.prompt((notification) => {
//               if (
//                 notification.isNotDisplayed() ||
//                 notification.isSkippedMoment()
//               ) {
//                 console.log(
//                   "Google One Tap not displayed:",
//                   notification.getNotDisplayedReason()
//                 )
//                 // Fallback to manual render
//                 handleManualGoogleRender()
//               }
//             })
//           } else {
//             // For mobile, directly try to find and click the rendered button
//             setTimeout(() => {
//               const renderedButton = document.querySelector(
//                 ".google-login-hidden button"
//               )
//               if (renderedButton) {
//                 ;(renderedButton as HTMLElement).click()
//               }
//             }, 500)
//           }
//         } catch (error) {
//           console.error("Google One Tap failed:", error)
//           handleManualGoogleRender()
//         }
//       } else {
//         console.error("Google SDK not loaded properly")
//         errorToast(
//           "Google login failed to initialize. Please refresh the page and try again."
//         )
//       }
//     }, 1000)
//   }

//   const handleManualGoogleRender = () => {
//     console.log("Attempting manual Google button render...")
//     if (window.google?.accounts?.id) {
//       try {
//         // Clear and re-render the Google button
//         const container = document.querySelector(
//           ".google-login-hidden"
//         ) as HTMLElement
//         if (container) {
//           container.innerHTML = ""
//           window.google.accounts.id.renderButton(container, {
//             theme: "outline",
//             size: "large",
//             width: 300,
//             click_listener: () => {
//               console.log("Manual Google button clicked")
//             }
//           })

//           // Try to click the newly rendered button
//           setTimeout(() => {
//             const newButton = container.querySelector("button")
//             if (newButton) {
//               console.log("Clicking manually rendered button")
//               ;(newButton as HTMLElement).click()
//             }
//           }, 200)
//         }
//       } catch (error) {
//         console.error("Manual render failed:", error)
//         errorToast(
//           "Google login is not available. Please try refreshing the page."
//         )
//       }
//     }
//   }

//   const handleSkip = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault()
//     if (isSubmitting) return

//     setIsSubmitting(true)

//     try {
//       setOnboardingData((prev: any) => ({
//         ...prev
//         // Add any step-specific data here if needed
//       }))
//       onNextStep()
//     } catch (err) {
//       console.error("Step 36 Error:", err)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleGoogleError = () => {
//     console.log("Google Login Failed")
//     setGoogleError("Google sign-in failed. Please try again.")
//     setGoogleLoading(false)
//   }

//   return (
//     <>
//       <div className="flex w-full justify-start">
//         <img src="/images/logo.png" alt="" className="mb-5" />
//       </div>
//       <div className="w-full">
//         <div className="max-w-5xl mx-auto">
//           <FormCardLayout>
//             <img
//               src="/images/lines.svg"
//               alt="lines"
//               className="opacity-60 absolute"
//             />
//             <div className="w-full min-h-[700px] flex flex-col justify-center items-center p-10 z-50 gap-8">
//               <div className="flex flex-col items-center gap-6">
//                 {/* Moved heading higher and made it larger */}
//                 <div className="text-center">
//                   <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
//                     <span className="text-white">Save your</span>
//                     <span className="text-brand-yellow"> Progress</span>
//                   </h1>
//                   <p className="text-gray-300 text-lg md:text-xl mt-2">
//                     Sign in to save your progress and continue later
//                   </p>
//                 </div>

//                 <div>
//                   <img
//                     src="/images/login-screen-image.png"
//                     alt="Login Image"
//                     className="h-60 md:h-96 mb-4"
//                   />
//                 </div>

//                 <div className="transform scale-100 md:scale-150">
//                   <button
//                     onClick={handleCustomGoogleLogin}
//                     disabled={googleLoading}
//                     className="flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:min-w-[300px]">
//                     {googleLoading ? (
//                       <div className="flex items-center gap-3">
//                         <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
//                         <span>Signing in...</span>
//                       </div>
//                     ) : (
//                       <>
//                         <svg
//                           className="w-5 h-5 flex-shrink-0"
//                           viewBox="0 0 24 24">
//                           <path
//                             fill="#4285F4"
//                             d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                           />
//                           <path
//                             fill="#34A853"
//                             d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                           />
//                           <path
//                             fill="#FBBC05"
//                             d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                           />
//                           <path
//                             fill="#EA4335"
//                             d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                           />
//                         </svg>
//                         <span>Sign in with Google</span>
//                       </>
//                     )}
//                   </button>

//                   {/* Hidden Google Login Component */}
//                   <div
//                     className="google-login-hidden"
//                     style={{
//                       position: "absolute",
//                       left: "-9999px",
//                       opacity: 0,
//                       pointerEvents: "none"
//                     }}>
//                     <GoogleLogin
//                       onSuccess={handleGoogleSuccess}
//                       onError={handleGoogleError}
//                       useOneTap={false}
//                       auto_select={false}
//                       size="large"
//                       theme="outline"
//                     />
//                   </div>
//                 </div>

//                 {googleError && (
//                   <p className="text-red-400 text-sm text-center max-w-md">
//                     {googleError}
//                   </p>
//                 )}

//                 <p className="text-white text-base md:text-lg">
//                   would you like to sign in later?{" "}
//                   <span
//                     className="text-brand-yellow font-medium cursor-pointer hover:underline"
//                     onClick={handleSkip}>
//                     Skip
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </FormCardLayout>
//           <div className="w-full flex justify-center mt-1">
//             <StepNavigation
//               currentStep={36}
//               onNext={handleSkip}
//               onPrevious={onPreviousStep}
//               isLoading={isSubmitting}
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// export default StepThirtySix

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { clearLocalStorageButKeepTour } from "@/src/utils/ls"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import {
  GoogleOAuthProvider,
  GoogleLogin,
  GoogleCredentialResponse
} from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { errorToast } from "../../../components/Toast"
import { successToast } from "../../../components/Toast"
import authService from "../../../api/auth"
import API_ENDPOINTS from "../../../api/endpoints"

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

interface StepThirtySixProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

const StepThirtySix: React.FC<StepThirtySixProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [showGoogleLogin, setShowGoogleLogin] = useState(false)
  const [userHasSkipped, setUserHasSkipped] = useState(false)
  const [googleInitialized, setGoogleInitialized] = useState(false)
  const navigate = useNavigate()

  const [loginBtnKey, setLoginBtnKey] = useState<string | undefined>()

  const isSafariOrIPhone = useMemo(
    () =>
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      /iPhone|iPad|iPod/i.test(navigator.userAgent),
    []
  )

  function decodeJWT(token: string): any {
    try {
      // Split the token into parts
      const parts = token.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid JWT token format")
      }

      // Decode the payload (second part)
      const payload = parts[1]
      const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))

      return JSON.parse(decodedPayload)
    } catch (error) {
      console.error("Error decoding JWT token:", error)
      throw new Error("Failed to decode JWT token")
    }
  }

  function extractGoogleUserData(
    credentialResponse: GoogleCredentialResponse
  ): any {
    try {
      const decodedToken = decodeJWT(credentialResponse.credential || "")

      // Extract the relevant user data
      const userData: any = {
        sub: decodedToken.sub,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        given_name: decodedToken.given_name,
        family_name: decodedToken.family_name,
        picture: decodedToken.picture,
        iat: decodedToken.iat,
        exp: decodedToken.exp
      }

      return userData
    } catch (error) {
      console.error("Error extracting Google user data:", error)
      throw new Error("Failed to extract user data from Google credential")
    }
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

  const initializeGoogleOAuth = async () => {
    // Skip initialization if user has already skipped
    if (userHasSkipped) {
      console.log("User has skipped, preventing Google OAuth initialization")
      return false
    }

    // Skip if already initialized
    if (googleInitialized) {
      console.log("Google OAuth already initialized")
      return true
    }

    try {
      console.log("Initializing Google OAuth on user intent...")

      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id:
            "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com",
          callback: handleGoogleSuccess
        })
        setGoogleInitialized(true)
        console.log("Google OAuth initialized successfully")
        return true
      } else {
        console.error("Google Identity Services not available")
        return false
      }
    } catch (error) {
      console.error("Failed to initialize Google OAuth:", error)
      return false
    }
  }

  useEffect(() => {
    clearLocalStorageButKeepTour()

    const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setShowGoogleLogin(isIPhone)

    // Note: Google OAuth initialization moved to handleCustomGoogleLogin
    // to implement user intent-driven approach
  }, [])

  // const handleGoogleSuccess = async (credentialResponse: any) => {
  //   const { credential } = credentialResponse
  //   if (!credential) return errorToast("No credential received")

  //   setGoogleLoading(true)
  //   try {
  //     // First, authenticate with Google
  //     const response = await authService.googleSignIn({ idToken: credential })
  //     successToast("Google sign-in successful!")

  //     // Update onboarding data with user ID
  //     setOnboardingData((prev: any) => ({
  //       ...prev,
  //       userId: response.result.user._id
  //     }))

  //     // Get the access token from the response
  //     const accessToken =
  //       response.result.accessToken ||
  //       response.result.token ||
  //       localStorage.getItem("access_token")

  //     if (accessToken) {
  //       // Store access token if not already stored
  //       if (!localStorage.getItem("access_token")) {
  //         localStorage.setItem("access_token", accessToken)
  //       }

  //       // Post the onboarding data after successful authentication
  //       await postOnboardingDataFromStorage(accessToken)
  //     }

  //     // Proceed to next step
  //     onNextStep()
  //   } catch (error) {
  //     console.error("Google sign-in failed:", error)
  //     errorToast("Google sign-in failed.")
  //   } finally {
  //     setGoogleLoading(false)
  //   }
  // }
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const { credential } = credentialResponse
    if (!credential) return errorToast("No credential received")

    setGoogleLoading(true)
    try {
      // First, authenticate with Google
      const response = await authService.googleSignIn({ idToken: credential })
      successToast("Google sign-in successful!")

      // Update onboarding data with user ID
      setOnboardingData((prev: any) => ({
        ...prev,
        userId: response.result.user._id
      }))

      const hasSubscription = response.result.user?.subscribed || false

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

        // Check if onboarding is completed
        const onboardingCompleted =
          response.result.onboardingCompleted ||
          response.result.user?.onboardingCompleted ||
          response.onboardingCompleted

        if (onboardingCompleted === true && hasSubscription) {
          // If onboarding is completed, navigate to auto-apply
          console.log("Onboarding completed, navigating to /auto-apply")
          navigate("/auto-apply")
          return
        }

        // Post the onboarding data after successful authentication (only if onboarding not completed)
        await postOnboardingDataFromStorage(accessToken)
      }

      // Proceed to next step (only if onboarding not completed)
      onNextStep()
    } catch (error) {
      console.error("Google sign-in failed:", error)
      errorToast("Google sign-in failed.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleCustomGoogleLogin = async () => {
    console.log("User clicked Google sign-in, initializing OAuth...")

    // Skip if user has already skipped
    if (userHasSkipped) {
      console.log("User has skipped, preventing Google sign-in")
      errorToast("Please refresh the page to sign in with Google.")
      return
    }

    // Initialize Google OAuth on user intent
    const initialized = await initializeGoogleOAuth()
    if (!initialized) {
      errorToast(
        "Google login failed to initialize. Please refresh the page and try again."
      )
      return
    }

    console.log("Attempting Google sign-in...")

    // First, try to click the hidden Google Login button (works for both mobile and web)
    const googleLoginButton = document.querySelector(
      ".hidden [role='button'], .hidden button"
    )
    console.log("Found Google login button:", googleLoginButton)

    if (googleLoginButton) {
      console.log("Clicking Google login button...")
      ;(googleLoginButton as HTMLElement).click()
      return
    }

    // Fallback 1: Try other common Google button selectors
    const fallbackSelectors = [
      '[data-testid="google-login-button"]',
      '[role="button"][aria-label*="Google"]',
      'button[aria-label*="Sign in with Google"]',
      '[aria-labelledby="button-label"]',
      ".google-login button"
    ]

    for (const selector of fallbackSelectors) {
      const button = document.querySelector(selector)
      if (button) {
        console.log(`Found button with selector ${selector}:`, button)
        ;(button as HTMLElement).click()
        return
      }
    }

    // Fallback 2: For desktop, try Google One Tap if available
    const isMobile =
      /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      )

    if (!isMobile && window.google?.accounts?.id) {
      console.log("Trying Google One Tap...")
      try {
        window.google.accounts.id.prompt()
        return
      } catch (error) {
        console.error("Google One Tap failed:", error)
      }
    }

    // Final fallback: Show error
    console.error("All Google sign-in methods failed")
    errorToast(
      "Google login failed to initialize. Please refresh the page and try again."
    )
  }

  const handleSkip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      // Set flag to prevent any background Google OAuth execution
      setUserHasSkipped(true)
      console.log("User skipped sign-in, preventing background OAuth execution")

      setOnboardingData((prev: any) => ({
        ...prev
        // Add any step-specific data here if needed
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 36 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleError = () => {
    if (isSafariOrIPhone) {
      console.log("Detected Safari/iPhone, reloading page...")
      return window.location.reload()
    }
    console.log("Google Login Failed")
    setGoogleError("Google sign-in failed. Please try again.")
    setGoogleLoading(false)
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
            <div className="w-full min-h-[700px] flex flex-col justify-center items-center p-10 z-50 gap-8">
              <div className="flex flex-col items-center gap-6">
                {/* Moved heading higher and made it larger */}
                <div className="text-center">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                    <span className="text-white">Save your</span>
                    <span className="text-brand-yellow"> Progress</span>
                  </h1>
                  <p className="text-gray-300 text-lg md:text-xl mt-2">
                    Sign in to save your progress and continue later
                  </p>
                </div>

                <div>
                  <img
                    src="/images/login-screen-image.png"
                    alt="Login Image"
                    className="h-60 md:h-96 mb-4"
                  />
                </div>

                <div className="transform scale-100 md:scale-150">
                  <button
                    onClick={handleCustomGoogleLogin}
                    disabled={googleLoading}
                    className="flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:min-w-[300px]">
                    {googleLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </button>
                  <div className="hidden">
                    <GoogleLogin
                      {...(isSafariOrIPhone ? { key: loginBtnKey } : {})}
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      click_listener={
                        isSafariOrIPhone
                          ? () => {
                              setLoginBtnKey(`login-btn-${Date.now()}`)
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>

                {googleError && (
                  <p className="text-red-400 text-sm text-center max-w-md">
                    {googleError}
                  </p>
                )}

                <p className="text-white text-base md:text-lg">
                  would you like to sign in later?{" "}
                  <span
                    className="text-brand-yellow font-medium cursor-pointer hover:underline"
                    onClick={handleSkip}>
                    Skip
                  </span>
                </p>
              </div>
            </div>
          </FormCardLayout>
          <div className="w-full flex justify-center mt-1">
            <StepNavigation
              currentStep={36}
              onNext={handleSkip}
              onPrevious={onPreviousStep}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default StepThirtySix
