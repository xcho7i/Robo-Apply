import * as XLSX from "xlsx"
import * as mammoth from "mammoth"
import { JobRow } from "../types"

/**
 * Extract text from PDF file using PDF.js with robust worker configuration
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Import pdfjs-dist dynamically to avoid SSR issues
    const pdfjs = await import("pdfjs-dist")

    // Set worker path with better error handling and fallbacks
    if (typeof window !== "undefined") {
      // Use unpkg as primary CDN with HTTPS protocol for better compatibility
      const workerUrls = [
        `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`,
        `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`,
        `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
        `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.js`,
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`,
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`,
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`,
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
      ]

      // Try to set worker with fallback mechanism
      let workerSet = false
      for (const workerUrl of workerUrls) {
        try {
          pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
          console.log(`🔧 Attempting to use PDF.js worker from: ${workerUrl}`)
          workerSet = true
          break
        } catch (e) {
          console.warn(`⚠️ Failed to set worker URL: ${workerUrl}`, e)
        }
      }

      if (!workerSet) {
        console.warn("⚠️ No worker URL could be set, attempting inline worker")
        // Fallback to using a blob URL with inline worker
        try {
          const workerCode = `
            importScripts('https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js');
          `
          const blob = new Blob([workerCode], {
            type: "application/javascript"
          })
          pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob)
        } catch (e) {
          console.warn("⚠️ Inline worker creation failed", e)
        }
      }
    }

    console.log(
      `� Attempting to extract text from PDF: ${file.name} (${(
        file.size /
        1024 /
        1024
      ).toFixed(2)} MB)`
    )

    const arrayBuffer = await file.arrayBuffer()

    // Add additional options for better compatibility and error handling
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      // @ts-ignore
      useSystemFonts: true,
      disableFontFace: false,
      verbosity: 0, // Reduce console noise
      isEvalSupported: false, // Disable eval for security
      disableAutoFetch: false, // Allow auto-fetching
      disableStream: false, // Allow streaming
      disableRange: false, // Allow range requests
      maxImageSize: 1024 * 1024, // Limit image size
      cMapPacked: true // Use packed character maps
    })

    // Add timeout for PDF loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("PDF loading timeout after 30 seconds")),
        30000
      )
    })

    const pdf = (await Promise.race([
      loadingTask.promise,
      timeoutPromise
    ])) as any
    console.log(`📊 PDF loaded successfully. Pages: ${pdf.numPages}`)

    let fullText = ""
    let successfulPages = 0
    let failedPages = 0

    // Extract text from all pages with error handling per page
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const pageTimeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Page ${i} processing timeout`)),
            10000
          )
        })

        const pagePromise = (async () => {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const textItems = textContent.items as any[]

          const pageText = textItems
            .filter(
              (item) =>
                item.str &&
                typeof item.str === "string" &&
                item.str.trim().length > 0
            )
            .map((item) => item.str.trim())
            .join(" ")

          // Clean up the page to free memory
          page.cleanup()

          return pageText
        })()

        const pageText = (await Promise.race([
          pagePromise,
          pageTimeoutPromise
        ])) as string

        if (pageText.trim()) {
          fullText += pageText + "\n"
          successfulPages++
        }

        console.log(
          `✅ Page ${i}/${pdf.numPages} processed successfully (${pageText.length} chars)`
        )
      } catch (pageError) {
        console.warn(`⚠️ Error processing page ${i}:`, pageError)
        failedPages++
        // Continue with other pages even if one fails
      }
    }

    const extractedText = fullText.trim()

    if (!extractedText || extractedText.length < 10) {
      throw new Error(
        `No readable text found in PDF. The file might be an image-based PDF, password-protected, or corrupted. Successfully processed ${successfulPages}/${pdf.numPages} pages (${failedPages} failed).`
      )
    }

    console.log(
      `✅ Successfully extracted ${extractedText.length} characters from ${successfulPages}/${pdf.numPages} pages (${failedPages} failed)`
    )
    return extractedText
  } catch (error) {
    console.error("❌ Error extracting text from PDF:", error)
    throw new Error(
      "Failed to extract text from PDF. Please ensure it is not image-based pdf."
    )
    // Provide more specific error messages
    // if (error instanceof Error) {
    //   if (
    //     error.message.includes("Worker") ||
    //     error.message.includes("worker")
    //   ) {
    //     throw new Error(
    //       "PDF processing error: Unable to load PDF worker. Please check your internet connection and try again."
    //     )
    //   } else if (
    //     error.message.includes("Invalid PDF") ||
    //     error.message.includes("invalid")
    //   ) {
    //     throw new Error(
    //       "Invalid PDF file: The file appears to be corrupted or is not a valid PDF."
    //     )
    //   } else if (
    //     error.message.includes("password") ||
    //     error.message.includes("encrypted")
    //   ) {
    //     throw new Error(
    //       "Password-protected PDF: This PDF requires a password and cannot be processed."
    //     )
    //   } else if (error.message.includes("timeout")) {
    //     throw new Error(
    //       "PDF processing timeout: The file is too large or complex. Please try a smaller PDF file."
    //     )
    //   } else if (error.message.includes("No readable text")) {
    //     throw error // Re-throw our custom message
    //   } else {
    //     throw new Error(`PDF processing failed: ${error.message}`)
    //   }
    // }

    // throw new Error(
    //   "Failed to extract text from PDF file. Please ensure the file is a valid, non-protected PDF with readable text content."
    // )
  }
}

/**
 * Extract text content from different file types
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.name.toLowerCase()

  if (fileType.endsWith(".pdf")) {
    return await extractTextFromPDF(file)
  } else if (fileType.endsWith(".docx")) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (err) {
      throw new Error("Invalid DOCX file")
    }
  } else if (fileType.endsWith(".txt")) {
    return await file.text()
  } else {
    throw new Error(
      "Unsupported file type. Please use .pdf, .docx, or .txt files."
    )
  }
}

/**
 * Parse Excel file and convert to JobRow array
 */
