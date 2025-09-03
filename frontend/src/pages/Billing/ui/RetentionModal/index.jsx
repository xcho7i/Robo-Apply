// import React, { useState } from "react"
// import Button from "../../../../components/Button"
// import { IoMdClose } from "react-icons/io"
// import CircularIndeterminate from "../../../../components/loader/circular"

// const RetentionModal = ({
//   isOpen,
//   onClose,
//   onContinueToCancellation,
//   onClaimDiscount,
//   isLoading = false
// }) => {
//   const [selectedPlan, setSelectedPlan] = useState("")

//   if (!isOpen) return null

//   const plans = [
//     {
//       name: "Basic Plan",
//       identifier: "basic_monthly_individual",
//       originalPrice: 47,
//       discountedPrice: 33,
//       savings: 14
//     },
//     {
//       name: "Standard Plan",
//       identifier: "standard_monthly_individual",
//       originalPrice: 129,
//       discountedPrice: 90,
//       savings: 39
//     },
//     {
//       name: "Premium Plan",
//       identifier: "premium_monthly_individual",
//       originalPrice: 389,
//       discountedPrice: 272,
//       savings: 117
//     }
//   ]

//   return (
//     <div
//       id="retention-modal"
//       className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
//       onClick={(e) => e.target.id === "retention-modal" && onClose()}>
//       <div className="bg-modalPurple rounded-lg p-6 md:p-8 w-full max-w-[90%] md:max-w-[60%] mt-10 relative border max-h-[90vh] overflow-y-auto">
//         {/* Close Button */}
//         <Button
//           onClick={onClose}
//           className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
//           <IoMdClose size={24} />
//         </Button>

//         {/* Modal Heading */}
//         <h2 className="text-lg md:text-3xl font-bold text-primary mb-4">
//           Cancel Subscription
//         </h2>

//         {/* Sub-Header */}
//         <h3 className="text-yellow-400 text-xl md:text-xl font-bold mb-4">
//           Before You Go — Here's a Better Option
//         </h3>

//         {/* Body Text */}
//         <p className="text-base md:text-xl  text-primary mb-6 leading-relaxed">
//           Stay with RoboApply and keep access to Auto Apply, Tailored Resumes,
//           and all your unused credits—without losing progress.
//         </p>

//         <p className="text-sm md:text-xl font-bold text-gray-300 mb-8 leading-relaxed">
//           <span className="text-yellow-400 ">
//             Instead of canceling, enjoy 30% off for the next 3 months on any
//             plan.
//           </span>
//         </p>

//         {/* Plans Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           {plans.map((plan, index) => (
//             <div
//               key={index}
//               onClick={() => setSelectedPlan(plan.identifier)}
//               className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:ring-2 hover:ring-purple ${
//                 selectedPlan === plan.identifier
//                   ? "border-yellow bg-yellow hover:border-gray-500"
//                   : "border-purple-500 ring-2 ring-purple-500 bg-gradient-to-b from-purple-900/50 to-purple-800/50 shadow-lg shadow-purple-500/20"
//               }`}>
//               <p
//                 className={`font-semibold text-base md:text-2xl mb-2 transition-colors ${
//                   selectedPlan === plan.identifier
//                     ? "text-black"
//                     : "text-primary"
//                 }`}>
//                 {plan.name}
//               </p>
//               <div className="mb-2">
//                 <span
//                   className={`text-xl md:text-2xl font-bold transition-colors ${
//                     selectedPlan === plan.identifier
//                       ? "text-black"
//                       : "text-yellow-400"
//                   }`}>
//                   ${plan.discountedPrice}/mo
//                 </span>
//               </div>
//               <div className="text-sm md:text-base text-primary mb-2">
//                 <span className="line-through">${plan.originalPrice}</span>
//                 <span
//                   className={`ml-2  ${
//                     selectedPlan === plan.identifier
//                       ? "text-black"
//                       : "text-yellow"
//                   }`}>
//                   /mo for 3 months
//                 </span>
//               </div>
//               <div
//                 className={`text-sm md:text-base transition-colors ${
//                   selectedPlan === plan.identifier
//                     ? "text-black"
//                     : "text-yellow-400"
//                 }`}>
//                 Save ${plan.savings}/month
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Additional Info */}
//         <p className="text-xs text-gray-400 text-center mb-6">
//           <em>(Billed monthly – You save 30%)</em>
//         </p>

