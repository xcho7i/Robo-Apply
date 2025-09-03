"use client"

import React, { useState, useEffect, useRef } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import StepNavigation from "../../../components/common/StepNavigation"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

interface StepThirtyFiveProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: (stepMinus?: number) => void
}

const StepThirtyFive: React.FC<StepThirtyFiveProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Animation for Application Score and Card Values
  const [score, setScore] = useState(0)
  const [dailyApplications, setDailyApplications] = useState(0)
  const [cardValues, setCardValues] = useState({
    targetApplications: 0,
    tailoredResume: 0,
    coverLetters: 0,
    successScore: 0
  })
  const [isInView, setIsInView] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progress = useMotionValue(0)
  const width = useTransform(progress, (v) => `${v}%`)

  // Intersection Observer to detect when progress bar is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before the element is fully in view
      }
    )

    if (progressBarRef.current) {
      observer.observe(progressBarRef.current)
    }

    return () => {
      if (progressBarRef.current) {
        observer.unobserve(progressBarRef.current)
      }
    }
  }, [])

  // Animate card values and daily applications when component mounts
  useEffect(() => {
    // Animate the score number
    const scoreControls = animate(0, 7, {
      duration: 1.2,
      onUpdate(value) {
        setScore(Math.round(value))
      }
    })

    // Animate card values
    const targetAppsControls = animate(0, 20, {
      duration: 1.5,
      onUpdate(value) {
        setCardValues((prev) => ({
          ...prev,
          targetApplications: Math.round(value)
        }))
      }
    })

    const resumeControls = animate(0, 3, {
      duration: 1.3,
      onUpdate(value) {
        setCardValues((prev) => ({
          ...prev,
          tailoredResume: Math.round(value)
        }))
      }
    })

    const coverLettersControls = animate(0, 20, {
      duration: 1.4,
      onUpdate(value) {
        setCardValues((prev) => ({
          ...prev,
          coverLetters: Math.round(value)
        }))
      }
    })

    const successScoreControls = animate(0, 8, {
      duration: 1.1,
      onUpdate(value) {
        setCardValues((prev) => ({
          ...prev,
          successScore: Math.round(value)
        }))
      }
    })

    // Animate daily applications
    const dailyAppsControls = animate(0, 20, {
      duration: 1.6,
      onUpdate(value) {
        setDailyApplications(Math.round(value))
      }
    })

    return () => {
      scoreControls.stop()
      targetAppsControls.stop()
      resumeControls.stop()
      coverLettersControls.stop()
      successScoreControls.stop()
      dailyAppsControls.stop()
    }
  }, [])

  // Animate progress bar only when it comes into view
  useEffect(() => {
    if (isInView) {
      const progressControls = animate(progress, 70, { duration: 1.2 })

      return () => {
        progressControls.stop()
      }
    }
  }, [isInView, progress])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev
        // Add any step-specific data here if needed
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 35 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Data array for the information cards
  const cardData = [
    {
      id: 1,
      title: ["Target", "applications"],
      value: cardValues.targetApplications,
      icon: (
        <svg
          className="w-5 h-5 text-black"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 4a6 6 0 110 12 6 6 0 010-12zM10 6a4 4 0 100 8 4 4 0 000-8zM10 8a2 2 0 110 4 2 2 0 010-4z" />
        </svg>
      ),
      bgColor: "bg-white",
      textColor: "text-black",
      isSmallText: false
    },
    {
      id: 2,
      title: ["Tailored", "Resume"],
      value: cardValues.tailoredResume,
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      ),
      bgColor: "bg-purple-600",
      textColor: "text-white",
      isSmallText: false
    },
    {
      id: 3,
      title: ["Cover", "letters"],
      value: cardValues.coverLetters,
      icon: (
        <svg
          className="w-5 h-5 text-black"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      ),
      bgColor: "bg-brand-yellow",
      textColor: "text-black",
      isSmallText: false
    }
  ]

  // Data array for the bottom row cards
  const bottomCardData = [
    {
      id: 1,
      title: ["Time", "Commitment"],
      value: "Less than 30 min",
      icon: (
        <svg
          className="w-5 h-5 text-black"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: "bg-white",
      textColor: "text-black",
      isSmallText: true
    },
    {
      id: 2,
      title: ["Success score"],
      value: `${cardValues.successScore}/10`,
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: "bg-purple-600",
      textColor: "text-white",
      isSmallText: false
    }
  ]

  // Data array for goal tips
  const goalTips = [
    {
      id: 1,
      text: "Use your scores to optimize your process",
      icon: (
        <svg
          className="w-6 h-6 text-black"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      )
    },
    {
      id: 2,
      text: "Generate tailored resumes",
      icon: (
        <svg
          className="w-6 h-6 text-black"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      )
    },
    {
      id: 3,
      text: "Send at least 20 job applications daily",
      icon: (
        <svg
          className="w-6 h-6 text-black"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      )
    },
    {
      id: 4,
      text: "Apply to different job types",
      icon: (
        <svg
          className="w-6 h-6 text-black"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      )
    }
  ]

  // Data array for feature cards
  const featureCards = [
    {
      id: 1,
      title: "Automated resume tailoring",
      source: "Our Blog",
      link: " https://roboapply.co/roboapply-the-automated-job-application-platform/"
    },
    {
      id: 2,
      title: "One-click applications",
      source: "Our Blog",
      link: "https://roboapply.co/navigating-the-future-your-guide-to-the-ai-job-application-process/"
    },
    {
      id: 3,
      title: "Career advancement",
      source: "How to break into Tech",
      link: " https://www.youtube.com/watch?v=LmEGvzvhd2g"
    }
  ]

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <div className="w-full">
        <div className="max-w-3xl w-full mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 object-cover z-10 absolute inset-0 w-full h-full"
            />
            <div className="my-12 p-4 max-w-lg z-50 rounded-lg bg-black flex flex-col justify-center items-center gap-5 py-5">
              <div className="text-3xl font-bold text-center gap-2">
                <span className="text-center text-brand-yellow">
                  Congratulations!{" "}
                </span>
                <span className="text-center">your custom plan is ready</span>
              </div>
              <div className="flex flex-row gap-5 justify-center items-center">
                <div>
                  <img
                    src={"/images/Group 2085663803.png"}
                    alt="lines"
                    className="w-32"
                  />
                </div>
              </div>

              {/* Daily Task Section */}
              <div className="text-center space-y-2">
                <div className="text-white text-xl">your task today:</div>
                <div className="text-2xl font-bold text-brand-yellow">
                  <motion.span>{dailyApplications}</motion.span> Applications
                </div>
                <div className="text-white text-lg">Adjust anytime</div>
              </div>

              {/* Daily Recommendation Section */}
              <div className="text-center space-y-2 mt-4">
                <div className="text-white text-2xl font-bold">
                  Daily recommendation
                </div>
                <div className="text-white text-lg">Adjust anytime</div>
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md w-full mx-auto mt-8">
                {cardData.map((card) => (
                  <div
                    key={card.id}
                    className="border border-brand-yellow rounded-lg p-4 text-center">
                    <div
                      className={`w-8 h-8 mx-auto mb-2 ${card.bgColor} rounded-full flex items-center justify-center`}>
                      {card.icon}
                    </div>
                    {card.title.map((titleLine, index) => (
                      <div key={index} className="text-white text-sm">
                        {titleLine}
                      </div>
                    ))}
                    <div
                      className={`text-brand-yellow font-bold ${
                        card.isSmallText ? "text-sm" : "text-lg"
                      }`}>
                      <motion.span>{card.value}</motion.span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Row Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 w-full max-w-md mx-auto">
                {bottomCardData.map((card) => (
                  <div
                    key={card.id}
                    className="border border-brand-yellow w-full rounded-lg p-4 text-center">
                    <div
                      className={`w-8 h-8 mx-auto mb-2 ${card.bgColor} rounded flex items-center justify-center`}>
                      {card.icon}
                    </div>
                    {card.title.map((titleLine, index) => (
                      <div key={index} className="text-white text-sm">
                        {titleLine}
                      </div>
                    ))}
                    <div
                      className={`text-brand-yellow ${
                        card.isSmallText ? "text-sm" : "font-bold text-lg"
                      }`}>
                      <motion.span>{card.value}</motion.span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Application Score Section */}
              <div
                ref={progressBarRef}
                className="w-full max-w-md mx-auto mt-8">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-white text-lg">Application Score</div>
                  <div className="text-brand-yellow font-bold text-lg">
                    <motion.span>{score}</motion.span>/10
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    className="bg-brand-yellow h-3 rounded-full"
                    style={{ width }}
                  />
                </div>
              </div>

              {/* How to reach your goal Section */}
              <div className="w-full max-w-md mx-auto mt-8">
                <div className="text-white text-2xl font-bold text-center mb-6">
                  How to reach your goal:
                </div>

                <div className="space-y-4">
                  {goalTips.map((tip) => (
                    <div
                      key={tip.id}
                      className="flex items-center gap-4 border border-brand-yellow rounded-lg p-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        {tip.icon}
                      </div>
                      <div className="text-white text-sm">{tip.text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-white text-center text-lg mt-6 max-w-md mx-auto">
                Plan based on the following sources, among other peer-reviewed
                industry sources:
              </div>
              {/* Feature Cards Section */}
              <div className="w-full max-w-md mx-auto mt-8">
                <div className="space-y-4">
                  {featureCards.map((card) => (
                    <div
                      key={card.id}
                      className="border border-brand-yellow rounded-lg p-6 flex justify-between items-center cursor-pointer"
                      onClick={() => window.open(card.link, "_blank")}>
                      <div className="text-white text-lg font-medium">
                        <span className="underline cursor-pointer">
                          {card.title}
                        </span>
                      </div>
                      <div className="text-brand-yellow text-lg font-bold">
                        {card.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Text */}
            </div>
          </FormCardLayout>

          <div className="w-full flex justify-center mt-4">
            <StepNavigation
              currentStep={35}
              onNext={handleSubmit}
              onPrevious={() => onPreviousStep(2)}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default StepThirtyFive
