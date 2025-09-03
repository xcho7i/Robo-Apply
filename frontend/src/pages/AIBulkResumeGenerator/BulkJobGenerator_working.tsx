"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { Label } from "./components/ui/label"
import DashBoardLayout from "../../dashboardLayout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./components/ui/select"
import {
  Plus,
  X,
  Loader2,
  Sparkles,
  Building2,
  FileText,
  Brain,
  Target,
  Upload,
  Download,
  Eye
} from "lucide-react"
import { Alert, AlertDescription } from "./components/ui/alert"
import { Badge } from "./components/ui/badge"
import { Checkbox } from "./components/ui/checkbox"
import * as XLSX from "xlsx"
import * as mammoth from "mammoth"
import { marked } from "marked"
import {
  downloadTailoredResume,
  generateModernResumeDocx
} from "./lib/modern-resume-generator"
import { successToast, errorToast } from "../../components/Toast"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../api/endpoints"

interface JobRow {
  id: string
  companyUrl: string
  jobTitle: string
  description: string
  skills: string
}

interface BulkJobGeneratorProps {
  className?: string
  onJobsGenerated?: (jobs: JobRow[]) => void
}

const BulkJobGenerator: React.FC<BulkJobGeneratorProps> = ({
  className = "",
  onJobsGenerated
}) => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobRow[]>([
    {
      id: "1",
      companyUrl: "",
      jobTitle: "",
      description: "",
      skills: ""
    }
  ])

  const [language, setLanguage] = useState("English (US)")
  const [yearsOfExperience, setYearsOfExperience] = useState("2-5")
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bulkGenerating, setBulkGenerating] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<{ [key: string]: string }>({})
  const [baseResume, setBaseResume] = useState<File | null>(null)
  const [baseResumeContent, setBaseResumeContent] = useState<string>("")
  const [includeDescriptions, setIncludeDescriptions] = useState(false)
  const [isUploadingExcel, setIsUploadingExcel] = useState(false)
  const [isGeneratingResumes, setIsGeneratingResumes] = useState(false)
  const [editingDescriptions, setEditingDescriptions] = useState<Set<string>>(
    new Set()
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [retryReady, setRetryReady] = useState<{ [key: string]: boolean }>({})

  // Basic utility functions
  const addRow = () => {
    if (jobs.length >= 100) {
      setError("Maximum of 100 job rows allowed")
      return
    }

    const newJob: JobRow = {
      id: Date.now().toString(),
      companyUrl: "",
      jobTitle: "",
      description: "",
      skills: ""
    }
    setJobs([...jobs, newJob])
  }

  const removeRow = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id))
  }

  const updateJob = (id: string, field: keyof JobRow, value: string) => {
    setJobs(
      jobs.map((job) => (job.id === id ? { ...job, [field]: value } : job))
    )
  }

  // API generation functions
  const generateAllTitles = async () => {
    const entriesWithUrl = jobs.filter((job) => job.companyUrl.trim())
    if (entriesWithUrl.length === 0) {
      errorToast("Please add company URLs to generate titles")
      return
    }

    try {
      setIsProcessing(true)
      let successCount = 0
      for (const job of entriesWithUrl) {
        try {
          const requestBody = {
            company_url: job.companyUrl,
            context: job.jobTitle.trim() || "", // Use existing title as context
            target_role: job.jobTitle.trim() || "",
            years_experience: parseInt(yearsOfExperience.split("-")[0]) || 0,
            language: language
          }

          const response = await fetch(API_ENDPOINTS.GenerateSingleAIJobTitle, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(requestBody)
          })

          if (response.ok) {
            const result = await response.json()
            updateJob(
              job.id,
              "jobTitle",
              result.data?.job_title || "Generated Title"
            )
            successCount++
          }
        } catch (error) {
          console.error(`Failed to generate title for job ${job.id}:`, error)
        }
      }

      if (successCount > 0) {
        successToast(`Generated ${successCount} job titles`)
      } else {
        errorToast("Failed to generate any titles")
      }
    } catch (error) {
      console.error("Error in bulk title generation:", error)
      errorToast("Failed to generate titles")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateAllDescriptions = async () => {
    const entriesWithTitle = jobs.filter((job) => job.jobTitle.trim())
    if (entriesWithTitle.length === 0) {
      errorToast("Please add job titles to generate descriptions")
      return
    }

    try {
      setIsProcessing(true)
      let successCount = 0
      for (const job of entriesWithTitle) {
        try {
          const response = await fetch(
            API_ENDPOINTS.GenerateSingleAIJobDescriptionV2,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`
              },
              body: JSON.stringify({
                job_title: job.jobTitle,
                company_url: job.companyUrl,
                generate_type: "description"
              })
            }
          )

          if (response.ok) {
            const result = await response.json()
            updateJob(
              job.id,
              "description",
              result.data?.job_description || "Generated description..."
            )
            successCount++
          }
        } catch (error) {
          console.error(
            `Failed to generate description for job ${job.id}:`,
            error
          )
        }
      }

      if (successCount > 0) {
        successToast(`Generated ${successCount} job descriptions`)
      } else {
        errorToast("Failed to generate any descriptions")
      }
    } catch (error) {
      console.error("Error in bulk description generation:", error)
      errorToast("Failed to generate descriptions")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateAllSkills = async () => {
    const entriesWithContent = jobs.filter(
      (job) => job.jobTitle.trim() || job.description.trim()
    )
    if (entriesWithContent.length === 0) {
      errorToast("Please add job titles or descriptions to generate skills")
      return
    }

    try {
      setIsProcessing(true)
      let successCount = 0
      for (const job of entriesWithContent) {
        try {
          const response = await fetch(API_ENDPOINTS.GenerateSingleAISkill, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({
              company_url: job.companyUrl,
              job_title: job.jobTitle,
              job_description: job.description,
              generate_type: "skills"
            })
          })

          if (response.ok) {
            const result = await response.json()
            updateJob(
              job.id,
              "skills",
              result.data?.skills || "Generated skills..."
            )
            successCount++
          }
        } catch (error) {
          console.error(`Failed to generate skills for job ${job.id}:`, error)
        }
      }

      if (successCount > 0) {
        successToast(`Generated ${successCount} skills lists`)
      } else {
        errorToast("Failed to generate any skills")
      }
    } catch (error) {
      console.error("Error in bulk skills generation:", error)
      errorToast("Failed to generate skills")
    } finally {
      setIsProcessing(false)
    }
  }

  // Individual generation functions
  const generateTitles = async (job: JobRow) => {
    if (!job.companyUrl.trim()) {
      errorToast("Please enter a company URL first")
      return
    }
    try {
      setIsProcessing(true)

      const requestBody = {
        company_url: job.companyUrl,
        context: job.jobTitle.trim() || "", // Use existing title as context
        target_role: job.jobTitle.trim() || "",
        years_experience: parseInt(yearsOfExperience.split("-")[0]) || 0,
        language: language
      }

      const response = await fetch(API_ENDPOINTS.GenerateSingleAIJobTitle, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error("Failed to generate titles")
      }

      const result = await response.json()
      updateJob(job.id, "jobTitle", result.data?.job_title || "Generated Title")
      successToast("Job title generated successfully")
    } catch (error) {
      console.error("Error generating titles:", error)
      errorToast("Failed to generate job title")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateDescriptions = async (job: JobRow) => {
    if (!job.jobTitle.trim()) {
      errorToast("Please enter a job title first")
      return
    }
    try {
      setIsProcessing(true)
      const response = await fetch(
        API_ENDPOINTS.GenerateSingleAIJobDescriptionV2,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          },
          body: JSON.stringify({
            job_title: job.jobTitle,
            company_url: job.companyUrl,
            generate_type: "description"
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to generate description")
      }

      const result = await response.json()
      updateJob(
        job.id,
        "description",
        result.data?.job_description || "Generated description..."
      )
      successToast("Job description generated successfully")
    } catch (error) {
      console.error("Error generating description:", error)
      errorToast("Failed to generate job description")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateSkills = async (job: JobRow) => {
    if (!job.jobTitle.trim() && !job.description.trim()) {
      errorToast("Please enter a job title or description first")
      return
    }
    try {
      setIsProcessing(true)
      const response = await fetch(API_ENDPOINTS.GenerateSingleAISkill, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          company_url: job.companyUrl,
          job_title: job.jobTitle,
          job_description: job.description,
          generate_type: "skills"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to generate skills")
      }

      const result = await response.json()
      updateJob(job.id, "skills", result.data?.skills || "Generated skills...")
      successToast("Skills generated successfully")
    } catch (error) {
      console.error("Error generating skills:", error)
      errorToast("Failed to generate skills")
    } finally {
      setIsProcessing(false)
    }
  }

  // Comprehensive row generation with retry mechanism
  const generateRowAI = async (job: JobRow) => {
    if (!job.companyUrl.trim()) {
      errorToast("Please enter a company URL first")
      return
    }

    setIsProcessing(true)
    setFieldErrors({})
    setRetryReady({})

    const localGeneratedData = {
      jobTitle: job.jobTitle,
      description: job.description,
      skills: job.skills
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`
    }

    const bodyForTitle = JSON.stringify({
      company_url: job.companyUrl,
      context: job.jobTitle.trim() || "", // Use existing title as context
      target_role: job.jobTitle.trim() || "",
      years_experience: parseInt(yearsOfExperience.split("-")[0]) || 0,
      language: language
    })

    const bodyForDescription = JSON.stringify({
      job_title: localGeneratedData.jobTitle,
      company_url: job.companyUrl,
      generate_type: "description"
    })

    const bodyForSkills = JSON.stringify({
      company_url: job.companyUrl,
      job_title: localGeneratedData.jobTitle,
      job_description: localGeneratedData.description,
      generate_type: "skills"
    })

    const fetchTitle = fetch(API_ENDPOINTS.GenerateSingleAIJobTitle, {
      method: "POST",
      headers,
      body: bodyForTitle
    })

    const fetchDescription = fetch(
      API_ENDPOINTS.GenerateSingleAIJobDescriptionV2,
      {
        method: "POST",
        headers,
        body: bodyForDescription
      }
    )

    const fetchSkills = fetch(API_ENDPOINTS.GenerateSingleAISkill, {
      method: "POST",
      headers,
      body: bodyForSkills
    })

    Promise.allSettled([fetchTitle, fetchDescription, fetchSkills])
      .then(async (results) => {
        const [titleResult, descResult, skillsResult] = results

        const parseJson = async (res: any) => {
          if (res.status === "fulfilled") {
            try {
              return await res.value.json()
            } catch {
              return null
            }
          }
          return null
        }

        const titleData = await parseJson(titleResult)
        const descData = await parseJson(descResult)
        const skillsData = await parseJson(skillsResult)

        const newErrors: { [key: string]: string } = {}

        const handleRateLimit = (key: string, waitMs: number) => {
          newErrors[key] = `Rate limit exceeded. Please wait ${Math.ceil(
            waitMs / 1000
          )}s.`
          setTimeout(() => {
            setRetryReady((prev) => ({ ...prev, [key]: true }))
          }, waitMs)
        }

        if (titleData?.data?.wait_ms) {
          handleRateLimit("jobTitle", titleData.data.wait_ms)
        }

        if (descData?.data?.wait_ms) {
          handleRateLimit("description", descData.data.wait_ms)
        }

        if (skillsData?.data?.wait_ms) {
          handleRateLimit("skills", skillsData.data.wait_ms)
        }

        setFieldErrors(newErrors)

        if (titleData?.data?.job_title && !localGeneratedData.jobTitle.trim()) {
          localGeneratedData.jobTitle = titleData.data.job_title
        }

        if (
          descData?.data?.job_description &&
          !localGeneratedData.description.trim()
        ) {
          localGeneratedData.description = descData.data.job_description
        }

        if (skillsData?.data?.skills && !localGeneratedData.skills.trim()) {
          localGeneratedData.skills = skillsData.data.skills
        }

        setJobs((prevJobs) =>
          prevJobs.map((prevJob) =>
            prevJob.id === job.id
              ? {
                  ...prevJob,
                  jobTitle: localGeneratedData.jobTitle,
                  description: localGeneratedData.description,
                  skills: localGeneratedData.skills
                }
              : prevJob
          )
        )

        const generatedItems: ("title" | "description" | "skills")[] = []
        if (localGeneratedData.jobTitle !== job.jobTitle)
          generatedItems.push("title")
        if (localGeneratedData.description !== job.description)
          generatedItems.push("description")
        if (localGeneratedData.skills !== job.skills)
          generatedItems.push("skills")

        if (generatedItems.length > 0) {
          successToast(`Generated ${generatedItems.join(", ")} for this row`)
        } else if (Object.keys(newErrors).length === 0) {
          successToast("All fields already have content")
        }
      })
      .catch((err) => {
        console.error("Error during Promise.allSettled processing:", err)
        errorToast("Something went wrong while generating AI content")
      })
      .finally(() => {
        setIsProcessing(false)
      })
  }

  return (
    <DashBoardLayout>
      <div className={`space-y-8 ${className}`}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              Bulk Job Application Generator
              <Badge variant="secondary" className="ml-2">
                AI-Powered
              </Badge>
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Generate multiple tailored job applications efficiently. Add
              company URLs and let AI create job titles, descriptions, and
              required skills.
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {/* Job Table */}
            <div className="space-y-4">
              {/* Bulk Actions */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Job Entries
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Bulk Actions:</span>
                  <Button
                    onClick={generateAllTitles}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    <Sparkles className="mr-1 h-3 w-3" />
                    <span className="text-xs">Titles</span>
                  </Button>
                  <Button
                    onClick={generateAllDescriptions}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100">
                    <Sparkles className="mr-1 h-3 w-3" />
                    <span className="text-xs">Descriptions</span>
                  </Button>
                  <Button
                    onClick={generateAllSkills}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100">
                    <Sparkles className="mr-1 h-3 w-3" />
                    <span className="text-xs">Skills</span>
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-3 text-gray-700 font-medium text-sm">
                          Company URL*
                        </th>
                        <th className="text-left p-3 text-gray-700 font-medium text-sm">
                          Job Title
                        </th>
                        <th className="text-left p-3 text-gray-700 font-medium text-sm">
                          Job Description
                        </th>
                        <th className="text-left p-3 text-gray-700 font-medium text-sm">
                          Skills
                        </th>
                        <th className="text-left p-3 text-gray-700 font-medium text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job, index) => (
                        <tr
                          key={job.id}
                          className={`${
                            index !== jobs.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          }`}>
                          {/* Company URL */}
                          <td className="p-3 w-1/5">
                            <Input
                              value={job.companyUrl}
                              onChange={(e) =>
                                updateJob(job.id, "companyUrl", e.target.value)
                              }
                              placeholder="google.com"
                              className="border-gray-200 focus:border-blue-500"
                            />
                          </td>

                          {/* Job Title */}
                          <td className="p-3 w-1/5">
                            <div className="group relative">
                              <Input
                                value={job.jobTitle}
                                onChange={(e) =>
                                  updateJob(job.id, "jobTitle", e.target.value)
                                }
                                placeholder="Software Engineer"
                                className="border-gray-200 focus:border-green-500 pr-10"
                              />
                              <Button
                                onClick={() => generateTitles(job)}
                                disabled={isProcessing}
                                size="sm"
                                variant="ghost"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-purple hover:text-purple/80 hover:bg-purple/10 transition-all disabled:opacity-50 flex items-center justify-center rounded opacity-30 group-hover:opacity-100">
                                <Sparkles className="h-3 w-3" />
                              </Button>
                            </div>
                            {retryReady[`jobTitle-${job.id}`] ? (
                              <Button
                                onClick={() => {
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    [`jobTitle-${job.id}`]: ""
                                  }))
                                  setRetryReady((prev) => ({
                                    ...prev,
                                    [`jobTitle-${job.id}`]: false
                                  }))
                                  generateTitles(job)
                                }}
                                variant="link"
                                size="sm"
                                className="text-purple underline text-xs p-0 h-auto">
                                Retry
                              </Button>
                            ) : fieldErrors[`jobTitle-${job.id}`] ? (
                              <p className="text-red-400 text-xs">
                                {fieldErrors[`jobTitle-${job.id}`]}
                              </p>
                            ) : null}
                          </td>

                          {/* Job Description */}
                          <td className="p-3 w-1/5">
                            <div className="group relative">
                              <Input
                                value={job.description}
                                onChange={(e) =>
                                  updateJob(
                                    job.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter job description"
                                className="border-gray-200 focus:border-purple-500 pr-10"
                              />
                              <Button
                                onClick={() => generateDescriptions(job)}
                                disabled={isProcessing}
                                size="sm"
                                variant="ghost"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-purple hover:text-purple/80 hover:bg-purple/10 transition-all disabled:opacity-50 flex items-center justify-center rounded opacity-30 group-hover:opacity-100">
                                <Sparkles className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>

                          {/* Skills */}
                          <td className="p-3 w-1/5">
                            <div className="group relative">
                              <Input
                                value={job.skills}
                                onChange={(e) =>
                                  updateJob(job.id, "skills", e.target.value)
                                }
                                placeholder="Enter Skills"
                                className="border-gray-200 focus:border-orange-500 pr-10"
                              />
                              <Button
                                onClick={() => generateSkills(job)}
                                disabled={isProcessing}
                                size="sm"
                                variant="ghost"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-purple hover:text-purple/80 hover:bg-purple/10 transition-all disabled:opacity-50 flex items-center justify-center rounded opacity-30 group-hover:opacity-100">
                                <Sparkles className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3 w-1/5">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => generateRowAI(job)}
                                disabled={isProcessing}
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                title="Generate all AI content for this row">
                                {isProcessing ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3 w-3" />
                                )}
                              </Button>
                              {jobs.length > 1 && (
                                <Button
                                  onClick={() => removeRow(job.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add New Row */}
                <div className="border-t border-gray-100 p-3">
                  <Button
                    onClick={addRow}
                    disabled={jobs.length >= 100}
                    variant="outline"
                    className="w-full border-dashed border-2 py-4 text-purple hover:border-purple transition-colors">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Job Entry ({jobs.length}/100)
                  </Button>
                </div>
              </div>
            </div>

            {/* Core Settings */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-dashed border-purple-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Core Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English (US)">English (US)</SelectItem>
                      <SelectItem value="English (UK)">English (UK)</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                      <SelectItem value="Russian">Russian</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Years of Experience
                  </Label>
                  <Select
                    value={yearsOfExperience}
                    onValueChange={setYearsOfExperience}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">
                        Entry Level (0-1 years)
                      </SelectItem>
                      <SelectItem value="2-3">Junior (2-3 years)</SelectItem>
                      <SelectItem value="2-5">Mid-level (2-5 years)</SelectItem>
                      <SelectItem value="4-7">
                        Experienced (4-7 years)
                      </SelectItem>
                      <SelectItem value="6-10">Senior (6-10 years)</SelectItem>
                      <SelectItem value="8-15">Lead (8-15 years)</SelectItem>
                      <SelectItem value="10+">Expert (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashBoardLayout>
  )
}

export default BulkJobGenerator
