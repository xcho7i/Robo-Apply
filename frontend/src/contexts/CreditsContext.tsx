import React, { createContext, useContext, useState, useEffect } from "react"
import API_ENDPOINTS from "../api/endpoints"
import { useLocation } from "react-router-dom"
import { analytics } from "../api/functions/analytics"
import { User } from "../api/functions/user"
import { useSubscriptionStore } from "../stores/subscription"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const CreditsContext = createContext({
  credits: null,
  creditsLoading: false,
  refreshCredits: async () => {}
})

export const useCredits = () => useContext(CreditsContext)

export const CreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(null)
  const [creditsLoading, setCreditsLoading] = useState(false)

  const setSubscription = useSubscriptionStore((set) => set.setSubscription)

  const refreshCredits = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return
    User.getSubscriptionData()
      .then(async (res) => {
        if (res.success == false) {
          return console.error(res.message)
        }

        const subscriptionObj = res?.data
        const response = await analytics.getJobHistoryCount()

        if (response.success === false) {
          console.error(response.message)
        }

        let totalJobsApplied = response.jobActivities?.reduce(
          (acc, job) => acc + job.totalNoOfAppliedJobs,
          0
        )

        if (subscriptionObj) {
          setSubscription(subscriptionObj, totalJobsApplied || 0)
        }
      })
      .catch((err) => {
        console.error("Error checking subscription:", err)
      })
  }

  useEffect(() => {
    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(refreshCredits, 300000)

    // Listen for custom events
    const handleCreditsUpdate = () => {
      console.log("💳 Credits update event received")
      refreshCredits()
    }

    window.addEventListener("creditsUpdated", handleCreditsUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener("creditsUpdated", handleCreditsUpdate)
    }
  }, [])

  return (
    <CreditsContext.Provider
      value={{ credits, creditsLoading, refreshCredits }}>
      {children}
    </CreditsContext.Provider>
  )
}
