"use client"

import React, { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import styles from "./StepTwentyThree.module.css"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepTwentyThreeProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: () => void
}

const StepTwentyThree: React.FC<StepTwentyThreeProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carousel slides data
  const slides = [
    {
      image: "/images/slide-25-image.png",
      title: "Track everything you apply to —",
      highlight: "Automatically",
      description:
        "Track every job you apply to — with the resume used and status, all in one place.",
      imagePosition: "right"
    },
    {
      image: "/images/WhatsApp Image 2025-07-29 at 18.46.47.jpeg",
      title: "Browser extension integrated with top",
      highlight: "job platforms",
      description:
        "Use RoboApply's browser extension to auto-fill and apply on LinkedIn, Indeed, ZipRecruiter, Workday, and more — all without leaving the page.",
      imagePosition: "right"
    },
    {
      image: "/images/slide-23-image.png",
      title: "Automate your job search.",
      highlight: "Apply faster.",
      description:
        "Apply to thousands of jobs in minutes with RoboApply — tailored resumes, AI cover letters, and one-click tracking, all in one place.",
      imagePosition: "left"
    },
    {
      image: "/images/slide-24-image.png",
      title: "Create Bulk tailored resumes for every job —",
      highlight: "instantly",
      description:
        "RoboApply tailors your resume to each job — no edits needed. Show recruiters exactly what they're looking for.",
      imagePosition: "right"
    }
  ]

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev
        // Add any step-specific data here if needed
      }))
      onNextStep(4)
    } catch (err) {
      console.error("Step 23 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>

      <div className="w-full">
        <div className="flex flex-col items-center justify-center bg-brand-bgBlue-form max-w-5xl mx-auto p-5 mb-5 rounded-2xl shadow-2xl border-black border">
          <ProgressBar step={23} />
          <div>
            {/* <div className="text-2xl font-bold">
              You have great Potential to land  
              <span className="text-brand-yellow"> interview fast.</span>
            </div> */}
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <FormCardLayout>
            <img
              src="/images/lines.svg"
              alt="lines"
              className="opacity-60 absolute"
            />

            <div className="relative w-full">
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{
                  clickable: true,
                  dynamicBullets: false
                }}
                autoplay={{
                  delay: 1500,
                  disableOnInteraction: false
                  // pauseOnMouseEnter: true,
                }}
                loop={true}
                allowTouchMove={true}
                touchRatio={1}
                touchAngle={45}
                resistance={true}
                resistanceRatio={0.85}
                className={styles.onboardingSwiper}>
                {slides.map((slide, index) => (
                  <SwiperSlide key={index}>
                    <div className="w-full flex flex-col md:flex-row p-6 z-50 ">
                      {slide.imagePosition === "left" ? (
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                          <div className="w-full mt-10 md:w-1/2 flex items-center justify-center">
                            <img
                              src={slide.image}
                              alt="Icon"
                              className="-ml-10 scale-150 max-w-full h-auto object-cover"
                            />
                          </div>
                          <div className="w-full md:w-1/2 flex flex-col justify-center gap-5 p-5">
                            <div className="text-2xl text-white font-bold leading-tight break-words">
                              {slide.title}
                              <span className="text-brand-yellow">
                                {" "}
                                {slide.highlight}
                              </span>
                            </div>
                            <FormPara className="text-sm leading-relaxed break-words">
                              {slide.description}
                            </FormPara>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-full md:w-1/2 flex flex-col justify-center gap-5 p-5">
                            <div className="text-2xl text-white font-bold leading-tight break-words">
                              {slide.title}
                              <span className="text-brand-yellow">
                                {" "}
                                {slide.highlight}
                              </span>
                            </div>
                            <FormPara className="text-sm leading-relaxed break-words">
                              {slide.description}
                            </FormPara>
                          </div>
                          <div className="w-full md:w-1/2 flex items-center justify-center">
                            <img
                              src={slide.image}
                              alt="Icon"
                              className={`max-w-full h-auto object-cover ${
                                slide.image ===
                                "/images/WhatsApp Image 2025-07-29 at 18.46.47.jpeg"
                                  ? "rounded-lg w-[300px] sm:w-[350px] mt-10"
                                  : slide.image === "/images/slide-24-image.png"
                                  ? "scale-[1.3] sm:scale-125 mt-12"
                                  : "scale-110 mt-10"
                              }`}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </FormCardLayout>

          <div className="w-full flex justify-center mt-4">
            <StepNavigation
              currentStep={23}
              onNext={handleSubmit}
              onPrevious={onPreviousStep}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default StepTwentyThree
