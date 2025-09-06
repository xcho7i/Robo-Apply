// import { useState, useEffect, useRef } from "react"
// import logo from "../assets/logo.svg"
// import profilePic from "../assets/profilePic.svg"
// import { HiDotsVertical } from "react-icons/hi"
// import { MdManageAccounts } from "react-icons/md"
// import { RiLogoutBoxRLine } from "react-icons/ri"
// import dashboardIcon from "../assets/dashboardIcons/dashboardIcon.svg"
// import profileIcon from "../assets/dashboardIcons/profileIcon.svg"
// import analyticsIcon from "../assets/dashboardIcons/AnalyticsIcon.svg"
// import coverletterIcon from "../assets/dashboardIcons/coverLetterIcon.svg"
// import resumeScoreIcon from "../assets/dashboardIcons/resumeScoreIcon.svg"
// import interviewGuide from "../assets/dashboardIcons/interviewGuide.svg"
// import aiscore from "../assets/dashboardIcons/aiscore.svg"
// import { GiMoneyStack } from "react-icons/gi"
// import { FaQuestionCircle } from "react-icons/fa"
// import { FaRegMoneyBillAlt } from "react-icons/fa"
// import { GiTwoCoins } from "react-icons/gi"
// import {
//   ChevronDown,
//   ChevronRight,
//   Bell,
//   BellRing,
//   Settings
// } from "lucide-react"

// import { IoIosNotificationsOutline } from "react-icons/io"
// import { Link, useLocation } from "react-router-dom"
// import Button from "../components/Button"
// import { useSubscriptionStore } from "../stores/subscription"
// import OnboardingChecklist from "@/src/components/tour/OnboardingChecklist"
// import { useCredits } from "../contexts/CreditsContext"
// // Import OneSignal hook
// import { useOneSignal } from "../hooks/useOneSignal"

// const DashboardNavbar = () => {
//   const location = useLocation()
//   const [fullName, setFullName] = useState("")
//   const [email, setEmail] = useState("")
//   const [imageUrl, setImageUrl] = useState("")
//   const [menuOpen, setMenuOpen] = useState(false)
//   const [notificationOpen, setNotificationOpen] = useState(false)
//   const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false)

//   // OneSignal integration
//   const {
//     isInitialized,
//     isSubscribed,
//     notifications,
//     unreadCount,
//     subscribeUser,
//     unsubscribeUser,
//     markAsRead,
//     clearNotifications,
//     sendTestNotification
//   } = useOneSignal()

//   const credits = useSubscriptionStore((state) => state.remainingCredits)
//   const creditsLoading = useSubscriptionStore(
//     (state) => state.loadingSubscription
//   )

//   /**
//    Helper function to check if a route is active
//    */
//   const isActive = (paths) =>
//     paths.some((path) => {
//       const normalizedPath = `/${path.replace(/^\/+/, "")}` // Ensure path starts with a single '/'
//       return (
//         location.pathname === normalizedPath ||
//         location.pathname.startsWith(`${normalizedPath}/`)
//       )
//     })

//   const menuRef = useRef<HTMLDivElement>(null)
//   const menuButtonRef = useRef<HTMLDivElement>(null)

//   const menuRefSmallScreen = useRef<HTMLDivElement>(null)
//   const menuButtonRefSmallScreen = useRef<HTMLDivElement>(null)

//   const notificationRef = useRef<HTMLDivElement>(null)
//   const notificationButtonRef = useRef<HTMLDivElement>(null)

//   const notificationRefSmallScreen = useRef<HTMLDivElement>(null)
//   const notificationButtonRefSmallScreen = useRef<HTMLDivElement>(null)

//   // Load user data from localStorage
//   const loadUserData = () => {
//     const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
//     if (userData && userData?.firstName) {
//       const firstLastName =
//         userData.firstName && userData.lastName
//           ? `${userData.firstName} ${userData.lastName}`.trim()
//           : ""

