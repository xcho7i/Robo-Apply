"use client"

import React, { useEffect, useState } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import { BsFillLightbulbFill } from "react-icons/bs"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepThreeProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: () => void
}

const OPTIONS = [
  {
    key: "active",
    icon: (
      <svg
        width="58"
        height="60"
        viewBox="0 0 58 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <rect
          x="3.36084"
          y="47.4397"
          width="50.4973"
          height="11.8743"
          rx="0.5"
          fill="white"
          stroke="white"
        />
        <path
          d="M35.6281 46.6409L34.9551 35.3953"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M24.3328 31.7143C30.3996 37.0959 39.6804 36.5405 45.0621 30.4736C50.4437 24.4068 49.8883 15.126 43.8214 9.74433C37.7546 4.36268 28.4737 4.91815 23.0921 10.985C17.7105 17.0518 18.2659 26.3327 24.3328 31.7143Z"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10.7285 27.4131C11.5846 27.4131 12.3026 27.7009 12.9092 28.2832C13.5149 28.8648 13.8057 29.5438 13.8047 30.3457V40.1455H10.2285V52.1611H4.07617V40.1455H0.5V30.3457C0.500099 29.5423 0.791891 28.8636 1.39746 28.2832C1.92843 27.7744 2.5441 27.4904 3.2627 27.4268L3.57715 27.4131H10.7285ZM7.15332 18.8301C8.00582 18.8281 8.72375 19.1153 9.33301 19.7002C9.94155 20.2845 10.2316 20.9634 10.2285 21.7617C10.2254 22.5629 9.93394 23.2442 9.33105 23.8301C8.73067 24.4134 8.01427 24.7003 7.1543 24.6963H7.15234C6.29599 24.6963 5.57882 24.4091 4.97363 23.8281C4.36914 23.2478 4.07721 22.568 4.07617 21.7627C4.07516 20.9585 4.36659 20.2801 4.97266 19.7012C5.58092 19.1202 6.29909 18.8321 7.15332 18.8301Z"
          fill="white"
          stroke="white"
        />
      </svg>
    ),
    iconBg: "bg-[#8359FF9E]",
    title: "Active Job Seeker",
    desc: "I am actively looking for new opportunities and want to find a role within the next six months."
  },
  {
    key: "passive",
    icon: <BsFillLightbulbFill size={36} className="text-white" />,
    iconBg: "bg-brand-purple",
    title: "Passive Job Seeker",
    desc: "I am passively browsing opportunities that can take me to the next level, upskills me, or offers an interesting career transition."
  },
  {
    key: "not",
    icon: (
      <svg
        width="54"
        height="58"
        viewBox="0 0 54 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M28.1678 56.5216L28.1359 56.5269L27.9471 56.62L27.894 56.6306L27.8567 56.62L27.6679 56.5242C27.6396 56.5172 27.6183 56.5225 27.6041 56.5402L27.5935 56.5668L27.5483 57.7048L27.5616 57.7579L27.5882 57.7925L27.8647 57.9893L27.9046 57.9999L27.9365 57.9893L28.213 57.7925L28.2449 57.75L28.2556 57.7048L28.2104 56.5694C28.2033 56.5411 28.1891 56.5251 28.1678 56.5216ZM28.8697 56.2211L28.8325 56.2264L28.3433 56.4737L28.3167 56.5003L28.3087 56.5296L28.3566 57.6729L28.3699 57.7048L28.3912 57.726L28.9256 57.9707C28.9593 57.9795 28.985 57.9724 29.0027 57.9494L29.0133 57.9122L28.9229 56.2796C28.9141 56.2459 28.8963 56.2265 28.8697 56.2211ZM26.9687 56.2264C26.957 56.2193 26.9429 56.217 26.9296 56.22C26.9162 56.223 26.9045 56.231 26.8969 56.2424L26.8809 56.2796L26.7905 57.9122C26.7923 57.9441 26.8074 57.9653 26.8357 57.976L26.8756 57.9707L27.41 57.7234L27.4366 57.7021L27.4446 57.6729L27.4925 56.5296L27.4845 56.4977L27.4579 56.4711L26.9687 56.2264Z"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M26.5885 0C41.2734 0 53.1771 11.9037 53.1771 26.5885C53.1862 32.7248 51.0641 38.6739 47.1734 43.419L47.2265 43.4775L46.8756 43.7753C44.3819 46.7243 41.2747 49.0935 37.7707 50.7173C34.2667 52.3412 30.4505 53.1806 26.5885 53.177C18.7449 53.177 11.699 49.7817 6.83328 44.3842L6.3015 43.7727L5.95054 43.4802L6.00371 43.4164C2.11356 38.6719 -0.00851452 32.7239 2.56768e-05 26.5885C2.56768e-05 11.9037 11.9037 0 26.5885 0ZM26.5885 39.8828C21.6431 39.8828 17.1735 41.4568 13.8447 43.6211C17.5208 46.3782 21.9934 47.8657 26.5885 47.8593C31.1837 47.8657 35.6563 46.3782 39.3324 43.6211C35.5284 41.1841 31.1063 39.8869 26.5885 39.8828ZM26.5885 5.3177C22.5857 5.31759 18.6641 6.44696 15.2744 8.57599C11.8847 10.705 9.16457 13.7473 7.42662 17.3532C5.68868 20.959 5.00346 24.9821 5.44974 28.96C5.89602 32.9379 7.45568 36.7091 9.94945 39.8402C14.2594 36.748 20.1408 34.5651 26.5885 34.5651C33.0363 34.5651 38.9176 36.748 43.2276 39.8402C45.7214 36.7091 47.2811 32.9379 47.7273 28.96C48.1736 24.9821 47.4884 20.959 45.7505 17.3532C44.0125 13.7473 41.2924 10.705 37.9027 8.57599C34.513 6.44696 30.5914 5.31759 26.5885 5.3177ZM26.5885 10.6354C29.4092 10.6354 32.1144 11.7559 34.1089 13.7504C36.1034 15.745 37.2239 18.4501 37.2239 21.2708C37.2239 24.0915 36.1034 26.7967 34.1089 28.7912C32.1144 30.7857 29.4092 31.9062 26.5885 31.9062C23.7679 31.9062 21.0627 30.7857 19.0682 28.7912C17.0736 26.7967 15.9531 24.0915 15.9531 21.2708C15.9531 18.4501 17.0736 15.745 19.0682 13.7504C21.0627 11.7559 23.7679 10.6354 26.5885 10.6354ZM26.5885 15.9531C25.1782 15.9531 23.8256 16.5134 22.8284 17.5106C21.8311 18.5079 21.2708 19.8605 21.2708 21.2708C21.2708 22.6812 21.8311 24.0337 22.8284 25.031C23.8256 26.0283 25.1782 26.5885 26.5885 26.5885C27.9989 26.5885 29.3515 26.0283 30.3487 25.031C31.346 24.0337 31.9062 22.6812 31.9062 21.2708C31.9062 19.8605 31.346 18.5079 30.3487 17.5106C29.3515 16.5134 27.9989 15.9531 26.5885 15.9531Z"
          fill="white"
        />
        <line
          x1="15.3627"
          y1="4.1115"
          x2="41.1632"
          y2="42.8044"
          stroke="white"
          stroke-width="7"
        />
      </svg>
    ),
    iconBg: "bg-brand-yellow",
    title: "Not a Job Seeker",
    desc: "I am currently not seeking new opportunities but would like to take advantage of career enhancing features such as resume score and Interview guide."
  }
]

