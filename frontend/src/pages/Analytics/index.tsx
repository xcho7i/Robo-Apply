import React, { useEffect, useState } from "react"
import DashBoardLayout from "../../dashboardLayout"
import Button from "../../components/Button"
import SessionDiv from "./SessionDiv"
import PlatFormDiv from "./PlatFormDiv"
import linkedinPic from "../../assets/dashboardIcons/linkedinImage.svg"
import IndeedPic from "../../assets/dashboardIcons/indeedImage.svg"
import glassPic from "../../assets/dashboardIcons/glassdoorImage.svg"
import zipPic from "../../assets/dashboardIcons/ziprecruiterImage.svg"
import monsterPic from "../../assets/dashboardIcons/monsterImage.svg"
import SimplyPic from "../../assets/dashboardIcons/simplyHiredImage.svg"
import { useTour,aiAnalytics } from "@/src/stores/tours"

// Platform icon mapping
export const platformIcons = {
  LinkedIn: linkedinPic,
  Indeed: IndeedPic,
  Glassdoor: glassPic,
  Dice: glassPic, // Using glassPic as fallback
  ZipRecruiter: zipPic,
  Monster: monsterPic,
  SimplyHired: SimplyPic
}

const Analytics = () => {
  const [activeComponent, setActiveComponent] = useState("session")
      const { startModuleTourIfEligible } = useTour()
  useEffect(() => {
    startModuleTourIfEligible("analytics", aiAnalytics, { showWelcome: false })
  }, [startModuleTourIfEligible])

  return (
    <DashBoardLayout>
      <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full">
          <div className="text-center space-y-3 pt-5 md:pt-10 px-5 pb-5">
            <p className="text-3xl font-normal text-primary">Analytics</p>
            {/* <p className="text-sm md:text-xl font-normal text-primary">
              Create your personalized cover letter for job applications,
              powered AI technology—fast and free!
            </p> */}
          </div>
          <hr className="border-t-2 border-simplePurple mb-5 w-[40%] mx-auto" />
          <div className="px-5 md:px-10 py-5">
            <div className="border border-primary rounded-lg px-5 py-4 flex items-center justify-between gap-5">
              <div className="w-full" data-tour="ai-analytics-sessionDetailsBtn">
              <Button
                onClick={() => setActiveComponent("session")}
                className={`py-4 flex items-center   space-x-2 w-full justify-center text-xs md:text-xl whitespace-nowrap font-semibold rounded-lg ${
                  activeComponent === "session"
                    ? "bg-gradient-to-b from-gradientStart to-gradientEnd text-white"
                    : "bg-none text-primary border border-primary"
                }`}>
                Session Details
              </Button></div>
              <div className="w-full" data-tour="ai-analytics-checkPlatform">
              <Button
                onClick={() => setActiveComponent("platform")}
                className={`py-4 flex items-center  space-x-2 w-full justify-center text-xs md:text-xl whitespace-nowrap font-semibold rounded-lg ${
                  activeComponent === "platform"
                    ? "bg-gradient-to-b  from-gradientStart to-gradientEnd text-white"
                    : "bg-none text-primary border border-primary "
                }`}>
                Check By Platform
              </Button>
              </div>
            </div>

            <div className="py-5 md:py-10">
              {/* Conditionally render the components based on activeComponent */}
              {activeComponent === "session" && <SessionDiv />}
              {activeComponent === "platform" && <PlatFormDiv />}
            </div>
          </div>
        </div>
      </div>
    </DashBoardLayout>
  )
}

export default Analytics
