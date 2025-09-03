import { AiOutlineSetting } from "react-icons/ai"
import React, { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import dashboardIcon from "../assets/dashboardIcons/dashboardIcon.svg"
import profileIcon from "../assets/dashboardIcons/profileIcon.svg"
import analyticsIcon from "../assets/dashboardIcons/AnalyticsIcon.svg"
import coverletterIcon from "../assets/dashboardIcons/coverLetterIcon.svg"
import resumeScoreIcon from "../assets/dashboardIcons/resumeScoreIcon.svg"
import interviewGuide from "../assets/dashboardIcons/interviewGuide.svg"
import LiveInterview from "../assets/dashboardIcons/LiveInterview.svg"
import AddYourPosition from "../assets/dashboardIcons/AddYourPosition.svg"
import AddYourResume from "../assets/dashboardIcons/AddYourResume.svg"
import AIInterviewCopilot from "../assets/dashboardIcons/AIInterviewCopilot.svg"
import aiscore from "../assets/dashboardIcons/aiscore.svg"
import sidebarContactUs from "../assets/logo.svg"
import { VscLayoutSidebarRight } from "react-icons/vsc"
import { VscLayoutSidebarLeft } from "react-icons/vsc"
import { RiContactsBookFill, RiLogoutBoxRLine } from "react-icons/ri"
import { FaEnvelope } from "react-icons/fa6"
import { MdWifiCalling3 } from "react-icons/md"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "antd"
import { useSubscriptionStore } from "../stores/subscription"
import { useTour,settings } from "../stores/tours" // Import the tour store
 
import CommingSoonModal from "../components/Modals/CommingSoonModal/index"

const DashboardSidebar = () => {
  const location = useLocation()
  const dropdownTriggerRef = useRef<HTMLDivElement>(null)
 
  // Tour integration - but we won't auto-expand dropdown
  const { started, currentIndex, steps } = useTour()
 
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      JSON.parse(localStorage.getItem("isSidebarCollapsed") || "false") || false
  )
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [isCopilotVisible, setIsCopilotVisible] = useState(() =>
    ["/live-interview", "/add-your-resume", "/add-your-position"].some((path) =>
      location.pathname.startsWith(path)
    )
  )

  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false)
  const [isHoverDropdownOpen, setIsHoverDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 88 })

//     const { startModuleTourIfEligible } = useTour()
// useEffect(() => {
//   startModuleTourIfEligible("settings", settings, { showWelcome: false })
// }, [startModuleTourIfEligible])
 
  // Remove the auto-expand effect - let user manually control dropdown
  // The tour will skip dropdown items if they're not visible
 
  useEffect(() => {
    if (isHoverDropdownOpen && dropdownTriggerRef.current) {
      const rect = dropdownTriggerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.top,
        left: rect.right + 8
      })
    }
  }, [isHoverDropdownOpen])
 
  const currentPlan =
    useSubscriptionStore(
      (state) => state?.subscription?.subscription?.planName
    ) || "Free"
 
  useEffect(() => {
    localStorage.setItem(
      "isSidebarCollapsed",
      JSON.stringify(isSidebarCollapsed)
    )
  }, [isSidebarCollapsed])
 
  useEffect(() => {
    const aiResumeRoutes = [
      "/ai-bulk-resume-generator",
      "/ai-single-resume-generator", 
      "/initialize-resume-generation"
    ]
    // Keep this logic for route-based dropdown opening (not tour-based)
    if (aiResumeRoutes.some((route) => location.pathname.startsWith(route))) {
      setIsAIDropdownOpen(true)
    }
  }, [location.pathname])
 
  const isActive = (paths) =>
    paths.some((path) => {
      const normalizedPath = `/${path.replace(/^\/+/, "")}`
      return (
        location.pathname === normalizedPath ||
        location.pathname.startsWith(`${normalizedPath}/`)
      )
    })
 

  const handleCopilotClick = () => {
    setIsCopilotVisible((prev) => !prev) // toggle visibility
  }

  const isCopilotRouteActive = isActive([
    "/live-interview",
    "/add-your-resume",
    "/add-your-position"
  ])

  const styles = {
    active:
      "text-primary px-3 py-3 w-48 rounded-lg bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] font-semibold",
    inactive:
      "text-primary px-3 py-3 w-48 rounded-lg hover:bg-gray-700 hover:text-purple-300 font-normal"
  }
 
  // Normal dropdown toggle behavior - no tour interference
  const handleDropdownToggle = () => {
    setIsAIDropdownOpen(!isAIDropdownOpen)
  }
 
  const plans = ["Free", "Basic", "Standard", "Premium", "Enterprise"]
  const currentPlanLower = currentPlan.split(/Plan/i)[0]?.toLowerCase()?.trim()
  const currentIndexs = plans.findIndex((plan) =>
    plan.toLowerCase().includes(currentPlanLower)
  )
  let nextPlan = plans[currentIndexs + 1]?.split(" ")[0]
  if (currentIndexs === -1 && currentPlan.includes("Unlimited")) {
    nextPlan = "Enterprise"
  } else if (currentIndexs === -1) {
    nextPlan = "Basic"
  } else if (currentIndex === plans.length - 1) {
    nextPlan = "Enterprise"
  }
 
  return (
    <aside
      data-tour="sidebar"
      className={`h-full flex flex-col pb-14 ${
        isSidebarCollapsed ? "w-20" : "w-64"
      } p-4 space-y-10 bg-almostBlack border-t-dashboardborderColor border-r-dashboardborderColor border border-l-0 border-b-0 transition-width duration-300`}
    >
      <nav className="flex flex-col space-y-2 ">
        <button
          className="text-primary focus:outline-none flex justify-end mr-3.5"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
          {isSidebarCollapsed ? (
            <VscLayoutSidebarLeft className="w-6 h-6" />
          ) : (
            <VscLayoutSidebarRight className="w-6 h-6" />
          )}
        </button>
 
        {/* ⬇️ TOUR HOOK: AutoApply link gets data-tour so the spotlight can attach */}

        {showComingSoon && (
          <CommingSoonModal
            isOpen={showComingSoon}
            onClose={() => setShowComingSoon(false)}
          />
        )}

        <Link
          to="/auto-apply"
          data-tour="nav-autoapply"
          className={`flex items-center w-10 ${
            isActive(["/auto-apply"])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <img
            src={dashboardIcon}
            className="w-5 h-5"
            alt="AutoApply"
            loading="lazy"
          />
          {!isSidebarCollapsed && <span className="ml-2">AutoApply</span>}
        </Link>
 
        <Link
          to="/resume-manager"
          data-tour="nav-resume-manager"
          className={`flex items-center w-10 ${
            isActive(["/resume-manager"])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <img
            src={profileIcon}
            className="w-5 h-5"
            alt="Resume Manager"
            loading="lazy"
          />
          {!isSidebarCollapsed && <span className="ml-2">Resume Manager</span>}
        </Link>
 
        {/* AI Tailored Apply - Dropdown */}
        <div className="relative">
          {isSidebarCollapsed ? (
            <div
              className="relative group"
              onMouseEnter={() => setIsHoverDropdownOpen(true)}
              onMouseLeave={() => setIsHoverDropdownOpen(false)}>
              <div
                ref={dropdownTriggerRef}
                className={`flex items-center cursor-pointer ${
                  isActive([
                    "/ai-bulk-resume-generator",
                    "/ai-single-resume-generator",
                    "/initialize-resume-generation"
                  ])
                    ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full w-10"
                    : "hover:bg-gray-700 p-3 rounded-full w-10"
                }`}>
                <img
                  src={profileIcon}
                  className="w-5 h-5 !mr-0"
                  alt="AI Tailored Apply"
                  loading="lazy"
                />
              </div>
 
              {isHoverDropdownOpen && (
                <div
                  className="fixed bg-gray-800 rounded-lg shadow-lg py-2 min-w-[220px]"
                  style={{
                    zIndex: 9999,
                    left: `${dropdownPosition.left}px`,
                    top: `${dropdownPosition.top}px`
                  }}
                  onMouseEnter={() => setIsHoverDropdownOpen(true)}
                  onMouseLeave={() => setIsHoverDropdownOpen(false)}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-600 mb-1">
                    AI Tailored Apply
                  </div>
                  <Link
                    data-tour="nav-aitailored-dashboard"
                    to="/initialize-resume-generation"
                    className={`block px-3 py-2 text-sm transition-colors ${
                      isActive(["/initialize-resume-generation"])
                        ? "bg-gray-700 text-white"
                        : "text-primary hover:bg-gray-700 hover:text-purple-300"
                    }`}>
                    Dashboard
                  </Link>
                  <Link
                    data-tour="nav-aitailored-single"
                    to="/ai-single-resume-generator"
                    className={`block px-3 py-2 text-sm transition-colors ${
                      isActive(["/ai-single-resume-generator"])
                        ? "bg-gray-700 text-white"
                        : "text-primary hover:bg-gray-700 hover:text-purple-300"
                    }`}>
                    Single Tailored Resume
                  </Link>
                  <Link
                    data-tour="nav-aitailored-bulk"
                    to="/ai-bulk-resume-generator"
                    className={`block px-3 py-2 text-sm transition-colors ${
                      isActive(["/ai-bulk-resume-generator"])
                        ? "bg-gray-700 text-white"
                        : "text-primary hover:bg-gray-700 hover:text-purple-300"
                    }`}>
                    Bulk Tailored Resume
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                data-tour="nav-aitailored"
                onClick={handleDropdownToggle}
                className={`flex items-center w-full relative ${
                  isActive([
                    "/ai-bulk-resume-generator",
                    "/ai-single-resume-generator",
                    "/initialize-resume-generation"
                  ])
                    ? styles.active
                    : styles.inactive
                }`}>
                <img
                  src={profileIcon}
                  className="w-5 h-5"
                  alt="AI Tailored Apply"
                  loading="lazy"
                />
                <span className="!ml-2">AI Tailored Apply</span>
                <span className="absolute right-3">
                  {isAIDropdownOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              </button>
 
              {isAIDropdownOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  <Link
                    data-tour="nav-aitailored-dashboard"
                    onClick={() => setIsAIDropdownOpen(false)}
                    to="/initialize-resume-generation"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(["/initialize-resume-generation"])
                        ? "bg-gradient-to-r from-[#AF63FB] to-[#8C20F8] text-white"
                        : "text-primary hover:bg-gray-700 hover:text-purple-300"
                    }`}>
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    data-tour="nav-aitailored-single"
                    onClick={() => setIsAIDropdownOpen(false)}
                    to="/ai-single-resume-generator"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(["/ai-single-resume-generator"])
                        ? "bg-gradient-to-r from-[#AF63FB] to-[#8C20F8] text-white"
                        : "text-primary hover:bg-gray-700 hover:text-purple-300"
                    }`}>
                    <span>Single Tailored Resume</span>
                  </Link>
                  <Link
                    data-tour="nav-aitailored-bulk"
                    to="/ai-bulk-resume-generator"
                    onClick={() => setIsAIDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(["/ai-bulk-resume-generator"])
                        ? "bg-gradient-to-r from-[#AF63FB] to-[#8C20F8] text-white"
                        : "text-primary hover:bg-gray-700 hover:text-purple-300"
                    }`}>
                    <span>Bulk Tailored Resume</span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
 
        <Link
          data-tour="ai-res-builder-resumeNav"
          to="/scan-resume/main-ResumeBuilder"
          className={`flex items-center w-10 ${
            isActive(["/scan-resume"])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <img
            src={resumeScoreIcon}
            className="w-5 h-5"
            alt="Resume Score"
            loading="lazy"
          />
          {!isSidebarCollapsed && (
            <span className="ml-2">AI Resume Builder</span>
          )}
        </Link>
 
        <Link
          data-tour="ai-coverletter-cvrLtrHeading"
          to="/main-coverletter"
          className={`flex items-center w-10 ${
            isActive([
              "/main-coverletter",
              "/coverletter",
              "/dashboard-cover",
              "/show-cover-letter"
            ])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <img
            src={coverletterIcon}
            className="w-5 h-5"
            alt="AI Cover Letter"
            loading="lazy"
          />
          {!isSidebarCollapsed && <span className="ml-2">AI Cover Letter</span>}
        </Link>
 
        <Link
          data-tour="ai-scan-heading"
          to="/scan"
          className={`flex items-center w-10 ${
            isActive(["/scan", "/scan-Main"])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <img
            src={aiscore}
            className="w-5 h-5"
            alt="AI Resume Score"
            loading="lazy"
          />
          {!isSidebarCollapsed && <span className="ml-2">AI Resume Score</span>}
        </Link>
 
        <Link
          data-tour="ai-interviewGuid-interviewHeading"
          to="/main-interview-Guide"
          className={`flex items-center w-10 ${
            isActive(["/interview-Guide", "/main-interview-Guide"])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <img
            src={interviewGuide}
            className="w-5 h-5"
            alt="Interview Guide"
            loading="lazy"
          />
          {!isSidebarCollapsed && (
            <span className="ml-2">AI Interview Guide</span>
          )}
        </Link>
 

        <button
         data-tour="ai-copilot-nav"
          onClick={() => setShowComingSoon(true)}
          className={`${
            isCopilotVisible || isCopilotRouteActive ? "bg-gray-700" : ""
          } flex items-center p-3 rounded-lg`}>
          <img
            src={AIInterviewCopilot}
            className="w-5 h-5"
            alt="AI Interview Copilot"
            loading="lazy"
          />
          {!isSidebarCollapsed && (
            <span className="ml-2">AI Interview Copilot</span>
          )}
        </button>

        {/* <Link
          to="/live-interview"
          onClick={handleCopilotClick} // ensure submenu opens
          className={`${
            isCopilotVisible || isCopilotRouteActive ? "bg-gray-700" : ""
          } flex items-center p-3 rounded-lg`}>
          <img
            src={AIInterviewCopilot}
            className="w-5 h-5"
            alt="AI Interview Copilot"
            loading="lazy"
          />
          {!isSidebarCollapsed && <span className="ml-2">AI Interview Copilot</span>}
        </Link> */}

        {isCopilotVisible ? (
          <div className="border-l-2 border-[#676767] p-4">
            <Link
              to="/live-interview"
              className={`flex items-center w-10 ${
                isActive(["/live-interview"])
                  ? isSidebarCollapsed
                    ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                    : styles.active
                  : isSidebarCollapsed
                  ? "hover:bg-gray-700 p-3 rounded-full"
                  : styles.inactive
              }`}>
              <img
                src={LiveInterview}
                className="w-5 h-5"
                alt="Interview Guide"
                loading="lazy"
              />
              {!isSidebarCollapsed && (
                <span className="ml-2">Live Interview</span>
              )}
            </Link>

            <Link
              to="/add-your-resume"
              className={`flex items-center w-10 ${
                isActive(["/add-your-resume"])
                  ? isSidebarCollapsed
                    ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                    : styles.active
                  : isSidebarCollapsed
                  ? "hover:bg-gray-700 p-3 rounded-full"
                  : styles.inactive
              }`}>
              <img
                src={AddYourResume}
                className="w-5 h-5"
                alt="Interview Guide"
                loading="lazy"
              />
              {!isSidebarCollapsed && (
                <span className="ml-2">Add Your Resume</span>
              )}
            </Link>

            <Link
              to="/add-your-position"
              className={`flex items-center w-10 ${
                isActive(["/add-your-position"])
                  ? isSidebarCollapsed
                    ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                    : styles.active
                  : isSidebarCollapsed
                  ? "hover:bg-gray-700 p-3 rounded-full"
                  : styles.inactive
              }`}>
              <img
                src={AddYourPosition}
                className="w-5 h-5"
                alt="Interview Guide"
                loading="lazy"
              />
              {!isSidebarCollapsed && (
                <span className="ml-2">Add Your Position</span>
              )}
            </Link>
          </div>
        ) : (
          <></>
        )}

        <Link
          data-tour="ai-analytics-sessionDetails"
          to="/analytics"
          className={`flex items-center w-10 ${
            isActive(["/analytics"])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <img
            src={analyticsIcon}
            className="w-5 h-5"
            alt="Analytics"
            loading="lazy"
          />
          {!isSidebarCollapsed && <span className="ml-2">Analytics</span>}
        </Link>
 
        {!isSidebarCollapsed && <span className="!mt-6">Other Menu</span>}
        <Link
          data-tour="ai-settings-UpgradePlan"
          to="/billing"
          className={`flex items-center w-10 ${
            isActive(["/billing"])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <AiOutlineSetting />
          {!isSidebarCollapsed && <span className="ml-2">Settings</span>}
        </Link>
 
        <Link
          onClick={() => localStorage.removeItem("access_token")}
          to="/"
          className={`flex items-center w-10 ${
            isActive(["/"])
              ? isSidebarCollapsed
                ? "bg-gradient-to-b from-[#AF63FB] to-[#8C20F8] p-3 rounded-full"
                : styles.active
              : isSidebarCollapsed
              ? "hover:bg-gray-700 p-3 rounded-full"
              : styles.inactive
          }`}>
          <RiLogoutBoxRLine />
          {!isSidebarCollapsed && <span className="ml-2">Logout</span>}
        </Link>
      </nav>
 
      {!isSidebarCollapsed && (
        <div
          className={`w-full py-3 px-6 bg-[url("/src/assets/upgrade-card.png")] bg-cover bg-no-repeat rounded-xl `}>
          <img
            src={sidebarContactUs}
            className="w-full h-auto bg-white rounded-lg p-2 scale-90"
            alt="Contact"
            loading="lazy"
          />
          <div className="text-primary flex flex-col justify-end items-center space-y-2">
            <h2 className="text-lg text-nowrap font-extrabold">
              Upgrade to {nextPlan}
            </h2>
            <p className="text-center text-sm font-semibold">
              Get access to all features on Unlock Full Potential with RoboApply
            </p>
            <Link type="button" to={"/billing"}>
              <Button className="px-6 font-semibold" color="default" variant="solid">
                Get {nextPlan}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}
 
export default DashboardSidebar
 
