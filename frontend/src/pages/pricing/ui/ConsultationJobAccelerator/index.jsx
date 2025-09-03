import React from "react"
import { FaCheck } from "react-icons/fa"
import Button from "../../../../components/Button"

const ConsultationJobAccelerator = () => {
  const handleScheduleCall = () => {
    // Add your navigation or modal logic here
    console.log("Schedule strategy call clicked")
  }

  const features = [
    "Personalized Onboarding",
    "Group Strategy Calls",
    "Resume & LinkedIn Optimization",
    "Job Search Plan",
    "Interview Coaching",
    "500 Bonus Credits Included"
  ]

  return (
    <div className="w-full mx-auto">
      <div
        className="w-full shadow-2xl overflow-hidden"
        style={{
          background:
          "radial-gradient(48.6% 799.61% at 50% 50%, #100919 0%, #100919 100%) padding-box, radial-gradient(48.6% 799.61% at 50% 50%, #DFA325 0%, #8e54e9cc 100%) border-box",
        borderRadius: "15px",
        border: "2px solid transparent"
        }}>
        <div
          className="flex  flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8"
          style={{
            borderRadius: "15px",
            background: "linear-gradient(163deg, #100919 52%, #8C20F83B 100%)"
          }}>
          {/* Left Side - Title, Description and Pricing */}
          <div className="flex-1 max-w-lg p-6 lg:p-8 text-left">
            {/* <h2 className="text-xl lg:text-3xl font-bold text-yellow-400 mb-2 text-nowrap">
              Consultation + Job Accelerator
            </h2> */}

<h2 className="text-xl lg:text-3xl font-bold text-yellow-400 mb-2 break-words">
  Consultation + Job Accelerator
</h2>
            <p className="text-gray-200 text-sm lg:text-base text-left mb-6 leading-relaxed">
              For serious candidates who want expert guidance + full RoboApply
              potential.
            </p>

            <div className="mb-6 text-left">
              <p className="text-gray-300 text-sm mb-2">Starting from</p>
              <div className="flex items-baseline gap-2">
              <span className="text-lg lg:text-4xl font-bold text-white break-words">
  $999.99 (Intro Offer: $499)
</span>
              </div>
            </div>

            {/* Call to Action Button */}
            {/* <Button
              onClick={handleScheduleCall}
              className="w-full  px-8 py-4 text-white font-semibold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 mb-6 lg:mb-0"
              style={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)",
                boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)"
              }}>
              Schedule Your Strategy Call
            </Button> */}

<Button
  onClick={handleScheduleCall}
  className="w-full max-w-full px-6 py-3 text-white font-semibold text-base sm:text-lg rounded-lg transition-all duration-200 transform hover:scale-105 mb-6 lg:mb-0"
  style={{
    background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)",
    boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)"
  }}>
  Schedule Your Strategy Call
</Button>
          </div>

          {/* Right Side - Features List */}
          <div className="flex-1 max-w-md p-6 lg:p-8">
            <ul className="lg:pl-6 space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <FaCheck className="text-green-400 text-sm mt-1 flex-shrink-0" />
                  <span className="text-gray-200 text-sm lg:text-base leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsultationJobAccelerator
