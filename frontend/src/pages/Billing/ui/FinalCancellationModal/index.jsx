import React, { useState, useEffect } from "react"
import Button from "../../../../components/Button"
import { IoMdClose } from "react-icons/io"
import { IoWarning } from "react-icons/io5"
import { MdClose } from "react-icons/md"

const FinalCancellationModal = ({
  isOpen,
  onClose,
  onDontCancel,
  onConfirmCancellation
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    // Get subscription data from localStorage
    const getNextBillingDate = () => {
      try {
        const subscriptionData = localStorage.getItem("Subscription_data")
        if (subscriptionData) {
          const parsedData = JSON.parse(subscriptionData)
          const nextBillingDate = parsedData?.nextBillingDate

          if (nextBillingDate) {
            const date = new Date(nextBillingDate)
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              })
            }
          }
        }
      } catch (error) {
        console.error(
          "Error parsing subscription data from localStorage:",
          error
        )
      }

      // Fallback: Calculate deletion date (30 days from now)
      const deletionDate = new Date()
      deletionDate.setDate(deletionDate.getDate() + 30)
      return deletionDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
    }

    setFormattedDate(getNextBillingDate())
  }, [isOpen])

  if (!isOpen) return null

  const dataLossItems = [
    "All Tailored Resumes",
    "All Auto Apply Settings and History",
    "Saved Cover Letters",
    "Analytics and Dashboard Data",
    "Any Remaining Credits"
  ]

  return (
    <div
      id="final-cancellation-modal"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target.id === "final-cancellation-modal" && onClose()}>
      <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-[90%] md:max-w-[50%] mt-10 relative border max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1">
          <IoMdClose size={24} />
        </Button>

        {/* Modal Heading */}
        <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-6">
          Cancel Subscription
        </h2>

        {/* Warning Section */}
        <div className="mb-6">
          {/* Warning Icon and Message */}
          <div className="flex items-start gap-3 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex-shrink-0">
              <IoWarning className="text-red-500 text-xl mt-0.5" />
            </div>
            <div>
              <h3 className="text-red-600 font-semibold text-sm md:text-base mb-2">
                Your Data Will Be Permanently Deleted after {formattedDate}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                After cancellation, you will lose access to RoboApply and all
                saved data. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* What You'll Lose Section */}
        <div className="mb-6">
          <h3 className="text-gray-800 font-semibold text-base mb-4">
            What you'll lose:
          </h3>
          <div className="space-y-3">
            {dataLossItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <MdClose className="text-red-500 text-lg flex-shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500 focus:outline-none"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              <em>
                I understand that all my data will be deleted and cannot be
                recovered.
              </em>
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Button
            onClick={onDontCancel}
            className="w-full md:w-auto px-6 py-3 font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg hover:ring-2 hover:ring-gray-400 transition-all order-2 md:order-1">
            Don't Cancel
          </Button>
          <Button
            onClick={onConfirmCancellation}
            disabled={!isConfirmed}
            className={`w-full md:w-auto px-6 py-3 font-semibold rounded-lg transition-all order-1 md:order-2 ${
              isConfirmed
                ? "bg-red text-primary hover:ring-2 hover:ring-gradientEnd cursor-pointer"
                : "bg-rose-300 text-primary cursor-not-allowed opacity-50"
            }`}>
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FinalCancellationModal
