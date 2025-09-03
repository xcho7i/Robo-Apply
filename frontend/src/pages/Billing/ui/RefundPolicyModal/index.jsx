import React from "react"

const RefundPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal content */}
        <div>
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Refund Policy
          </h2>

          {/* Content */}
          <div className="text-gray-700 space-y-4 text-sm">
            <p>
              According to our{" "}
              <a
                href="#"
                className="text-purpleColor underline hover:text-purple-800">
                Terms and Conditions
              </a>
              , we do not issue either partial or full refunds, for any package
              - subscriptions or one-off packages. This is independent of the
              number of credits used.
            </p>

            <p>
              Due to the high costs of LLM & GPU processing, we're not able to
              offer refunds because we reserve servers and incur high costs for
              your usage immediately.
            </p>

            <p>
              Please note that our customer support team cannot process refund
              requests. Our services are fully automated and all purchases are
              non-refundable as per our terms.
            </p>
          </div>

          {/* Understood button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium">
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicyModal
