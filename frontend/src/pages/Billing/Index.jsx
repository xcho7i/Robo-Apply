import React, { useState, useEffect } from "react"
import DashBoardLayout from "../../dashboardLayout"
import Button from "../../components/Button"
import { Link } from "react-router-dom"
import BillingModal from "./ui/BillingModal"
import CancelSubscriptionModal from "./ui/CancelSubscriptionModal"
import RetentionModal from "./ui/RetentionModal"
import DiscountSuccessModal from "./ui/DiscountSuccessModal"
import FinalCancellationModal from "./ui/FinalCancellationModal"
import CancellationConfirmedModal from "./ui/CancellationConfirmedModal"
import RefundPolicyModal from "./ui/RefundPolicyModal"
import { format, addDays, addYears } from "date-fns"
import { errorToast, successToast } from "../../components/Toast"
import API_ENDPOINTS from "../../api/endpoints"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const Billing = () => {
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isRetentionModalOpen, setIsRetentionModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isFinalCancellationModalOpen, setIsFinalCancellationModalOpen] =
    useState(false)
  const [
    isCancellationConfirmedModalOpen,
    setIsCancellationConfirmedModalOpen
  ] = useState(false)
  const [isRefundPolicyModalOpen, setIsRefundPolicyModalOpen] = useState(false)
  const [isDiscountLoading, setIsDiscountLoading] = useState(false)
  const [discountedPrice, setDiscountedPrice] = useState(0)
  const [subscription, setSubscription] = useState(null)
  const [userEmail, setUserEmail] = useState("")
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true) // Add loading state

  // Cancel modal state
  const [selectedReasons, setSelectedReasons] = useState([])
  const [mainReason, setMainReason] = useState("")

  const handleBillingUpdate = (info) => {
    setSubscription(info)
    console.log("Updated Billing Info:", info)
  }

  // Cancel modal functions
  const handleReasonChange = (reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    )
  }

  const handleMainReasonChange = (value) => {
    setMainReason(value)
  }

  const handleContinueToCancellation = async () => {
    // Validate that at least one reason is selected
    if (selectedReasons.length === 0) {
      console.log("❌ No reasons selected - this should not happen!")
      errorToast("Please select at least one reason for cancellation.")
      return
    }

    // Create cancellation form data
    const cancellationFormData = {
      cancelReason: selectedReasons,
      cancelReasonText: mainReason || ""
    }

    try {
      // Save to localStorage
      localStorage.setItem(
        "cancellation_FormData",
        JSON.stringify(cancellationFormData)
      )

      console.log("=== CANCELLATION DATA SAVED TO LOCALSTORAGE ===")
      console.log(JSON.stringify(cancellationFormData, null, 2))

      // Close cancel modal and open retention modal
      setIsCancelModalOpen(false)
      setIsRetentionModalOpen(true)
    } catch (error) {
      console.error("Error saving cancellation data to localStorage:", error)
      errorToast("Failed to save cancellation data. Please try again.")
    }
  }

  const handleSendToTeam = async () => {
    // Validate that at least one reason is selected
    if (selectedReasons.length === 0) {
      console.log("❌ No reasons selected - this should not happen!")
      errorToast("Please select at least one reason for cancellation.")
      return
    }

    // Create cancellation form data
    const cancellationFormData = {
      cancelReason: selectedReasons,
      cancelReasonText: mainReason || "",
      timestamp: new Date().toISOString(),
      cancellationType: "send_to_team_and_wait"
    }

    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      errorToast("Access token missing. Please login again.")
      return
    }

    try {
      console.log("=== SENDING CANCELLATION DATA TO TEAM ===")
      console.log(JSON.stringify(cancellationFormData, null, 2))

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.SendSubscriptionTeam}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(cancellationFormData)
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        console.log("✅ Sending feedback to team...")
        successToast("Feedback sent to team. We'll be in touch soon!")

        // Close modal and reset state
        handleModalClose()
      } else {
        console.error("API Error:", data)
        errorToast(
          data.message || "Failed to send feedback to team. Please try again."
        )
      }
    } catch (error) {
      console.error("Network Error:", error)
      errorToast(
        "Network error occurred. Please check your connection and try again."
      )
    }
  }

  // Handle modal close and reset
  const handleModalClose = () => {
    setIsCancelModalOpen(false)
    setIsRetentionModalOpen(false)
    setIsSuccessModalOpen(false)
    setIsFinalCancellationModalOpen(false)
    setIsCancellationConfirmedModalOpen(false)
    setIsRefundPolicyModalOpen(false)
    setIsDiscountLoading(false)
    // Reset cancel modal state
    setSelectedReasons([])
    setMainReason("")
  }

  // Success modal handlers
  const handleGoToDashboard = () => {
    handleModalClose()
    // navigate("/auto-apply") // Uncomment if you have navigate imported
  }

  // Final cancellation modal handlers
  const handleDontCancel = () => {
    console.log("✅ User decided not to cancel")
    handleModalClose()
    successToast("Great! Your subscription remains active.")
  }

  const handleConfirmCancellation = async () => {
    console.log("✅ Processing final cancellation...")

    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      errorToast("Access token missing. Please login again.")
      return
    }

    // Get cancellation form data from localStorage
    const cancellationFormData = localStorage.getItem("cancellation_FormData")

    if (!cancellationFormData) {
      errorToast("Cancellation data not found. Please try again.")
      return
    }

    let parsedCancellationData
    try {
      parsedCancellationData = JSON.parse(cancellationFormData)
    } catch (error) {
      console.error("Error parsing cancellation form data:", error)
      errorToast("Invalid cancellation data. Please try again.")
      return
    }

    try {
      console.log("=== SENDING CANCELLATION DATA ===")
      console.log(JSON.stringify(parsedCancellationData, null, 2))

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.CancelSubscribtion}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(parsedCancellationData)
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        console.log("✅ Subscription cancelled successfully!")

        // Remove cancellation form data from localStorage after successful cancellation
        localStorage.removeItem("cancellation_FormData")

        // Close final cancellation modal and open confirmation modal
        setIsFinalCancellationModalOpen(false)
        setIsCancellationConfirmedModalOpen(true)
      } else {
        console.error("API Error:", data)
        errorToast(
          data.message || "Failed to cancel subscription. Please try again."
        )
      }
    } catch (error) {
      console.error("Final cancellation error:", error)
      errorToast("Failed to cancel subscription. Please try again.")
    }
  }

  // Retention modal handlers
  const handleRetentionContinueToCancellation = () => {
    console.log("✅ Moving to final cancellation confirmation...")
    // Close retention modal and open final cancellation modal
    setIsRetentionModalOpen(false)
    setIsFinalCancellationModalOpen(true)
  }

  const handleClaimDiscount = async (selectedPlanIdentifier) => {
    if (!selectedPlanIdentifier) {
      errorToast("Please select a plan to continue.")
      return
    }

    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      errorToast("Access token missing. Please login again.")
      return
    }

    setIsDiscountLoading(true)

    try {
      console.log("=== APPLYING DISCOUNT FOR PLAN ===")
      console.log("Selected Plan Identifier:", selectedPlanIdentifier)

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.DiscountSubscription}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            identifier: selectedPlanIdentifier
          })
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        console.log("✅ Discount applied successfully!")

        // Check if checkoutUrl is present in the response
        if (data.checkoutUrl) {
          // Open checkout URL in new tab and close current tab
          setIsRetentionModalOpen(false)
          window.location.href = data.checkoutUrl
          return
        }

        // If no checkoutUrl, handle as regular discount application
        const plans = {
          basic_monthly_individual: 33,
          standard_monthly_individual: 90,
          premium_monthly_individual: 272
        }

        setDiscountedPrice(plans[selectedPlanIdentifier] || 0)

        // Optionally update subscription data
        if (data.subscription) {
          setSubscription(data.subscription)
        }

        // Close retention modal and show success modal
        setIsRetentionModalOpen(false)
        setIsSuccessModalOpen(true)
      } else {
        console.error("API Error:", data)
        errorToast(
          data.message || "Failed to apply discount. Please try again."
        )
      }
    } catch (error) {
      console.error("Network Error:", error)
      errorToast(
        "Network error occurred. Please check your connection and try again."
      )
    } finally {
      setIsDiscountLoading(false)
    }
  }

  const handleOpenCancelModal = () => {
    // Reset state when opening modal
    setSelectedReasons([])
    setMainReason("")
    setIsCancelModalOpen(true)
  }

  // Function to fetch subscription data (primary source with complete data)
  const fetchSubscriptionData = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      errorToast("Access token missing. Please login again.")
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
        // Update subscription state with the fetched data
        setSubscription(data.subscription)
        console.log("✅ Subscription data fetched successfully!")
      } else {
        console.error("Subscription data API Error:", data)
        // Don't show error toast here, let billing data try
      }
    } catch (error) {
      console.error("Subscription data fetch error:", error)
      // Don't show error toast here, let billing data try
    }
  }

  // Function to fetch billing data (fallback)
  const fetchBillingData = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      errorToast("Access token missing. Please login again.")
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
        localStorage.setItem(
          "Subscription_data",
          JSON.stringify(data.subscription)
        )
      } else {
        errorToast(data.msg || "Failed to fetch billing data.")
      }
    } catch (err) {
      console.error("Billing data fetch error:", err)
      errorToast("Something went wrong while fetching billing info.")
    }
  }

  // Handle closing cancellation confirmed modal
  const handleCancellationConfirmedModalClose = () => {
    setIsCancellationConfirmedModalOpen(false)
    // Call subscription data API after closing the modal
    fetchSubscriptionData()
    window.location.reload()
  }

  // Handle "Don't cancel" button click
  const handleDontCancelSubscription = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      errorToast("Access token missing. Please login again.")
      return
    }

    try {
      console.log("=== REVERTING SUBSCRIPTION CANCELLATION ===")

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.RevertSubscription}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        console.log("✅ Subscription cancellation reverted successfully!")
        successToast(
          "Your subscription cancellation has been reverted successfully."
        )

        // Refresh subscription data to update UI
        fetchSubscriptionData()
        window.location.reload()
      } else {
        console.error("API Error:", data)
        errorToast(
          data.message || "Failed to revert cancellation. Please try again."
        )
      }
    } catch (error) {
      console.error("Revert cancellation error:", error)
      errorToast("Failed to revert cancellation. Please try again.")
    }
  }

  // Handle "Request Refund" button click
  const handleRequestRefund = () => {
    setIsRefundPolicyModalOpen(true)
  }

  const isFormValid =
    selectedReasons.length > 0 && mainReason.trim().length > 15

  useEffect(() => {
    // Get user email from localStorage
    const getUserEmail = () => {
      try {
        const userData = localStorage.getItem("user_data")
        if (userData) {
          const parsedData = JSON.parse(userData)
          setUserEmail(parsedData.email || "")
        }
      } catch (error) {
        console.error("Error parsing user_data from localStorage:", error)
      }
    }

    getUserEmail()

    // First try subscription data, then billing data as fallback
    const loadData = async () => {
      setIsSubscriptionLoading(true)
      await fetchSubscriptionData()
      // Small delay then try billing data if subscription is still null
      setTimeout(async () => {
        if (!subscription) {
          console.log("Subscription data not loaded, trying billing data...")
          await fetchBillingData()
        }
        setIsSubscriptionLoading(false)
      }, 1000)
    }

    loadData()
  }, [])

  const formatDate = (isoDate) => {
    if (!isoDate) return "Not Available"
    try {
      const date = new Date(isoDate)
      if (isNaN(date.getTime())) {
        return "Not Available"
      }
      return format(date, "MMMM dd, yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Not Available"
    }
  }

  // const getNextPaymentDate = () => {
  //   if (isSubscriptionLoading) return "Loading..."
  //   if (!subscription?.lastPayment?.date || !subscription?.nextBillingDate) {
  //     return "Not Available"
  //   }

  //   try {
  //     const lastDate = new Date(subscription.lastPayment.date)

  //     // Check if date is valid
  //     if (isNaN(lastDate.getTime())) {
  //       return "Not Available"
  //     }

  //     if (subscription.billingCycle === "monthly") {
  //       return format(addDays(lastDate, 30), "MMMM dd, yyyy")
  //     } else if (subscription.billingCycle === "yearly") {
  //       return format(addYears(lastDate, 1), "MMMM dd, yyyy")
  //     }

  //     return "Not Available"
  //   } catch (error) {
  //     console.error("Error formatting next payment date:", error)
  //     return "Not Available"
  //   }
  // }

  const getNextPaymentDate = () => {
    if (isSubscriptionLoading) return "Loading..."
    if (!subscription?.nextBillingDate) {
      return "Not Available"
    }

    try {
      const date = new Date(subscription.nextBillingDate)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Not Available"
      }

      return format(date, "MMMM dd, yyyy")
    } catch (error) {
      console.error("Error formatting discounted amount date:", error)
      return "Not Available"
    }
  }

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

  const capitalizeFirstLetter = (str) => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <DashBoardLayout>
      <div className="w-full px-6 md:px-16 py-10 border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0 text-white min-h-screen">
        <div className="text-center">
          <h1 className="text-xl md:text-3xl font-semibold">
            Account & Billing
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage your subscription, payment methods, invoices, and transaction
            history with ease.
          </p>
          <div className="w-full max-w-[70%] md:max-w-[60%] border-b-2 border-purple mx-auto mt-3" />
        </div>

        <div className="mt-14">
          <h2 className="text-lg md:font-semibold uppercase">Account</h2>
          <p className="mt-4 text-base">
            <span className="md:font-semibold">User Account :</span>{" "}
            {userEmail || "Not Available"}
          </p>
        </div>

        <div className="hidden md:flex justify-start gap-[42%] items-center mt-8 border-b border-gray-700 pb-3">
          <h3 className="uppercase font-semibold text-xl">Your Current Plan</h3>
          <h3 className="uppercase font-semibold text-xl">Billing</h3>
        </div>

        <div className="flex flex-col md:flex-row lg:px-10 w-full justify-between mt-6 gap-6">
          <h3 className="flex md:hidden uppercase font-semibold text-sm border-b">
            Your Current Plan
          </h3>
        </div>

        <div className="lg:flex lg:gap-5 py-5">
          {/* Left Side: Plan Info */}
          <div className="flex mb-5 lg:mb-0 flex-col w-full items-center justify-center p-10 border rounded-xl border-ProgressBarColor text-center whitespace-nowrap">
            <h1 className="text-xl md:text-3xl font-semibold">
              {isSubscriptionLoading
                ? "Loading..."
                : subscription?.planName || "No Plan"}
            </h1>
            <h1 className="text-xl md:text-2xl font-bold mt-2">
              ${isSubscriptionLoading ? "0" : subscription?.planPrice || "0"}
              <span className="p-2 text-sm text-gray-400 font-bold">
                /{" "}
                {isSubscriptionLoading
                  ? "Monthly"
                  : capitalizeFirstLetter(subscription?.billingCycle) ||
                    "Monthly"}
              </span>
            </h1>

            <Link
              to="/pricingPlan"
              className="w-full max-w-[60%] mt-2 bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg p-3 text-primary hover:ring-2 hover:ring-gradientEnd">
              Upgrade Plan
            </Link>
          </div>

          {/* Right Side: Billing Info */}
          <div className="w-full flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-2 w-full items-start justify-start p-5 md:p-10 border rounded-xl bg-analyticsBoxBackground border-primary text-left whitespace-nowrap">
              <p className="text-sm md:text-xl font-bold mb-1">
                Payment Method
              </p>
              <p className="text-sm md:text-xl font-medium">
                {isSubscriptionLoading
                  ? "Loading..."
                  : subscription?.paymentMethod || "Stripe"}
              </p>

              <p className="text-sm md:text-xl font-bold mb-1">Last Payment</p>
              <p className="text-sm md:text-lg font-semibold">
                {formatDate(subscription?.lastPayment?.date)} - ${" "}
                {isSubscriptionLoading
                  ? "0"
                  : subscription?.lastPayment?.amount || "0"}
                <span className="text-extraLightGrey px-2">|</span>
                <span>Active</span>
              </p>
            </div>

            <div className="flex flex-col gap-y-2 w-full items-start justify-start p-5 md:p-10 border rounded-xl bg-analyticsBoxBackground border-primary text-left whitespace-nowrap">
              <p className="text-sm md:text-xl font-bold mb-1">
                Billing Period
              </p>
              <p className="text-sm md:text-xl font-medium">
                Plan Billed{" "}
                {isSubscriptionLoading
                  ? "Monthly"
                  : capitalizeFirstLetter(subscription?.billingCycle) ||
                    "Monthly"}
                <span className="text-extraLightGrey px-2">|</span>
                <Link to="/pricingPlan" className="text-danger cursor-pointer">
                  Update
                </Link>
              </p>

              <p className="text-sm md:text-xl font-bold mb-1">Next Payment</p>
              <p className="text-sm md:text-lg font-semibold">
                {getNextPaymentDate()}
                <span className="text-extraLightGrey px-2">|</span> ${" "}
                {isSubscriptionLoading
                  ? "0"
                  : subscription?.discountedAmount ||
                    subscription?.planPrice ||
                    "0"}
              </p>
            </div>

            <div
              className={
                "flex flex-col gap-y-2 w-full items-start justify-start p-5 md:p-10 border rounded-xl bg-analyticsBoxBackground border-primary text-left whitespace-nowrap" +
                (!isSubscriptionLoading && !subscription?.planName
                  ? " !hidden "
                  : "")
              }>
              <p className="text-sm md:text-xl font-semibold mb-1">
                Cancel Subscription
              </p>

              {subscription?.isCancelled ? (
                <div className="w-full">
                  {/* Cancellation Notice */}
                  <div className="bg-red-100 border border-red-300 rounded-lg py-4 px-2 mb-4 bg-rose-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400 mt-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      {/* <div className="ml-3 text-sm text-red-700 ">
                        <p className="font-medium">
                          All your credits, articles and integrations will be
                          deleted on {formatCancelDate(subscription.cancelAt)}.
                        </p>
                        <p className="mt-1">
                          If you change your mind you can revert the
                          cancellation before the date.
                        </p>
                      </div> */}
                      <div className="ml-3 text-sm text-red-700 max-w-full break-words overflow-hidden">
                        <p className="font-medium break-words whitespace-normal">
                          All your credits, articles and integrations will be
                          deleted on {formatCancelDate(subscription.cancelAt)}.
                        </p>
                        <p className="mt-1 break-words whitespace-normal">
                          If you change your mind you can revert the
                          cancellation before the date.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDontCancelSubscription}
                      className="bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg p-3 text-primary hover:ring-2 hover:ring-gradientEnd">
                      Don't cancel
                    </Button>
                    <Button
                      onClick={handleRequestRefund}
                      className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium text-sm">
                      Request Refund
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleOpenCancelModal}
                  className="text-danger text-sm md:text-xl font-medium cursor-pointer"
                  disabled={isSubscriptionLoading}>
                  {isSubscriptionLoading ? "Loading..." : "Cancel"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        onClose={handleModalClose}
        selectedReasons={selectedReasons}
        mainReason={mainReason}
        onReasonChange={handleReasonChange}
        onMainReasonChange={handleMainReasonChange}
        onContinueToCancellation={handleContinueToCancellation}
        onSendToTeam={handleSendToTeam}
        isFormValid={isFormValid}
      />

      <RetentionModal
        isOpen={isRetentionModalOpen}
        onClose={handleModalClose}
        onContinueToCancellation={handleRetentionContinueToCancellation}
        onClaimDiscount={handleClaimDiscount}
        isLoading={isDiscountLoading}
      />

      <DiscountSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleModalClose}
        discountedPrice={discountedPrice}
        onGoToDashboard={handleGoToDashboard}
      />

      <FinalCancellationModal
        isOpen={isFinalCancellationModalOpen}
        onClose={handleModalClose}
        onDontCancel={handleDontCancel}
        onConfirmCancellation={handleConfirmCancellation}
      />

      <CancellationConfirmedModal
        isOpen={isCancellationConfirmedModalOpen}
        onClose={handleCancellationConfirmedModalClose}
      />

      <RefundPolicyModal
        isOpen={isRefundPolicyModalOpen}
        onClose={() => setIsRefundPolicyModalOpen(false)}
      />

      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onSave={handleBillingUpdate}
      />
    </DashBoardLayout>
  )
}

export default Billing