export const parseExcelFile = async (file: File): Promise<JobRow[]> => {
  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    throw new Error("Please upload a valid Excel file (.xlsx or .xls)")
  }

  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: "array" })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

  if (jsonData.length === 0) {
    throw new Error("Excel file appears to be empty")
  }

  // Flexible column mapping helper
  const getColumnValue = (row: any, possibleNames: string[]): string => {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null) {
        return String(row[name]).trim()
      }
    }
    return ""
  }

  // Map Excel data to job entries
  const newJobs: JobRow[] = jsonData.slice(0, 100).map((row, index) => ({
    id: (Date.now() + index).toString(),
    companyUrl: getColumnValue(row, [
      "Company URL",
      "companyUrl",
      "company_url",
      "URL",
      "url",
      "Company",
      "company",
      "Website",
      "website"
    ]),
    jobTitle: getColumnValue(row, [
      "Job Title",
      "jobTitle",
      "job_title",
      "Title",
      "title",
      "Position",
      "position",
      "Role",
      "role"
    ]),
    description: getColumnValue(row, [
      "Description",
      "description",
      "Job Description",
      "jobDescription",
      "job_description",
      "desc",
      "Desc"
    ]),
    skills: getColumnValue(row, [
      "Skills",
      "skills",
      "Required Skills",
      "requiredSkills",
      "required_skills",
      "skill",
      "Skill"
    ])
  }))

  // Filter out completely empty rows
  const validJobs = newJobs.filter(
    (job) =>
      job.companyUrl.trim() !== "" ||
      job.jobTitle.trim() !== "" ||
      job.description.trim() !== "" ||
      job.skills.trim() !== ""
  )

  if (validJobs.length === 0) {
    throw new Error("No valid job data found in Excel file")
  }

  return validJobs
}

/**
 * Generate context for title generation from existing job titles
 */
export const generateTitleContext = (jobs: JobRow[]): string => {
  const existingTitles = jobs
    .map((job) => job.jobTitle)
    .filter((title) => title.trim() !== "")
    .slice(0, 10) // Limit to 10 titles for context

  if (existingTitles.length === 0) {
    return ""
  }

  return `Use these existing job titles as context for similar roles: ${existingTitles.join(
    ", "
  )}`
}

/**
 * Validate if a URL is properly formatted
 */
export const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return false

  try {
    // Add protocol if missing
    const urlToTest = url.startsWith("http") ? url : `https://${url}`
    new URL(urlToTest)
    return true
  } catch {
    return false
  }
}

/**
 * Format company URL for API calls
 */
export const formatCompanyUrl = (url: string): string => {
  if (!url.trim()) return ""

  // Remove protocol and www if present, keep just the domain
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
}
