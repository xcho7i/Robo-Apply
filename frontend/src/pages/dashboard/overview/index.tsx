import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Slider from "react-slick"

import { successToast, errorToast } from "../../../components/Toast"

import {
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight
} from "react-icons/fa"
import { SearchProps } from "@types"
import SearchForm from "../ui/SearchForm"
import GradientButton from "../../../components/GradientButton"
import IntegratedPlatforms from "../ui/IntegratedPlatforms"

import { getAllResumes, getResumeDetails } from "@/src/api/functions"
import {
  activateTab,
  extensionURL,
  getResponseFromExtension,
  isExtensionInstalled
} from "@/src/extension"
import API_ENDPOINTS from "@/src/api/endpoints"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

import LimitCard from "../ui/LimitCard"
import { useSubscriptionStore } from "@/src/stores/subscription"
import { useDashboardStore } from "@/src/stores/dashboard"
import ExtensionUpgradeModal from "../ui/ExtensionUpgradeModal"
import Tooltip from "../ui/Tooltip"

import { useTour, autoApplySteps, fullTourSteps } from "../../../stores/tours"
import GuidedTourModal from "@/src/components/tour/GuidedTourModal"
// import {resumeManagerSteps } from "@/src/stores/tours"
import { useLocation } from "react-router-dom"

