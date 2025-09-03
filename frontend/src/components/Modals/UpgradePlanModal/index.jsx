import React from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../Button"

const UpgradePlanModal = ({ isOpen, onClose, context = "default" }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const messageMap = {
    coverLetter:
      "Your remaining credits are too low to create a new cover letter. Please upgrade your plan to continue.",
    resumeBuilder:
      "Your remaining credits are too low to build a new resume. Please upgrade your plan to continue.",
    scan: "Your remaining credits are too low to scan a resume. Please upgrade your plan to continue.",
    interviewGuide:
      "Your remaining credits are too low for taking the guidence. Please upgrade your plan to continue.",
    resumeUpload:
      "Your remaining credits are too low to create a profile. Please upgrade your plan to continue.",
    autoApply:
      "Your remaining credits are too low for autoApply. Please upgrade your plan to continue.",
    bulkResumeGenerator:
      "Your remaining credits are too low for generation. Please upgrade your plan to continue.",
    ExpirePlan:
      "Your free plan has expired. Please upgrade to continue using RoboApply.",
    default:
      "Your remaining credits are too low. Please upgrade your plan to continue."
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-modalPurple border p-10 rounded-xl max-w-2xl w-full text-center shadow-lg">
        <h2 className="text-3xl font-bold text-primary mb-6">
          Upgrade your Subscription Plan
        </h2>
        <p className="mb-8 text-primary text-lg leading-relaxed">
          {messageMap[context] || messageMap.default}
        </p>
        <div className="flex justify-center gap-6">
          <Button
            onClick={() => navigate("/pricingPlan")}
            className="p-3 sm:p-4 gap-2 px-6 sm:px-8 flex min-w-40 items-center justify-center text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            Go to Pricing
          </Button>
          <Button
            onClick={onClose}
            className="p-3 sm:p-4 gap-2 px-6 sm:px-8 flex items-center space-x-2 min-w-40 text-center justify-center text-primary text-navbar font-bold rounded-lg border-2 border-purpleBorder hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UpgradePlanModal
