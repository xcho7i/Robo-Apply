import React, { useState, useEffect } from "react"

import linkedinPic from "../../../assets/dashboardIcons/linkedinImage.svg"
import UserAccountIcon from "../../../assets/analytics/userAccountIcon.svg"
import ResumeChoosenIcon from "../../../assets/analytics/resumeChoosenIcon.svg"
import SkillSearchIcon from "../../../assets/analytics/skillSearchIcon.svg"
import LinkIcon from "../../../assets/analytics/linkIcon.svg"
import DatePickerInput from "../../../components/DatePickerInput"
import SessionTable from "../ui/SessionTable"
import API_ENDPOINTS from "../../../api/endpoints"
import { errorToast } from "../../../components/Toast"
import CircularIndeterminate from "../../../components/loader/circular"
import { analytics } from "@/src/api/functions/analytics"
import ViewCard, { CardData, getCardData } from "../ui/ViewCard"

import { platformIcons } from ".."
import ViewTable from "../ui/ViewTable"

const SessionDiv = () => {
  const [isTableVisible, setTableVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [totalJobs, setTotalJobs] = useState<number>(0)

  const [sessionData, setSessionData] = useState<CardData[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch analytics data from API
  const fetchAnalyticsBySession = async (date: Date | null = null) => {
    let formattedDate: string = ""
    if (date) {
      formattedDate = formatDateLocal(date)
    }

    setLoading(true)

    try {
      const result = await analytics.getJobHistoryCount(formattedDate)

      if (!result.success) {
        setLoading(false)
        return errorToast(result.message)
      }

      // const result = await response.json()
      if (result.success && result.jobActivities) {
        const data = getCardData(result.jobActivities)
        setSessionData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      errorToast("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const formatDateLocal = (date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, "0")
    const day = `${date.getDate()}`.padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    fetchAnalyticsBySession(selectedDate)
  }, [selectedDate])

  const handleDateChange = (date) => {
    setSelectedDate(date)
    console.log("Selected Date:", date)
    // fetchAnalyticsBySession(date)
  }

  const handleGoBack = () => {
    setTableVisible(false)
  }

  const toggleTableVisibility = (session: CardData) => {
    setTableVisible((prevVisible) => !prevVisible)
    setTotalJobs(session.applyJobsCount)
    setSelectedPlatform(session.title.toLowerCase())
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularIndeterminate />
      </div>
    )
  }

  return (
    <>
      {!isTableVisible ? (
        <>
          <p className="text-xl font-medium text-primary" data-tour="ai-analytics-checkSessionDay">
            Check Session By Day ....
          </p>
          <div className="mt-4 mb-5">
            <DatePickerInput
              placeholder="Choose a date"
              selectedDate={selectedDate}
              onChange={handleDateChange}
              className="w-full"
            />
          </div>
          <div className="w-full py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {sessionData.length > 0 ? (
              sessionData.map((session, index) => (
                <ViewCard
                  key={`${session.title}-${index}`}
                  {...session}
                  onToggleTableVisibility={() => toggleTableVisibility(session)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-primary text-lg">
                  No analytics data available
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full py-0 md:py-5 grid grid-cols-1">
          <ViewTable
            totalJobs={totalJobs}
            selectedDate={selectedDate}
            selectedPlatform={selectedPlatform}
            onGoBack={handleGoBack}
          />
        </div>
      )}
    </>
  )
}

export default SessionDiv