//       setFullName(firstLastName || userData.fullName || "User")
//       setEmail(userData.email || "")
//       setImageUrl(userData.imageUrl || profilePic)
//     }
//   }

//   useEffect(() => {
//     loadUserData() // On mount

//     const handleUserDataUpdate = () => {
//       loadUserData() // On custom update event
//     }

//     const handleClickOutside = (event) => {
//       if (
//         menuOpen &&
//         !event.target.closest("#hamburger-menu") &&
//         menuRef.current &&
//         !menuRef.current.contains(event.target) &&
//         !menuButtonRef.current?.contains(event.target)
//       ) {
//         setMenuOpen(false)
//       }
//       if (
//         menuOpen &&
//         event.target.closest("#hamburger-menu") &&
//         menuRefSmallScreen.current &&
//         !menuRefSmallScreen.current.contains(event.target) &&
//         !menuButtonRefSmallScreen.current?.contains(event.target)
//       ) {
//         console.log("Clicked Outside menu")
//         setMenuOpen(false)
//       }

//       if (
//         notificationOpen &&
//         notificationRef.current &&
//         !event.target.closest("#hamburger-menu") &&
//         !notificationRef.current.contains(event.target) &&
//         !notificationButtonRef.current?.contains(event.target)
//       ) {
//         setNotificationOpen(false)
//       }

//       if (
//         notificationOpen &&
//         event.target.closest("#hamburger-menu") &&
//         notificationRefSmallScreen.current &&
//         !notificationRefSmallScreen.current.contains(event.target) &&
//         !notificationButtonRefSmallScreen.current?.contains(event.target)
//       ) {
//         setNotificationOpen(false)
//       }
//     }

//     window.addEventListener("userDataUpdated", handleUserDataUpdate)
//     document.addEventListener("mousedown", handleClickOutside)

//     return () => {
//       window.removeEventListener("userDataUpdated", handleUserDataUpdate)
//       document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [menuOpen, notificationOpen])

//   // Auto-open dropdown if on AI resume pages
//   useEffect(() => {
//     const aiResumeRoutes = [
//       "/ai-bulk-resume-generator",
//       "/ai-single-resume-generator",
//       "/initialize-resume-generation"
//     ]
//     if (aiResumeRoutes.some((route) => location.pathname.startsWith(route))) {
//       setIsAIDropdownOpen(false)
//     }
//   }, [location.pathname])

//   const toggleMenu = (e) => {
//     e.stopPropagation()
//     if (notificationOpen) setNotificationOpen(false)
//     setMenuOpen(!menuOpen)
//   }

//   const toggleNotification = (e) => {
//     e.stopPropagation()
//     if (menuOpen) setMenuOpen(false)
//     setNotificationOpen(!notificationOpen)
//   }

//   const handleLogout = () => {
//     localStorage.removeItem("access_token")
//   }

//   const handleSubscribeToNotifications = async () => {
//     if (isSubscribed) {
//       await unsubscribeUser()
//     } else {
//       await subscribeUser()
//     }
//   }

//   const formatNotificationTime = (timestamp: Date) => {
//     const now = new Date()
//     const diff = now.getTime() - timestamp.getTime()
//     const minutes = Math.floor(diff / (1000 * 60))
//     const hours = Math.floor(diff / (1000 * 60 * 60))
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24))

//     if (minutes < 1) return "Just now"
//     if (minutes < 60) return `${minutes}m ago`
//     if (hours < 24) return `${hours}h ago`
//     return `${days}d ago`
//   }

//   const renderNotificationContent = () => {
//     if (!isInitialized) {
//       return (
//         <div className="p-4 text-center">
//           <p className="text-sm text-gray-400">Initializing notifications...</p>
//         </div>
//       )
//     }

//     if (!isSubscribed) {
//       return (
//         <div className="p-4">
//           <div className="text-center mb-4">
//             <Bell className="w-12 h-12 mx-auto text-gray-400 mb-2" />
//             <p className="text-sm text-gray-300 mb-2">
//               Stay updated with RoboApply!
//             </p>
//             <p className="text-xs text-gray-400 mb-4">
//               Get notified about job matches, application updates, and more.
//             </p>
//             <Button
//               onClick={handleSubscribeToNotifications}
//               className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded">
//               Enable Notifications
//             </Button>
//           </div>
//         </div>
//       )
//     }

//     if (notifications.length === 0) {
//       return (
//         <div className="p-4 text-center">
//           <Bell className="w-8 h-8 mx-auto text-gray-400 mb-2" />
//           <p className="text-sm text-gray-400">No notifications yet</p>
//           <button
//             onClick={sendTestNotification}
//             className="mt-2 text-xs text-purple-400 hover:text-purple-300">
//             Send test notification
//           </button>
//         </div>
//       )
//     }

//     return (
//       <div>
//         <div className="flex justify-between items-center p-3 border-b border-gray-700">
//           <p className="font-semibold text-sm">
//             Notifications ({notifications.length})
//           </p>
//           <div className="flex gap-2">
//             <button
//               onClick={handleSubscribeToNotifications}
//               className="text-xs text-gray-400 hover:text-gray-300"
//               title={
//                 isSubscribed ? "Disable notifications" : "Enable notifications"
//               }>
//               <Settings className="w-4 h-4" />
//             </button>
//             {notifications.length > 0 && (
//               <button
//                 onClick={clearNotifications}
//                 className="text-xs text-purple-400 hover:text-purple-300">
//                 Clear all
//               </button>
//             )}
//           </div>
//         </div>
//         <div className="max-h-80 overflow-y-auto">
//           {notifications.slice(0, 10).map((notification) => (
//             <div
//               key={notification.id}
//               className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
//                 !notification.read ? "bg-gray-800" : ""
//               }`}
//               onClick={() => markAsRead(notification.id)}>
//               <div className="flex justify-between items-start mb-1">
//                 <p className="text-sm font-medium text-white truncate">
//                   {notification.title}
//                 </p>
//                 {!notification.read && (
//                   <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 ml-2 mt-1" />
//                 )}
//               </div>
//               <p className="text-xs text-gray-300 mb-1">
//                 {notification.message}
//               </p>
//               <p className="text-xs text-gray-500">
//                 {formatNotificationTime(notification.timestamp)}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <nav className="flex justify-between items-center bg-almostBlack pt-4 md:pt-8 pl-4 lg:pl-12 pb-4 md:pb-8">
//       <div className="flex-shrink-0">
//         <a
//           href="https://beta.robo-apply.com/"
//           target="_blank"
//           rel="noopener noreferrer">
//           <img
//             src={logo}
//             alt="Logo"
//             className="w-28 sm:w-32 md:w-48 h-6 sm:h-7 md:h-9"
//             loading="lazy"
//           />
//         </a>
//       </div>

//       {/* Desktop Navigation */}
//       <div className="hidden lg:flex">
//         <div className="mr-10 gap-2 flex">
//           {/* Credits Display Section */}
//           <div className="flex items-center justify-center rounded-xl px-3 py-2">
//             <div className="flex items-center space-x-2">
//               <GiTwoCoins className="w-5 h-5 text-yellow-500" />
//               <div className="text-center">
//                 {creditsLoading ? (
//                   <>
//                     <p className="text-[14px] font-semibold text-primary">0</p>
//                     <p className="text-[10px] font-medium text-gray-400">
//                       Credits
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     <p
//                       id="__credits-available-number"
//                       className="text-[14px] font-semibold text-primary">
//                       {credits !== null ? credits : "--"}
//                     </p>
//                     <p className="text-[10px] font-medium text-gray-400">
//                       Credits
//                     </p>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Notification Section */}
//           <div className="relative items-center justify-center flex">
//             <span
//               className="border rounded-md border-gray-600 p-0.5 cursor-pointer relative"
//               ref={notificationButtonRef}
//               onClick={toggleNotification}>
//               {unreadCount > 0 ? (
//                 <BellRing className="w-7 h-7 text-purple-400" />
//               ) : (
//                 <IoIosNotificationsOutline className="w-7 h-7" />
//               )}
//               {unreadCount > 0 && (
//                 <span
//                   className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
//                   style={{ fontSize: "10px" }}>
//                   {unreadCount > 9 ? "9+" : unreadCount}
//                 </span>
//               )}
//             </span>

//             {notificationOpen && (
//               <div
//                 ref={notificationRef}
//                 className="absolute right-0 top-0 mt-12 w-80 bg-gray-800 text-white rounded-lg shadow-lg z-50 border border-gray-700">
//                 {renderNotificationContent()}
//               </div>
//             )}
//           </div>

//           {/* Profile Display Section */}
//           <div className="flex w-full justify-center items-center text-left space-x-2 bg-totalBlack rounded-xl">
//             <img
//               src={imageUrl}
//               alt="Profile"
//               className="w-12 h-12 p-1.5 pl-2 rounded-full"
//               loading="lazy"
//             />

//             <div className="mt-2 pr-2">
//               <p className="text-[14px] font-semibold text-primary">
//                 {fullName}
//               </p>
//               <p className="text-primary text-[11px] font-medium">{email}</p>
//             </div>
//             <OnboardingChecklist />
//             <span ref={menuButtonRef}>
//               <Button
//                 onClick={toggleMenu}
//                 className="flex items-center justify-center font-semibold w-full min-w-max h-12 px-2">
//                 <HiDotsVertical />
//               </Button>
//             </span>
//             {menuOpen && (
//               <div
//                 ref={menuRef}
//                 className="hidden lg:block absolute right-20 top-16 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-50">
//                 <Link
//                   to="/auto-apply"
//                   className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
//                   <img src={dashboardIcon} className="w-4 h-4" loading="lazy" />
//                   Home
//                 </Link>
//                 <Link
//                   to="/edit-profile"
//                   className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
//                   <MdManageAccounts />
//                   Edit Profile
//                 </Link>
//                 <Link
//                   to="/billing"
//                   className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
//                   <FaRegMoneyBillAlt />
//                   Account & Billing
//                 </Link>
//                 <Link
//                   to="/pricingPlan"
//                   className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
//                   <GiMoneyStack />
//                   Pricing
//                 </Link>
//                 <Link
//                   to="/analytics"
//                   className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
//                   <img src={analyticsIcon} className="w-4 h-4" loading="lazy" />
//                   Analytics
//                 </Link>
//                 <Link
//                   to="https://roboapply.co/faq/"
//                   className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
//                   <FaQuestionCircle />
//                   Faq
//                 </Link>
//                 <Link
//                   to="/"
//                   className="flex gap-1 items-center justify-left px-4 py-2 text-white rounded-b-lg hover:bg-gray-700">
//                   <RiLogoutBoxRLine />
//                   Logout
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Mobile Navigation */}
//       <div id="hamburger-menu" className="lg:hidden flex items-center">
//         <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-3">
//           {/* Mobile Credits Display */}
//           <div className="flex items-center justify-center rounded-xl px-1 sm:px-2 py-1 sm:py-2">
//             <div className="flex items-center space-x-1">
//               <GiTwoCoins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
//               <div className="text-center">
//                 {creditsLoading ? (
//                   <p className="text-[10px] sm:text-[12px] font-medium text-primary">
//                     0
//                   </p>
//                 ) : (
//                   <p className="text-[10px] sm:text-[12px] font-semibold text-primary">
//                     {credits !== null ? credits : "--"}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Mobile Notification Section */}
//           <div className="relative flex items-center justify-center">
//             <span
//               className="border rounded-md border-gray-600 p-0.5 cursor-pointer relative"
//               ref={notificationButtonRefSmallScreen}
//               onClick={toggleNotification}>
//               {unreadCount > 0 ? (
//                 <BellRing className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
//               ) : (
//                 <IoIosNotificationsOutline className="w-5 h-5 sm:w-6 sm:h-6" />
//               )}
//               {unreadCount > 0 && (
//                 <span
//                   className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
//                   style={{ fontSize: "9px" }}>
//                   {unreadCount > 9 ? "9+" : unreadCount}
//                 </span>
//               )}
//             </span>

//             {notificationOpen && (
//               <div
//                 ref={notificationRefSmallScreen}
//                 className="absolute right-0 top-1 mt-8 sm:mt-12 w-72 sm:w-80 bg-gray-800 text-white rounded-lg shadow-lg z-50 border border-gray-700">
//                 {renderNotificationContent()}
//               </div>
//             )}
//           </div>

//           {/* Mobile Profile Section */}
//           <div className="flex bg-totalBlack rounded-xl">
//             <img
//               src={imageUrl}
//               alt="Profile"
//               className="w-8 h-8 sm:w-10 sm:h-10 p-1 rounded-full flex-shrink-0"
//               loading="lazy"
//             />

//             <OnboardingChecklist />

//             <span ref={menuButtonRefSmallScreen} className="flex-shrink-0">
//               <Button
//                 onClick={toggleMenu}
//                 className="flex items-center justify-center font-semibold h-8 sm:h-10 w-8 sm:w-10 px-1 sm:px-2">
//                 <HiDotsVertical className="w-4 h-4 sm:w-5 sm:h-5" />
//               </Button>
//             </span>
//           </div>

//           {/* Mobile Menu Dropdown */}
//           {menuOpen && (
//             <div
//               ref={menuRefSmallScreen}
//               className="absolute right-2 sm:right-4 top-16 sm:top-20 mt-0 w-56 sm:w-64 bg-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
//               {/* Show OnboardingChecklist in menu for very small screens */}
//               <div className="block xs:hidden px-4 py-2 border-b border-gray-700">
//                 <OnboardingChecklist />
//               </div>

//               <Link
//                 to="/auto-apply"
//                 className="flex gap-2 px-4 py-2 text-white rounded-t-lg hover:bg-gray-700">
//                 <img src={dashboardIcon} className="w-4 h-4" />
//                 AutoApply
//               </Link>
//               <Link
//                 to="/resume-manager"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <img src={profileIcon} className="w-4 h-4" loading="lazy" />
//                 Resume Manager
//               </Link>

//               {/* AI Tailored Apply - Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => setIsAIDropdownOpen(!isAIDropdownOpen)}
//                   className={`flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-700 w-full text-left ${
//                     isActive([
//                       "/ai-bulk-resume-generator",
//                       "/ai-single-resume-generator",
//                       "/initialize-resume-generation"
//                     ])
//                       ? "bg-gray-700"
//                       : ""
//                   }`}>
//                   <img
//                     src={profileIcon}
//                     className="w-4 h-4"
//                     alt="AI Tailored Apply"
//                     loading="lazy"
//                   />
//                   <span className="flex-1 text-sm">AI Tailored Apply</span>
//                   {isAIDropdownOpen ? (
//                     <ChevronDown className="h-4 w-4" />
//                   ) : (
//                     <ChevronRight className="h-4 w-4" />
//                   )}
//                 </button>

