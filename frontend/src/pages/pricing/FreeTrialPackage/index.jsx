import React, { useState } from "react"
import logo from "../../../assets/logo.svg"
import { FaRegCalendarAlt, FaRegBell, FaWifi, FaTimes } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import Slider from "react-slick"
import API_ENDPOINTS from "../../../api/endpoints"
import { errorToast, successToast } from "../../../components/Toast"
import CircularIndeterminate from "../../../components/loader/circular"
import FormCardLayout from "../../../components/common/FormCardLayout"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const FreeTrialPackage = () => {
  const [selectedPackage, setSelectedPackage] = useState(
    "basic_monthly_individual"
  )
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const navigate = useNavigate()

  const externalPlans = [
    {
      name: "Basic Plan",
      identifier: "basic_monthly_individual"
    },
    {
      name: "Standard Plan",
      identifier: "standard_monthly_individual"
    },
    {
      name: "Premium Plan",
      identifier: "premium_monthly_individual"
    },
    {
      name: "Basic Plan",
      identifier: "basic_yearly_individual"
    },
    {
      name: "Standard Plan",
      identifier: "standard_yearly_individual"
    },
    {
      name: "Premium Plan",
      identifier: "premium_yearly_individual"
    }
  ]

  const plans = {
    individual: [
      {
        title: "Basic Plan",
        monthlyPrice: "$47",
        yearlyPrice: "$37",
        yearlyWeeklyPrice: "$9.25",
        extraText: "Save $120 with yearly"
      },
      {
        title: "Standard Plan",
        monthlyPrice: "$129",
        yearlyPrice: "$103",
        yearlyWeeklyPrice: "$25.75",
        extraText: "Save $312 with yearly"
      },
      {
        title: "Premium Plan",
        monthlyPrice: "$389",
        yearlyPrice: "$311",
        yearlyWeeklyPrice: "$77.75",
        extraText: "Save $936 with yearly"
      }
    ]
  }

  const timelineSteps = [
    {
      title: "Today",
      description:
        "Unlock all the app's features like AI Tailored Apply and more.",
      icon: FaRegCalendarAlt,
      status: "active"
    },
    {
      title: "In 2 Days - Reminder",
      description: "We'll send you a reminder that your trial is ending soon.",
      icon: FaRegBell,
      status: "upcoming"
    },
    {
      title: "In 3 Days - Billing Starts",
      description:
        "You'll be charged on Jul 22, 2025 unless you cancel anytime before.",
      icon: FaWifi,
      status: "future"
    }
  ]

  // Calculate date 3 days from now
  const getDateInThreeDays = () => {
    const today = new Date()
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(today.getDate() + 3)
    return threeDaysFromNow.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  // Create grouped packages (2 per slide: monthly and yearly of same plan)
  const groupedPackages = []

  plans.individual.forEach((plan) => {
    const monthlyIdentifier = externalPlans.find(
      (ext) => ext.name === plan.title && ext.identifier.includes("monthly")
    )?.identifier

    const yearlyIdentifier = externalPlans.find(
      (ext) => ext.name === plan.title && ext.identifier.includes("yearly")
    )?.identifier

    groupedPackages.push([
      {
        ...plan,
        billing: "monthly",
        price: plan.monthlyPrice,
        identifier: monthlyIdentifier,
        period: "/mo"
      },
      {
        ...plan,
        billing: "yearly",
        price: plan.yearlyWeeklyPrice,
        identifier: yearlyIdentifier,
        period: "/week"
      }
    ])
  })

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }

  // Function to handle trial start with API call
  const handleStartTrial = async () => {
    const accessToken = localStorage.getItem("access_token")

    if (!accessToken) {
      errorToast("Access token missing. Please login again.")
      return
    }

    if (!selectedPackage) {
      errorToast("Please select a plan to continue.")
      return
    }

    setIsStartingTrial(true)

    try {
      console.log("=== STARTING 3-DAY FREE TRIAL ===")
      console.log("Selected Package:", selectedPackage)

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.Subscription}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: selectedPackage,
          isTrial: true
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log("✅ Free trial started successfully!")

        // Check if checkoutUrl is present in the response
        if (data.checkoutUrl) {
          console.log("Redirecting to checkout URL:", data.checkoutUrl)
          // Redirect to checkout URL in same tab
          window.location.href = data.checkoutUrl
        } else {
          // If no checkoutUrl, show success message
          successToast(data.msg)

          // Optional: Redirect user or update UI after successful trial start
          // window.location.href = "/dashboard" // Uncomment if you want to redirect
        }
      } else {
        console.error("API Error:", data)
        errorToast(
          data.message || "Failed to start free trial. Please try again."
        )
      }
    } catch (error) {
      console.error("Network Error:", error)
      errorToast(
        "Network error occurred. Please check your connection and try again."
      )
    } finally {
      setIsStartingTrial(false)
    }
  }

  // Handle close button click
  const handleClose = () => {
    navigate("/signIn")
  }

  return (
    <>
      {/* Loading Overlay */}
      {isStartingTrial && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-70 flex justify-center items-center text-white z-50">
          <CircularIndeterminate />
        </div>
      )}

      {/* Logo Section - Similar to StepThirtyNine */}
      <div className="flex w-full justify-start p-6">
        <a
          href="https://beta.robo-apply.com/"
          target="_blank"
          rel="noopener noreferrer">
          <img
            src={logo}
            alt="Logo"
            className="w-48 md:w-48 h-9 mb-5"
            loading="lazy"
          />
        </a>
      </div>

      {/* Main Content with FormCardLayout Background */}
      <div className="w-full">
        <div className="max-w-5xl mx-auto">
          <FormCardLayout>
            {/* Background Lines Image - Same as StepThirtyNine */}
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-50 absolute top-0 left-0 w-full h-full object-cover z-0"
            />

            {/* Main Content Container */}
            <div className="relative z-10 w-full flex flex-col justify-center items-center px-4 py-10 text-white">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-primary  transition-colors duration-200 z-20 w-8 h-8 flex items-center justify-center rounded-full  hover:text-purple"
                aria-label="Close">
                <FaTimes className="w-5 h-5" />
              </button>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
                  Start your 3-day{" "}
                  <span className="text-brand-yellow">Free</span> trial to
                  continue
                </h1>
              </div>

              {/* Timeline */}
              <div className="relative w-full max-w-md mb-10">
                {/* Vertical line */}
                <div className="absolute top-4 bottom-0 left-4 w-4 bg-brand-yellow z-0 rounded-4xl" />

                {timelineSteps.map((step, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-4 mb-10 last:mb-0 z-10">
                    {/* Timeline dot */}
                    <div>
                      <div
                        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white ${
                          step.status === "active"
                            ? "bg-brand-yellow text-black"
                            : step.status === "upcoming"
                            ? "bg-brand-yellow text-black"
                            : "bg-gray-500 text-gray-400"
                        }`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-base md:text-lg mb-1">
                        {step.title}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {step.description.includes("Jul 22, 2025")
                          ? step.description.replace(
                              "Jul 22, 2025",
                              getDateInThreeDays()
                            )
                          : step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Packages Slider */}
              <div className="mb-8 w-full max-w-lg">
                <h2 className="text-white text-xl font-semibold mb-4 text-center">
                  Choose Your Plan
                </h2>
                <Slider {...sliderSettings}>
                  {groupedPackages.map((packagePair, slideIndex) => (
                    <div key={slideIndex} className="px-4">
                      <div className="flex gap-4 justify-center">
                        {packagePair.map((pkg, index) => {
                          const isSelected = selectedPackage === pkg.identifier

                          return (
                            <div key={index} className="w-full max-w-48">
                              <div
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-start ${
                                  isSelected
                                    ? "border-brand-yellow bg-brand-yellow/10"
                                    : "border-brand-yellow bg-gray-800/50 hover:border-brand-yellow/70"
                                }`}
                                onClick={() =>
                                  setSelectedPackage(pkg.identifier)
                                }>
                                <div className="text-left">
                                  <div className="text-brand-yellow text-2xl font-bold mb-2">
                                    {pkg.price}
                                    <span className="text-sm text-gray-300">
                                      {pkg.period}
                                    </span>
                                  </div>
                                  <div
                                    className={`text-xs px-3 py-1 rounded-full mb-3 inline-block text-nowrap ${
                                      pkg.billing === "monthly"
                                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                                        : "bg-green-500/20 text-green-300 border border-green-400/30"
                                    }`}>
                                    {pkg.billing === "monthly"
                                      ? "Monthly Billing"
                                      : "Yearly Billing"}
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    {pkg.title}
                                  </p>
                                </div>
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "border-brand-yellow bg-brand-yellow"
                                      : "border-gray-500 bg-transparent"
                                  }`}>
                                  {isSelected && (
                                    <svg
                                      className="w-4 h-4 text-black"
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
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>

              {/* No Payment Due */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <svg
                  className="w-7 h-7 text-white"
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
                <span className="font-bold text-2xl">No Payment Due Now</span>
              </div>

              {/* CTA Button */}
              <button
                className={`bg-brand-yellow text-black px-6 py-3 rounded-full font-semibold hover:opacity-90 transition w-full max-w-xs text-center ${
                  isStartingTrial ? "opacity-75 cursor-not-allowed" : ""
                }`}
                onClick={handleStartTrial}
                disabled={isStartingTrial}>
                {isStartingTrial ? (
                  "Starting Trial..."
                ) : (
                  <>
                    <span className="flex items-center justify-center flex-nowrap whitespace-nowrap">
                      <span className="text-lg">Start My 3-Day Free Trial</span>
                      <span
                        aria-hidden="true"
                        className="mx-2 h-[2px] w-8 bg-black/50 inline-block"
                      />
                      <span className="text-2xl">$0</span>
                    </span>
                  </>
                )}
              </button>

              {/* Fine Print */}
              <p className="text-gray-400 text-xs mt-4 text-center">
                3-day free trial, then billing starts with selected plan
              </p>
            </div>
          </FormCardLayout>
        </div>
      </div>
    </>
  )
}

export default FreeTrialPackage