const StepThree: React.FC<StepThreeProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [selected, setSelected] = useState<string | null>(
    onboardingData.jobSearchStatus || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setSelected(onboardingData.jobSearchStatus || null)
  }, [onboardingData.jobSearchStatus])

  const handleSelect = (key: string) => {
    setSelected(key)
    setError("") // clear error
    setOnboardingData((prev: any) => ({
      ...prev,
      jobSearchStatus: key
    }))
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onNextStep(2)
    }, 300)
  }

  const handleSubmit = async () => {
    if (!selected) {
      setError("Please select one option to proceed.")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onNextStep(2)
    }, 300)
  }

  return (
    <div className="mb-10 md:mb-0">
      <div className="w-full max-w-2xl mx-auto  flex flex-col items-center">
        {/* <FormHeading
          purpleText="Where"
          whiteText="are you in"
          yellowText="your job search?*"
          className="text-center mb-2"
        /> */}
        <div className="w-full mb-4">
          <ProgressBar step={3} />
        </div>
        <div className=" text-2xl sm:text-3xl md:text-4xl font-semibold mb-6">
          <span className="text-brand-purple">Where</span>
          <span className="text-white"> are you in </span>
          <span className="text-brand-yellow">your job</span>
          <span className="text-white"> search?</span>
          <span className="text-brand-yellow">*</span>
        </div>
        <FormPara className="text-center text-base mb-6">
          <span className="text-brand-yellow font-semibold">Note:</span> Your
          selection will not affect your platform experience and is for
          informational purposes only.
        </FormPara>
        <div className="flex flex-wrap lg:flex-nowrap gap-2 lg:gap-3 w-full mb-4 justify-center items-center">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSelect(opt.title)}
              className={`flex-1 h-[400px] min-w-[200px] max-w-[300px] sm:max-w-[240px] w-[200px] lg:w-[240px] rounded-2xl transition-all duration-200 p-3 border hover:border-2  bg-brand-bgBlue-form  flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-yellow/60
                ${
                  selected === opt.title
                    ? "border-yellow-500 border-2 shadow-lg "
                    : "border-transparent hover:border-brand-purple border-white"
                }
              `}>
              <div
                className={`my-4  flex items-center justify-center h-20 w-20 rounded-xl ${opt.iconBg}`}>
                {opt.icon}
              </div>
              <div
                className={`font-semibold text-lg mb-2 ${
                  opt.key === "not" ? "text-brand-yellow" : "text-brand-yellow"
                }`}>
                {opt.title}
              </div>
              <div className="text-white text-sm md:text-base opacity-80">
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
        <div className="flex w-full justify-end">
          <StepNavigation
            currentStep={3}
            onNext={handleSubmit}
            onPrevious={onPreviousStep}
            disabled={isSubmitting || !selected}
          />
        </div>
      </div>
    </div>
  )
}

export default StepThree