//                 {/* Dropdown Menu */}
//                 {isAIDropdownOpen && (
//                   <div className="bg-gray-800">
//                     <Link
//                       to="/initialize-resume-generation"
//                       className={`flex items-center gap-2 px-6 py-2 text-white text-sm hover:bg-gray-700 border-l-2 border-gray-600 ${
//                         isActive(["/initialize-resume-generation"])
//                           ? "bg-gray-700 border-l-purple-500"
//                           : ""
//                       }`}>
//                       <span>Dashboard</span>
//                     </Link>
//                     <Link
//                       to="/ai-single-resume-generator"
//                       className={`flex items-center gap-2 px-6 py-2 text-white text-sm hover:bg-gray-700 border-l-2 border-gray-600 ${
//                         isActive(["/ai-single-resume-generator"])
//                           ? "bg-gray-700 border-l-purple-500"
//                           : ""
//                       }`}>
//                       <span>Single Tailored Resume</span>
//                     </Link>
//                     <Link
//                       to="/ai-bulk-resume-generator"
//                       className={`flex items-center gap-2 px-6 py-2 text-white text-sm hover:bg-gray-700 border-l-2 border-gray-600 ${
//                         isActive(["/ai-bulk-resume-generator"])
//                           ? "bg-gray-700 border-l-purple-500"
//                           : ""
//                       }`}>
//                       <span>Bulk Tailored Resume</span>
//                     </Link>
//                   </div>
//                 )}
//               </div>
//               <Link
//                 to="/scan-resume/main-ResumeBuilder"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <img src={resumeScoreIcon} className="w-4 h-4" loading="lazy" />
//                 AI Resume Builder
//               </Link>
//               <Link
//                 to="/dashboard-cover"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <img src={coverletterIcon} className="w-4 h-4" loading="lazy" />
//                 AI Cover Letter
//               </Link>
//               <Link
//                 to="/scan"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <img
//                   src={aiscore}
//                   className="w-4 h-4"
//                   alt="Resume Score"
//                   loading="lazy"
//                 />
//                 AI Resume Score
//               </Link>
//               <Link
//                 to="/main-interview-Guide"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <img
//                   src={interviewGuide}
//                   className="w-4 h-4"
//                   alt="Interview Guide"
//                   loading="lazy"
//                 />
//                 AI Interview Guide
//               </Link>

//               <Link
//                 to="/analytics"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <img src={analyticsIcon} className="w-4 h-4" loading="lazy" />
//                 Analytics
//               </Link>

//               <Link
//                 to="https://beta.robo-apply.com/pricing/"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <GiMoneyStack className="w-4 h-4" />
//                 Pricing
//               </Link>
//               <Link
//                 to="/edit-profile"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <MdManageAccounts className="w-4 h-4" />
//                 Edit Profile
//               </Link>
//               <Link
//                 to="/billing"
//                 className="flex gap-2 items-center justify-left px-4 py-2 text-white hover:bg-gray-700">
//                 <FaRegMoneyBillAlt className="w-4 h-4" />
//                 Account & Billing
//               </Link>
//               <Link
//                 to="https://app.robo-apply.com/faq/"
//                 className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
//                 <FaQuestionCircle className="w-4 h-4" />
//                 FAQ
//               </Link>
//               <Link
//                 to="/"
//                 className="flex gap-2 px-4 py-2 text-white rounded-b-lg hover:bg-gray-700"
//                 onClick={handleLogout}>
//                 <RiLogoutBoxRLine className="w-4 h-4" />
//                 Logout
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   )
// }

// export default DashboardNavbar

import { useState, useEffect, useRef } from "react"
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
import AIInterviewCopilot from "../assets/dashboardIcons/AIInterviewCopilot.svg"
import CommingSoonModal from "../components/Modals/CommingSoonModal"
import { GiMoneyStack } from "react-icons/gi"
import { FaQuestionCircle } from "react-icons/fa"
import { FaRegMoneyBillAlt } from "react-icons/fa"
import { GiTwoCoins } from "react-icons/gi"
import {
  ChevronDown,
  ChevronRight,
  Bell,
  BellRing,
  Settings
} from "lucide-react"

import { IoIosNotificationsOutline } from "react-icons/io"
import { Link, useLocation } from "react-router-dom"
import Button from "../components/Button"
import { useSubscriptionStore } from "../stores/subscription"
import OnboardingChecklist from "@/src/components/tour/OnboardingChecklist"
import { useCredits } from "../contexts/CreditsContext"
// Import OneSignal hook
import { useOneSignal } from "../hooks/useOneSignal"

