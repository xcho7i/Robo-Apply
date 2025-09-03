import { TailoredResumeData } from "../types"
import { Packer } from "docx"
import { generateModernResumeDocx } from "../../AIBulkResumeGenerator/utils/docxGenerator"

import API_ENDPOINTS from "@/src/api/endpoints"
import { Job, Resume } from "@types"

import { postRequest } from "@/src/api/httpRequests"
import { extractTextFromFile } from "../../AIBulkResumeGenerator/utils"
import mammoth from "mammoth"
import { PreviewData } from "../JobsFound/ResumePreview"
import { BASE_URL } from "@/src/api"
import { sleep } from "@/src/utils"

// Helper function to check if a job should be excluded from credit charges
const shouldExcludeFromCredits = (jobData: any): boolean => {
  // Check if the job has used_free_generation set to false
  // This means it was previously generated using credits and shouldn't be charged again for regeneration
  const usedFreeGeneration = jobData.generation_metadata?.used_free_generation

  console.log("🔍 Credit exclusion check for job:", {
    jobId: jobData.generation_id,
    jobTitle: jobData.job_details?.job_title,
    company: jobData.job_details?.company_name,
    usedFreeGeneration,
    shouldExclude: usedFreeGeneration === false
  })

  return usedFreeGeneration === false
}

// Helper function to create a readable preview text from structured data
const createResumePreviewText = (data: TailoredResumeData): string => {
  // Defensive check for full_name
  const fullName = data.full_name || "Resume Holder"
  let text = `${fullName.toUpperCase()}\n`
  text += "=".repeat(fullName.length) + "\n\n"

  // Contact Information
  const contactInfo: string[] = []
  if (data.contact_information?.email)
    contactInfo.push(`Email: ${data.contact_information.email}`)
  if (data.contact_information?.phone)
    contactInfo.push(`Phone: ${data.contact_information.phone}`)
  if (data.contact_information?.location)
    contactInfo.push(`Location: ${data.contact_information.location}`)
  if (data.contact_information?.linkedin)
    contactInfo.push(`LinkedIn: ${data.contact_information.linkedin}`)
  if (data.contact_information?.github)
    contactInfo.push(`GitHub: ${data.contact_information.github}`)
  if (data.contact_information?.website)
    contactInfo.push(`Website: ${data.contact_information.website}`)
  if (data.contact_information?.social_links) {
    data.contact_information.social_links.forEach((link) => {
      if (link.platform && link.url) {
        contactInfo.push(`${link.platform}: ${link.url}`)
      }
    })
  }

  if (contactInfo.length > 0) {
    text += contactInfo.join(" | ") + "\n\n"
  }

  // Professional Summary
  if (data.professional_summary) {
    text += "PROFESSIONAL SUMMARY\n"
    text += "-".repeat(20) + "\n"
    text += data.professional_summary + "\n\n"
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    text += "CORE COMPETENCIES\n"
    text += "-".repeat(17) + "\n"
    text += data.skills.join(" • ") + "\n\n"
  }

  // Work Experience
  if (data.work_experience && data.work_experience.length > 0) {
    text += "PROFESSIONAL EXPERIENCE\n"
    text += "-".repeat(23) + "\n"
    data.work_experience.forEach((job) => {
      if (job.job_title || job.company) {
        text += `${job.job_title || "Position"} | ${job.company || "Company"}\n`
        const details: any = []
        if (job.location) details.push(job.location)
        if (job.start_date && job.end_date) {
          details.push(`${job.start_date} - ${job.end_date}`)
        } else if (job.start_date) {
          details.push(`${job.start_date} - Present`)
        }
        if (details.length > 0) {
          text += details.join(" | ") + "\n"
        }
        if (job.responsibilities && job.responsibilities.length > 0) {
          job.responsibilities.forEach((resp) => {
            text += `• ${resp}\n`
          })
        }
        text += "\n"
      }
    })
  }

  // Education
  if (data.education && data.education.length > 0) {
    text += "EDUCATION\n"
    text += "-".repeat(9) + "\n"
    data.education.forEach((edu) => {
      if (edu.degree || edu.institution) {
        text += `${edu.degree || "Degree"}\n`
        text += `${edu.institution || "Institution"}`
        if (edu.location) text += ` - ${edu.location}`
        text += "\n"
        if (edu.start_year && edu.end_year) {
          text += `${edu.start_year} - ${edu.end_year}\n`
        } else if (edu.start_year) {
          text += `${edu.start_year}\n`
        }
        if (edu.additional_details) {
          text += `${edu.additional_details}\n`
        }
        text += "\n"
      }
    })
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    text += "CERTIFICATIONS\n"
    text += "-".repeat(14) + "\n"
    data.certifications.forEach((cert) => {
      if (cert.name) {
        text += `• ${cert.name}`
        if (cert.issuer) text += ` - ${cert.issuer}`
        if (cert.year) text += ` (${cert.year})`
        text += "\n"
      }
    })
    text += "\n"
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    text += "KEY PROJECTS\n"
    text += "-".repeat(12) + "\n"
    data.projects.forEach((project) => {
      if (project.title) {
        text += `• ${project.title}`
        if (project.description) text += `: ${project.description}`
        text += "\n"
      }
    })
    text += "\n"
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    text += "LANGUAGES\n"
    text += "-".repeat(9) + "\n"
    data.languages.forEach((lang) => {
      if (lang.language) {
        text += `• ${lang.language}`
        if (lang.proficiency) text += `: ${lang.proficiency}`
        text += "\n"
      }
    })
    text += "\n"
  }

  // Awards
  if (data.awards && data.awards.length > 0) {
    text += "AWARDS & HONORS\n"
    text += "-".repeat(15) + "\n"
    data.awards.forEach((award) => {
      if (award.title) {
        text += `• ${award.title}`
        if (award.issuer) text += ` - ${award.issuer}`
        if (award.year) text += ` (${award.year})`
        if (award.description) text += `\n  ${award.description}`
        text += "\n"
      }
    })
  }

  return text
}

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem("access_token")

const getResumeScore = async (
  job: Job,
  resumeText: string
): Promise<number> => {
  try {
    const analyzeResponse = await fetch(
      `${BASE_URL}${API_ENDPOINTS.AnalyzeResumeScore}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          resumeText: resumeText,
          jobTitle: job.title,
          jobDescription: job.desc,
          skills: [job.title]
        })
      }
    )

    const analyzeData: AnalyzeResumeScore = await analyzeResponse.json()

    if (analyzeData.success) {
      return analyzeData.data.score
    }

    return 0
  } catch (error) {
    console.error(error)
    return 0
  }
}

export async function storeJobDetails(
  jobData: Job[],
  resume: Resume,
  resumeTxt: string,
  size: number,
  uid: string
) {
  try {
    const jobs: Payload["jobs"] = await Promise.all(
      jobData.map(async (job) => ({
        companyUrl: job.company,
        description: job.desc || "",
        id: job.id,
        jobTitle: job.title,
        skills: job.title,
        language: "en",
        resumeScore: await getResumeScore(job, resumeTxt),
        yearsOfExperience: resume.formData.experience
      }))
    )

    const s3Url = new URL(resume.resumeUrl)
    const fileInfo: Payload["fileInfo"] = {
      s3_path: resume.resumeUrl,
      is_public: false,
      file_size: size,
      mime_type: resume.resumeUrl.includes(".pdf")
        ? "application/pdf"
        : resume.resumeUrl.includes(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf",
      file_format: resume.resumeUrl.includes(".pdf")
        ? "PDF"
        : resume.resumeUrl.includes(".docx")
        ? "DOCX"
        : "TXT",
      s3_key: s3Url.pathname.startsWith("/")
        ? s3Url.pathname.substring(1)
        : s3Url.pathname,
      original_filename: resume.resumeUrl.split("/")?.pop() || "resume.pdf",
      access_note: "File is private - use pre-signed URL for access"
    }

    const payload: Payload = {
      // years_of_experience: resume.formData.experience,
      resumeText: resumeTxt,
      jobs: jobs,
      SESSION_ID: uid,
      is_bulk_operation: true,
      fileInfo: fileInfo
      // Add is_regenerating parameter for free regenerations
      // is_regenerating: shouldExcludeFromCredits(jobData)
    }

    const result: StoreJobDetailsRes = await postRequest(
      API_ENDPOINTS.SaveJobsToSession,
      payload
    )
    if (!result.success) throw new Error(result.msg)
    return true
  } catch (error) {
    console.error("Error generating resume:", error)
    return false
  }
}

export async function getTailoredJobData(
  jobData: Job,
  resumeTxt: string,
  uid: string
) {
  try {
    const payload: GetTailoredDataPayload = {
      resumeText: resumeTxt,
      SESSION_ID: uid,
      generation_id: jobData.id,
      job_description: jobData.desc as string,
      job_title: jobData.title,
      language: "en"
    }

    const result: GetTailoredDataRes = await postRequest(
      API_ENDPOINTS.GenerateAIResume,
      payload
    )
    if (!result.success) throw new Error(result.msg)

    const tailoredResumeData = result.data?.tailored_resume || result.data
    if (!tailoredResumeData) throw new Error("No tailored resume data")
    // Generate DOCX using modern generator
    const docxDocument = generateModernResumeDocx(tailoredResumeData as any)
    // const docxBlob = await Packer.toBlob(docxDocument)
    const base64URLString = await Packer.toBase64String(docxDocument)
    const arrayBuffer = await Packer.toArrayBuffer(docxDocument)
    // const docxUrl = URL.createObjectURL(docxBlob)

    // console.log("🚀 Generated resume response:", {
    //   result,
    //   arrayBuffer,
    //   base64URLString
    // })

    const data: PreviewData = {
      jobTitle: jobData.title,
      jobId: jobData.id,
      company: jobData.company,
      jobDescription: jobData.desc as string,
      arrayBuffer: arrayBuffer,
      base64: base64URLString
    }

    return data
  } catch (error) {
    console.error("Error generating resume:", error)
  }
}

/**
 * Extract text from PDF file using PDF.js with robust worker configuration
 */
const extractTextFromPDF = async (
  arrayBuffer: ArrayBuffer
): Promise<string> => {
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
  }
}

// Handle resume upload
export const getBaseResumeText = async (url: string) => {
  try {
    const blobType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    if (url.startsWith("http")) {
      const isS3Url =
        url.includes("s3.amazonaws.com") || url.includes("amazonaws.com")

      let fetchUrl = url

      if (isS3Url) {
        const encodedS3Url = encodeURIComponent(url)
        fetchUrl = `${
          import.meta.env.VITE_APP_BASE_URL || "http://localhost:3001"
        }/api/ai-resume-tailor/stream-s3-file?url=${encodedS3Url}`
        // console.log("📄 Using proxy URL for text extraction:", fetchUrl)
      }

      const blob = await fetch(fetchUrl).then((res) => res.blob())
      const fileSize = blob.size
      console.log("blobType", blob.type, blob.size)
      if (blob.type.includes(blobType)) {
        // DOCX file
        const arrayBuffer = await blob.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return { content: result.value, fileSize }
      } else if (blob.type.includes("/pdf")) {
        const arrayBuffer = await blob.arrayBuffer()
        const extractedText = await extractTextFromPDF(arrayBuffer)
        return { content: extractedText, fileSize }
      } else if (blob.type.includes("text/")) {
        // Text file
        const content = await blob.text()
        return { content, fileSize }
      }
    } else if (url.startsWith("blob:")) {
      // Local blob URL
      const response = await fetch(url)
      const blob = await response.blob()
      const fileSize = blob.size

      if (blob.type.includes(blobType)) {
        // DOCX file
        const arrayBuffer = await blob.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return { content: result.value, fileSize }
      } else if (blob.type.includes("text/")) {
        // Text file
        const content = await blob.text()
        return { content, fileSize }
      }
    }

    return { content: "", fileSize: 0 }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to extract text from file"
    console.error(errorMessage)
    return { error: errorMessage, fileSize: 0 }
  }
}

// Generate UUID v4
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

type Payload = {
  SESSION_ID: string
  jobs: {
    id: string
    companyUrl: string
    jobTitle: string
    description: string
    skills: string
    resumeScore: number
    language?: string
    yearsOfExperience?: string
  }[]
  fileInfo: {
    s3_path: string
    // s3_key: "fileupload/1756118397942/Ghulam-Hussain.docx"
    s3_key: string
    original_filename: string
    // original_filename: "Ghulam-Hussain.docx"
    // file_format: "DOCX"
    file_size: number
    mime_type:
      | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      | "application/pdf"
    file_format: "DOCX" | "PDF" | "TXT"
    is_public: false
    access_note: "File is private - use pre-signed URL for access"
  }
  resumeText: string
  is_bulk_operation: true
}

type StoreJobDetailsRes = {
  msg: "Job details and resume data stored successfully"
  success: true
  data: {
    session_id: "c47487df-cb94-421e-8ccd-937b8e22f39b"
    jobs_processed: 1
    jobs_stored: 1
    jobs_failed: 0
    stored_jobs: [
      {
        original_id: "1"
        original_job_id: "1"
        generation_id: "1"
        job_title: "so"
        company_name: "Google"
        company_url: "google.com"
        skills_count: 16
        resume_score: 82
        language: "English (US)"
        years_of_experience: "3"
        years_experience_numeric: 3
        status: "stored"
      }
    ]
    failed_jobs: []
    resume_data: {
      has_file: "Ghulam-Hussain.docx"
      has_text: true
      resume_source: "file_and_text"
      file_info: {
        s3_path: "https://poweredjob-bucket.s3.amazonaws.com/fileupload/1756265547374/Ghulam-Hussain.docx"
        s3_key: "fileupload/1756265547374/Ghulam-Hussain.docx"
        original_filename: "Ghulam-Hussain.docx"
        file_format: "DOCX"
        file_size: 10247
        mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        is_public: false
        access_note: "File is private - use pre-signed URL for access"
      }
      text_provided: true
    }
    summary: {
      success_rate: "100.0%"
      total_skills_extracted: 16
      average_resume_score: "82.0"
      languages_provided: ["English (US)"]
      experience_ranges: ["3"]
      resume_uploaded: "Ghulam-Hussain.docx"
    }
    verification: {
      verified_count: 0
      all_fields_stored: true
      sample_generation: null
    }
    metadata: {
      stored_at: "2025-08-27T03:32:35.630Z"
      session_updated: true
      resume_updated: "Ghulam-Hussain.docx"
      data_verified: true
    }
  }
}

type GetTailoredDataPayload = {
  SESSION_ID: string
  job_title: string
  job_description: string
  language: string
  resumeText: string
  generation_id: string
  required_skills?: string[]
  company_url?: string
  years_of_experience?: string
  is_regenerating?: boolean
}

const getTailoredDataRes = {
  msg: "Tailored resume generated successfully",
  success: true,
  data: {
    tailored_resume: {
      source_content_analysis: {
        has_email: true,
        has_phone: true,
        has_location: true,
        has_linkedin: false,
        has_github: false,
        has_social_links: false,
        has_relocation_willingness: false,
        has_skills: true,
        has_work_experience: true,
        has_education: true,
        has_certifications: true,
        has_projects: false,
        has_languages: false,
        has_awards: false,
        has_selected_project_highlights: false,
        has_awards_and_recognition: false,
        has_professional_summary: true
      },
      full_name: "IDRIS AILEME-ODU",
      contact_information: {
        email: "idrisodu@outlook.com",
        phone: "469-970-4962",
        location: "Dallas, Texas, USA"
      },
      professional_summary:
        "Accomplished Software Engineer with over 10 years of experience in developing scalable software solutions in healthcare IT and cloud environments. Proficient in Python, C/C++, and modern web frameworks such as React and Node.js. Demonstrated expertise in cloud migration, system optimization, and cybersecurity enhancements, with a focus on delivering innovative solutions that drive business success. Strong collaborator with excellent problem-solving skills and a commitment to continuous improvement.",
      skills: [
        "Software Development",
        "Python",
        "C/C++",
        "React",
        "Node.js",
        "Cloud Migration",
        "AWS",
        "Azure",
        "Web Frameworks",
        "Agile Methodologies",
        "DevOps Practices",
        "Problem-Solving",
        "Team Collaboration",
        "Communication"
      ],
      work_experience: [
        {
          has_job_title: true,
          has_company: true,
          has_location: true,
          has_start_date: true,
          has_end_date: true,
          has_responsibilities: true,
          job_title:
            "Senior Embedded Software Engineer & Web Solutions Developer",
          company: "Cardinal Health",
          location: "Dallas, TX",
          start_date: "2019-09",
          end_date: null,
          responsibilities: [
            "Led the design and deployment of scalable software solutions, ensuring compliance with HIPAA, CLIA, and 21 CFR Part 11, enhancing secure clinical research operations.",
            "Integrated LIMS with lab instruments and EHR systems, improving lab automation and reducing sample tracking errors by 45%.",
            "Managed cloud infrastructure migration to AWS/Azure, enhancing scalability and cutting infrastructure costs by 30%.",
            "Implemented cybersecurity enhancements, reducing vulnerabilities by 50% through zero-trust, MFA, and IAM.",
            "Spearheaded clinical AI initiatives, integrating Gen AI/NLP models to reduce provider workload by 40% and administrative tasks by 35%."
          ]
        },
        {
          has_job_title: true,
          has_company: true,
          has_location: true,
          has_start_date: true,
          has_end_date: true,
          has_responsibilities: true,
          job_title: "Cloud Migration Project Manager & Web Developer",
          company: "Goldman Sachs Group",
          location: "Dallas, TX",
          start_date: "2016-03",
          end_date: "2019-09",
          responsibilities: [
            "Led cloud migration of 300+ enterprise applications to AWS, Azure, and GCP, achieving 30% infrastructure cost savings.",
            "Automated infrastructure provisioning with Terraform and Ansible, reducing manual effort by 60% and deployment cycles from weeks to hours.",
            "Enhanced system performance and CI/CD workflows, meeting 99.99% uptime targets through optimized pipelines and latency-reducing tools.",
            "Strengthened DR readiness and operational continuity, improving financial trading operations with sub-millisecond latency."
          ]
        },
        {
          has_job_title: true,
          has_company: true,
          has_location: true,
          has_start_date: true,
          has_end_date: true,
          has_responsibilities: true,
          job_title: "Salesforce CRM Project Manager & Web Developer",
          company: "Salesforce",
          location: "Dallas, TX",
          start_date: "2013-03",
          end_date: "2016-03",
          responsibilities: [
            "Led Salesforce CRM implementation, managing SDLC phases with 99.9% uptime and reducing manual input by 60%.",
            "Oversaw CRM data migration, ensuring data integrity and compliance with GDPR, SOC 2, and PCI-DSS.",
            "Directed Agile and Waterfall project delivery, accelerating timelines by 30% and ensuring quality through rigorous testing.",
            "Deployed real-time analytics, improving forecasting accuracy by 20% and reducing case resolution times by 30%."
          ]
        },
        {
          has_job_title: true,
          has_company: true,
          has_location: true,
          has_start_date: true,
          has_end_date: true,
          has_responsibilities: true,
          job_title: "Project Manager & Web Developer",
          company: "Blue Cross Blue Shield",
          location: "Dallas, TX",
          start_date: "2010-02",
          end_date: "2013-03",
          responsibilities: [
            "Led digital health initiatives, enhancing patient access and care coordination through integrated systems.",
            "Managed cross-functional teams, ensuring HIPAA-, NCQA-, and CMS-compliant project delivery.",
            "Directed portal optimization, achieving over $10M in savings through increased self-service adoption.",
            "Spearheaded EHR/EMR integration, boosting provider/member engagement by 30% through real-time data exchange."
          ]
        }
      ],
      education: [
        {
          has_degree: true,
          has_institution: true,
          has_location: true,
          has_start_year: true,
          has_end_year: true,
          has_additional_details: true,
          degree: "Bachelor's Degree in Computer Science",
          institution: "Ladoke Akintola University",
          location: "Ogbomosho, Nigeria",
          start_year: 2003,
          end_year: 2007,
          additional_details: "GPA 3.9"
        }
      ],
      certifications: [
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Project Management Professional (PMP)",
          issuer: "PMI",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Certified Scrum Master (CSM)",
          issuer: "Scrum Alliance",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Professional Scrum Master",
          issuer: "Scrum.org",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Certified SAFe® Scrum Master (SSM)",
          issuer: "Scaled Agile",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "ITIL v4",
          issuer: "AXELOS",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Six Sigma White Belt",
          issuer: "Ladoke Akintola University",
          year: null
        }
      ],
      tailoring_score: 92
    },
    tailored_data: {
      source_content_analysis: {
        has_email: true,
        has_phone: true,
        has_location: true,
        has_linkedin: false,
        has_github: false,
        has_social_links: false,
        has_relocation_willingness: false,
        has_skills: true,
        has_work_experience: true,
        has_education: true,
        has_certifications: true,
        has_projects: false,
        has_languages: false,
        has_awards: false,
        has_selected_project_highlights: false,
        has_awards_and_recognition: false,
        has_professional_summary: true
      },
      full_name: "IDRIS AILEME-ODU",
      contact_information: {
        email: "idrisodu@outlook.com",
        phone: "469-970-4962",
        location: "Dallas, Texas, USA"
      },
      professional_summary:
        "Accomplished Software Engineer with over 10 years of experience in developing scalable software solutions in healthcare IT and cloud environments. Proficient in Python, C/C++, and modern web frameworks such as React and Node.js. Demonstrated expertise in cloud migration, system optimization, and cybersecurity enhancements, with a focus on delivering innovative solutions that drive business success. Strong collaborator with excellent problem-solving skills and a commitment to continuous improvement.",
      skills: [
        "Software Development",
        "Python",
        "C/C++",
        "React",
        "Node.js",
        "Cloud Migration",
        "AWS",
        "Azure",
        "Web Frameworks",
        "Agile Methodologies",
        "DevOps Practices",
        "Problem-Solving",
        "Team Collaboration",
        "Communication"
      ],
      work_experience: [
        {
          has_job_title: true,
          has_company: true,
          has_location: true,
          has_start_date: true,
          has_end_date: true,
          has_responsibilities: true,
          job_title:
            "Senior Embedded Software Engineer & Web Solutions Developer",
          company: "Cardinal Health",
          location: "Dallas, TX",
          start_date: "2019-09",
          end_date: null,
          responsibilities: [
            "Led the design and deployment of scalable software solutions, ensuring compliance with HIPAA, CLIA, and 21 CFR Part 11, enhancing secure clinical research operations.",
            "Integrated LIMS with lab instruments and EHR systems, improving lab automation and reducing sample tracking errors by 45%.",
            "Managed cloud infrastructure migration to AWS/Azure, enhancing scalability and cutting infrastructure costs by 30%.",
            "Implemented cybersecurity enhancements, reducing vulnerabilities by 50% through zero-trust, MFA, and IAM.",
            "Spearheaded clinical AI initiatives, integrating Gen AI/NLP models to reduce provider workload by 40% and administrative tasks by 35%."
          ]
        },
        {
          has_job_title: true,
          has_company: true,
          has_location: true,
          has_start_date: true,
          has_end_date: true,
          has_responsibilities: true,
          job_title: "Cloud Migration Project Manager & Web Developer",
          company: "Goldman Sachs Group",
          location: "Dallas, TX",
          start_date: "2016-03",
          end_date: "2019-09",
          responsibilities: [
            "Led cloud migration of 300+ enterprise applications to AWS, Azure, and GCP, achieving 30% infrastructure cost savings.",
            "Automated infrastructure provisioning with Terraform and Ansible, reducing manual effort by 60% and deployment cycles from weeks to hours.",
            "Enhanced system performance and CI/CD workflows, meeting 99.99% uptime targets through optimized pipelines and latency-reducing tools.",
            "Strengthened DR readiness and operational continuity, improving financial trading operations with sub-millisecond latency."
          ]
        },
        {
          has_job_title: true,
          has_company: true,
          has_location: true,
          has_start_date: true,
          has_end_date: true,
          has_responsibilities: true,
          job_title: "Salesforce CRM Project Manager & Web Developer",
          company: "Salesforce",
          location: "Dallas, TX",
          start_date: "2013-03",
          end_date: "2016-03",
          responsibilities: [
            "Led Salesforce CRM implementation, managing SDLC phases with 99.9% uptime and reducing manual input by 60%.",
            "Oversaw CRM data migration, ensuring data integrity and compliance with GDPR, SOC 2, and PCI-DSS.",
            "Directed Agile and Waterfall project delivery, accelerating timelines by 30% and ensuring quality through rigorous testing.",
            "Deployed real-time analytics, improving forecasting accuracy by 20% and reducing case resolution times by 30%."
          ]
        },
        {
          has_job_title: true,
          has_company: true,
          has_location: true,
          has_start_date: true,
          has_end_date: true,
          has_responsibilities: true,
          job_title: "Project Manager & Web Developer",
          company: "Blue Cross Blue Shield",
          location: "Dallas, TX",
          start_date: "2010-02",
          end_date: "2013-03",
          responsibilities: [
            "Led digital health initiatives, enhancing patient access and care coordination through integrated systems.",
            "Managed cross-functional teams, ensuring HIPAA-, NCQA-, and CMS-compliant project delivery.",
            "Directed portal optimization, achieving over $10M in savings through increased self-service adoption.",
            "Spearheaded EHR/EMR integration, boosting provider/member engagement by 30% through real-time data exchange."
          ]
        }
      ],
      education: [
        {
          has_degree: true,
          has_institution: true,
          has_location: true,
          has_start_year: true,
          has_end_year: true,
          has_additional_details: true,
          degree: "Bachelor's Degree in Computer Science",
          institution: "Ladoke Akintola University",
          location: "Ogbomosho, Nigeria",
          start_year: 2003,
          end_year: 2007,
          additional_details: "GPA 3.9"
        }
      ],
      certifications: [
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Project Management Professional (PMP)",
          issuer: "PMI",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Certified Scrum Master (CSM)",
          issuer: "Scrum Alliance",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Professional Scrum Master",
          issuer: "Scrum.org",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Certified SAFe® Scrum Master (SSM)",
          issuer: "Scaled Agile",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "ITIL v4",
          issuer: "AXELOS",
          year: null
        },
        {
          has_name: true,
          has_issuer: true,
          has_year: true,
          name: "Six Sigma White Belt",
          issuer: "Ladoke Akintola University",
          year: null
        }
      ],
      tailoring_score: 92
    },
    metadata: {
      job_title: "so",
      generated_at: "2025-08-27T03:33:26.717Z",
      tokens_used: 9304,
      credits_used: 15,
      remaining_credits: 2287,
      session_id: "c47487df-cb94-421e-8ccd-937b8e22f39b",
      generation_id: "gen_1756265554028_bvzx1fvzt",
      updated_at: "2025-08-27T03:33:25.422Z",
      created_at: "2025-08-27T03:32:34.472Z",
      is_regenerating: false,
      was_free_regeneration: false,
      has_used_free_regeneration: false,
      used_free_generation: false,
      generation_history: {
        current_version_number: 1,
        total_versions: 1,
        regeneration_count: 0,
        has_previous_versions: false
      }
    }
  }
}

type GetTailoredDataRes = typeof getTailoredDataRes

type AnalyzeResumeScore = {
  msg: string
  success: boolean
  data: {
    score: number
    metadata: {
      job_title: string
      analyzed_at: string
      tokens_used: number
      is_free: boolean
    }
  }
}

const samplePayload = {
  SESSION_ID: "d180895b-3927-400c-a8be-b65109209f20",
  jobs: [
    {
      id: "1",
      companyUrl: "google.com",
      jobTitle: "Software Engineer",
      description: "",
      resumeScore: 75,
      language: "English (US)",
      yearsOfExperience: "3"
    }
  ],
  fileInfo: {
    s3_path:
      "https://poweredjob-bucket.s3.amazonaws.com/fileupload/1756198376666/Ghulam-Hussain.docx",
    s3_key: "fileupload/1756198376666/Ghulam-Hussain.docx",
    original_filename: "Ghulam-Hussain.docx",
    file_format: "DOCX",
    file_size: 10247,
    mime_type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    is_public: false,
    access_note: "File is private - use pre-signed URL for access"
  },
  resumeText: "",
  is_bulk_operation: true
}