const DashboardHome = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<Slider>(null)

  const [loadingResumes, setLoadingResumes] = useState(false)
  const limitsData = useSubscriptionStore((state) => state.limitsData)

  const setLoading = useDashboardStore((state) => state.setLoading)
  const gotoJobFound = useDashboardStore((state) => state.gotoJobFound)
  const setResumeList = useDashboardStore((state) => state.setResumeList)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const loadingSubscription = useSubscriptionStore(
    (state) => state.loadingSubscription
  )

  const { openWelcome, resetFor, setSteps, openOnFirstVisit } = useTour()

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (_: number, next: number) => setCurrentSlide(next)
  }

  let tempValues = useRef<SearchProps>({} as SearchProps)

  const handleSearch = async (
    values: SearchProps,
    continueWithOutdated = false
  ) => {
    const extensionInstalled = await isExtensionInstalled()

    if ((typeof extensionInstalled as any) == Boolean && !extensionInstalled) {
      alert("Please install the RoboApply extension to continue!")
      return window.open(extensionURL, "_blank")
    }

    if (
      (typeof extensionInstalled as any) != Boolean &&
      !extensionInstalled?.installed
    ) {
      alert("Please install the RoboApply extension to continue!")
      return window.open(extensionURL, "_blank")
    }
    tempValues.current = values

    if (extensionInstalled?.isOutdated && !continueWithOutdated) {
      return setShowUpgradeModal(true)
    }

    if (!values.q || values?.q?.trim() === "") {
      return alert("Please enter a valid search term.")
    }

    if (values?.tailoredApply == "yes" && values.plateform != "linkedin") {
      errorToast("Tailored Apply is only available for LinkedIn!")
      return
    }

    try {
      setLoading(true)

      const params: SearchProps = { ...values }
      const { error, resume } = await getResumeDetails(values.profile_id)
      if (error || !resume) {
        console.log({ errorInGetResumeDetails: error })
        errorToast(error)
        setLoading(false)
        return
      }

      if (!resume?.formData?.experience?.trim()) {
        errorToast("Please add experience to your resume to continue!")
        setLoading(false)
        return
      }

      if (params.location && params.location?.includes("__")) {
        params.location = params.location.split("__")[0]
      }

      const response = await getResponseFromExtension({
        type: "getJobs",
        platform: values.plateform,
        params,
        excludeCompanies:
          resume?.formData?.companiesExclude
            ?.split(",")
            ?.map((c) => c.trim()) || []
      })

      await activateTab()

      if (response?.error) {
        setLoading(false)
        return alert("Error scrapping jobs: " + response.error)
      }

      gotoJobFound(false, response?.results || [], "jobsFound", values, resume)
    } catch (error) {
      console.error("Error scraping jobs:", error)
      setLoading(false)
      alert("Something went wrong, while scraping jobs!")
    }
  }

  function handleExtensionUpgrade(action: "continue" | "upgrade") {
    setShowUpgradeModal(false)
    if (action == "continue") return handleSearch(tempValues.current, true)
    return window.open(extensionURL, "_blank")
  }

  const handleResumeNavigation = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      console.error("No access token found.")
      return
    }

    try {
      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.SubscriptionData}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to fetch subscription data.")
      const subData = await res.json()
      console.log("Subscription Data Response:", subData)
      return subData
    } catch (err) {
      console.error("Error checking subscription:", err)
      return null
    }
  }

  //  const navigate = useNavigate()
  const location = useLocation()
  const { startModuleTourIfEligible } = useTour()
  useEffect(() => {
    startModuleTourIfEligible("auto-apply", autoApplySteps, {
      showWelcome: false
    })
  }, [startModuleTourIfEligible])
  useEffect(() => {
    // setSteps(fullTourSteps)
    // openOnFirstVisit("auto_apply_dashboard", { steps: fullTourSteps, showWelcome: true })
    // openOnFirstVisit("auto_apply_dashboard", autoApplySteps)
    // openWelcome()
    setLoadingResumes(true)
    getAllResumes()
      .then((res) => {
        if (res.error) {
          console.log("Error fetching resumes:", res.error)
          errorToast(res.error)
        }
        if (res.resumes) setResumeList(res.resumes)
      })
      .finally(() => setLoadingResumes(false))

    // clean localStorage keys related to extension
    for (const k of [
      "extensionStatus",
      "platformName",
      "resumeName",
      "edited",
      "resumeResponse",
      "resumeUrlPath",
      "roboapplyData"
    ])
      localStorage.removeItem(k)
  }, [])

  return (
    <>
      <section id="overview-section" data-tour="overview-section">
        <div className="flex justify-between   items-stretch w-full rounded-xl pb-2  ">
          <div className="flex  gap-3">
            <p className="text-2xl font-semibold">Overview</p>
            <Tooltip credits={6} />
          </div>
          <GradientButton className="" onClick={() => navigate("/pricingPlan")}>
            Upgrade Plan
          </GradientButton>
        </div>

        <div
          id="overview-cards"
          className="hidden md:flex items-stretch gap-4 w-full rounded-xl ">
          {limitsData.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 ">
                <LimitCard
                  className={""}
                  jobLimit={item.jobLimit}
                  progressValue={item.progress}
                  jobsLeft={item.jobsLeft}
                  label={item.label}
                  title={item.title}
                  jobsLeftLabel={item.jobsLeftLabel}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 items-start mt-4">
        <div>
          <div className="flex justify-center items-center">
            <div className="block md:hidden w-72  xxs:w-[20rem] xms:w-96 py-5 ">
              <Slider {...settings} ref={sliderRef}>
                {limitsData.map((item, index) => (
                  <div key={index}>
                    <LimitCard
                      className={""}
                      jobLimit={item.jobLimit}
                      progressValue={item.progress}
                      jobsLeft={item.jobsLeft}
                      label={item.label}
                      title={item.title}
                      jobsLeftLabel={item.jobsLeftLabel}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          <div className="flex md:hidden justify-center gap-1 mb-6">
            <FaRegArrowAltCircleLeft
              className="text-3xl text-gray-500 hover:text-white cursor-pointer"
              onClick={() => sliderRef.current?.slickPrev()}
            />
            <FaRegArrowAltCircleRight
              className="text-3xl text-gray-500 hover:text-white cursor-pointer"
              onClick={() => sliderRef.current?.slickNext()}
            />
          </div>

          <div>
            <SearchForm
              showFull
              loading={loadingResumes || loadingSubscription}
              onFinish={handleSearch}
            />
          </div>

          <IntegratedPlatforms />
        </div>
      </div>

      <ExtensionUpgradeModal
        show={showUpgradeModal}
        setShow={setShowUpgradeModal}
        action={handleExtensionUpgrade}
      />
    </>
  )
}

export default DashboardHome
