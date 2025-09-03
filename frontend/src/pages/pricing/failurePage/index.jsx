// import React from "react"
// import { Link } from "react-router-dom"
// import { BsXCircle } from "react-icons/bs"

// const FailurePage = () => {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center px-4">
//       <BsXCircle size={100} className="text-red-500 mb-4" />
//       <h1 className="text-3xl font-bold text-red-700 mb-2">Payment Failed</h1>
//       <p className="text-greyColor text-lg mb-6">
//         Something went wrong with your transaction. Please try again or contact
//         support.
//       </p>
//       <Link
//         to="/pricingPlan"
//         className="bg-green-600 text-2xl font-semibold underline text-purple hover:text-primary px-6 py-2 rounded hover:bg-green-700 transition">
//         Try Again
//       </Link>
//     </div>
//   )
// }

// export default FailurePage

import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BsXCircle } from "react-icons/bs"
import API_ENDPOINTS from "../../../api/endpoints"
import { errorToast } from "../../../components/Toast"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const FailurePage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    localStorage.removeItem("subscription-in-progress")
  }, [])

  const handleTryAgain = async () => {
    setIsLoading(true)

    try {
      const accessToken = localStorage.getItem("access_token")

      if (!accessToken) {
        errorToast("Access token missing. Please login again.")
        setIsLoading(false)
        return
      }

      // Call subscription data API
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.SubscriptionData}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )

      const data = await response.json()
      console.log("Subscription API response:", data)

      // Check if response indicates no active subscription
      if (
        response.ok &&
        data.success &&
        data.msg === "No active subscription found"
      ) {
        // Get user data from localStorage
        try {
          const userData = localStorage.getItem("user_data")
          if (userData) {
            const parsedUserData = JSON.parse(userData)
            console.log("User data:", parsedUserData)

            // Navigate based on subscribed status
            if (parsedUserData.subscribed === false) {
              navigate("/package")
            } else {
              navigate("/pricingPlan")
            }
          } else {
            // If no user data found, default to pricingPlan
            navigate("/pricingPlan")
          }
        } catch (error) {
          console.error("Error parsing user_data from localStorage:", error)
          // Default to pricingPlan if parsing fails
          navigate("/pricingPlan")
        }
      } else {
        // If different response, default to pricingPlan
        navigate("/pricingPlan")
      }
    } catch (error) {
      console.error("API call error:", error)
      errorToast("Failed to check subscription status. Please try again.")
      // Default to pricingPlan on error
      navigate("/pricingPlan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center px-4">
      <BsXCircle size={100} className="text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-red-700 mb-2">Payment Failed</h1>
      <p className="text-greyColor text-lg mb-6">
        Something went wrong with your transaction. Please try again or contact
        support.
      </p>
      <button
        onClick={handleTryAgain}
        disabled={isLoading}
        className={`bg-green-600 text-2xl font-semibold underline text-purple hover:text-primary px-6 py-2 rounded hover:bg-green-700 transition ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}>
        {isLoading ? "Checking..." : "Try Again"}
      </button>
    </div>
  )
}

export default FailurePage
