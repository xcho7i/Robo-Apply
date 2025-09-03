import React, { useEffect } from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import AppRouter from "./router"
import "./App.css"
import { ConfigProvider } from "antd"
import { theme } from "antd"
import { StyleProvider } from "@ant-design/cssinjs"
import { useSubscriptionStore } from "./stores/subscription"

import { User } from "./api/functions/user"
import { getAllResumes } from "./api/functions"
import { analytics } from "./api/functions/analytics"
import { useDashboardStore } from "./stores/dashboard"
import { CreditsProvider } from "./contexts/CreditsContext"
import { useTour } from "./stores/tours"
import { AdditionalContextProvider } from "@/src/contexts/InterviewCopilotSettingContext"
import { YourResumeProvider } from "@/src/contexts/YourResumeContext"
import ClarityConsent from "./components/ClarityConsent"

const googleClientId =
  "637508697495-nvbnuf0rsqt9ver41b2rgh40ft07q6ra.apps.googleusercontent.com" // Your client ID

function App() {
  const setSubscription = useSubscriptionStore((set) => set.setSubscription)
  const setLoadingSubscription = useSubscriptionStore(
    (set) => set.setLoadingSubscription
  )

  const setResumeList = useDashboardStore((set) => set.setResumeList)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    setLoadingSubscription(true)
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
      .finally(() => {
        setLoadingSubscription(false)
      })

    getAllResumes()
      .then((res) => {
        if (res.resumes) {
          setResumeList(res.resumes)
        }
      })
      .catch((err) => {
        console.error("Error checking resumeList:", err)
      })
  }, [])

 useEffect(() => {
    // ✅ Location getter
    useTour.getState().setLocationGetter(() => window.location.pathname)

    // ✅ Navigator (safe: don’t break app)
    useTour.getState().setNavigator((path) => {
      if (window.location.pathname !== path) {
        // If you are not really routing, just force location
        window.history.pushState({}, "", path)
        // Trigger a re-render so your component shows
        window.dispatchEvent(new PopStateEvent("popstate"))
      }
    })
  }, [])


  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <CreditsProvider>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            components: {
              Input: {
                colorBgContainer: "rgba(69, 69, 69, 1)"
              },
              Select: {
                colorBgContainer: "rgba(69, 69, 69, 1)"
              }
            },
            token: {
              colorBgContainer: "rgba(26, 26, 26, 1)"
            }
          }}>
          <StyleProvider hashPriority="low">
            <AdditionalContextProvider>
              <YourResumeProvider>
                <AppRouter />
              </YourResumeProvider>
            </AdditionalContextProvider>
            <ClarityConsent />
          </StyleProvider>
        </ConfigProvider>
      </CreditsProvider>
    </GoogleOAuthProvider>
  )
}

export default App
