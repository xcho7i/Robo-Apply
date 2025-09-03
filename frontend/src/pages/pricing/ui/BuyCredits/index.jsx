import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeftLong } from "react-icons/fa6"
import { CiCircleInfo } from "react-icons/ci"
import { HiArrowLeft } from "react-icons/hi"

import Button from "../../../../components/Button"
import DashboardNavbar from "../../../../dashboardNavbar"
import API_ENDPOINTS from "../../../../api/endpoints"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const BuyCredits = () => {
  const [credits, setCredits] = useState(1000)
  const [couponCode, setCouponCode] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const creditPrice = 0.15
  const totalAmount = credits * creditPrice

  const handleCreditsChange = (e) => {
    const value = e.target.value

    // Allow empty string for user to clear the field
    if (value === "") {
      setCredits(0)
      return
    }

    // Only allow numbers (including decimal points if needed)
    if (/^\d*$/.test(value)) {
      const numValue = parseInt(value) || 0

      // Apply min/max constraints
      if (numValue >= 0 && numValue <= 10000) {
        setCredits(numValue)
      }
    }
  }

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value)
    setCredits(value)
  }

  const handleBackToPlan = () => {
    navigate("/pricingPlan")
  }

  const handleUpdateSubscription = () => {
    console.log(`{credits:${credits}}`)
    handlePlanSelection()
  }

  const handlePlanSelection = () => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      console.error("Access token is missing.")
      return
    }

    setLoading(true)

    const creditsUrl = `${BASE_URL}${API_ENDPOINTS.BuyCredits}`

    fetch(creditsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        credits: credits
      })
    })
      .then((res) => res.json())
      .then((responseData) => {
        console.log("Credits purchase API response:", responseData)
        setLoading(false)

        if (responseData.success && responseData.checkoutUrl) {
          window.location.href = responseData.checkoutUrl
        }
      })
      .catch((error) => {
        console.error("Error during credits purchase API call:", error)
        setLoading(false)
      })
  }

  return (
    <>
      <DashboardNavbar />
      <div className="bg-almostBlack w-full h-screen border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between my-8">
              <Button
                onClick={handleBackToPlan}
                className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <HiArrowLeft className="mr-2" />
                Go Back
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Left Section - Credits Management */}
              <div className="lg:col-span-2 flex flex-col">
                <h1 className="text-3xl font-bold text-primary mb-8">
                  Manage credits volume
                </h1>

                <div className="bg-almostBlack rounded-lg border border-gray-200 p-6 flex-1">
                  {/* Credits Input Section */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <label className="text-primary font-medium">
                        Number of credits
                      </label>
                      <CiCircleInfo className="w-8 h-8 text-primary ml-2" />
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                      <input
                        type="text"
                        value={credits}
                        onChange={handleCreditsChange}
                        className="border border-gray-300 bg-almostBlack rounded-lg px-4 py-2 w-32 text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                      <span className="text-lg font-semibold text-primary">
                        credits
                      </span>
                    </div>
                  </div>

                  {/* Slider Section */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={credits}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer slider"
                      />

                      {/* Slider Labels */}
                      <div className="flex justify-between text-sm text-primary mt-2">
                        <span>0</span>
                        <span>2,500</span>
                        <span>5,000</span>
                        <span>7,500</span>
                        <span className="flex items-center">
                          10,000
                          <span className="ml-1 text-xs">Max</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Current Selection Display */}
                  <div className="text-right mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {credits.toLocaleString()} credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Purchase Summary */}
              <div className="lg:col-span-1 flex flex-col">
                <h2 className="text-3xl font-bold text-primary mb-8">
                  Purchase summary
                </h2>

                <div className="bg-almostBlack rounded-lg border border-gray-200 p-6 flex-1 flex flex-col">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-primary">
                        {credits.toLocaleString()} credits
                      </span>
                      <span className="font-semibold">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <hr className="border-gray-200 mb-4" />

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-primary">
                      Immediate charge :
                    </span>
                    <span className="font-bold text-lg">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-1"></div>

                  {/* Update Button */}
                  <div className="w-full flex justify-center">
                    <Button
                      onClick={handleUpdateSubscription}
                      className="p-3 flex items-center text-center justify-center w-[60%] text-primary text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd mt-auto">
                      Update your subscription
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }

          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }

          .slider::-webkit-slider-track {
            background: #e5e7eb;
            height: 8px;
            border-radius: 4px;
          }

          .slider::-moz-range-track {
            background: #e5e7eb;
            height: 8px;
            border-radius: 4px;
          }
        `}</style>
      </div>
    </>
  )
}

export default BuyCredits
