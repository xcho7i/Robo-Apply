// import API_ENDPOINTS from "./endpoints"
// import { postRequest } from "./httpRequests"

// // Login
// const login = async (credentials) => {
//   const response = await postRequest(API_ENDPOINTS.LOGIN, credentials)
//   // console.log("+++++++++", response.result.access_token.accessToken)
//   localStorage.setItem(
//     "access_token",
//     response.result.access_token.accessToken.accessToken
//   )
//   localStorage.setItem("user_data", JSON.stringify(response.result.user))
//   localStorage.setItem(
//     "subscription_data",
//     JSON.stringify(response.result.user.subscription)
//   )

//   return response
// }

// // Register
// const register = async (userData) => {
//   const response = await postRequest(API_ENDPOINTS.SignUP, userData)
//   return response
// }

// // Forget Password
// const forgetPassword = async (email) => {
//   const response = await postRequest(API_ENDPOINTS.ForgetPassword, { email })
//   return response
// }

// // verify otp
// const verifyOTP = async (otp) => {
//   const response = await postRequest(API_ENDPOINTS.VerifyOTP, {
//     resetPasswordOtp: otp
//   })
//   return response
// }

// // Reset Password
// const resetPassword = async (data) => {
//   const response = await postRequest(API_ENDPOINTS.ResetNewPassword, data)
//   return response
// }

// // google Sign In
// const googleSignIn = async (token) => {
//   const response = await postRequest(API_ENDPOINTS.GOOGLE_SIGN_IN, token)
//   // console.log("+++++++++", response.result.access_token.accessToken)
//   localStorage.setItem(
//     "access_token",
//     response.result.access_token.accessToken.accessToken
//   )
//   localStorage.setItem("user_data", JSON.stringify(response.result.user))
//   localStorage.setItem(
//     "subscription_data",
//     JSON.stringify(response.result.user.subscription)
//   )

//   return response
// }

// const authService = {
//   login,
//   register,
//   googleSignIn,
//   forgetPassword,
//   verifyOTP,
//   resetPassword
// }

// export default authService

import API_ENDPOINTS from "./endpoints"
import { postRequest } from "./httpRequests"

// Login
const login = async (credentials) => {
  const response = await postRequest(API_ENDPOINTS.LOGIN, credentials)
  console.log("Login API response:", response) // Debug log

  // Store authentication data
  localStorage.setItem(
    "access_token",
    response.result.access_token.accessToken.accessToken
  )
  localStorage.setItem("user_data", JSON.stringify(response.result.user))
  localStorage.setItem(
    "subscription_data",
    JSON.stringify(response.result.user.subscription)
  )

  // Return the response with isNewUser flag
  return {
    ...response,
    isNewUser: response.result?.user?.isNewUser || false
  }
}

// Register
const register = async (userData) => {
  const response = await postRequest(API_ENDPOINTS.SignUP, userData)
  return response
}

// Forget Password
const forgetPassword = async (email) => {
  const response = await postRequest(API_ENDPOINTS.ForgetPassword, { email })
  return response
}

// verify otp
const verifyOTP = async (otp) => {
  const response = await postRequest(API_ENDPOINTS.VerifyOTP, {
    resetPasswordOtp: otp
  })
  return response
}

// Reset Password
const resetPassword = async (data) => {
  const response = await postRequest(API_ENDPOINTS.ResetNewPassword, data)
  return response
}

// google Sign In
const googleSignIn = async (token) => {
  const response = await postRequest(API_ENDPOINTS.GOOGLE_SIGN_IN, token)
  console.log("Google Sign-in API response:", response) // Debug log

  // Store authentication data
  localStorage.setItem(
    "access_token",
    response.result.access_token.accessToken.accessToken
  )
  localStorage.setItem("user_data", JSON.stringify(response.result.user))
  localStorage.setItem(
    "subscription_data",
    JSON.stringify(response.result.user.subscription)
  )

  // Return the response with isNewUser flag
  return {
    ...response,
    isNewUser: response.result?.user?.isNewUser || false
  }
}

const authService = {
  login,
  register,
  googleSignIn,
  forgetPassword,
  verifyOTP,
  resetPassword
}

export default authService
