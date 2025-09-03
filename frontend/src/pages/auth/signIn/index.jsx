// import React, { useState, useEffect } from "react"
// import { GoogleLogin } from "@react-oauth/google"
// import { Link, useNavigate } from "react-router-dom"
// import InputField from "../../../components/EmailInput"
// import PasswordInput from "../../../components/PasswordInput"
// import Button from "../../../components/Button"
// import googleIcon from "../../../assets/socialMedia/google_logo.svg"
// import signInImage from "../../../assets/auth/signInImage.webp"
// import { successToast, errorToast } from "../../../components/Toast"
// import authService from "../../../api/auth"
// import logo from "../../../assets/logo.svg"
// import CircularIndeterminate from "../../../components/loader/circular"

// const SignIn = () => {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [showGoogleLogin, setShowGoogleLogin] = useState(false)
//   const navigate = useNavigate()

//   useEffect(() => {
//     localStorage.clear()

//     const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent)
//     setShowGoogleLogin(isIPhone)

//     if (window.google && window.google.accounts) {
//       window.google.accounts.id.initialize({
//         client_id:
//           "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com",
//         callback: handleGoogleSuccess
//       })
//     }
//   }, [])

//   const handleSignIn = async (e) => {
//     e.preventDefault()
//     if (!email || !password) {
//       errorToast("Please fill in both fields.")
//       return
//     }

//     setLoading(true)
//     try {
//       const response = await authService.login({ email, password })
//       console.log("Login response:", response) // Debug log

//       successToast("Login successfully!")
//       setEmail("")
//       setPassword("")

//       // Check if user is new and navigate accordingly
//       if (response.isNewUser === true) {
//         console.log("New user detected, navigating to /package")
//         navigate("/package")
//       } else {
//         console.log("Existing user, navigating to /auto-apply")
//         navigate("/auto-apply")
//       }
//     } catch (error) {
//       console.error("Login failed:", error)
//       errorToast("Wrong email or password")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleGoogleSuccess = async (credentialResponse) => {
//     const { credential } = credentialResponse
//     if (!credential) return errorToast("No credential received")

//     setLoading(true)
//     try {
//       const response = await authService.googleSignIn({ idToken: credential })
//       console.log("Google sign-in response:", response) // Debug log

//       successToast("Google sign-in successful!")

//       // Check if user is new and navigate accordingly
//       if (response.isNewUser === true) {
//         console.log("New Google user detected, navigating to /package")
//         navigate("/package")
//       } else {
//         console.log("Existing Google user, navigating to /auto-apply")
//         navigate("/auto-apply")
//       }
//     } catch (error) {
//       console.error("Google sign-in failed:", error)
//       errorToast("Google sign-in failed.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleGoogleFailure = () => {
//     errorToast("Google sign-in was unsuccessful. Try again.")
//   }

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
//         googleLoginButton.click()
//       } else {
//         errorToast("Google login failed to initialize.")
//       }
//     }
//   }

//   return (
//     <div className="flex justify-center items-center w-screen lg:h-screen md:p-10">
//       <div className="block lg:flex bg-almostBlack p-5 lg:gap-14 rounded-2xl w-full h-full lg:max-w-[1050px] lg:max-h-[680px]">
//         <img
//           src={logo}
//           className="cursor-pointer lg:hidden pb-5 lg:pl-5 w-[150px]"
//           onClick={() =>
//             (window.location.href = "https://beta.robo-apply.com/")
//           }
//         />

//         <p className="block lg:hidden text-primary font-semibold text-2xl pb-5">
//           Log In
//         </p>

//         {/* Image Section */}
//         <div className="w-full lg:w-1/2 flex justify-center items-center order-1 lg:order-2">
//           <img
//             src={signInImage}
//             alt="Sign In"
//             className="max-w-full max-h-full object-contain"
//             loading="lazy"
//           />
//         </div>

//         {/* Form Section */}
//         <div className="w-full lg:w-1/2 flex order-2 lg:order-1">
//           <div className="w-full">
//             <div className="w-full flex lg:justify-between">
//               <div className="flex gap-3 pt-5 md:pl-5">
//                 <img
//                   src={logo}
//                   className="cursor-pointer hidden lg:block"
//                   onClick={() =>
//                     (window.location.href = "https://beta.robo-apply.com/")
//                   }
//                 />
//               </div>
//               <div className="flex lg:hidden gap-2 pt-5 md:pl-5 items-center whitespace-nowrap">
//                 <p className="text-right text-greyColor text-xs md:text-base">
//                   Don't have an account?
//                 </p>
//                 <Link
//                   // to="/signUp"
//                   to="/onboarding"
//                   className="text-purpleColor hover:text-primary">
//                   Sign up
//                 </Link>
//               </div>
//             </div>

//             <div className="w-full items-center lg:pt-14 md:pl-5">
//               <p className="hidden lg:block text-primary font-semibold text-3xl">
//                 Log In
//               </p>
//               <p className="text-primary font-medium text-base md:text-xl pt-5">
//                 Welcome back! to AI powered jobs
//               </p>

//               <InputField
//                 type="text"
//                 placeholder="Email Address"
//                 className="mt-8"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//               <PasswordInput
//                 placeholder="Password"
//                 className="mt-6"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />

//               <div className="justify-end flex mt-3 hover:underline">
//                 <Link className="text-primary" to="/forgetPassword">
//                   Forgot password?
//                 </Link>
//               </div>

//               <div className="mt-5">
//                 <Button
//                   onClick={handleSignIn}
//                   className="flex items-center justify-center font-semibold p-3 px-8 w-full min-w-max h-12 text-navbar bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//                   Sign in
//                 </Button>
//               </div>

//               {/* Custom Google Button */}
//               <div
//                 className="mt-2 w-full flex justify-center"
//                 style={{ display: showGoogleLogin ? "none" : "flex" }}>
//                 <Button
//                   onClick={handleCustomGoogleLogin}
//                   className="flex items-center justify-center text-navbar rounded-lg py-3 mb-5 md:mb-0 font-semibold px-4 w-full bg-blue text-white hover:ring-2 hover:ring-[#4285F4] focus:ring-2 focus:ring-[#4285F4]">
//                   <img
//                     src={googleIcon}
//                     alt="Google Icon"
//                     className="h-6 mr-3"
//                     loading="lazy"
//                   />
//                   Sign in with Google
//                 </Button>
//               </div>

//               {/* Google Login rendered always but hidden unless iPhone */}
//               <div
//                 className="mt-2 w-full flex justify-center"
//                 style={{ display: showGoogleLogin ? "flex" : "none" }}>
//                 <div className="w-[480px]">
//                   <GoogleLogin
//                     onSuccess={handleGoogleSuccess}
//                     onError={handleGoogleFailure}
//                     useOneTap
//                     text="signin_with"
//                     shape="rectangular"
//                     theme="filled_blue"
//                   />
//                 </div>
//               </div>

//               <div className="hidden lg:flex gap-2 pt-5 items-center whitespace-nowrap">
//                 <p className="text-right text-primary text-xs md:text-base">
//                   Don't have an account?
//                 </p>
//                 <Link
//                   // to="/signUp"
//                   to="/onboarding"
//                   className="text-purpleColor hover:text-primary">
//                   Sign up
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {loading && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-50 flex justify-center items-center text-white">
//           <CircularIndeterminate />
//         </div>
//       )}
//     </div>
//   )
// }

// export default SignIn

import React, { useState, useEffect, useMemo } from "react"
import { GoogleLogin } from "@react-oauth/google"
import { Link, useNavigate } from "react-router-dom"
import InputField from "../../../components/EmailInput"
import PasswordInput from "../../../components/PasswordInput"
import Button from "../../../components/Button"
import googleIcon from "../../../assets/socialMedia/google_logo.svg"
import signInImage from "../../../assets/auth/signInImage.webp"
import { successToast, errorToast } from "../../../components/Toast"
import authService from "../../../api/auth"
import logo from "../../../assets/logo.svg"
import CircularIndeterminate from "../../../components/loader/circular"
import { clearLocalStorageButKeepTour } from "@/src/utils/ls"
import "./signin.css"

const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showGoogleLogin, setShowGoogleLogin] = useState(false)
  const navigate = useNavigate()

  const [loginBtnKey, setLoginBtnKey] = useState()
  const isSafariOrIPhone = useMemo(
    () =>
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      /iPhone|iPad|iPod/i.test(navigator.userAgent),
    []
  )

  useEffect(() => {
    clearLocalStorageButKeepTour()

    const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setShowGoogleLogin(isIPhone)

    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id:
          "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com",
        callback: handleGoogleSuccess
      })
    }
  }, [])

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      errorToast("Please fill in both fields.")
      return
    }

    setLoading(true)
    try {
      const response = await authService.login({ email, password })
      console.log("Login response:", response) // Debug log

      successToast("Login successfully!")
      setEmail("")
      setPassword("")

      // Check if user is new and navigate accordingly
      if (response.isNewUser === true) {
        console.log("New user detected, navigating to /package")
        navigate("/package")
      } else {
        console.log("Existing user, navigating to /auto-apply")
        navigate("/auto-apply")
      }
    } catch (error) {
      console.error("Login failed:", error)
      errorToast("Wrong email or password")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse
    if (!credential) return errorToast("No credential received")

    setLoading(true)
    try {
      const response = await authService.googleSignIn({ idToken: credential })
      console.log("Google sign-in response:", response) // Debug log

      successToast("Google sign-in successful!")

      // Check if user is new and navigate accordingly
      if (response.isNewUser === true) {
        console.log("New Google user detected, navigating to /package")
        navigate("/package")
      } else {
        console.log("Existing Google user, navigating to /auto-apply")
        navigate("/auto-apply")
      }
    } catch (error) {
      console.error("Google sign-in failed:", error)
      errorToast("Google sign-in failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleFailure = () => {
    if (isSafariOrIPhone) {
      console.log("Detected Safari/iPhone, reloading page...")
      return window.location.reload()
    }
    errorToast("Google sign-in was unsuccessful. Try again.")
  }

  const handleCustomGoogleLogin = () => {
    const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isIPhone) {
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        window.google.accounts.id.prompt()
      } else {
        errorToast("Google login failed to initialize.")
      }
    } else {
      const googleLoginButton = document.querySelector(
        '[aria-labelledby="button-label"]'
      )
      if (googleLoginButton) {
        googleLoginButton.click()
      } else {
        errorToast("Google login failed to initialize.")
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-2 md:p-4 lg:p-5">
      <div className="relative block lg:flex bg-almostBlack p-3 sm:p-4 lg:p-5 lg:gap-8 xl:gap-14 rounded-2xl w-full h-full lg:max-w-[980px] lg:max-h-[680px] overflow-hidden">
        {/* Mobile Logo */}
        <div className="lg:hidden pb-3 sm:pb-4 lg:pb-5">
          <img
            src={logo}
            className="cursor-pointer w-[120px] sm:w-[150px]"
            onClick={() =>
              (window.location.href = "https://beta.robo-apply.com/")
            }
          />
        </div>

        {/* Mobile Title */}
        <p className="block lg:hidden text-primary font-semibold text-xl sm:text-2xl pb-3 sm:pb-5">
          Log In
        </p>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center items-center order-1 lg:order-2 mb-4 lg:mb-0">
          <div className="w-full h-full flex justify-center items-center">
            <img
              src={signInImage}
              alt="Sign In"
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex order-2 lg:order-1 md:overflow-y-auto">
          <div className="w-full flex flex-col h-full">
            {/* Desktop Header */}
            <div className="w-full flex lg:justify-between mb-4 lg:mb-0">
              <div className="flex gap-3 pt-2 lg:pt-5">
                <img
                  src={logo}
                  className="cursor-pointer hidden lg:block w-[120px] xl:w-auto"
                  onClick={() =>
                    (window.location.href = "https://beta.robo-apply.com/")
                  }
                />
              </div>
              <div className="flex lg:hidden gap-2 pt-2 lg:pt-5 items-center whitespace-nowrap">
                <p className="text-right text-greyColor text-sm">
                  Don't have an account?
                </p>
                <Link
                  to="/onboarding"
                  className="text-purpleColor hover:text-primary text-base">
                  Sign up
                </Link>
              </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 flex flex-col justify-center w-full">
              <div className="w-full space-y-3 sm:space-y-4 lg:space-y-3">
                {/* Desktop Title */}
                <p className="hidden lg:block text-primary font-semibold text-2xl xl:text-3xl">
                  Log In
                </p>

                {/* Subtitle */}
                <p className="text-primary font-medium text-sm sm:text-base lg:text-lg xl:text-xl">
                  Welcome back! to AI powered jobs
                </p>

                {/* Form Fields */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <InputField
                    type="text"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <PasswordInput
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {/* Forgot Password */}
                  <div className="justify-end flex hover:underline">
                    <Link
                      className="text-primary text-sm lg:text-base"
                      to="/forgetPassword">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    onClick={handleSignIn}
                    className="flex items-center justify-center font-semibold p-3 px-4 sm:px-6 lg:px-8 w-full min-w-max h-10 sm:h-12 text-navbar bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd text-sm lg:text-base">
                    Sign in
                  </Button>

                  {/* Custom Google Button */}
                  <div
                    className="w-full flex justify-center"
                    style={{ display: showGoogleLogin ? "none" : "flex" }}>
                    <Button
                      onClick={handleCustomGoogleLogin}
                      className="flex items-center justify-center text-navbar rounded-lg py-2.5 sm:py-3 font-semibold px-4 w-full bg-blue text-white hover:ring-2 hover:ring-[#4285F4] focus:ring-2 focus:ring-[#4285F4] text-sm lg:text-base">
                      <img
                        src={googleIcon}
                        alt="Google Icon"
                        className="h-4 sm:h-5 lg:h-6 mr-2 lg:mr-3"
                        loading="lazy"
                      />
                      Sign in with Google
                    </Button>
                  </div>

                  {/* Google Login for iPhone */}
                  <div
                    className="w-full flex justify-center custom-google-login-iphone"
                    style={{ display: showGoogleLogin ? "flex" : "none" }}>
                    <div className="w-full max-w-[480px] relative [&_div:not(#mock-google-button)>div]:!opacity-0">
                      <div
                        id="mock-google-button"
                        className="w-full absolute inset-0 flex justify-center z-[9999] pointer-events-none [&_*]:pointer-events-none">
                        <Button className="flex items-center justify-center text-navbar rounded-lg py-2.5 sm:py-3 font-semibold px-4 w-full bg-blue text-white hover:ring-2 hover:ring-[#4285F4] focus:ring-2 focus:ring-[#4285F4] text-sm lg:text-base">
                          <img
                            src={googleIcon}
                            alt="Google Icon"
                            className="h-4 sm:h-5 lg:h-6 mr-2 lg:mr-3"
                            loading="lazy"
                          />
                          Sign in with Google
                        </Button>
                      </div>
                      <GoogleLogin
                        {...(isSafariOrIPhone ? { key: loginBtnKey } : {})}
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                        click_listener={
                          isSafariOrIPhone
                            ? () => {
                                setLoginBtnKey(`login-btn-${Date.now()}`)
                              }
                            : undefined
                        }
                        useOneTap
                        text="signin_with"
                        shape="rectangular"
                        theme="filled_blue"
                        width="100%"
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop Sign Up Link */}
                <div className="hidden lg:flex gap-2 pt-2 lg:pt-5 items-center whitespace-nowrap">
                  <p className="text-right text-primary text-xs sm:text-sm lg:text-base">
                    Don't have an account?
                  </p>
                  <Link
                    to="/onboarding"
                    className="text-purpleColor hover:text-primary text-xs sm:text-sm lg:text-base">
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay - positioned relative to the container */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center text-white z-50 rounded-2xl">
            <CircularIndeterminate />
          </div>
        )}
      </div>
    </div>
  )
}

export default SignIn