const DashboardNavbar = () => {
  const location = useLocation()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  // OneSignal integration
  const {
    isInitialized,
    isSubscribed,
    notifications,
    unreadCount,
    subscribeUser,
    unsubscribeUser,
    markAsRead,
    clearNotifications,
    sendTestNotification
  } = useOneSignal()

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
    setNotificationOpen(!notificationOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
  }

  const handleSubscribeToNotifications = async () => {
    if (isSubscribed) {
      await unsubscribeUser()
    } else {
      await subscribeUser()
    }
  }

  const formatNotificationTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const renderNotificationContent = () => {
    if (!isInitialized) {
      return (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400">Initializing notifications...</p>
        </div>
      )
    }

    if (!isSubscribed) {
      return (
        <div className="p-4">
          <div className="text-center mb-4">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-300 mb-2">
              Stay updated with RoboApply!
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Get notified about job matches, application updates, and more.
            </p>
            <Button
              onClick={handleSubscribeToNotifications}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded">
              Enable Notifications
            </Button>
          </div>
        </div>
      )
    }

    if (notifications.length === 0) {
      return (
        <div className="p-4 text-center">
          <Bell className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-400">No notifications yet</p>
          <button
            onClick={sendTestNotification}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300">
            Send test notification
          </button>
        </div>
      )
    }

    return (
      <div>
        <div className="flex justify-between items-center p-3 border-b border-gray-700">
          <p className="font-semibold text-sm">
            Notifications ({notifications.length})
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSubscribeToNotifications}
              className="text-xs text-gray-400 hover:text-gray-300"
              title={
                isSubscribed ? "Disable notifications" : "Enable notifications"
              }>
              <Settings className="w-4 h-4" />
            </button>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-purple-400 hover:text-purple-300">
                Clear all
              </button>
            )}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                !notification.read ? "bg-gray-800" : ""
              }`}
              onClick={() => markAsRead(notification.id)}>
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-white truncate">
                  {notification.title}
                </p>
                {!notification.read && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 ml-2 mt-1" />
                )}
              </div>
              <p className="text-xs text-gray-300 mb-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500">
                {formatNotificationTime(notification.timestamp)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <nav className="flex justify-between items-center bg-almostBlack pt-4 md:pt-8 pl-4 lg:pl-12 pb-4 md:pb-8">
      <div className="flex-shrink-0">
        <a
          href="https://beta.robo-apply.com/"
          target="_blank"
          rel="noopener noreferrer">
          <img
            src={logo}
            alt="Logo"
            className="w-28 sm:w-32 md:w-48 h-6 sm:h-7 md:h-9"
            loading="lazy"
          />
        </a>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex">
        <div className="mr-10 gap-2 flex">
          {/* Credits Display Section */}
          <div className="flex items-center justify-center rounded-xl px-3 py-2">
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
              className="border rounded-md border-gray-600 p-0.5 cursor-pointer relative"
              ref={notificationButtonRef}
              onClick={toggleNotification}>
              {unreadCount > 0 ? (
                <BellRing className="w-7 h-7 text-purple-400" />
              ) : (
                <IoIosNotificationsOutline className="w-7 h-7" />
              )}
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  style={{ fontSize: "10px" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>

            {notificationOpen && (
              <div
                ref={notificationRef}
                className="absolute right-0 top-0 mt-12 w-80 bg-gray-800 text-white rounded-lg shadow-lg z-50 border border-gray-700">
                {renderNotificationContent()}
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
                className="hidden lg:block absolute right-20 top-16 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-50">
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
                  to="/pricingPlan"
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
                  to="https://roboapply.co/faq/"
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

      {/* Mobile Navigation */}
      <div id="hamburger-menu" className="lg:hidden flex items-center">
        <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-3">
          {/* Mobile Credits Display */}
          <div className="flex items-center justify-center rounded-xl px-1 sm:px-2 py-1 sm:py-2">
            <div className="flex items-center space-x-1">
              <GiTwoCoins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              <div className="text-center">
                {creditsLoading ? (
                  <p className="text-[10px] sm:text-[12px] font-medium text-primary">
                    0
                  </p>
                ) : (
                  <p className="text-[10px] sm:text-[12px] font-semibold text-primary">
                    {credits !== null ? credits : "--"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Notification Section */}
          <div className="relative flex items-center justify-center">
            <span
              className="border rounded-md border-gray-600 p-0.5 cursor-pointer relative"
              ref={notificationButtonRefSmallScreen}
              onClick={toggleNotification}>
              {unreadCount > 0 ? (
                <BellRing className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              ) : (
                <IoIosNotificationsOutline className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  style={{ fontSize: "9px" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>

            {notificationOpen && (
              <div
                ref={notificationRefSmallScreen}
                className="absolute right-0 top-1 mt-8 sm:mt-12 w-72 sm:w-80 bg-gray-800 text-white rounded-lg shadow-lg z-50 border border-gray-700">
                {renderNotificationContent()}
              </div>
            )}
          </div>

          {/* Mobile Profile Section */}
          <div className="flex items-center bg-totalBlack rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt="Profile"
              className="w-8 h-8 sm:w-10 sm:h-10 p-1 rounded-full flex-shrink-0"
              loading="lazy"
            />

            {/* OnboardingChecklist - Hidden on very small screens */}
            <div className="hidden xs:block">
              <OnboardingChecklist />
            </div>

            <span ref={menuButtonRefSmallScreen} className="flex-shrink-0">
              <Button
                onClick={toggleMenu}
                className="flex items-center justify-center font-semibold h-8 sm:h-10 w-8 sm:w-10 px-1 sm:px-2">
                <HiDotsVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </span>
          </div>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div
              ref={menuRefSmallScreen}
              className="absolute right-2 sm:right-4 top-16 sm:top-20 mt-0 w-56 sm:w-64 bg-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {/* Show OnboardingChecklist in menu for very small screens */}
              <div className="block xs:hidden px-4 py-2 border-b border-gray-700">
                <OnboardingChecklist />
              </div>

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
                  <span className="flex-1 text-sm">AI Tailored Apply</span>
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
                        isActive(["/ai-bulk-resume-generator"])
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
                <img src={resumeScoreIcon} className="w-4 h-4" loading="lazy" />
                AI Resume Builder
              </Link>
              <Link
                to="/dashboard-cover"
                className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                <img src={coverletterIcon} className="w-4 h-4" loading="lazy" />
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
                  alt="Interview Guide"
                  loading="lazy"
                />
                AI Interview Guide
              </Link>

              <Button
                onClick={() => setShowComingSoon(true)}
                className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                <img
                  src={AIInterviewCopilot}
                  className="w-4 h-4"
                  alt="AI Interview Copilot"
                  loading="lazy"
                />
                AI Interview Copilot
              </Button>
              <CommingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
              {/* <Link
                to="/live-interview"
                className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                <img
                  src={AIInterviewCopilot}
                  className="w-4 h-4"
                  alt="AI Interview Copilot"
                  loading="lazy"
                />
                AI Interview Copilot
              </Link> */}

              <Link
                to="/analytics"
                className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                <img src={analyticsIcon} className="w-4 h-4" loading="lazy" />
                Analytics
              </Link>

              <Link
                to="https://beta.robo-apply.com/pricing/"
                className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                <GiMoneyStack className="w-4 h-4" />
                Pricing
              </Link>
              <Link
                to="/edit-profile"
                className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                <MdManageAccounts className="w-4 h-4" />
                Edit Profile
              </Link>
              <Link
                to="/billing"
                className="flex gap-2 items-center justify-left px-4 py-2 text-white hover:bg-gray-700">
                <FaRegMoneyBillAlt className="w-4 h-4" />
                Account & Billing
              </Link>
              <Link
                to="https://app.robo-apply.com/faq/"
                className="flex gap-2 px-4 py-2 text-white hover:bg-gray-700">
                <FaQuestionCircle className="w-4 h-4" />
                FAQ
              </Link>
              <Link
                to="/"
                className="flex gap-2 px-4 py-2 text-white rounded-b-lg hover:bg-gray-700"
                onClick={handleLogout}>
                <RiLogoutBoxRLine className="w-4 h-4" />
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar
