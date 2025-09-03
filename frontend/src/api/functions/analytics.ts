import { JobHistory } from "@types"
import { Util } from "./util"
import { BASE_URL } from ".."
import API_ENDPOINTS from "../endpoints"

class Analytics extends Util {
  async getJobHistoryCount(date?: string, platform?: string) {
    const url = new URL(`${BASE_URL}${API_ENDPOINTS.JobActivityCount}`)
    if (date) url.searchParams.set("date", date)
    if (platform) url.searchParams.set("platform", platform)

    interface JobHistoryCount {
      jobActivities: {
        resumeId: string
        platformName: string
        totalNoOfAppliedJobs: number
      }[]
      success: boolean
      msg: string
    }

    try {
      const res = await this.fetchData(url.href)
      const result: JobHistoryCount = await res.json()

      if (!result.success) {
        console.error(result.msg)
        throw new Error("Failed to retrieve job history.")
      }

      return {
        success: true,
        jobActivities: result.jobActivities
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred"
      console.error("Failed to retrieve job history:", error)
      return {
        success: false,
        message: errorMessage
      }
    }
  }
  async saveJobHistory(item: JobHistory) {
    const url = `${BASE_URL}${API_ENDPOINTS.SaveJobHistory}`
    const token = localStorage.getItem("access_token")

    if (!token) {
      return { success: false, message: "You are not authorized." }
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
      })

      const result = await res.json()
      if (!result.success) {
        console.error(result.msg)
        throw new Error("Failed to save job history")
      }

      console.log("Job history saved successfully:", result)
      return {
        success: true,
        message: "Job history saved successfully!"
      }
    } catch (error) {
      console.error("Error saving job history:", error)
      return {
        success: false,
        message: "Failed to save job history."
      }
    }
  }

  async viewJobHistory(query?: URLSearchParams) {
    const url = new URL(`${BASE_URL}${API_ENDPOINTS.ViewJobHistory}?${query}`)
    try {
      const res = await this.fetchData(url.href)
      const result = await res.json()
      return {
        success: true,
        jobActivities: (result?.jobActivities?.docs || []) as JobHistory[]
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred"
      console.error("Failed to retrieve job history:", error)
      return {
        success: false,
        message: errorMessage
      }
    }
  }
}

const analytics = new Analytics()
export { analytics }
