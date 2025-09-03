import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaCheck } from "react-icons/fa"
import { RxCross2 } from "react-icons/rx"
import { HiCheck } from "react-icons/hi"

import Button from "../../../../components/Button"
import InputField from "../../../../components/EmailInput"
import PaymentModal from "../paymentModal"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import ToggleSwitch from "../toggleSwitch"
import TagIcon from "../../../../assets/Tag.png"
import TagIcon15 from "../../../../assets/Tag15.png"

import { HiArrowLeft } from "react-icons/hi"
import { SlArrowRight } from "react-icons/sl"
import API_ENDPOINTS from "../../../../api/endpoints"
import CircularIndeterminate from "../../../../components/loader/circular"
import AvatarGroup from "../../../../assets/Avatar-group.webp"
import PayAsYouGo from "../../../pricing/ui/PayAsYouGo"
import ConsultationJobAccelerator from "../../../pricing/ui/ConsultationJobAccelerator"

import { BASE_URL } from "../../../../api/index"
import { errorToast, successToast } from "../../../../components/Toast"

const stripePromise = loadStripe("your-public-key")

const PricingSection = () => {
  const [billingCategory, setBillingCategory] = useState("individual")
  const [billingPeriod, setBillingPeriod] = useState("monthly")
  const [isChecked, setIsChecked] = useState({})
  const [emails, setEmails] = useState({})
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isYearly, setIsYearly] = useState(false)
  const [loading, setLoading] = useState(false)

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
        extraText: "Save $120 with yearly",
        features: [
          {
            text: "Daily Limit: 20 Job Applications",
            available: true,
            color: "white"
          },
          {
            text: "Monthly Credits: 4,000",
            available: true,
            color: "white"
          },
          {
            text: "Auto Apply (uses credits)",
            available: true,
            color: "white"
          },
          {
            text: "Resume Builder",
            available: true,
            color: "white"
          },
          {
            text: "Resume Score",
            available: true,
            color: "white"
          },
          {
            text: "AI Cover Letters",
            available: true,
            color: "white"
          },
          {
            text: "1 Resume Profiles",
            available: true,
            color: "white"
          },
          {
            text: "Interview Buddy (uses credits)",
            available: true,
            color: "white"
          },
          {
            text: "Tailored Resumes (uses credits)",
            available: true,
            color: "white"
          },

          {
            text: "3 Free Tailored Resumes",
            available: true,
            color: "white",
            icon: "🎁"
          },
          {
            text: "3 Free Auto Applies",
            available: true,
            color: "white",
            icon: "🎁"
          },
          {
            text: "Ideal for active job seekers with tailored needs.",
            available: true,
            color: "white",
            icon: "💡"
          }
        ]
      },
      {
        title: "Standard Plan",
        monthlyPrice: "$129",
        yearlyPrice: "$103",
        extraText: "Save $312 with yearly",
        features: [
          {
            text: "Daily Limit: 100 Job Applications",
            available: true,
            color: "white"
          },
          {
            text: "Monthly Credits: 30,000",
            available: true,
            color: "white"
          },
          {
            text: "Auto Apply (uses credits)",
            available: true,
            color: "white"
          },
          {
            text: "Resume Builder",
            available: true,
            color: "white"
          },
          {
            text: "Resume Score",
            available: true,
            color: "white"
          },
          {
            text: "AI Cover Letters",
            available: true,
            color: "white"
          },
          {
            text: "5 Resume Profile",
            available: true,
            color: "white"
          },
          {
            text: "Interview Buddy (uses credits)",
            available: true,
            color: "white"
          },
          {
            text: "Tailored Resumes (uses credits)",
            available: true,
            color: "white"
          },

          {
            text: "3 Free Tailored Resumes",
            available: true,
            color: "white",
            icon: "🎁"
          },
          {
            text: "3 Free Auto Applies",
            available: true,
            color: "white",
            icon: "🎁"
          },
          {
            text: "Ideal for active job seekers with tailored needs.",
            available: true,
            color: "white",
            icon: "👍🏻"
          }
        ]
      },
      {
        title: "Premium Plan",
        monthlyPrice: "$389",
        yearlyPrice: "$311",
        extraText: "Save $936 with yearly",
        features: [
          {
            text: "Daily Limit: 500 Job Applications",
            available: true,
            color: "white"
          },
          {
            text: "Monthly Credits: 100,000",
            available: true,
            color: "white"
          },
          {
            text: "Auto Apply (uses credits)",
            available: true,
            color: "white"
          },
          {
            text: "Resume Builder",
            available: true,
            color: "white"
          },
          {
            text: "Resume Score",
            available: true,
            color: "white"
          },
          {
            text: "AI Cover Letters",
            available: true,
            color: "white"
          },
          {
            text: "Interview Buddy (uses credits)",
            available: true,
            color: "white"
          },
          {
            text: "Tailored Resumes (uses credits)",
            available: true,
            color: "white"
          },
          {
            text: "Up to 10 Resume Profiles",
            available: true,
            color: "white"
          },

          {
            text: "3 Free Tailored Resumes",
            available: true,
            color: "white",
            icon: "🎁"
          },
          {
            text: "3 Free Auto Applies",
            available: true,
            color: "white",
            icon: "🎁"
          },
          {
            text: "Best for power users and recruiters applying at scale.",
            available: true,
            color: "white",
            icon: "🚀"
          }
        ]
      }
    ]
  }

  const handleBillingCategoryChange = (value) => {
    setBillingCategory(value)
    setBillingPeriod("monthly") // Reset billing period for enterprise
  }

  const handleBillingPeriodChange = (value) => {
    setBillingPeriod(value)
  }

  const handleCheckboxChange = (planTitle) => {
    setIsChecked((prev) => ({
      ...prev,
      [planTitle]: !prev[planTitle]
    }))
  }

  const handleEmailChange = (planTitle, value) => {
    setEmails((prev) => ({ ...prev, [planTitle]: value }))
  }

  const handlePlanSelection = (plan) => {
    const billingPeriodKey = isYearly ? "yearly" : "monthly"

    const matchedExternal = externalPlans.find(
      (extPlan) =>
        extPlan.name === plan.title &&
        extPlan.identifier.includes(billingPeriodKey)
    )

    if (!matchedExternal) {
      console.warn("No matching plan found for:", {
        title: plan.title,
        billingCategory,
        billingPeriod: billingPeriodKey
      })
      return
    }

    console.log("Matched identifier:", matchedExternal.identifier)

    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      console.error("Access token is missing.")
      return
    }

    setLoading(true)

    const subscriptionUrl = `${BASE_URL}${API_ENDPOINTS.UpdateSubscription}`

    fetch(subscriptionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identifier: matchedExternal.identifier
      })
    })
      .then((res) => res.json())
      .then((responseData) => {
        console.log("Subscription API response:", responseData)
        setLoading(false)

        // if (responseData.success && responseData.checkoutUrl) {
        //   window.open(responseData.checkoutUrl, "_blank")
        // }
        if (responseData.success && responseData.checkoutUrl) {
          window.location.href = responseData.checkoutUrl // Open in same tab
        } else if (responseData.success && responseData.msg) {
          successToast(responseData.msg) // Show success message
        } else {
          errorToast(responseData.msg)
        }
      })
      .catch((error) => {
        console.error("Error during subscription API call:", error)
        setLoading(false)
      })
  }

  const handleScheduleCall = () => {
    // Add your schedule call logic here
    console.log("Schedule a call clicked")
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPlan(null)
  }

  const EnterpriseSection = () => (
    <div className="flex justify-center items-center min-h-[400px] pb-10">
      <div className=" rounded-xl p-8 max-w-3xl w-full border border-purpleBorder hover:border-yellowColor shadow-2xl">
        <div className="text-left mb-8">
          <h2 className="text-4xl font-bold text-primary mb-4">Enterprise</h2>
          <p className="text-lg text-primary">
            Custom pricing for recruiters, agencies & high-volume teams
          </p>
        </div>

        <div className="border-t border-primary pt-6 mb-14 text-left">
          <h3 className="text-2xl font-semibold text-primary mb-6">
            What's Included:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 mb-8">
            <div className="space-y-3  text-left">
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={18} />
                <span className="text-white">Unlimited Job Applications</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={18} />
                <span className="text-white">Unlimited Resume Profiles</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={18} />
                <span className="text-white text-left">
                  Custom Monthly Credits (starting at 250,000)
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={18} />
                <span className="text-white">Advanced Analytics Dashboard</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={18} />
                <span className="text-white">Team & Seat Management</span>
              </div>
            </div>

            <div className="space-y-3  text-left">
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={18} />
                <span className="text-white">API & White-Label Options</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={26} />
                <span className="text-white text-left">
                  Full Feature Access (Auto Apply, Resume Tools, Interview
                  Buddy)
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={18} />
                <span className="text-white">
                  Slack & Zoom Priority Support
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheck className="text-green-500" size={18} />
                <span className="text-white">
                  Free Consultation & 1,000 Bonus Credits
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-left mb-8">
          <p className="text-white text-lg mb-2">
            Let us tailor a solution for your organization.
          </p>
          <p className="text-white text-xl">
            Starts at <span className="font-bold text-primary">$999/month</span>{" "}
            or request a custom quote.
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleScheduleCall}
            // className="bg-yellow hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300">
            className="py-3 px-6 flex items-center space-x-2 max-w-40 min-w-max bg-yellow text-black text-lg font-bold rounded-full border-2 border-yellow hover:ring-2 hover:ring-yellow-500 focus:ring-2 focus:ring-yellow-500">
            Schedule a Call
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full">
          <div className="w-full p-3 md:p-10">
            <div className="flex items-center justify-between md:px-7"></div>
            <Button
              onClick={() => navigate("/auto-apply")}
              className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
              <HiArrowLeft className="mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
      <Elements stripe={stripePromise}>
        <div className=" px-[17%] text-center ">
          <p className="text-4xl font-semibold text-primary mb-14">
            Choose Your Ideal Plan with AI Jobs Pricing Options
          </p>

          {/* Individual/Enterprise Toggle */}
          <div className="flex justify-center space-x-4 mb-10">
            <div className="relative p-2 bg-lightGreyBackground rounded-full flex items-center">
              <div
                className={`absolute top-0 bottom-0 left-1 w-[47%] border-4 border-[#DFA325] m-[4px] rounded-full transition-transform duration-300 ease-in-out ${
                  billingCategory === "individual"
                    ? "translate-x-0"
                    : "translate-x-full"
                }`}
              />
              <button
                onClick={() => handleBillingCategoryChange("individual")}
                className={`relative z-10 px-8 py-2 rounded-full text-xl font-bold transition-colors duration-300 ${
                  billingCategory === "individual"
                    ? "text-[#DFA325]"
                    : "text-lightGrey"
                }`}>
                Individual
              </button>
              <button
                onClick={() => handleBillingCategoryChange("enterprise")}
                className={`relative z-10 px-8 py-2 rounded-full text-xl font-bold transition-colors duration-300 ${
                  billingCategory === "enterprise"
                    ? "text-[#DFA325]"
                    : "text-lightGrey"
                }`}>
                Enterprise
              </button>
            </div>
          </div>

          {/* Monthly/Yearly Toggle - Only show for Individual */}
          {billingCategory === "individual" && (
            <div className="flex justify-center space-x-4 mb-10">
              <ToggleSwitch isYearly={isYearly} setIsYearly={setIsYearly} />
            </div>
          )}

          {/* Content based on billing category */}
          {loading ? (
            <div className="w-full flex justify-center items-center py-20">
              <CircularIndeterminate />
            </div>
          ) : billingCategory === "enterprise" ? (
            <EnterpriseSection />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {plans[billingCategory].map((plan) => (
                // <div
                //   key={plan.title}
                //   className="bg-transparent rounded-lg shadow-lg p-6 flex flex-col transition-transform transform hover:translate-y-[-10px] hover:shadow-2xl relative border border-bg-gradient-to-r from-[rgba(223,163,37,1)] to-[rgba(142,84,233,0.8)]"
                //   onMouseEnter={(e) => {
                //     e.currentTarget.style.borderColor = "#FFC107"
                //   }}
                //   onMouseLeave={(e) => {
                //     e.currentTarget.style.borderColor = "#7546C0"
                //   }}
                //   style={{ position: "relative" }}>
                //   {/* Gradient Borders */}
                //   <div className="absolute top-0 left-2 w-[97%] h-[2px] bg-gradient-to-r from-[rgba(223,163,37,1)] to-[rgba(142,84,233,0.8)]"></div>
                //   <div className="absolute bottom-0 left-2 w-[97%] h-[2px] bg-gradient-to-r from-[rgba(223,163,37,1)] to-[rgba(142,84,233,0.8)]"></div>
                <div
                  className="bg-transparent rounded-lg shadow-lg p-6 flex flex-col transition-transform transform hover:translate-y-[-10px] hover:shadow-2xl relative border border-bg-gradient-to-r from-[rgba(223,163,37,1)] to-[rgba(142,84,233,0.8)]"
                  onClick={() => handlePlanSelection(plan)}
                  style={{
                    background:
                      "radial-gradient(48.6% 799.61% at 50% 50%, #100919 0%, #100919 100%) padding-box, radial-gradient(48.6% 799.61% at 50% 50%, #DFA325 0%, #8e54e9cc 100%) border-box",
                    borderRadius: "15px",
                    border: "2px solid transparent"
                  }}>
                  {/* Conditionally render the plan badges */}
                  <div className="flex justify-center w-full">
                    {plan.title === "Standard Plan" ? (
                      <div className="flex my-4 p-3 px-6 items-center space-x-2 max-w-40 min-w-max h-10 text-navbar bg-[#FFC107] text-black font-semibold rounded-full">
                        <div className="flex justify-between items-center gap-4">
                          <p>Most Popular!!!</p>
                        </div>
                      </div>
                    ) : plan.title === "Basic Plan" ? (
                      <div className="flex my-4 p-3 px-6 items-center space-x-2 max-w-40 min-w-max h-10 text-navbar bg-purpleBackground text-primary font-semibold rounded-full">
                        <div className="flex justify-between items-center gap-4">
                          <p>Limited Time!!!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="my-4 h-10"></div>
                    )}
                  </div>

                  {plan?.title === "Standard Plan" && (
                    <img
                      src={TagIcon}
                      alt={"tag"}
                      className="w-14 h-auto object-contain absolute right-[10px] top-[-16px]"
                      loading="lazy"
                    />
                  )}

                  <div className="flex flex-col flex-grow">
                    <p className="text-lg font-semibold mb-4">{plan.title}</p>
                    <p className="text-4xl font-semibold mb-4">
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      <span className="text-base font-medium">
                        /{isYearly ? "Monthly" : "Monthly"}
                      </span>
                    </p>

                    {/* Conditional rendering of extra text or empty div */}
                    <div className="flex justify-center w-full min-h-[20px]">
                      {isYearly ? (
                        <p className="text-yellowColor border px-3 py-2 border-yellowColor rounded-full text-base font-semibold mb-5">
                          {plan.extraText}
                        </p>
                      ) : (
                        <div className=""></div>
                      )}
                    </div>

                    <ul className="mb-7 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-1 text-left">
                          <span>
                            {feature.icon ? (
                              <span className="text-lg mr-1">
                                {feature.icon}
                              </span>
                            ) : feature.available ? (
                              <HiCheck
                                className="text-white-500 mr-2"
                                color="#158240"
                                size={24}
                              />
                            ) : (
                              <RxCross2
                                className="text-white-500 mr-2"
                                color="#158240"
                                size={24}
                              />
                            )}
                          </span>
                          <span style={{ color: feature.color }}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* <InputField
                      type="text"
                      placeholder="Email Address"
                      className="mt-4"
                      value={emails[plan.title] || ""}
                      onChange={(e) =>
                        handleEmailChange(plan.title, e.target.value)
                      }
                    /> */}
                    <div>
                      <Button
                        className="mt-4 py-2 px-4 ltext-center bg-transparent text-sm lg:text-lg font-medium border-2 border-yellow text-primary hover:bg-yellow hover:text-black hover:font-bold rounded-full"
                        // onClick={() => handlePlanSelection(plan)}
                      >
                        Activate This Plan
                      </Button>
                    </div>
                  </div>
                  <div className="md:flex items-center justify-center mt-4 gap-2 mb-8 text-left">
                    <div>
                      <img
                        src={AvatarGroup}
                        alt="Avatar Group"
                        className="w-20 h-auto object-cover mt-4 rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-primary text-sm">
                      <p>Trusted By Over</p>
                      <p className="whitespace-nowrap font-semibold">
                        10K+
                        <span
                          className="text-yellowColor
                        ">
                          {" "}
                          Job Seekers!
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <PaymentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          data={selectedPlan}
        />
      </Elements>
      <div className="pb-16 px-[17%] text-center ">
        <PayAsYouGo />
      </div>
      <div className="pb-16 px-[17%] text-center ">
        <ConsultationJobAccelerator />
      </div>
    </>
  )
}

export default PricingSection
