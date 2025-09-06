import { useEffect, useState } from "react"
import DashboardHome from "./overview"
import ResultReport from "./ResultReport"
import JobsFound from "./JobsFound"
import DashBoardLayout from "../../dashboardLayout"
import { useSubscriptionStore } from "@/src/stores/subscription"
import { User } from "@/src/api/functions/user"
import { errorToast } from "@/src/components/Toast"
import { analytics } from "@/src/api/functions/analytics"
import { useDashboardStore } from "@/src/stores/dashboard"
import { useLocation } from "react-router-dom"
import ExpiredModal from "../../components/Modals/ExpiredModal"
import PaymentFailed from "../../components/Modals/PaymentFailed"

function Dashboard() {
  const setSubscription = useSubscriptionStore((set) => set.setSubscription)
  const setSubscriptionLoading = useSubscriptionStore(
    (set) => set.setLoadingSubscription
  )

  const showComponent = useDashboardStore((set) => set.showComponent)
  const setShowComponent = useDashboardStore((set) => set.setShowComponent)

  const [showExpiredModal, setShowExpiredModal] = useState(false)
  const [showPaymentFailed, setShowPaymentFailed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const rawUserData = localStorage.getItem("user_data")
    let lastPaymentFailed = false

    if (rawUserData) {
      try {
        const user = JSON.parse(rawUserData)
        lastPaymentFailed = !!user?.lastPaymentFailed

        // 👇 If last payment failed, show modal & stop further checks
        if (lastPaymentFailed) {
          setShowPaymentFailed(true)
          return
        }
      } catch (error) {
        console.error("Failed to parse user_data:", error)
      }
    }

    // 👇 Only run subscription checks if payment has NOT failed
    setSubscriptionLoading(true)
    User.getSubscriptionData()
      .then(async (res) => {
        if (res.success === false) {
          return errorToast(res.message)
        }
        const response = await analytics.getJobHistoryCount()

        if (response.success === false) {
          return errorToast(response.message)
        }

        let totalJobsApplied = response.jobActivities?.reduce(
          (acc, job) => acc + job.totalNoOfAppliedJobs,
          0
        )

        const subscriptionObj = res?.data
        console.log(">>>>>>>>>>>>", subscriptionObj)

        // if (subscriptionObj) {
        //   setSubscription(subscriptionObj, totalJobsApplied || 0)

        //   // 👇 Only check isCancelled if NOT lastPaymentFailed
        //   if (
        //     subscriptionObj?.subscription?.isCancelled &&
        //     !subscriptionObj?.subscription?.isActive
        //   ) {
        //     setShowExpiredModal(true)
        //   }
        // }

        if (subscriptionObj) {
          setSubscription(subscriptionObj, totalJobsApplied || 0)

          // 👇 Show modal if subscription expired OR no active subscription found
          if (
            (subscriptionObj?.subscription?.isCancelled &&
              !subscriptionObj?.subscription?.isActive) ||
            subscriptionObj?.msg === "No active subscription found"
          ) {
            setShowExpiredModal(true)
          }
        }

        console.log("Subscription data:", { res })
      })
      .finally(() => {
        setSubscriptionLoading(false)
      })
  }, [showComponent])

  useEffect(() => {
    setShowComponent("home")
  }, [location])

  return (
    <DashBoardLayout>
      <div className="flex flex-col gap-1 sm:gap-5 px-6 sm:px-10 pt-5 sm:pt-10 w-full h-full">
        {showComponent === "home" && <DashboardHome />}
        {showComponent === "jobsFound" && <JobsFound />}
        {showComponent === "ResultReport" && <ResultReport />}
      </div>

      {/* Expired Modal */}
      <ExpiredModal
        open={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
      />

      {/* Payment Failed Modal */}
      <PaymentFailed
        open={showPaymentFailed}
        onClose={() => setShowPaymentFailed(false)}
      />
    </DashBoardLayout>
  )
}

export default Dashboard
