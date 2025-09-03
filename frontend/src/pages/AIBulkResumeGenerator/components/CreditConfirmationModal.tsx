import React, { useEffect } from "react"
import { IoMdClose } from "react-icons/io"
import { CreditValidationResult } from "../types"

interface CreditConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  creditValidation: CreditValidationResult
  isLoading?: boolean
  customHeaderMessage?: string // Custom message for the header warning/success section
}

const CreditConfirmationModal: React.FC<CreditConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  creditValidation,
  isLoading = false,
  customHeaderMessage
}) => {
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      (event.target as HTMLDivElement).id ===
      "credit-confirmation-modal-container"
    ) {
      onClose()
    }
  }

  const creditCost = (creditValidation?.creditCost || undefined) as number

  // Removed auto-confirm logic to let parent handle credit-free operations

  if (!isOpen) return null

  return (
    <div
      id="credit-confirmation-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOutsideClick}>
      <div className="bg-modalPurple rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd disabled:opacity-50">
          <IoMdClose size={24} />
        </button>

        {/* Header */}
        <div className="mb-6 mt-2">
          <h3 className="text-lg font-semibold text-primary mb-1">
            Credit Confirmation Required
          </h3>
        </div>

        <div className="mb-6">
          {/* Warning Section - only show if credits are being charged */}
          {creditValidation.creditCost > 0 && (
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-primary">
                  {customHeaderMessage ||
                    (creditValidation.freeUsed
                      ? "This Operation will Consume Credits"
                      : "Credits Required")}
                </h4>
                <p className="text-xs text-lightGrey">
                  {creditValidation.creditCost > 0
                    ? "Credits will be deducted for this action"
                    : "This operation uses your available free generation"}
                </p>
              </div>
            </div>
          )}

          {/* Success Section - show if operation is free */}
          {creditValidation.creditCost === 0 && (
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-primary">
                  {creditValidation.freeUsed
                    ? "Free Generation Available"
                    : "No Credits Required"}
                </h4>
                <p className="text-xs text-lightGrey">
                  This operation is free for you
                </p>
              </div>
            </div>
          )}

          {/* Message and Details */}
          <div className="bg-almostBlack/80 rounded-lg p-4 mb-4 border border-customGray">
            <div className="text-sm text-primary mb-3 whitespace-pre-line">
              {creditValidation.message}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium text-primary">Action:</span>
                <p className="text-lightGrey">
                  {creditValidation.action === "multiple_fields_generation"
                    ? "Multiple Fields Generation"
                    : creditValidation.action === "tailored_resume"
                    ? "Tailored Resume Generation"
                    : creditValidation.action
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                </p>
              </div>
              <div>
                <span className="font-medium text-primary">Cost:</span>
                <p className="text-lightGrey">
                  {creditValidation.creditCost === 0
                    ? "FREE"
                    : `${creditValidation.creditCost} credits`}
                </p>
              </div>
            </div>
          </div>

          {/* Info Notice - only show if credits are being charged */}
          {creditValidation.creditCost > 0 && (
            <div className="bg-purple bg-opacity-20 border border-purple rounded-lg p-3">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-purple mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-primary">
                  By continuing, {creditValidation.creditCost} credits will be
                  deducted from your account.
                </p>
              </div>
            </div>
          )}

          {/* Success Notice - show if operation is free */}
          {creditValidation.creditCost === 0 && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-3">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-xs text-primary">
                  This operation will not consume any credits.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-primary bg-almostBlack/80 hover:bg-opacity-80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-customGray">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-primary bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : creditValidation.creditCost === 0 ? (
              "Proceed (FREE)"
            ) : (
              `Proceed (${creditValidation.creditCost} credits)`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreditConfirmationModal
