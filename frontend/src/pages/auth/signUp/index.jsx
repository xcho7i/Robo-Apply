// import React, { useState } from "react"
// import signUPImage from "../../../assets/auth/signUpImage.webp"
// import { Link } from "react-router-dom"
// import InputField from "../../../components/EmailInput"
// import PasswordInput from "../../../components/PasswordInput"
// import Button from "../../../components/Button"
// import googleIcon from "../../../assets/socialMedia/google_logo.svg"
// import linkedinIcon from "../../../assets/socialMedia/linkedin_symbol.svg"
// import { successToast, errorToast } from "../../../components/Toast"
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
// import { useNavigate } from "react-router-dom"

// import authService from "../../../api/auth"
// import logo from "../../../assets/logo.svg"
// import CircularIndeterminate from "../../../components/loader/circular"

// const googleClientId =
//   "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com"

// const SignUp = () => {
//   const [fullName, setFullName] = useState("")
//    const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [agreed, setAgreed] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const navigate = useNavigate()

//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     return re.test(String(email).toLowerCase())
//   }

//   const handleCreateAccount = async (e) => {
//     e.preventDefault()

//     if (!fullName || !email || !password || !confirmPassword) {
//       errorToast("Please fill all fields")
//       return
//     }

//     if (!/^[a-zA-Z\s]+$/.test(fullName)) {
//       errorToast("Full Name should contain only alphabets")
//       return
//     }

//     if (!validateEmail(email)) {
//       errorToast("Invalid email format")
//       return
//     }

//     const passwordRegex =
//       /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*,.])[A-Za-z\d!@#$%^&*,.]{8,}$/
//     if (!passwordRegex.test(password)) {
//       errorToast(
//         "Password must be at least 8 characters long, containing at least one uppercase letter, one numeric digit, and one special character (e.g., @, #, $, %, &, *, .)."
//       )
//       return
//     }

//     if (password !== confirmPassword) {
//       errorToast("Passwords do not match")
//       return
//     }

//     if (!agreed) {
//       errorToast("You must agree to the Terms and Privacy Policy")
//       return
//     }
//     setLoading(true)

//     try {
//       const response = await authService.register({
//         fullName: fullName,
//         email: email,
//         password: password
//       })
//       console.log(response)
//       // Clear form fields
//       setFullName("")
//       setEmail("")
//       setPassword("")
//       setConfirmPassword("")
//       setAgreed(false)

//       // Navigate to /login
//       successToast("Account created successfully!")
//       navigate("/dashboard")
//     } catch (error) {
//       console.log("error", error)
//     }
//     setLoading(false)
//   }

//   const handleGoogleSuccess = async (credentialResponse) => {
//     const { credential } = credentialResponse
//     console.log("+++++++++CCCCCC", credentialResponse)
//     setLoading(true)

//     try {
//       // Send the credential to your backend server to verify and get user data
//       const response = await authService.googleSignIn({
//         idToken: credential
//       })
//       console.log("Google User Data:", response)
//       successToast("Google sign-in successful!")
//       navigate("/dashboard")
//     } catch (error) {
//       console.error("Google sign-in failed:", error)
//       errorToast("Google sign-in failed.")
//     }
//     setLoading(false)
//   }

//   const handleGoogleFailure = (error) => {
//     console.error("Google login failed:", error)
//     errorToast("Google sign-in failed.")
//   }

//   return (
//     <>
//       {loading && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-50 flex justify-center items-center text-white">
//           <CircularIndeterminate />
//         </div>
//       )}
//       <GoogleOAuthProvider clientId={googleClientId}>
//         <div className="flex justify-center items-center w-screen lg:h-screen md:p-10">
//           <div className="block lg:flex  bg-almostBlack pr-5  lg:gap-10 rounded-2xl w-full h-full lg:max-w-[1050px] lg:max-h-[680px]">
//             {/* Text Section */}
//             <div className="w-full lg:w-1/2 flex lg:p-5">
//               <div className="w-full">
//                 <div className="hidden lg:flex w-full justify-between lg:pb-5">
//                   <div className="flex gap-3 pt-5 md:pl-5">
//                     <img
//                       src={logo}
//                       className="cursor-pointer hidden lg:block"
//                       onClick={() =>
//                         (window.location.href = "https://beta.robo-apply.com/")
//                       }
//                     />
//                   </div>
//                 </div>

//                 <div className="w-full items-center pt-5 pl-5">
//                   <div>
//                     <img
//                       src={logo}
//                       className="cursor-pointer lg:hidden pb-5 lg:pl-5 w-[150px]"
//                       onClick={() =>
//                         (window.location.href = "https://beta.robo-apply.com/")
//                       }
//                     />
//                     <p className="text-2xl md:text-2xl lg:text-3xl pb-5 lg:pb-1 text-primary font-semibold ">
//                       Sign Up
//                     </p>
//                     <div className="md:flex lg:hidden w-full justify-center items-center">
//                       <img
//                         src={signUPImage}
//                         alt="Sign In"
//                         className="max-w-full max-h-full object-contain"
//                         loading="lazy"
//                       />
//                     </div>
//                     <div className="flex lg:hidden w-full justify-start">
//                       <div className="flex gap-3 pt-4">
//                         <p className="text-right text-greyColor">
//                           Already a member?
//                         </p>
//                         <Link
//                           to="/signIn"
//                           className="text-purpleColor hover:text-primary">
//                           Sign in
//                         </Link>
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <p className="text-primary font-medium text-2xl pt-4">
//                       {/* Start your 30-day free trial. */}
//                     </p>
//                   </div>
//                   <div className="">
//                     <InputField
//                       type="text"
//                       placeholder="Full Name"
//                       value={fullName}
//                       onChange={(e) => setFullName(e.target.value)}
//                       className="mt-6"
//                     />
//                     <InputField
//                       type="text"
//                       placeholder="Email Address"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       className="mt-4"
//                     />
//                     <PasswordInput
//                       placeholder="Password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="mt-4"
//                     />
//                     <PasswordInput
//                       placeholder="Confirm Password"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       className="mt-4"
//                     />
//                   </div>

//                   <div className="mt-5">
//                     <Button
//                       onClick={handleCreateAccount}
//                       className="flex items-center justify-center p-3 px-8 w-full min-w-max font-semibold h-12 text-navbar bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//                       Create Account
//                     </Button>
//                   </div>
//                   <div className="hidden lg:flex gap-3 pt-4 items-center whitespace-nowrap">
//                     <p className="text-right text-greyColor">
//                       Already a member?
//                     </p>
//                     <Link
//                       to="/signIn"
//                       className="text-purpleColor hover:text-primary">
//                       Sign in
//                     </Link>
//                   </div>

//                   <div className="mt-4 flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={agreed}
//                       onChange={() => setAgreed(!agreed)}
//                       className="form-checkbox h-5 w-5 text-purpleColor bg-transparent border-2 border-gray-400 rounded focus:ring-purpleColor focus:outline-none checked:bg-transparent checked:text-purpleColor hover:border-purpleColor"
//                     />
//                     <p className="ml-4 text-sm font-normal">
//                       You are agreeing to the
//                       <Link
//                         to="https://beta.robo-apply.com/terms-and-conditions/"
//                         className="text-purpleColor hover:underline px-1">
//                         Terms
//                       </Link>
//                       and
//                       <Link
//                         to="https://beta.robo-apply.com/privacy-policy/"
//                         className="text-purpleColor hover:underline px-1">
//                         Privacy Policy
//                       </Link>
//                     </p>
//                   </div>
//                   <div className="mt-5 w-full">
//                     {/* Custom Google button that's always full width */}
//                     <Button
//                       onClick={() => {
//                         // Trigger Google sign-in process
//                         const googleLoginButton = document.querySelector(
//                           '[aria-labelledby="button-label"]'
//                         )
//                         if (googleLoginButton) {
//                           googleLoginButton.click()
//                         }
//                       }}
//                       className="flex items-center justify-center text-navbar rounded-lg py-3 mb-5 md:mb-0 font-semibold px-4 w-full bg-blue text-white hover:ring-2 hover:ring-[#4285F4]  focus:ring-2 focus:ring-[#4285F4]"
//                       style={{ width: "100%" }}>
//                       <img
//                         src={googleIcon}
//                         alt="Google Icon"
//                         className="h-6 mr-3"
//                         loading="lazy"
//                       />
//                       Sign in with Google
//                     </Button>

//                     {/* Hidden GoogleLogin component that will be triggered by our custom button */}
//                     <div className="hidden">
//                       <GoogleLogin
//                         onSuccess={handleGoogleSuccess}
//                         onError={handleGoogleFailure}
//                       />
//                     </div>
//                   </div>
//                   {/* <div className="mt-5 w-full">
//                     <GoogleLogin
//                       onSuccess={handleGoogleSuccess}
//                       onError={handleGoogleFailure}
//                       render={({ onClick, disabled }) => (
//                         <Button
//                           onClick={onClick}
//                           disabled={disabled}
//                           className="flex items-center justify-center rounded-lg py-3 text-lg font-medium hover:font-semibold px-4 w-full min-w-max bg-whiteBackground text-blackColor"
//                         >
//                           <img
//                             src={googleIcon}
//                             alt="Google Icon"
//                             className="h-6 mr-3"
//                             loading="lazy"
//                           />
//                           Google
//                         </Button>
//                       )}
//                     />
//                     <Button
//                     onClick={handleLinkedInLogin}
//                     className="flex items-center justify-center py-1 px-2 rounded-sm   font-normal hover:font-semibold min-w-max bg-whiteBackground text-blackColor"
//                   >
//                     <img
//                       src={linkedinIcon}
//                       alt="LinkedIn Icon"
//                       className="h-5 mr-1"
//                     />
//                     Sign in with LinkedIn
//                   </Button>
//                   </div> */}
//                 </div>
//               </div>
//             </div>

//             {/* Image Section, hidden on small screens */}
//             <div className="w-full lg:w-1/2 hidden lg:flex justify-center items-center">
//               <img
//                 src={signUPImage}
//                 alt="Sign In"
//                 className="max-w-full max-h-full object-contain"
//                 loading="lazy"
//               />
//             </div>
//           </div>
//         </div>
//       </GoogleOAuthProvider>
//     </>
//   )
// }

// export default SignUp

import React, { useState } from "react"
import signUPImage from "../../../assets/auth/signUpImage.webp"
import { Link } from "react-router-dom"
import InputField from "../../../components/EmailInput"
import PasswordInput from "../../../components/PasswordInput"
import Button from "../../../components/Button"
import googleIcon from "../../../assets/socialMedia/google_logo.svg"
import linkedinIcon from "../../../assets/socialMedia/linkedin_symbol.svg"
import { successToast, errorToast } from "../../../components/Toast"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"

import authService from "../../../api/auth"
import logo from "../../../assets/logo.svg"
import CircularIndeterminate from "../../../components/loader/circular"

const googleClientId =
  "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com"

const SignUp = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(email).toLowerCase())
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      errorToast("Please fill all fields")
      return
    }

    if (!/^[a-zA-Z\s]+$/.test(firstName)) {
      errorToast("First Name should contain only alphabets")
      return
    }

    if (!/^[a-zA-Z\s]+$/.test(lastName)) {
      errorToast("Last Name should contain only alphabets")
      return
    }

    if (!validateEmail(email)) {
      errorToast("Invalid email format")
      return
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*,.])[A-Za-z\d!@#$%^&*,.]{8,}$/
    if (!passwordRegex.test(password)) {
      errorToast(
        "Password must be at least 8 characters long, containing at least one uppercase letter, one numeric digit, and one special character (e.g., @, #, $, %, &, *, .)."
      )
      return
    }

    if (password !== confirmPassword) {
      errorToast("Passwords do not match")
      return
    }

    if (!agreed) {
      errorToast("You must agree to the Terms and Privacy Policy")
      return
    }
    setLoading(true)

    try {
      const response = await authService.register({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
      })
      console.log(response)
      // Clear form fields
      setFirstName("")
      setLastName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setAgreed(false)

      // Navigate to /dashboard
      successToast("Account created successfully!")
      navigate("/auto-apply")
    } catch (error) {
      console.log("error", error)
    }
    setLoading(false)
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse
    console.log("+++++++++CCCCCC", credentialResponse)
    setLoading(true)

    try {
      // Send the credential to your backend server to verify and get user data
      const response = await authService.googleSignIn({
        idToken: credential
      })
      console.log("Google User Data:", response)
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
    }
    setLoading(false)
  }

  const handleGoogleFailure = (error) => {
    console.error("Google login failed:", error)
    errorToast("Google sign-in failed.")
  }

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-50 flex justify-center items-center text-white">
          <CircularIndeterminate />
        </div>
      )}
      <GoogleOAuthProvider clientId={googleClientId}>
        <div className="flex justify-center items-center w-screen lg:h-screen md:p-10">
          <div className="block lg:flex  bg-almostBlack pr-5  lg:gap-10 rounded-2xl w-full h-full lg:max-w-[1050px] lg:max-h-[680px]">
            {/* Text Section */}
            <div className="w-full lg:w-1/2 flex lg:p-5">
              <div className="w-full">
                <div className="hidden lg:flex w-full justify-between ">
                  <div className="flex gap-3 pt-5 md:pl-5">
                    <img
                      src={logo}
                      className="cursor-pointer hidden lg:block"
                      onClick={() =>
                        (window.location.href = "https://beta.robo-apply.com/")
                      }
                    />
                  </div>
                </div>

                <div className="w-full items-center pt-5 pl-5">
                  <div>
                    <img
                      src={logo}
                      className="cursor-pointer lg:hidden pb-5 lg:pl-5 w-[150px]"
                      onClick={() =>
                        (window.location.href = "https://beta.robo-apply.com/")
                      }
                    />
                    <p className="text-2xl md:text-2xl lg:text-3xl pb-5 lg:pb-0 text-primary font-semibold ">
                      Sign Up
                    </p>
                    <div className="md:flex lg:hidden w-full justify-center items-center">
                      <img
                        src={signUPImage}
                        alt="Sign In"
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex lg:hidden w-full justify-start">
                      <div className="flex gap-3 pt-4">
                        <p className="text-right text-greyColor">
                          Already a member?
                        </p>
                        <Link
                          to="/signIn"
                          className="text-purpleColor hover:text-primary">
                          Sign in
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-primary font-medium text-2xl">
                      {/* Start your 30-day free trial. */}
                    </p>
                  </div>
                  <div className="">
                    {/* First Name and Last Name side by side */}
                    <div className="flex gap-3 mt-6">
                      <InputField
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="flex-1"
                      />
                      <InputField
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <InputField
                      type="text"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-4"
                    />
                    <PasswordInput
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-4"
                    />
                    <PasswordInput
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-4"
                    />
                  </div>

                  <div className="mt-5">
                    <Button
                      onClick={handleCreateAccount}
                      className="flex items-center justify-center p-3 px-8 w-full min-w-max font-semibold h-12 text-navbar bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                      Create Account
                    </Button>
                  </div>
                  <div className="hidden lg:flex gap-3 pt-4 items-center whitespace-nowrap">
                    <p className="text-right text-greyColor">
                      Already a member?
                    </p>
                    <Link
                      to="/signIn"
                      className="text-purpleColor hover:text-primary">
                      Sign in
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={() => setAgreed(!agreed)}
                      className="form-checkbox h-5 w-5 text-purpleColor bg-transparent border-2 border-gray-400 rounded focus:ring-purpleColor focus:outline-none checked:bg-transparent checked:text-purpleColor hover:border-purpleColor"
                    />
                    <p className="ml-4 text-sm font-normal">
                      You are agreeing to the
                      <Link
                        to="https://beta.robo-apply.com/terms-and-conditions/"
                        className="text-purpleColor hover:underline px-1">
                        Terms
                      </Link>
                      and
                      <Link
                        to="https://beta.robo-apply.com/privacy-policy/"
                        className="text-purpleColor hover:underline px-1">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                  <div className="mt-5 w-full">
                    {/* Custom Google button that's always full width */}
                    <Button
                      onClick={() => {
                        // Trigger Google sign-in process
                        const googleLoginButton = document.querySelector(
                          '[aria-labelledby="button-label"]'
                        )
                        if (googleLoginButton) {
                          googleLoginButton.click()
                        }
                      }}
                      className="flex items-center justify-center text-navbar rounded-lg py-3 mb-5 md:mb-0 font-semibold px-4 w-full bg-blue text-white hover:ring-2 hover:ring-[#4285F4]  focus:ring-2 focus:ring-[#4285F4]"
                      style={{ width: "100%" }}>
                      <img
                        src={googleIcon}
                        alt="Google Icon"
                        className="h-6 mr-3"
                        loading="lazy"
                      />
                      Sign in with Google
                    </Button>

                    {/* Hidden GoogleLogin component that will be triggered by our custom button */}
                    <div className="hidden">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Section, hidden on small screens */}
            <div className="w-full lg:w-1/2 hidden lg:flex justify-center items-center">
              <img
                src={signUPImage}
                alt="Sign In"
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    </>
  )
}

export default SignUp
