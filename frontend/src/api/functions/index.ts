import API_ENDPOINTS from "../endpoints"
import { JobHistory, Resume, ResumeList } from "@types"
import { BASE_URL } from ".."

interface GetAllResumes {
  error?: string
  resumes?: ResumeList[]
}

interface GetResumeDetails {
  resume?: Resume
  error?: string
}

async function getAllResumes(): Promise<GetAllResumes> {
  const token = localStorage.getItem("access_token")

  if (!token) {
    return { error: "You are not authorized." }
  }

  const fullUrl = `${BASE_URL}${API_ENDPOINTS.GetAllResumes}`

  try {
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error("Failed to fetch resumes")
    }

    const result = await response.json()

    if (result.success && result.resumes?.docs) {
      const formattedResumes: ResumeList[] = result.resumes.docs.map((doc) => ({
        _id: doc._id,
        name: doc.resumeName,
        jobTitle: doc.jobTitle || "N/A", // Fallback if jobTitle is not available
        status: doc.isComplete === true ? "Completed" : "Not Completed",
        updatedAt: doc.updatedAt
      }))

      return { resumes: formattedResumes }
    } else {
      throw new Error("Unexpected response structure")
    }
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return { error: "Failed to load resumes" }
  }
}

async function getResumeDetails(id: string): Promise<GetResumeDetails> {
  const token = localStorage.getItem("access_token")

  if (!token) {
    return { error: "Access token missing" }
  }
  const fullUrl = `${BASE_URL}${API_ENDPOINTS.ViewSpecificResume(id)}`

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const result = await response.json()

    if (result?.success && result?.resume) {
      return { resume: result.resume as Resume }
    }
    console.log(result)
    return { error: "Failed to retrieve resume data." }
  } catch (error) {
    return { error: "Failed to fetch resume details" }
  }
}
async function addResume(data: Resume) {
  const accessToken = localStorage.getItem("access_token")

  if (!accessToken) {
    return {
      success: false,
      message: "Access token is missing."
    }
  }

  const url = `${BASE_URL}${API_ENDPOINTS.AddResume}`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error("Failed to update resume")
    }

    const responseData = await response.json()
    console.log("Resume updated successfully:", responseData)
    return { success: true, message: "Resume data saved successfully!" }
  } catch (error) {
    console.error("Error saving resume:", error)
    return { success: false, message: "Failed to save resume!" }
  }
}

async function updateResume(id: string, data: Resume) {
  const accessToken = localStorage.getItem("access_token")

  if (!accessToken) {
    return {
      success: false,
      message: "Access token is missing."
    }
  }

  const url = `${BASE_URL}${API_ENDPOINTS.UpdateResume(id)}`

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error("Failed to update resume")
    }

    const responseData = await response.json()
    console.log("Resume updated successfully:", responseData)
    return { success: true, message: "Resume updated successfully!" }
  } catch (error) {
    console.error("Error updating resume:", error)
    return { success: false, message: "Failed to update resume!" }
  }
}

async function deleteResume(id: string) {
  const url = `${BASE_URL}${API_ENDPOINTS.DeleteResume}/${id}`
  const token = localStorage.getItem("access_token")

  if (!token) {
    return { success: false, message: "You are not authorized." }
  }

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error("Failed to delete resume")
    }

    console.log("Successfully deleted Resume ID:", id)

    // // Remove from local state
    // setResumes((prevResumes) =>
    //   prevResumes.filter((resume) => resume._id !== resumeId)
    // );
    // setLoading(false);

    return {
      success: true,
      message: "Resume deleted successfully!"
    }
  } catch (error) {
    console.error("Error deleting resume:", error)
    return {
      success: false,
      message: "Failed to delete resume."
    }
  }
}

async function saveJobHistory(item: JobHistory) {
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

async function addFeedback(
  feedbackRating: number,
  feedbackDescription: string
) {
  const url = `${BASE_URL}${API_ENDPOINTS.AddFeedback}`
  const token = localStorage.getItem("access_token")

  if (!token) {
    return { success: false, message: "You are not authorized." }
  }

  type FeedbackRes = {
    feedback: {
      feedbackDescription: string
      feedbackRating: number
    }
    msg: string
    success: true
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ feedbackRating, feedbackDescription })
    })

    const result: FeedbackRes = await res.json()
    if (!result.success) {
      throw new Error(result.msg)
    }

    return {
      success: true,
      message: result.msg
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error adding feedback"
    return {
      success: false,
      message: errorMessage
    }
  }
}

async function improveJobDescriptionWithAI(payload: any) {
  const accessToken = localStorage.getItem("access_token")

  if (!accessToken) {
    return {
      success: false,
      message: "Access token is missing."
    }
  }

  const url = `${BASE_URL}${API_ENDPOINTS.ImproveJobDescriptionWithAI}`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error("Failed to improve job description")
    }

    const responseData = await response.json()
    console.log("Job description improved successfully:", responseData)
    return { success: true, data: responseData }
  } catch (error) {
    console.error("Error improving job description:", error)
    return { success: false, message: "Failed to improve job description!" }
  }
}

export {
  getAllResumes,
  getResumeDetails,
  addResume,
  updateResume,
  deleteResume,
  saveJobHistory,
  addFeedback,
  improveJobDescriptionWithAI
}