//         {/* Action Buttons */}
//         {isLoading ? (
//           <div className="flex justify-center items-center h-32">
//             <CircularIndeterminate size={32} />
//           </div>
//         ) : (
//           <div className="flex flex-col md:flex-row justify-center items-center gap-4">
//             <Button
//               onClick={onContinueToCancellation}
//               className="w-full md:w-auto px-6 py-3 font-semibold bg-gray-600 hover:bg-gray-700 text-white rounded-lg hover:ring-2 hover:ring-gray-500 transition-all order-2 md:order-1">
//               Continue to Cancellation
//             </Button>
//             <Button
//               onClick={() => onClaimDiscount(selectedPlan)}
//               disabled={!selectedPlan}
//               className={`w-full md:w-auto px-6 py-3 font-semibold rounded-lg transition-all order-1 md:order-2 ${
//                 selectedPlan
//                   ? "bg-yellow text-black hover:ring-2 hover:ring-gradientEnd cursor-pointer"
//                   : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
//               }`}>
//               Claim 30% Off & Keep Subscription
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default RetentionModal

import React, { useState, useEffect } from "react"
import Button from "../../../../components/Button"
import { IoMdClose } from "react-icons/io"
import CircularIndeterminate from "../../../../components/loader/circular"
import API_ENDPOINTS from "../../../../api/endpoints"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const RetentionModal = ({
  isOpen,
  onClose,
  onContinueToCancellation,
  onClaimDiscount,
  isLoading = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState("")
  const [subscriptionData, setSubscriptionData] = useState(null)

  // Function to fetch subscription data
  const fetchSubscriptionData = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      console.log("No access token found")
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
      console.log("Subscription data response:", data)

      if (response.ok && data.success) {
        setSubscriptionData(data) // Store the subscription data in state
        console.log("✅ Subscription data fetched successfully!")
      } else {
        console.error("Subscription data API Error:", data)
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error)
    }
  }

  // Make API call when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionData()
    }
  }, [isOpen])

  if (!isOpen) return null

  const plans = [
    {
      name: "Basic Plan",
      identifier: "basic_monthly_individual",
      originalPrice: 47,
      discountedPrice: 33,
      savings: 14
    },
    {
      name: "Standard Plan",
      identifier: "standard_monthly_individual",
      originalPrice: 129,
      discountedPrice: 90,
      savings: 39
    },
    {
      name: "Premium Plan",
      identifier: "premium_monthly_individual",
      originalPrice: 389,
      discountedPrice: 272,
      savings: 117
    }
  ]

  // Check if discount has been used
  const discountUsed = subscriptionData?.discountUsed === true

  return (
    <div
      id="retention-modal"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target.id === "retention-modal" && onClose()}>
      <div className="bg-modalPurple rounded-lg p-6 md:p-8 w-full max-w-[90%] md:max-w-[60%] mt-10 relative border max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
          <IoMdClose size={24} />
        </Button>

        {/* Modal Heading */}
        <h2 className="text-lg md:text-3xl font-bold text-primary mb-4">
          Cancel Subscription
        </h2>

        {/* Sub-Header */}
        <h3 className="text-yellow-400 text-xl md:text-xl font-bold mb-4">
          Before You Go — Here's a Better Option
        </h3>

        {/* Body Text */}
        <p className="text-base md:text-xl  text-primary mb-6 leading-relaxed">
          Stay with RoboApply and keep access to Auto Apply, Tailored Resumes,
          and all your unused credits—without losing progress.
        </p>

        {/* Show different content based on discount usage */}
        {!discountUsed ? (
          <>
            <p className="text-sm md:text-xl font-bold text-gray-300 mb-8 leading-relaxed">
              <span className="text-yellow">
                Instead of canceling, enjoy 30% off for the next 3 months on any
                plan.
              </span>
            </p>

            {/* Plans Grid - Selectable */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPlan(plan.identifier)}
                  className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:ring-2 hover:ring-purple ${
                    selectedPlan === plan.identifier
                      ? "border-yellow bg-yellow hover:border-gray-500"
                      : "border-purple-500 ring-2 ring-purple-500 bg-gradient-to-b from-purple-900/50 to-purple-800/50 shadow-lg shadow-purple-500/20"
                  }`}>
                  <p
                    className={`font-semibold text-base md:text-2xl mb-2 transition-colors ${
                      selectedPlan === plan.identifier
                        ? "text-black"
                        : "text-primary"
                    }`}>
                    {plan.name}
                  </p>
                  <div className="mb-2">
                    <span
                      className={`text-xl md:text-2xl font-bold transition-colors ${
                        selectedPlan === plan.identifier
                          ? "text-black"
                          : "text-yellow-400"
                      }`}>
                      ${plan.discountedPrice}/mo
                    </span>
                  </div>
                  <div className="text-sm md:text-base text-primary mb-2">
                    <span className="line-through">${plan.originalPrice}</span>
                    <span
                      className={`ml-2  ${
                        selectedPlan === plan.identifier
                          ? "text-black"
                          : "text-yellow"
                      }`}>
                      /mo for 3 months
                    </span>
                  </div>
                  <div
                    className={`text-sm md:text-base transition-colors ${
                      selectedPlan === plan.identifier
                        ? "text-black"
                        : "text-yellow-400"
                    }`}>
                    Save ${plan.savings}/month
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <p className="text-xs text-gray-400 text-center mb-6">
              <em>(Billed monthly – You save 30%)</em>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm md:text-xl font-bold text-gray-300 mb-8 leading-relaxed">
              <span className="text-red-400">
                You have already used your one-time 30% discount offer.
              </span>
            </p>

            {/* Plans Grid - Non-selectable with overlay message */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg p-4 text-center border-gray-600 bg-gray-800/50 opacity-60">
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-red-400 font-bold text-sm md:text-base">
                        Discount Already Used
                      </p>
                      <p className="text-gray-300 text-xs md:text-sm mt-1">
                        This offer was already claimed
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-base md:text-2xl mb-2 text-gray-400">
                    {plan.name}
                  </p>
                  <div className="mb-2">
                    <span className="text-xl md:text-2xl font-bold text-gray-400">
                      ${plan.discountedPrice}/mo
                    </span>
                  </div>
                  <div className="text-sm md:text-base text-gray-500 mb-2">
                    <span className="line-through">${plan.originalPrice}</span>
                    <span className="ml-2">/mo for 3 months</span>
                  </div>
                  <div className="text-sm md:text-base text-gray-500">
                    Save ${plan.savings}/month
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <p className="text-xs text-gray-400 text-center mb-6">
              <em>One-time discount offer per account</em>
            </p>
          </>
        )}

        {/* Action Buttons */}
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <CircularIndeterminate size={32} />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Button
              onClick={onContinueToCancellation}
              className="w-full md:w-auto px-6 py-3 font-semibold bg-gray-600 hover:bg-gray-700 text-white rounded-lg hover:ring-2 hover:ring-gray-500 transition-all order-2 md:order-1">
              Continue to Cancellation
            </Button>
            {/* Show discount claim button only if discount has not been used */}
            {!discountUsed && (
              <Button
                onClick={() => onClaimDiscount(selectedPlan)}
                disabled={!selectedPlan}
                className={`w-full md:w-auto px-6 py-3 font-semibold rounded-lg transition-all order-1 md:order-2 ${
                  selectedPlan
                    ? "bg-yellow text-black hover:ring-2 hover:ring-gradientEnd cursor-pointer"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                }`}>
                Claim 30% Off & Keep Subscription
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RetentionModal
