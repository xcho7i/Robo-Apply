import React, { createContext, useState, useContext, useEffect } from "react"
import API_ENDPOINTS from "@/src/api/endpoints"
import { errorToast } from "../components/Toast"

const YourResumeContext = createContext()
const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

export const useYourResume = () => useContext(YourResumeContext)

export const YourResumeProvider = ({ children }) => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
  const userId = userData?._id

  // Fetch resumes from backend on mount
  const fetchResumes = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.GetYourResume}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId })
      })

      if (!res.ok) throw new Error(await res.text())

      const result = await res.json()
      if (result.success && Array.isArray(result.uploadedFiles)) {
        setUploadedFiles(result.uploadedFiles)
      } else {
        throw new Error(result.msg || "Invalid server response")
      }
    } catch (err) {
      console.error(err)
      errorToast(err.message || "Failed to load resumes")
    } finally {
      setLoading(false)
    }
  }

  // Add new uploaded files
  const addUploadedFiles = (newFiles) => {
    // Ensure newFiles is always an array
    const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles]

    setUploadedFiles((prev) => {
      const combined = [...prev, ...filesArray]

      const uniqueFiles = combined.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name && f.date === file.date)
      )

      return uniqueFiles
    })
  }

  useEffect(() => {
    // fetchResumes()
  }, [])

  return (
    <YourResumeContext.Provider
      value={{ uploadedFiles, addUploadedFiles, fetchResumes, loading }}>
      {children}
    </YourResumeContext.Provider>
  )
}
