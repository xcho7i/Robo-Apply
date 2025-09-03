import React, { useState, useEffect, useRef } from "react"
import logo from "../assets/logo.svg"
import profilePic from "../assets/profilePic.svg"
import { HiDotsVertical } from "react-icons/hi"
import { MdManageAccounts } from "react-icons/md"
import { RiLogoutBoxRLine } from "react-icons/ri"
import dashboardIcon from "../assets/dashboardIcons/dashboardIcon.svg"
import profileIcon from "../assets/dashboardIcons/profileIcon.svg"
import analyticsIcon from "../assets/dashboardIcons/AnalyticsIcon.svg"
import coverletterIcon from "../assets/dashboardIcons/coverLetterIcon.svg"
import resumeScoreIcon from "../assets/dashboardIcons/resumeScoreIcon.svg"
import interviewGuide from "../assets/dashboardIcons/interviewGuide.svg"
import aiscore from "../assets/dashboardIcons/aiscore.svg"
import { GiMoneyStack } from "react-icons/gi"
import { FaQuestionCircle } from "react-icons/fa"
import { FaRegMoneyBillAlt } from "react-icons/fa"
import { GiTwoCoins } from "react-icons/gi"
import { ChevronDown, ChevronRight } from "lucide-react"

import { IoIosNotificationsOutline } from "react-icons/io"
import { Link, useLocation } from "react-router-dom"
import Button from "../components/Button"
import { useSubscriptionStore } from "../stores/subscription"
import OnboardingChecklist from "@/src/components/tour/OnboardingChecklist"
import { useCredits } from "../contexts/CreditsContext"

