import React from "react"
import Button from "../../../../components/Button"
import { IoMdClose } from "react-icons/io"

const CancelSubscriptionModal = ({
  isOpen,
  onClose,
  selectedReasons,
  mainReason,
  onReasonChange,
  onMainReasonChange,
  onContinueToCancellation,
  onSendToTeam,
  isFormValid
}) => {
  if (!isOpen) return null

  const reasonOptions = {
    price: [
      "Too expensive for the value I got",
      "Too expensive for my budget",
      "Found a cheaper alternative"
    ],
    results: [
      "Didn't land interviews as expected",
      "Didn't see improvements in my job search"
    ],
    usage: [
      "Didn't use RoboApply enough",
      "Changed my job search strategy",
      "Already landed a job"
    ],
    other: ["Technical issues with RoboApply", "Missing features I need"]
  }

  const renderReasonSection = (title, reasons) => (
    <div className="mb-6">
      <h3 className="text-base font-medium text-primary mb-3">{title}</h3>
      <div className="space-y-3">
        {reasons.map((reason) => (
          <label key={reason} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedReasons.includes(reason)}
              onChange={() => onReasonChange(reason)}
              className="mt-1 h-4 w-4 text-purple-600 bg-transparent border-2 border-gray-400 rounded focus:ring-purple-500 focus:outline-none"
            />
            <span className="text-sm text-gray-300">{reason}</span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div
      id="cancel-subscription-modal"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target.id === "cancel-subscription-modal" && onClose()}>
      <div className="bg-modalPurple rounded-lg p-6 md:p-8 w-full max-w-[90%] md:max-w-[50%] mt-10 relative border max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
          <IoMdClose size={24} />
        </Button>

        {/* Modal Heading */}
        <h2 className="text-lg md:text-2xl font-semibold text-primary mb-6">
          Cancel Subscription
        </h2>

        {/* Price Section */}
        {renderReasonSection("Price", reasonOptions.price)}

        {/* Results Section */}
        {renderReasonSection("Results", reasonOptions.results)}

        {/* Usage Section */}
        {renderReasonSection("Usage", reasonOptions.usage)}

        {/* Other Section */}
        {renderReasonSection("Other", reasonOptions.other)}

        {/* Main Reason Text Area */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-primary mb-3">
            What's the main reason you're cancelling? (Required)
          </h3>
          <textarea
            value={mainReason}
            onChange={(e) => onMainReasonChange(e.target.value)}
            className="w-full p-3 bg-transparent border border-gray-400 rounded-md text-primary placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            rows="4"
            placeholder="Please tell us more..."
          />
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-400 mb-6">
          We'll notify you if we make any changes based on your feedback.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={onContinueToCancellation}
            disabled={!isFormValid}
            className={`px-6 py-3 font-semibold rounded-lg transition-all ${
              isFormValid
                ? "bg-gradient-to-b from-gradientStart to-gradientEnd text-primary hover:ring-2 hover:ring-gradientEnd cursor-pointer"
                : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
            }`}>
            Continue to Cancellation
          </Button>
          <Button
            onClick={onSendToTeam}
            disabled={!isFormValid}
            className={`px-6 py-3 font-semibold rounded-lg transition-all ${
              isFormValid
                ? "bg-yellow text-black hover:ring-2 hover:ring-yellow-600 cursor-pointer"
                : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
            }`}>
            Send to Team & Wait
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CancelSubscriptionModal
