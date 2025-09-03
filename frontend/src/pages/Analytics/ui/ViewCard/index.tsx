import React from "react"
import Button from "../../../../components/Button"
import LinkIcon from "../../../../assets/analytics/linkIcon.svg"
import { platformIcons } from "../.."

export type CardData = {
  icon: string
  title: string
  applyJobsCount: number
  jobDate: string
}

export function getCardData(
  jobActivities: {
    resumeId: string
    platformName: string
    totalNoOfAppliedJobs: number
  }[]
): CardData[] {
  const cardData: CardData[] = jobActivities.map((item) => {
    const foundPlatform = Object.entries(platformIcons).find(
      ([platform]) => platform.toLowerCase() === item.platformName.toLowerCase()
    )
    return {
      icon: foundPlatform?.[1] || platformIcons.LinkedIn,
      title: foundPlatform?.[0] || item.platformName,
      applyJobsCount: item.totalNoOfAppliedJobs,
      jobDate: "item.jobDate" // Store jobDate from API response
    }
  })
  return cardData
}

const ViewCard = ({ icon, title, applyJobsCount, onToggleTableVisibility }) => {
  return (
    <div className="border border-primary rounded-lg px-3 md:px-6 py-8 w-full">
      <div className="flex gap-5 items-center">
        <img src={icon} alt={`${title} icon`} loading="lazy" />
        <p className="text-2xl font-medium text-primary">{title}</p>
      </div>
      <div className="space-y-2 mt-5">
        {/* <div className="mt-10 flex  md:items-center gap-2 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <img src={userEmail.icon} alt="User Account" loading="lazy" />
            <p className="text-primary text-xs md:text-sm font-medium">
              User Account:
            </p>
          </div>
          <p className="text-primary text-sm md:text-base font-medium">
            {userEmail.email}
          </p>
        </div>
        <div className="mt-10 flex  md:items-center gap-2 pb-3">
          <div className="flex items-center gap-2">
            <img src={resume.icon} alt="Resume" loading="lazy" />
            <p className="text-primary text-xs md:text-sm font-medium">
              Resume Chosen:
            </p>
          </div>
          <p className="text-primary text-sm md:text-base font-medium">
            {resume.name}
          </p>
        </div> */}

        <div className="px-4 py-3 bg-analyticsBoxBackground rounded-lg text-center w-full">
          <p className="text-primary text-base md:text-lg whitespace-nowrap font-semibold">
            Total Applied
          </p>
          <p className="text-xl md:text-3xl font-medium md:font-semibold text-white">
            {applyJobsCount}
          </p>
        </div>

        {/* <div className="pt-7  gap-1 flex items-start">
          <img src={skill.icon} alt="Skill Search " loading="lazy" />
          <p className="text-primary text-sm md:text-sm whitespace-nowrap font-medium">
            Skill Search:
          </p>
          <p className="text-primary text-sm whitespace-nowrap font-bold">
            {skill.name}
          </p>
        </div> */}

        <div className="pt-5 w-full  items-center flex justify-center">
          <Button
            onClick={onToggleTableVisibility}
            className="flex items-center justify-center w-full gap-3 text-base font-semibold px-4 py-3 md:py-4 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-full hover:ring-2 hover:ring-gradientEnd">
            Check by links
            <img src={LinkIcon} alt="Link Icon" loading="lazy" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ViewCard
