import React, { useEffect, useState } from "react"
import DashBoardLayout from "../../../dashboardLayout"
import { errorToast, successToast } from "../../../components/Toast"
import { useNavigate } from "react-router-dom"

import CoverLetterTemplate from "../templates"
import API_ENDPOINTS from "../../../api/endpoints"
import CircularIndeterminate from "../../../components/loader/circular"
import CoverLetterFinalLoader from "../../../components/loader/CoverLetterFinalLoader"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const ShowCoverLetter = () => {
  const [userData, setUserData] = useState({})
  const [companyData, setCompanyData] = useState({})
  const [letterBody, setLetterBody] = useState("")
  const [showRegenerate, setShowRegenerate] = useState(false)
  const [selectedOption, setSelectedOption] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("coverLetterUserData")
  //   const storedCompany = localStorage.getItem("coverLetterCompanyData")
  //   const storedLetter = localStorage.getItem("coverLetterBody")

  //   if (storedUser) setUserData(JSON.parse(storedUser))
  //   if (storedCompany) setCompanyData(JSON.parse(storedCompany))
  //   if (storedLetter) setLetterBody(storedLetter)
  // }, [])

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("coverLetterUserData")
      const storedCompany = localStorage.getItem("coverLetterCompanyData")
      const storedLetter = localStorage.getItem("coverLetterBody")

      // Safely parse user data
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        try {
          setUserData(JSON.parse(storedUser))
        } catch (error) {
          console.error("Error parsing user data:", error)
          setUserData({})
        }
      }

      // Safely parse company data
      if (
        storedCompany &&
        storedCompany !== "undefined" &&
        storedCompany !== "null"
      ) {
        try {
          setCompanyData(JSON.parse(storedCompany))
        } catch (error) {
          console.error("Error parsing company data:", error)
          setCompanyData({})
        }
      }

      // Letter body is stored as string, no need to parse
      if (
        storedLetter &&
        storedLetter !== "undefined" &&
        storedLetter !== "null"
      ) {
        setLetterBody(storedLetter)
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      // Set default values if everything fails
      setUserData({})
      setCompanyData({})
      setLetterBody("")
    }
  }, [])

  const handleRegenerate = () => {
    setShowRegenerate(true)
  }

  const handleSelectOption = (option) => {
    if (selectedOption === option) {
      setSelectedOption("")
      setInputValue("")
    } else {
      setSelectedOption(option)
      setInputValue(option)
    }
  }

  const handleRegenerateClick = async () => {
    if (!inputValue.trim()) {
      errorToast("Please enter a job title or select an option.")
      return
    }

    const stringifyData = (data) =>
      Object.values(data)
        .filter((val) => val && val.trim() !== "")
        .join(",")

    const personal_details = stringifyData(userData)
    const company = stringifyData(companyData)
    const cover_letter = letterBody?.trim() || ""
    const user_message = inputValue.trim()

    if (!cover_letter) {
      errorToast("Original cover letter is missing.")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("personal_details", personal_details)
      formData.append("Company", company)
      formData.append("cover_letter", cover_letter)
      formData.append("user_message", user_message)

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.RegenerateCoverLetter}`,
        {
          method: "POST",
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error("Failed to regenerate cover letter")
      }

      const data = await response.json()

      // Save new data in localStorage
      if (data.userData)
        localStorage.setItem(
          "coverLetterUserData",
          JSON.stringify(data.userData)
        )
      if (data.companyData)
        localStorage.setItem(
          "coverLetterCompanyData",
          JSON.stringify(data.companyData)
        )
      if (data.letterBody)
        localStorage.setItem("coverLetterBody", data.letterBody)

      // Update state with regenerated content
      if (data.letterBody) setLetterBody(data.letterBody)

      console.log("Regeneration success:", data)
    } catch (error) {
      console.error("Error:", error)
      errorToast("Something went wrong while regenerating the cover letter.")
    } finally {
      setLoading(false)
      setShowRegenerate(false)
      setSelectedOption("")
      setInputValue("")
    }
  }

  const handleCancelRegenerate = () => {
    setShowRegenerate(false)
    setSelectedOption("")
    setInputValue("")
  }

  const handleSave = async () => {
    if (!userData || !companyData || !letterBody) {
      errorToast("Missing data to save the cover letter.")
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      errorToast("User not authenticated.")
      return
    }

    // setLoading(true)

    try {
      const payload = {
        userData,
        companyData,
        letterBody
      }

      const coverLetterId = localStorage.getItem("coverLetter_id")
      const isUpdate = !!coverLetterId
      const url = isUpdate
        ? `${BASE_URL}${API_ENDPOINTS.AddCoverLetter}/${coverLetterId}`
        : `${BASE_URL}${API_ENDPOINTS.AddCoverLetter}`

      const method = isUpdate ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error("Failed to save cover letter.")
      }

      const result = await response.json()

      if (result.success) {
        successToast(result.msg || "Cover letter saved successfully.")
      }

      navigate("/main-coverletter")
    } catch (error) {
      console.error("Save error:", error)
      errorToast("An error occurred while saving the cover letter.")
    } finally {
      // setLoading(false)
    }
  }

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          {/* <CircularIndeterminate /> */}
          <CoverLetterFinalLoader />
        </div>
      ) : (
        <DashBoardLayout>
          <div className="bg-almostBlack w-full min-h-screen px-4 py-8 md:py-12">
            <div className="text-center space-y-3">
              <p className="text-xl md:text-3xl font-normal text-primary">
                Generating AI Cover Letter
              </p>
              <hr className="border-t-2 border-simplePurple w-[80%] md:w-[60%] mx-auto" />
            </div>

            {/* ⬇️ Template rendered here */}
            <CoverLetterTemplate
              userData={userData}
              companyData={companyData}
              letterBody={letterBody}
              showRegenerate={showRegenerate}
              handleRegenerate={handleRegenerate}
              handleRegenerateClick={handleRegenerateClick}
              inputValue={inputValue}
              setInputValue={setInputValue}
              selectedOption={selectedOption}
              handleSelectOption={handleSelectOption}
              handleCancelRegenerate={handleCancelRegenerate}
              handleSave={handleSave}
            />
          </div>
        </DashBoardLayout>
      )}
    </>
  )
}

export default ShowCoverLetter
