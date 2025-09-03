import React, { useState, useEffect, useRef } from "react"
import {
  HiArrowLeft,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight
} from "react-icons/hi"
import Button from "../../../../components/Button"
import { errorToast } from "../../../../components/Toast"
import API_ENDPOINTS from "../../../../api/endpoints"
import CircularIndeterminate from "../../../../components/loader/circular"
import { analytics } from "@/src/api/functions/analytics"
import * as XLSX from "xlsx"

import { platformIcons } from "../.."
import { useDashboardStore } from "@/src/stores/dashboard"
const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

interface Props {
  onGoBack: () => void
  selectedPlatform: string | null
  selectedDate: Date | null
  totalJobs: number
}

type JobData = {
  _id: string | undefined
  companyName: string
  jobTitle: string
  byResume: string
  jobDate: string
  jobLink: string
  platform: string
}

type CSVData = {
  Company: string
  "Job Title": string
  Resume: string
  "Job Date": string
  "Job Link": string
  Platform: string
}

function getCSVData(data: JobData[]): CSVData[] {
  return data.map((job) => {
    const [plateform] = Object.entries(platformIcons).find(
      ([platform, icon]) =>
        platform.toLowerCase() === job.platform.toLowerCase()
    ) || ["LinkedIn"]

    return {
      Company: job.companyName,
      "Job Title": job.jobTitle,
      Resume: job.byResume,
      "Job Date": job.jobDate,
      "Job Link": job.jobLink.split("?")[0],
      Platform: plateform
    }
  })
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".txt") ? filename : `${filename}.txt`
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const ViewTable = ({
  onGoBack,
  selectedPlatform,
  selectedDate,
  totalJobs
}: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [jobData, setJobData] = useState<JobData[]>([])

  const [loadedPages, setLoadedPages] = useState<number[]>([])
  const [allLoaded, setAllLoaded] = useState(false)

  const [loading, setLoading] = useState(false)

  const rowsPerPage = 20 // Number of rows to display per page

  const resumes = useDashboardStore((state) => state.resumeList)

  const dataToExport = useRef<CSVData[]>([])
  const exportFileName = useRef<string>(
    `Analytics ${selectedDate?.toLocaleDateString() || ""} ${
      selectedPlatform?.toUpperCase() || ""
    }`
  )

  // Fetch job data from API
  const fetchJobData = async (
    date: Date | null,
    platform: string | null,
    page: number,
    loadAll: boolean = false
  ) => {
    console.log("fetchJobData", { date, platform })
    const queryParams = new URLSearchParams({})

    if (platform) {
      queryParams.append("platformName", platform)
    }

    // Only append the date parameter if selectedDate is not empty or null
    if (date) {
      // Format date to YYYY-MM-DD if selectedDate exists
      const formattedDate = date.toISOString().split("T")[0]
      queryParams.append("date", formattedDate)
    }

    if (page && !loadAll) {
      queryParams.append("page", page.toString())
    }

    if (loadAll) {
      queryParams.append("limit", totalJobs.toString())
    }

    setLoading(true)

    try {
      const response = await analytics.viewJobHistory(queryParams)

      if (!response.success) {
        throw new Error(response.message)
      }

      if (response.success && response.jobActivities) {
        // Map API response to match the expected format
        const mappedData: JobData[] = response.jobActivities.map((job) => {
          const foundPlatform = Object.entries(platformIcons).find(
            ([platform]) =>
              platform.toLowerCase() === job.platform.toLowerCase()
          )

          return {
            _id: job._id,
            companyName: job.companyName,
            jobTitle: job.jobTitle,
            byResume:
              resumes.find((resume) => resume._id === job.resumeId)?.name ||
              job.resumeId, // Map resumeChosen to byResume
            jobDate: new Date(
              (job.createdAt as string)?.split("T")[0]
            )?.toLocaleDateString(), // Format date
            jobLink: job.jobUrl,
            platform: foundPlatform?.[1] || platformIcons.LinkedIn
          }
        })

        let newData = [
          ...jobData,
          ...mappedData.filter(
            (newJob) =>
              jobData.find((job) => job._id === newJob._id) === undefined
          )
        ]

        if (loadAll) {
          dataToExport.current = getCSVData(newData)
        }

        setJobData(newData)
      }
    } catch (error) {
      console.error("Error fetching job data:", error)
      const message = error instanceof Error ? error.message : "Unknown error"
      errorToast(message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts or when parameters change
  useEffect(() => {
    if (selectedPlatform || selectedDate) {
      if (!loadedPages.includes(currentPage)) {
        if (allLoaded) return
        fetchJobData(selectedDate, selectedPlatform, currentPage)
        setLoadedPages([...loadedPages, currentPage])
      }
    }
  }, [selectedPlatform, selectedDate, currentPage])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Calculate pagination details
  const totalPages = Math.ceil(totalJobs / rowsPerPage)
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = jobData.slice(indexOfFirstRow, indexOfLastRow)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  async function loadAllData() {
    if (jobData.length == totalJobs) {
      dataToExport.current = getCSVData(jobData)
      return setAllLoaded(true)
    }

    await fetchJobData(selectedDate, selectedPlatform, currentPage, true)
    setAllLoaded(true)
  }

  async function exportToExcel() {
    await loadAllData()

    if (dataToExport.current.length === 0) {
      return errorToast("No data to export.")
    }

    const workbook = XLSX.utils.book_new()

    const worksheet = XLSX.utils.json_to_sheet(dataToExport.current)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.utils.sheet_to_csv(worksheet)
    XLSX.writeFile(workbook, `${exportFileName.current}.xlsx`)
    setIsDropdownOpen(false)
  }

  async function exportToCSV() {
    await loadAllData()

    if (dataToExport.current.length === 0) {
      return errorToast("No data to export.")
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport.current)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs")
    XLSX.writeFile(workbook, `${exportFileName.current}.csv`, {
      bookType: "csv"
    })
    setIsDropdownOpen(false)
  }

  async function exportToTxt() {
    await loadAllData()

    if (dataToExport.current.length === 0) {
      return errorToast("No data to export.")
    }

    const text = dataToExport.current
      .map(
        (row) =>
          `Company: ${row.Company}\nJob Title: ${row["Job Title"]}\nResume: ${row.Resume}\nJob Date: ${row["Job Date"]}\nJob Link: ${row["Job Link"]}\nPlatform: ${row.Platform}\n`
      )
      .join("\n")
    downloadTextFile(`${exportFileName.current}.txt`, text)
    setIsDropdownOpen(false)
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
      <div className="w-full md:py-5">
        {/* Export and Go Back Buttons */}
        <div className="w-full md:flex items-center md:justify-between space-y-5 ">
          <div className="flex w-full items-center gap-2 text-primary text-xl md:text-2xl font-medium ">
            <p>Total Applied Jobs:</p>
            <p>{totalJobs}</p>
          </div>
          <div className="flex w-full items-center justify-end gap-5 ">
            <div className="relative">
              <Button
                onClick={toggleDropdown}
                className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                Export To <HiChevronDown className="ml-2" />
              </Button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-inputBackGround shadow-lg rounded-md border border-formBorders">
                  <ul className="py-1 text-primary">
                    <li
                      onClick={exportToExcel}
                      className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
                      XLS
                    </li>
                    <li
                      onClick={exportToTxt}
                      className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
                      TXT
                    </li>
                    <li
                      onClick={exportToCSV}
                      className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
                      CSV
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <Button
              onClick={onGoBack}
              className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
              <HiArrowLeft className="mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Job Details Table */}
        <div className="overflow-x-auto w-[99%] md:w-full  md:mt-5">
          <table className="w-full overflow-x-auto text-left border-collapse ">
            <thead>
              <tr>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 text-center rounded-md">
                    Company Name
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    Job Title
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    By Resume
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    Job Date
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    Platform
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    Job Link
                  </div>
                </th>
              </tr>

              {/* <tr>
                <th className="px-2 py-2">
                  <select
                    className="w-full p-2 border rounded bg-dropdownBackground"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}>
                    <option className="bg-inputBackGround" value="">
                      All Companies
                    </option>
                    {uniqueCompanies.map((company) => (
                      <option
                        className="bg-inputBackGround"
                        key={company}
                        value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    className="w-full p-2 border rounded bg-dropdownBackground"
                    value={selectedJobTitle}
                    onChange={(e) => setSelectedJobTitle(e.target.value)}>
                    <option className="bg-inputBackGround" value="">
                      All Job Titles
                    </option>
                    {uniqueJobTitles.map((title) => (
                      <option
                        className="bg-inputBackGround"
                        key={title}
                        value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    className="w-full p-2 border rounded bg-dropdownBackground"
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}>
                    <option className="bg-inputBackGround" value="">
                      All Resumes
                    </option>
                    {uniqueResumes.map((resume) => (
                      <option
                        className="bg-inputBackGround"
                        key={resume}
                        value={resume}>
                        {resume}
                      </option>
                    ))}
                  </select>
                </th>
                <th></th>
                <th></th>
              </tr> */}
            </thead>

            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((job, index) => (
                  <tr key={job._id || index} className="text-center">
                    <td className="px-2 py-2">
                      <div className="px-6 md:px-4 py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
                        {job.companyName}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="px-6 md:px-4 py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
                        {job.jobTitle}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="px-6 md:px-4  py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
                        {job.byResume}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="px-6 md:px-4  py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
                        {job.jobDate}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center">
                        <img
                          src={job.platform}
                          alt={job.platform}
                          className=" bg-dropdownBackground rounded-md whitespace-nowrap"></img>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <a
                        href={job.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-6 md:px-4 py-4 bg-gradient-to-b from-gradientStart to-gradientEnd rounded-md whitespace-nowrap text-navbar hover:text-white hover:shadow-lg transition-all duration-200">
                        Link
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <p className="text-primary text-lg">No jobs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-5 mt-4 px-3">
            <div className="flex gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-3  rounded-md bg-dropdownBackground text-primary border border-customGray cursor-pointer hover:border-purple disabled:opacity-50 disabled:cursor-not-allowed">
                <HiChevronLeft />
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-3  rounded-md bg-dropdownBackground text-primary border border-customGray cursor-pointer hover:border-purple disabled:opacity-50 disabled:cursor-not-allowed">
                <HiChevronRight />
              </Button>
            </div>
            <p className="text-sm">
              Page {currentPage} of {totalPages} | Rows: {indexOfFirstRow + 1} -{" "}
              {Math.min(indexOfLastRow, totalJobs)} of {totalJobs}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default ViewTable
