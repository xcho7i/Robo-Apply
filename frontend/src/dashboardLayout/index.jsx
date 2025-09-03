import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DashboardNavbar from "../dashboardNavbar"
import DashboardSidebar from "../dashboardSidebar"
import { format } from "date-fns"
import API_ENDPOINTS from "../api/endpoints"
import { errorToast } from "../components/Toast"
import GuidedTourModal from "@/src/components/tour/GuidedTourModal"
import { useTour, fullTourSteps } from "@/src/stores/tours"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const DashBoardLayout = ({ children }) => {
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState(null)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true)

  // Function to fetch subscription data
  const fetchSubscriptionData = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      setIsSubscriptionLoading(false)
      return
    }

    try {
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
      console.log("Fetched subscription data:", data)

      if (response.ok && data.success) {
        setSubscription(data.subscription)
        console.log("✅ Subscription data fetched successfully!")
      } else {
        console.error("Subscription data API Error:", data)
        // Try billing data as fallback
        await fetchBillingData()
      }
    } catch (error) {
      console.error("Subscription data fetch error:", error)
      // Try billing data as fallback
      await fetchBillingData()
    } finally {
      setIsSubscriptionLoading(false)
    }
  }

  // Function to fetch billing data (fallback)
  const fetchBillingData = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      return
    }

    try {
      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.GetBillingData}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      })

      const data = await res.json()
      console.log("Fetched billing data:", data)

      if (data.success && data.subscription) {
        setSubscription(data.subscription)
        console.log("✅ Billing data fetched successfully!")
      } else {
        console.error("Failed to fetch billing data:", data.msg)
      }
    } catch (err) {
      console.error("Billing data fetch error:", err)
    }
  }

  // Calculate days until expiration
  const calculateDaysUntilExpiration = (cancelDate) => {
    if (!cancelDate) return null

    try {
      const cancelDateTime = new Date(cancelDate)
      const currentTime = new Date()

      if (isNaN(cancelDateTime.getTime())) {
        return null
      }

      const timeDifference = cancelDateTime.getTime() - currentTime.getTime()
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24))

      return daysDifference > 0 ? daysDifference : 0
    } catch (error) {
      console.error("Error calculating days until expiration:", error)
      return null
    }
  }

  // Format cancel date function (keeping for potential future use)
  const formatCancelDate = (isoDate) => {
    if (!isoDate) return "Not Available"
    try {
      const date = new Date(isoDate)
      if (isNaN(date.getTime())) {
        return "Not Available"
      }
      return format(date, "MMM dd, h:mm a")
    } catch (error) {
      console.error("Error formatting cancel date:", error)
      return "Not Available"
    }
  }
  useEffect(() => {
    const SEEN_KEY = "ra_seen_app_tour_v1" // <- stable key
    // Login/Signup ya aise routes par tour mat chalao
    const blockOn = ["/login", "/signup", "/forgot"].some((p) =>
      location.pathname.startsWith(p)
    )
    if (blockOn) return

    // Already seen? kuch mat karo
    if (localStorage.getItem(SEEN_KEY) === "1") return

    // ✅ pehle mark seen, phir open (race condition se bachne ke liye)
    localStorage.setItem(SEEN_KEY, "1")

    const tour = useTour.getState()
    tour.setNavigator((path) => navigate(path))
    tour.setSteps(fullTourSteps)
    tour.openWelcome()
  }, [navigate, location.pathname])

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  // Get days until expiration
  const daysUntilExpiration = subscription?.cancelAt
    ? calculateDaysUntilExpiration(subscription.cancelAt)
    : null

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex-shrink-0 z-10">
        {/* Cancellation Notification Bar */}
        {!isSubscriptionLoading &&
          subscription?.isCancelled &&
          daysUntilExpiration !== null && (
            <div className="bg-red text-white px-4 py-2 text-center text-sm md:text-base">
              <div className="flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium">
                  Your subscription will expire in{" "}
                  <strong>
                    {daysUntilExpiration} day
                    {daysUntilExpiration !== 1 ? "s" : ""}
                  </strong>
                  . Renew now to keep your tailored resumes, credits, and
                  application history safe.
                  <span
                    onClick={() => navigate("/billing")}
                    className="ml-1 cursor-pointer hover:text-yellow-200 transition-colors duration-200"
                    style={{ textDecoration: "none" }}>
                    ➜
                  </span>
                </p>
              </div>
            </div>
          )}
        <DashboardNavbar />
      </header>

      <div className="flex h-full flex-grow overflow-hidden">
        <aside className="hidden lg:block bg-almostBlack text-white max-w-64 flex-shrink-0 overflow-y-auto hide-scrollbar">
          <DashboardSidebar />
        </aside>

        <main className="flex-grow h-full bg-almostBlack overflow-hidden  relative border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full h-full overflow-y-auto">{children}</div>
        </main>
      </div>
      <GuidedTourModal />
    </div>
  )
}

export default DashBoardLayout