const DashboardNavbar = () => {
  const location = useLocation()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [notification, setNotification] = useState(true)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false)

  const credits = useSubscriptionStore((state) => state.remainingCredits)
  const creditsLoading = useSubscriptionStore(
    (state) => state.loadingSubscription
  )

  /**
   Helper function to check if a route is active
   */
  const isActive = (paths) =>
    paths.some((path) => {
      const normalizedPath = `/${path.replace(/^\/+/, "")}` // Ensure path starts with a single '/'
      return (
        location.pathname === normalizedPath ||
        location.pathname.startsWith(`${normalizedPath}/`)
      )
    })

  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLDivElement>(null)

  const menuRefSmallScreen = useRef<HTMLDivElement>(null)
  const menuButtonRefSmallScreen = useRef<HTMLDivElement>(null)

  const notificationRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLDivElement>(null)

  const notificationRefSmallScreen = useRef<HTMLDivElement>(null)
  const notificationButtonRefSmallScreen = useRef<HTMLDivElement>(null)

  // Load user data from localStorage
  const loadUserData = () => {
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
    if (userData && userData?.firstName) {
      const firstLastName =
        userData.firstName && userData.lastName
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : ""

      setFullName(firstLastName || userData.fullName || "User")
      setEmail(userData.email || "")
      setImageUrl(userData.imageUrl || profilePic)
    }
  }

  useEffect(() => {
    loadUserData() // On mount

    const handleUserDataUpdate = () => {
      loadUserData() // On custom update event
    }

    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        !event.target.closest("#hamburger-menu") &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !menuButtonRef.current?.contains(event.target)
      ) {
        setMenuOpen(false)
      }
      if (
        menuOpen &&
        event.target.closest("#hamburger-menu") &&
        menuRefSmallScreen.current &&
        !menuRefSmallScreen.current.contains(event.target) &&
        !menuButtonRefSmallScreen.current?.contains(event.target)
      ) {
        console.log("Clicked Outside menu")
        setMenuOpen(false)
      }

      if (
        notificationOpen &&
        notificationRef.current &&
        !event.target.closest("#hamburger-menu") &&
        !notificationRef.current.contains(event.target) &&
        !notificationButtonRef.current?.contains(event.target)
      ) {
        setNotificationOpen(false)
      }

      if (
        notificationOpen &&
        event.target.closest("#hamburger-menu") &&
        notificationRefSmallScreen.current &&
        !notificationRefSmallScreen.current.contains(event.target) &&
        !notificationButtonRefSmallScreen.current?.contains(event.target)
      ) {
        setNotificationOpen(false)
      }
    }

    window.addEventListener("userDataUpdated", handleUserDataUpdate)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("userDataUpdated", handleUserDataUpdate)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen, notificationOpen])

  // Auto-open dropdown if on AI resume pages
  useEffect(() => {
    const aiResumeRoutes = [
      "/ai-bulk-resume-generator",
      "/ai-single-resume-generator",
      "/initialize-resume-generation"
    ]
    if (aiResumeRoutes.some((route) => location.pathname.startsWith(route))) {
      setIsAIDropdownOpen(false)
    }
  }, [location.pathname])

  const toggleMenu = (e) => {
    e.stopPropagation()
    if (notificationOpen) setNotificationOpen(false)
    setMenuOpen(!menuOpen)
  }

  const toggleNotification = (e) => {
    e.stopPropagation()
    if (menuOpen) setMenuOpen(false)
    // disable for now, Idris asked for it
    // setNotificationOpen(!notificationOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
  }

  return (
    <nav className="flex justify-between items-center bg-almostBlack pt-8 pl-4 lg:pl-12 pb-8">
      <div>
        <a
          href="https://beta.robo-apply.com/"
          target="_blank"
          rel="noopener noreferrer">
          <img
            src={logo}
            alt="Logo"
            className="w-32 md:w-48 h-9"
            loading="lazy"
          />
        </a>
      </div>
      <div className="hidden lg:flex">
        <div className="mr-10 gap-2 flex">
          {/* Credits Display Section */}
          <div className="flex items-center justify-center  rounded-xl px-3 py-2">
            <div className="flex items-center space-x-2">
              <GiTwoCoins className="w-5 h-5 text-yellow-500" />
              <div className="text-center">
                {creditsLoading ? (
                  <>
                    <p className="text-[14px] font-semibold text-primary">0</p>
                    <p className="text-[10px] font-medium text-gray-400">
                      Credits
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      id="__credits-available-number"
                      className="text-[14px] font-semibold text-primary">
                      {credits !== null ? credits : "--"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400">
                      Credits
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notification Section */}
          <div className="relative items-center justify-center flex">
            <span
              className="border rounded-md border-gray-600 p-0.5"
              ref={notificationButtonRef}>
              <IoIosNotificationsOutline
                className="w-7 h-7 cursor-pointer"
                onClick={toggleNotification}
              />
            </span>
            {notification && (
              <span
                className="absolute top-5 right-2 w-2 h-2 bg-dangerColor rounded-full"
                style={{
                  transform: "translate(50%, -50%)"
                }}></span>
            )}
            {notificationOpen && (
              <div
                ref={notificationRef}
                className="absolute right-0 top-0 mt-12 w-72 bg-gray-800 text-white rounded-lg shadow-lg p-4">
                <p className="font-semibold mb-2">Notifications</p>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <p className="text-sm">New job alert: Software Engineer</p>
                  </div>
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <p className="text-sm">Your resume has been reviewed</p>
                  </div>
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <p className="text-sm">Interview scheduled for 5th Oct</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Profile Display Section */}
          <div className="flex w-full justify-center items-center text-left space-x-2 bg-totalBlack rounded-xl">
            <img
              src={imageUrl}
              alt="Profile"
              className="w-12 h-12 p-1.5 pl-2 rounded-full"
              loading="lazy"
            />
            
            <div className="mt-2 pr-2">
              <p className="text-[14px] font-semibold text-primary">
                {fullName}
              </p>
              <p className="text-primary text-[11px] font-medium">{email}</p>
            </div>
            <OnboardingChecklist />
            <span ref={menuButtonRef}>
              <Button
                onClick={toggleMenu}
                className="flex items-center justify-center font-semibold w-full min-w-max h-12 px-2">
                <HiDotsVertical />
              </Button>
            </span>
            {menuOpen && (
              <div
                ref={menuRef}
                className="hidden lg:block absolute right-20 top-16 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg">
                <Link
                  to="/auto-apply"
                  className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
                  <img src={dashboardIcon} className="w-4 h-4" loading="lazy" />
                  Home
                </Link>
                <Link
                  to="/edit-profile"
                  className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
                  <MdManageAccounts />
                  Edit Profile
                </Link>
                <Link
                  to="/billing"
                  className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
                  <FaRegMoneyBillAlt />
                  Account & Billing
                </Link>
                <Link
                  to="https://beta.robo-apply.com/pricing/"
                  className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
                  <GiMoneyStack />
                  Pricing
                </Link>
                <Link
                  to="/analytics"
                  className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
                  <img src={analyticsIcon} className="w-4 h-4" loading="lazy" />
                  Analytics
                </Link>
                <Link
                  to="https://app.robo-apply.com/faq/"
                  className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
                  <FaQuestionCircle />
                  Faq
                </Link>
                <Link
                  to="/"
                  className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-b-lg hover:bg-gray-700">
                  <RiLogoutBoxRLine />
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hamburger Menu for Small Screens */}
      <div id="hamburger-menu" className="lg:hidden">
        <div className="flex gap-2 mr-3 bg-almostBlack">
          {/* Mobile Credits Display */}
          <div className="flex items-center justify-center rounded-xl px-2 py-2">
            <div className="flex items-center space-x-1">
              <GiTwoCoins className="w-4 h-4 text-yellow-500" />

              <div className="text-center">
                {creditsLoading ? (
                  <p className="text-[10px] font-medium text-primary">0</p>
                ) : (
                  <p className="text-[12px] font-semibold text-primary">
                    {credits !== null ? credits : "--"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Notification Section */}
          <div className="relative items-center justify-center flex">
            <span
              className="border rounded-md border-gray-600 p-0.5"
              ref={notificationButtonRefSmallScreen}>
              <IoIosNotificationsOutline
                className="w-7 h-7 cursor-pointer "
                onClick={toggleNotification}
              />
            </span>
            {notification && (
              <span
                className="absolute top-5 right-2 w-2 h-2 bg-dangerColor rounded-full"
                style={{
                  transform: "translate(50%, -50%)"
                }}></span>
            )}
            {notificationOpen && (
              <div
                ref={notificationRefSmallScreen}
                className="absolute right-0 top-1 mt-12 w-72 bg-gray-800 text-white rounded-lg shadow-lg p-4 z-20">
                <p className="font-semibold mb-2">Notification</p>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <p className="text-sm">New job alert: Software Engineer</p>
                  </div>
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <p className="text-sm">Your resume has been reviewed</p>
                  </div>
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <p className="text-sm">Interview scheduled for 5th Oct</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex bg-totalBlack rounded-xl">
            <img
              src={imageUrl}
              alt="Profile"
              className="w-12 h-12 p-1.5 rounded-full"
              loading="lazy"
            />
            <OnboardingChecklist /> 
            <span ref={menuButtonRefSmallScreen}>
              <Button
                onClick={toggleMenu}
                className="flex items-center justify-center font-semibold w-full min-w-max h-12 px-2">
                <HiDotsVertical />
              </Button>
            </span>
            {menuOpen && (
              <div
                ref={menuRefSmallScreen}
                className="absolute right-4 top-20 mt-0 w-56 bg-gray-800 rounded-lg shadow-lg z-30">
                <Link
                  to="/auto-apply"
                  className="flex gap-2 px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
                  <img src={dashboardIcon} className="w-4 h-4" />
                  AutoApply
                </Link>
                <Link
                  to="/resume-manager"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <img src={profileIcon} className="w-4 h-4" loading="lazy" />
                  Resume Manager
                </Link>

                {/* AI Tailored Apply - Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsAIDropdownOpen(!isAIDropdownOpen)}
                    className={`flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-700 w-full text-left ${
                      isActive([
                        "/ai-bulk-resume-generator",
                        "/ai-single-resume-generator",
                        "/initialize-resume-generation"
                      ])
                        ? "bg-gray-700"
                        : ""
                    }`}>
                    <img
                      src={profileIcon}
                      className="w-4 h-4"
                      alt="AI Tailored Apply"
                      loading="lazy"
                    />
                    <span className="flex-1">AI Tailored Apply</span>
                    {isAIDropdownOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isAIDropdownOpen && (
                    <div className="bg-gray-800">
                      <Link
                        to="/initialize-resume-generation"
                        className={`flex items-center gap-2 px-6 py-2 text-white text-sm hover:bg-gray-700 border-l-2 border-gray-600 ${
                          isActive(["/initialize-resume-generation"])
                            ? "bg-gray-700 border-l-purple-500"
                            : ""
                        }`}>
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/ai-single-resume-generator"
                        className={`flex items-center gap-2 px-6 py-2 text-white text-sm hover:bg-gray-700 border-l-2 border-gray-600 ${
                          isActive(["/ai-single-resume-generator"])
                            ? "bg-gray-700 border-l-purple-500"
                            : ""
                        }`}>
                        <span>Single Tailored Resume</span>
                      </Link>
                      <Link
                        to="/ai-bulk-resume-generator"
                        className={`flex items-center gap-2 px-6 py-2 text-white text-sm hover:bg-gray-700 border-l-2 border-gray-600 ${
                          isActive([
                            "/ai-bulk-resume-generator"
                            // "/initialize-resume-generation"
                          ])
                            ? "bg-gray-700 border-l-purple-500"
                            : ""
                        }`}>
                        <span>Bulk Tailored Resume</span>
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  to="/scan-resume/main-ResumeBuilder"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <img
                    src={resumeScoreIcon}
                    className="w-4 h-4"
                    loading="lazy"
                  />
                  AI Resume Builder
                </Link>
                <Link
                  to="/dashboard-cover"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <img
                    src={coverletterIcon}
                    className="w-4 h-4"
                    loading="lazy"
                  />
                  AI Cover Letter
                </Link>
                <Link
                  to="/scan"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <img
                    src={aiscore}
                    className="w-4 h-4"
                    alt="Resume Score"
                    loading="lazy"
                  />
                  AI Resume Score
                </Link>
                <Link
                  to="/main-interview-Guide"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <img
                    src={interviewGuide}
                    className="w-4 h-4"
                    alt="Resume Score"
                    loading="lazy"
                  />
                  AI Interview Guide
                </Link>

                <Link
                  to="/analytics"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <img src={analyticsIcon} className="w-4 h-4" loading="lazy" />
                  Analytics
                </Link>

                <Link
                  to="https://beta.robo-apply.com/pricing/"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <GiMoneyStack />
                  Pricing
                </Link>
                <Link
                  to="/edit-profile"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <MdManageAccounts />
                  Edit Profile
                </Link>
                <Link
                  to="/billing"
                  className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
                  <FaRegMoneyBillAlt />
                  Account & Billing
                </Link>
                <Link
                  to="https://app.robo-apply.com/faq/"
                  className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                  <FaQuestionCircle />
                  Faq
                </Link>
                <Link
                  to="/"
                  className="flex gap-2 px-4 py-2 text-white rounded-b-lg hover:bg-gray-700"
                  onClick={handleLogout}>
                  <RiLogoutBoxRLine />
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar
