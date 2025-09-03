import React from "react"
import { useNavigate } from "react-router-dom"
import { FaCheck } from "react-icons/fa"
import { FaCreditCard } from "react-icons/fa"
import Button from "../../../../components/Button"
import { GiTwoCoins } from "react-icons/gi"

const PayAsYouGo = () => {
  const navigate = useNavigate()

  const handleGetAccess = () => {
    navigate("/buyCredits")
  }

  return (
    <div className="w-full mx-auto">
      <div
        className="w-full shadow-2xl"
        style={{
          background:
            "radial-gradient(48.6% 799.61% at 50% 50%, #100919 0%, #100919 100%) padding-box, radial-gradient(48.6% 799.61% at 50% 50%, #DFA325 0%, #8e54e9cc 100%) border-box",
          borderRadius: "15px",
          border: "2px solid transparent"
        }}>
        <div className="flex flex-col lg:flex-row items-stretch justify-between">
          {/* Left Side */}
          <div className="flex-2 max-w-lg p-6 lg:p-8 bg-transparent">
            {" "}
            {/* ⭐ Add bg if needed */}
            <h2 className="text-base lg:text-xl font-bold text-yellow-400 mb-3 lg:mb-4">
              Pay as you go
            </h2>
            <div className="flex items-baseline gap-2 text-nowrap">
              <span className="text-xl lg:text-4xl font-bold text-white">
                $0.15
              </span>
              <span className="text-sm lg:text-base text-gray-300">
                per credit
              </span>
              <GiTwoCoins className="text-gray-400 text-xl " />
            </div>
          </div>

          {/* Middle */}
          <div className="flex-2 max-w-lg p-6  bg-pricingLightPurple  border border-t-0 border-r-0 border-b-0 border-l-PricingLeftBorder">
            {/* ⭐ h-full */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FaCheck className="text-green-400 text-sm mt-0.5 flex-shrink-0" />
                <span className="text-gray-200 text-sm lg:text-base leading-relaxed">
                  One-time purchase
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheck className="text-green-400 text-sm mt-0.5 flex-shrink-0" />
                <span className="text-gray-200 text-sm lg:text-base leading-relaxed">
                  No expiration
                </span>
              </li>
              <li className="flex items-start text-left gap-3">
                <FaCheck className="text-green-400 text-sm mt-0.5 flex-shrink-0" />
                <span className="text-gray-200 text-sm lg:text-base leading-relaxed">
                  Use for: Job Applications, Tailored Resumes, Interview Buddy,
                  Resume Builder, Cover Letters, Resume Scores
                </span>
              </li>
            </ul>
          </div>

          {/* Right Side */}
          <div className="flex-1 max-w-lg px-6 py-6 lg:px-8 lg:py-16 bg-pricingLightPurple flex items-center justify-center">
            <Button
              onClick={handleGetAccess}
              className="w-full lg:w-auto px-6 py-3 text-nowrap text-white font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)",
                boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)"
              }}>
              Get access
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PayAsYouGo
