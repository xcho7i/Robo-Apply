import React from "react"
import Button from "../../../../components/Button"
import { IoMdClose } from "react-icons/io"
import { IoCheckmark } from "react-icons/io5"

const DiscountSuccessModal = ({
  isOpen,
  onClose,
  discountedPrice,
  onGoToDashboard
}) => {
  if (!isOpen) return null

  return (
    <div
      id="discount-success-modal"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target.id === "discount-success-modal" && onClose()}>
      <div className="bg-modalPurple rounded-lg p-6 md:p-8 w-full max-w-[90%] md:max-w-[50%] mt-10 relative border max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
          <IoMdClose size={24} />
        </Button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green rounded-full flex items-center justify-center ">
            <IoCheckmark size={32} className="text-primary" />
          </div>
        </div>

        {/* Success Heading */}
        <h2 className="text-xl md:text-3xl font-semibold text-primary mb-6 text-center">
          Your Discount Is Applied!
        </h2>

        {/* Success Message */}
        <p className="text-sm md:text-lg text-gray-300 mb-8 text-center leading-relaxed">
          You'll be billed ${discountedPrice}/month for the next 3 months. Your
          RoboApply subscription has been updated.
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onGoToDashboard}
            className="w-full max-w-xs px-6 py-3 font-semibold bg-yellow text-black rounded-lg hover:ring-2 hover:ring-yellow-400 transition-all">
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DiscountSuccessModal
