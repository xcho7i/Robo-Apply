import { SubscriptionType } from "@/src/stores/subscription"
import { BASE_URL } from ".."
import API_ENDPOINTS from "../endpoints"
import { Util } from "./util"

const CreditsValues = {
  AutoApply: 6,
  TailoredResume: 15,
  AICoverLetter: 7,
  ResumeBuilder: 9,
  ResumeScore: 8,
  InterviewBuddy: 15
}

class USER extends Util {
  async getSubscriptionData() {
    try {
      const subRes = await this.fetchData(
        `${BASE_URL}${API_ENDPOINTS.SubscriptionData}`
      )
      const data: SubscriptionType & { msg: string } = await subRes.json()

      if (data?.success == false) {
        return {
          success: false,
          message: data?.msg
        }
      }

      return { data, success: true }
    } catch (error: any) {
      const errorMsg = (error as Error).message
      console.error("Error checking subscription:", error)
      return {
        success: false,
        message: errorMsg || "Failed to check subscription. Please try again."
      }
    }
  }

  async deductCredits(credits: keyof typeof CreditsValues) {
    const url = `${BASE_URL}${API_ENDPOINTS.DeductCredits}`
    try {
      const res = await this.fetchData(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ credits: CreditsValues[credits] })
      })

      const result = await res.json()
      if (result?.success == false) {
        throw new Error(result.msg)
      }

      return {
        success: true,
        message: result.msg
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

const User = new USER()
export { User }
