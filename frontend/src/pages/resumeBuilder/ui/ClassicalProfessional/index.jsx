// import React, { useState, useMemo } from "react"
// import { useNavigate } from "react-router-dom"
// import html2pdf from "html2pdf.js" // Import html2pdf.js
// import Button from "../../../../components/Button"
// import CircularIndeterminate from "../../../../components/loader/circular"
// import API_ENDPOINTS from "../../../../api/endpoints"
// import { errorToast, successToast } from "../../../../components/Toast"
// import DOMPurify from "dompurify"
// import jsPDF from "jspdf"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// // Function to format the date
// const formatDate = (dateString) => {
//   if (!dateString) return "Present" // If date is null, undefined, or empty, return "Present"
//   const date = new Date(dateString)
//   // Check if date is invalid
//   if (isNaN(date.getTime())) return "Present"
//   return date.toLocaleString("en-US", { month: "short", year: "numeric" })
// }

// const ClassicalProfessional = ({
//   personalData,
//   skills,
//   achievements,
//   certifications,
//   experiences,
//   languages,
//   qualifications
// }) => {
//   const navigate = useNavigate()
//   const [loading, SetLoading] = useState(false)

//   const [isPdfGenerating, setIsPdfGenerating] = useState(false)

//   // const generatePDF = async () => {
//   //   const resumeContent = document.getElementById("resume-content")
//   //   if (!resumeContent) return
//   //   SetLoading(true)

//   //   try {
//   //     setIsPdfGenerating(true)
//   //     const buttonsContainer = document.getElementById("buttons-container")
//   //     buttonsContainer.style.display = "none"

//   //     // Add PDF generation mode class
//   //     resumeContent.classList.add("pdf-mode")

//   //     const opt = {
//   //       margin: [10, 7, 0, 7],
//   //       filename: `${localStorage.getItem("resumeTitle") || "Resume"}.pdf`,
//   //       image: { type: "jpeg", quality: 0.98 },
//   //       html2canvas: { scale: 2 },
//   //       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
//   //     }

//   //     await html2pdf().from(resumeContent).set(opt).save()

//   //     // Cleanup
//   //     resumeContent.classList.remove("pdf-mode")
//   //     buttonsContainer.style.display = "flex"

//   //     setIsPdfGenerating(false)
//   //   } catch (error) {
//   //     console.error("PDF Generation Error:", error)
//   //     alert("Failed to generate PDF. Please try again.")
//   //   } finally {
//   //     setIsPdfGenerating(false)
//   //     SetLoading(false)
//   //   }
//   // }

//   // Add this import at the top of your file

//   const generatePDF = async () => {
//     SetLoading(true)

//     try {
//       setIsPdfGenerating(true)

//       // Create new jsPDF instance
//       const pdf = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4"
//       })

//       // Set up variables for positioning
//       let yPosition = 10
//       const pageWidth = pdf.internal.pageSize.getWidth()
//       const pageHeight = pdf.internal.pageSize.getHeight()
//       const margin = 10
//       const maxWidth = pageWidth - margin * 2

//       // Helper function to add text with word wrapping
//       const addText = (
//         text,
//         fontSize = 10,
//         isBold = false,
//         isCenter = false,
//         isItalic = false
//       ) => {
//         pdf.setFontSize(fontSize)

//         let fontStyle = "normal"
//         if (isBold && isItalic) fontStyle = "bolditalic"
//         else if (isBold) fontStyle = "bold"
//         else if (isItalic) fontStyle = "italic"

//         pdf.setFont("helvetica", fontStyle)

//         if (isCenter) {
//           const textWidth =
//             (pdf.getStringUnitWidth(text) * fontSize) / pdf.internal.scaleFactor
//           const x = (pageWidth - textWidth) / 2
//           pdf.text(text, x, yPosition)
//           yPosition += fontSize * 0.5
//         } else {
//           const lines = pdf.splitTextToSize(text, maxWidth)
//           pdf.text(lines, margin, yPosition)
//           yPosition += lines.length * (fontSize * 0.5)
//         }
//         yPosition += 3 // Add some spacing
//       }

//       // Helper function to add a line
//       const addLine = () => {
//         pdf.line(margin, yPosition, pageWidth - margin, yPosition)
//         yPosition += 8
//       }

//       // Helper function to check if we need a new page
//       const checkPageBreak = (requiredSpace = 20) => {
//         if (yPosition + requiredSpace > pageHeight - margin) {
//           pdf.addPage()
//           yPosition = 20
//         }
//       }

//       // Helper function to strip HTML tags and decode entities
//       const stripHtml = (html) => {
//         if (!html) return ""
//         const temp = document.createElement("div")
//         temp.innerHTML = html
//         return temp.textContent || temp.innerText || ""
//       }

//       // Add header - Name
//       addText(personalData.name || "", 20, true, true)

//       // Add job title
//       if (personalData.jobTitle) {
//         addText(personalData.jobTitle, 14, false, true)
//       }

//       addLine()

//       // Professional Summary
//       if (personalData.summary) {
//         checkPageBreak(30)
//         addText("Professional Summary", 14, true, true)
//         addText(stripHtml(personalData.summary), 10, false, false, true) // Italic for summary
//         yPosition += 5
//       }

//       // Contact Information (inline, no heading)
//       yPosition += 5
//       checkPageBreak(20)

//       const colWidth = (pageWidth - margin * 2) / 3
//       let colX = margin
//       const colY = yPosition

//       // Phone
//       if (personalData.phone) {
//         pdf.setFont("helvetica", "bold")
//         pdf.setFontSize(10)
//         pdf.text("Phone", colX, colY)

//         pdf.setFont("helvetica", "normal")
//         pdf.text(personalData.phone, colX, colY + 5)
//       }
//       colX += colWidth

//       // Email
//       if (personalData.email) {
//         pdf.setFont("helvetica", "bold")
//         pdf.setFontSize(10)
//         pdf.text("Email", colX, colY)

//         pdf.setFont("helvetica", "normal")
//         pdf.text(personalData.email, colX, colY + 5)
//       }
//       colX += colWidth

//       // Address (with wrapping if too long)
//       if (personalData.address) {
//         pdf.setFont("helvetica", "bold")
//         pdf.setFontSize(10)
//         pdf.text("Address", colX, colY)

//         pdf.setFont("helvetica", "normal")
//         const wrappedAddress = pdf.splitTextToSize(
//           personalData.address,
//           colWidth - 5
//         )
//         pdf.text(wrappedAddress, colX, colY + 5)
//       }

//       // move yPosition down after contact row
//       yPosition += 20

//       // Education
//       if (qualifications.length > 0) {
//         checkPageBreak(30)
//         yPosition += 5
//         addText("Education", 16, true)

//         qualifications.forEach((qualification, index) => {
//           checkPageBreak(25)

//           // Degree and dates
//           const degreeText = `${qualification.degreeType || ""} in ${
//             qualification.major || ""
//           } | ${formatDate(qualification.startDate)} - ${formatDate(
//             qualification.endDate
//           )}`
//           addText(degreeText, 12, true)

//           // Institution
//           const institutionText = `${qualification.institutionName || ""}${
//             qualification.institutionCity
//               ? ", " + qualification.institutionCity
//               : ""
//           }`
//           if (institutionText.trim()) {
//             addText(institutionText, 10)
//           }

//           // GPA
//           if (qualification.gpa) {
//             addText(`GPA: ${qualification.gpa}`, 10, true)
//           }

//           yPosition += 3
//         })
//       }

//       // Experience
//       if (experiences.length > 0) {
//         checkPageBreak(30)
//         yPosition += 5
//         addText("Experience", 16, true)

//         experiences.forEach((experience, index) => {
//           checkPageBreak(30)

//           // Job title and dates
//           const jobText = `${experience.jobTitle || ""} | ${formatDate(
//             experience.startDate
//           )} - ${formatDate(experience.endDate)}`
//           addText(jobText, 12, true)

//           // Company and location
//           const companyText = `${experience.companyName || ""}${
//             experience.location ? ", " + experience.location : ""
//           }`
//           if (companyText.trim()) {
//             addText(companyText, 10)
//           }

//           // Description
//           if (experience.description) {
//             addText(stripHtml(experience.description), 10)
//           }

//           yPosition += 3
//         })
//       }

//       // Certifications
//       if (certifications.length > 0) {
//         checkPageBreak(30)
//         yPosition += 5
//         addText("Certifications", 16, true)

//         certifications.forEach((certification, index) => {
//           checkPageBreak(15)

//           const certText = `• ${
//             certification.certificationTitle || ""
//           } | ${formatDate(certification.startDate)} - ${formatDate(
//             certification.endDate
//           )}`
//           addText(certText, 10, true)

//           if (certification.certificationUrl) {
//             addText(
//               `  ${certification.certificationUrl}`,
//               9,
//               false,
//               false,
//               false
//             )
//           }

//           yPosition += 2
//         })
//       }

//       // Achievements
//       if (achievements.length > 0) {
//         checkPageBreak(30)
//         yPosition += 5
//         addText("Achievements", 14, true)

//         achievements.forEach((achievement, index) => {
//           checkPageBreak(15)

//           const achievementText = `• ${achievement.awardTitle || ""}, ${
//             achievement.issuer || ""
//           } ${formatDate(achievement.startDate)} | ${formatDate(
//             achievement.endDate
//           )}`
//           addText(achievementText, 10)

//           yPosition += 8
//         })
//       }
//       addLine()

//       // Save the PDF
//       const fileName = `${localStorage.getItem("resumeTitle") || "Resume"}.pdf`
//       pdf.save(fileName)

//       successToast("PDF generated successfully!")
//     } catch (error) {
//       console.error("PDF Generation Error:", error)
//       errorToast("Failed to generate PDF. Please try again.")
//     } finally {
//       setIsPdfGenerating(false)
//       SetLoading(false)
//     }
//   }

//   const handleResetResume = async () => {
//     SetLoading(true)

//     const userId = localStorage.getItem("ResumeBuilder-Id")
//     const accessToken = localStorage.getItem("access_token")

//     if (!userId || !accessToken) {
//       errorToast("Missing resume ID or access token.")
//       SetLoading(false)
//       return
//     }

//     const deleteUrl = `${BASE_URL}${API_ENDPOINTS.DeleteResumeBuilder}/${userId}`

//     try {
//       const response = await fetch(deleteUrl, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json"
//         }
//       })

//       const responseData = await response.json()

//       if (response.ok && responseData.success) {
//         successToast("Resume reset successfully!")

//         // Clear related localStorage data
//         localStorage.removeItem("ResumeBuilder-Id")
//         localStorage.removeItem("resumeTitle")
//         localStorage.removeItem("resumeBuilderPersonalData")
//         localStorage.removeItem("resumeBuilderExperiences")
//         localStorage.removeItem("resumeBuilderQualifications")
//         localStorage.removeItem("resumeBuilderSkills")
//         localStorage.removeItem("resumeBuilderAchievements")
//         localStorage.removeItem("resumeBuilderLanguages")
//         localStorage.removeItem("resumeBuilderCertifications")
//         localStorage.removeItem("selectedTemplate")

//         navigate("/scan-resume")
//       } else {
//         throw new Error(responseData?.msg || "Failed to delete resume")
//       }
//     } catch (error) {
//       console.error("Error resetting resume:", error)
//       errorToast("Something went wrong while resetting the resume.")
//     } finally {
//       SetLoading(false)
//     }
//   }

//   const sanitizedSummary = useMemo(() => {
//     const summary = personalData.summary || ""
//     const clean = summary.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "")
//     return DOMPurify.sanitize(clean)
//   }, [personalData.summary])

//   const sanitizedExperiences = useMemo(() => {
//     return experiences.map((exp) => {
//       const clean = (exp.description || "").replace(
//         /<p>\s*<br\s*\/?>\s*<\/p>/gi,
//         ""
//       )
//       const sanitized = DOMPurify.sanitize(clean)
//       return { ...exp, sanitizedDescription: sanitized }
//     })
//   }, [experiences])

//   const handleSave = () => {
//     navigate("/scan-resume/main-ResumeBuilder")
//   }

//   return (
//     <>
//       {loading ? (
//         <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
//           <CircularIndeterminate />
//         </div>
//       ) : (
//         <>
//           <style>
//             {`
//           /* Mobile-first styles */
//           #resume-content {
//             width: 80mm !important;
//             margin: auto;
//             font-family: Arial, sans-serif;
//             padding: 10px;
//             box-sizing: border-box;
//             background-color: white;
//             color: black;
//           }

//                /* Make resume-content 200mm on large screens */
//     @media screen and (min-width: 768px) {
//       #resume-content {
//         width: 250mm !important;
//       }
//     }

//           /* PDF generation mode */
//           #resume-content.pdf-mode {
//             width: 200mm !important;
//             padding: 20px;
//           }

//           /* Mobile text sizes */
//           .resume-name {
//             font-size: 16px;
//           }
//           .resume-job-title {
//             font-size: 14px;
//           }
//           .section-heading {
//             font-size: 14px;
//           }
//           .content-text {
//             font-size: 12px;
//           }
//           .small-text {
//             font-size: 10px;
//           }

//           /* PDF mode text sizes */
//           .pdf-mode .resume-name {
//             font-size: 24px;
//           }
//           .pdf-mode .resume-job-title {
//             font-size: 18px;
//           }
//           .pdf-mode .section-heading {
//             font-size: 20px;
//           }
//           .pdf-mode .content-text {
//             font-size: 16px;
//           }
//           .pdf-mode .small-text {
//             font-size: 14px;
//           }

//           /* Responsive contact info */
//           @media (max-width: 80mm) {
//             .contact-info {
//               flex-direction: column;
//               gap: 0.5rem;
//             }
//             .contact-info > div {
//               width: 100%;
//               text-align: center;
//             }
//           }
//         `}
//           </style>

//           <div className="h-auto  overflow-auto">
//             <div
//               id="resume-content"
//               className="main-page bg-white text-black"
//               style={{
//                 width: "200mm",
//                 margin: "auto",
//                 fontFamily: "Arial, sans-serif",
//                 padding: "20px",
//                 boxSizing: "border-box"
//               }}>
//               <div className="flex-grow">
//                 {/* Resume Content: Name, Contact Information, Education, etc. */}
//                 <p className="text-center text-xl  md:text-3xl font-medium">
//                   {personalData.name}
//                 </p>
//                 <div className="text-center md:text-lg flex justify-center ">
//                   <p>{personalData.jobTitle}</p>
//                 </div>
//                 <hr className="border-t border-black my-4" />

//                 {/* Professional Summary */}
//                 <div>
//                   <p className="md:text-lg font-semibold pb-2 text-center">
//                     Professional Summary
//                   </p>
//                   {/* <p className="text-center text-xs md:text-base italic">
//                     {personalData.summary}
//                   </p> */}

//                   <div
//                     className="text-sm md:text-base text-justify space-y-2
//                     [&_ul]:list-disc [&_ul]:pl-5
//                     [&_ol]:list-decimal [&_ol]:pl-5"
//                     dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
//                   />
//                 </div>

//                 {/* Contact Information */}
//                 <div className="flex justify-between  pt-6 gap-x-2 md:gap-x-4">
//                   <div className="flex-1 text-center">
//                     <p className="text-[10px] md:text-sm px-1 md:px-2 ">
//                       <strong>Phone</strong> <br />
//                       {personalData.phone}
//                     </p>
//                   </div>
//                   <div className="flex-1 text-center">
//                     <p className="text-[10px] md:text-sm px-1 md:px-2 ">
//                       <strong>Email</strong> <br /> {personalData.email}
//                     </p>
//                   </div>
//                   <div className="flex-1 text-center">
//                     <p className="text-[10px] md:text-sm px-1 md:px-2 ">
//                       <strong>Address</strong> <br /> {personalData.address}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Education Section */}
//                 {qualifications.length > 0 && (
//                   <div className="mt-4">
//                     <p className="md:text-xl font-bold pb-4">Education</p>
//                     <div>
//                       {qualifications.map((qualification, index) => (
//                         <div key={index} className="mb-4 space-y-1 ">
//                           <p className="font-semibold text-sm md:text-base">
//                             {qualification.degreeType} in {qualification.major}{" "}
//                             | {formatDate(qualification.startDate)} -{" "}
//                             {formatDate(qualification.endDate)}
//                           </p>
//                           <p className="text-sm md:text-base">
//                             {qualification.institutionName},{" "}
//                             {qualification.institutionCity}
//                           </p>
//                           <p className="text-sm md:text-base">
//                             <strong>GPA:</strong> {qualification.gpa}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Relevant Experience */}
//                 {sanitizedExperiences.length > 0 && (
//                   <div className="mt-4">
//                     <p className="md:text-xl font-bold pb-4">Experience</p>
//                     {sanitizedExperiences.map((experience, index) => (
//                       <div key={index} className="mb-4 space-y-1">
//                         <p className="text-sm md:text-base font-semibold">
//                           {experience.jobTitle} |{" "}
//                           {formatDate(experience.startDate)} -{" "}
//                           {formatDate(experience.endDate)}
//                         </p>
//                         <p className="text-sm md:text-base">
//                           {experience.companyName}, {experience.location}
//                         </p>
//                         <div
//                           className="text-sm md:text-base text-justify space-y-2
//             [&_ul]:list-disc [&_ul]:pl-5
//             [&_ol]:list-decimal [&_ol]:pl-5"
//                           dangerouslySetInnerHTML={{
//                             __html: experience.sanitizedDescription
//                           }}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* {experiences.length > 0 && (
//                   <div className="mt-4">
//                     <p className="md:text-xl font-bold pb-4">Experience</p>
//                     {experiences.map((experience, index) => (
//                       <div key={index} className="mb-4 space-y-1">
//                         <p className="text-sm md:text-base font-semibold">
//                           {experience.jobTitle} |{" "}
//                           {formatDate(experience.startDate)} -{" "}
//                           {formatDate(experience.endDate)}
//                         </p>
//                         <p className=" text-sm md:text-base">
//                           {experience.companyName}, {experience.location}
//                         </p>
//                         <p className=" text-sm md:text-base text-justify">
//                           {experience.description}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 )} */}

//                 {/* Certifications */}
//                 {certifications.length > 0 && (
//                   <div className="mt-4">
//                     <p className="md:text-xl font-bold pb-2">Certifications</p>
//                     <ul className="list-disc list-inside space-y-2">
//                       {certifications.map((certification, index) => (
//                         <li
//                           key={index}
//                           className="font-semibold text-sm md:text-base">
//                           {certification.certificationTitle} |{" "}
//                           {formatDate(certification.startDate)} -{" "}
//                           {formatDate(certification.endDate)}
//                           {certification.certificationUrl && (
//                             <p className="text-xs md:text-sm text-blue-500 underline pl-5">
//                               <a
//                                 href={certification.certificationUrl}
//                                 target="_blank"
//                                 rel="noopener noreferrer">
//                                 {certification.certificationUrl}
//                               </a>
//                             </p>
//                           )}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//                 {/* Achievements */}
//                 {achievements.length > 0 && (
//                   <div className="mt-4">
//                     <p className="md:text-lg font-bold pb-2">Achievements</p>
//                     <ul className="list-disc list-inside space-y-1">
//                       {achievements.map((achievement, index) => (
//                         <li key={index} className="text-sm md:text-base">
//                           <strong>{achievement.awardTitle}</strong>,{" "}
//                           {achievement.issuer}{" "}
//                           {formatDate(achievement.startDate)} |{" "}
//                           {formatDate(achievement.endDate)}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>

//               <hr className="border-t border-black mt-4" />
//             </div>
//           </div>
//           <div
//             id="buttons-container"
//             className="flex flex-col md:flex-row items-center md:justify-center px-4 md:px-10 py-6 gap-4 md:gap-10 w-full">
//             <Button
//               onClick={handleResetResume}
//               className="p-3 flex items-center space-x-2 w-full md:w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
//               disabled={isPdfGenerating}>
//               Reset resume & start over
//             </Button>

//             <Button
//               onClick={generatePDF}
//               className="p-3 flex items-center space-x-2 w-full md:w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
//               disabled={isPdfGenerating}>
//               {isPdfGenerating ? "Generating PDF..." : "Download"}
//             </Button>

//             <Button
//               onClick={handleSave}
//               className="p-3 flex items-center space-x-2 w-full md:w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//               Save
//             </Button>
//           </div>
//         </>
//       )}
//     </>
//   )
// }

// export default ClassicalProfessional

import React, { useState, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import html2pdf from "html2pdf.js" // Import html2pdf.js
import Button from "../../../../components/Button"
import CircularIndeterminate from "../../../../components/loader/circular"
import API_ENDPOINTS from "../../../../api/endpoints"
import { errorToast, successToast } from "../../../../components/Toast"
import DOMPurify from "dompurify"
import jsPDF from "jspdf"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// Function to format the date
const formatDate = (dateString) => {
  if (!dateString) return "Present" // If date is null, undefined, or empty, return "Present"
  const date = new Date(dateString)
  // Check if date is invalid
  if (isNaN(date.getTime())) return "Present"
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

const ClassicalProfessional = ({
  personalData,
  skills,
  achievements,
  certifications,
  experiences,
  languages,
  qualifications
}) => {
  const navigate = useNavigate()
  const [loading, SetLoading] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [isWordGenerating, setIsWordGenerating] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const generatePDF = async () => {
    SetLoading(true)
    setShowDropdown(false)

    try {
      setIsPdfGenerating(true)

      // Create new jsPDF instance
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      })

      // Set up variables for positioning
      let yPosition = 10
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const maxWidth = pageWidth - margin * 2

      // Helper function to add text with word wrapping
      const addText = (
        text,
        fontSize = 10,
        isBold = false,
        isCenter = false,
        isItalic = false
      ) => {
        pdf.setFontSize(fontSize)

        let fontStyle = "normal"
        if (isBold && isItalic) fontStyle = "bolditalic"
        else if (isBold) fontStyle = "bold"
        else if (isItalic) fontStyle = "italic"

        pdf.setFont("helvetica", fontStyle)

        if (isCenter) {
          const textWidth =
            (pdf.getStringUnitWidth(text) * fontSize) / pdf.internal.scaleFactor
          const x = (pageWidth - textWidth) / 2
          pdf.text(text, x, yPosition)
          yPosition += fontSize * 0.5
        } else {
          const lines = pdf.splitTextToSize(text, maxWidth)
          pdf.text(lines, margin, yPosition)
          yPosition += lines.length * (fontSize * 0.5)
        }
        yPosition += 3 // Add some spacing
      }

      // Helper function to add a line
      const addLine = () => {
        pdf.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 8
      }

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage()
          yPosition = 20
        }
      }

      // Helper function to strip HTML tags and decode entities
      const stripHtml = (html) => {
        if (!html) return ""
        const temp = document.createElement("div")
        temp.innerHTML = html
        return temp.textContent || temp.innerText || ""
      }

      // Add header - Name
      addText(personalData.name || "", 20, true, true)

      // Add job title
      if (personalData.jobTitle) {
        addText(personalData.jobTitle, 14, false, true)
      }

      addLine()

      // Professional Summary
      if (personalData.summary) {
        checkPageBreak(30)
        addText("Professional Summary", 14, true, true)
        addText(stripHtml(personalData.summary), 10, false, false, true) // Italic for summary
        yPosition += 5
      }

      // Contact Information (inline, no heading)
      yPosition += 5
      checkPageBreak(20)

      const colWidth = (pageWidth - margin * 2) / 3
      let colX = margin
      const colY = yPosition

      // Phone
      if (personalData.phone) {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(10)
        pdf.text("Phone", colX, colY)

        pdf.setFont("helvetica", "normal")
        pdf.text(personalData.phone, colX, colY + 5)
      }
      colX += colWidth

      // Email
      if (personalData.email) {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(10)
        pdf.text("Email", colX, colY)

        pdf.setFont("helvetica", "normal")
        pdf.text(personalData.email, colX, colY + 5)
      }
      colX += colWidth

      // Address (with wrapping if too long)
      if (personalData.address) {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(10)
        pdf.text("Address", colX, colY)

        pdf.setFont("helvetica", "normal")
        const wrappedAddress = pdf.splitTextToSize(
          personalData.address,
          colWidth - 5
        )
        pdf.text(wrappedAddress, colX, colY + 5)
      }

      // move yPosition down after contact row
      yPosition += 20

      // Education
      if (qualifications.length > 0) {
        checkPageBreak(30)
        yPosition += 5
        addText("Education", 16, true)

        qualifications.forEach((qualification, index) => {
          checkPageBreak(25)

          // Degree and dates
          const degreeText = `${qualification.degreeType || ""} in ${
            qualification.major || ""
          } | ${formatDate(qualification.startDate)} - ${formatDate(
            qualification.endDate
          )}`
          addText(degreeText, 12, true)

          // Institution
          const institutionText = `${qualification.institutionName || ""}${
            qualification.institutionCity
              ? ", " + qualification.institutionCity
              : ""
          }`
          if (institutionText.trim()) {
            addText(institutionText, 10)
          }

          // GPA
          if (qualification.gpa) {
            addText(`GPA: ${qualification.gpa}`, 10, true)
          }

          yPosition += 3
        })
      }

      // Experience
      if (experiences.length > 0) {
        checkPageBreak(30)
        yPosition += 5
        addText("Experience", 16, true)

        experiences.forEach((experience, index) => {
          checkPageBreak(30)

          // Job title and dates
          const jobText = `${experience.jobTitle || ""} | ${formatDate(
            experience.startDate
          )} - ${formatDate(experience.endDate)}`
          addText(jobText, 12, true)

          // Company and location
          const companyText = `${experience.companyName || ""}${
            experience.location ? ", " + experience.location : ""
          }`
          if (companyText.trim()) {
            addText(companyText, 10)
          }

          if (experience.description) {
            pdf.setFont("Arial", "normal")
            pdf.setFontSize(10)

            // Extract <li> items from HTML description
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = experience.description
            const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
              (li) => li.textContent.trim()
            )

            liItems.forEach((item) => {
              pdf.text(`• ${item}`, margin, yPosition)
              yPosition += 5 // space between list items
            })
          }

          yPosition += 3
        })
      }

      // Certifications
      if (certifications.length > 0) {
        checkPageBreak(30)
        yPosition += 5
        addText("Certifications", 16, true)

        certifications.forEach((certification, index) => {
          checkPageBreak(15)

          const certText = `• ${
            certification.certificationTitle || ""
          } | ${formatDate(certification.startDate)} - ${formatDate(
            certification.endDate
          )}`
          addText(certText, 10, true)

          if (certification.certificationUrl) {
            addText(
              `  ${certification.certificationUrl}`,
              9,
              false,
              false,
              false
            )
          }

          yPosition += 2
        })
      }

      // Achievements
      if (achievements.length > 0) {
        checkPageBreak(30)
        yPosition += 5
        addText("Achievements", 14, true)

        achievements.forEach((achievement, index) => {
          checkPageBreak(15)

          const achievementText = `• ${achievement.awardTitle || ""}, ${
            achievement.issuer || ""
          } ${formatDate(achievement.startDate)} | ${formatDate(
            achievement.endDate
          )}`
          addText(achievementText, 10)

          yPosition += 8
        })
      }
      addLine()

      // Save the PDF
      const fileName = `${localStorage.getItem("resumeTitle") || "Resume"}.pdf`
      pdf.save(fileName)

      successToast("PDF generated successfully!")
    } catch (error) {
      console.error("PDF Generation Error:", error)
      errorToast("Failed to generate PDF. Please try again.")
    } finally {
      setIsPdfGenerating(false)
      SetLoading(false)
    }
  }

  const generateWordDocument = async () => {
    SetLoading(true)
    setShowDropdown(false)

    try {
      setIsWordGenerating(true)

      // Helper function to convert HTML to plain text with bullet points
      const convertHtmlToText = (html) => {
        if (!html) return ""
        const temp = document.createElement("div")
        temp.innerHTML = html

        // Keep lists instead of flattening them
        const lists = temp.querySelectorAll("ul, ol")
        lists.forEach((list) => {
          list.style.margin = "0"
          list.style.paddingLeft = "16pt"
          list.style.listStyleType = "disc"
        })

        const listItems = temp.querySelectorAll("li")
        listItems.forEach((li) => {
          li.style.marginBottom = "4pt" // spacing between items
        })

        return temp.innerHTML // keep the HTML (not plain text)
      }

      // Build comprehensive Word document content
      let htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Resume - ${personalData.name || "Professional"}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowRevisions/>
            <w:DoNotPrintRevisions/>
            <w:DoNotShowComments/>
            <w:DoNotShowInsertionsAndDeletions/>
            <w:DoNotShowPropertyChanges/>
            <w:PageSetup>
              <w:PageMargin w:top="720" w:right="720" w:bottom="720" w:left="720"/>
            </w:PageSetup>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            margin: 0.5in;
            size: 8.5in 11in;
          }
          body { 
            font-family: 'Times New Roman', serif; 
            font-size: 12pt;
            line-height: 1.2; 
            margin: 0;
            color: #000000;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20pt; 
            border-bottom: 1pt solid #000000;
            padding-bottom: 10pt;
          }
          .name { 
            font-size: 20pt; 
            font-weight: bold; 
            margin-bottom: 8pt;
          }
          .job-title { 
            font-size: 16pt; 
            margin-bottom: 10pt;
            font-style: bold;
          }
          .section-title1 { 
            font-size: 16pt; 
            font-weight: bold; 
            margin-top: 18pt; 
            margin-bottom: 10pt; 
            text-align: center;
          }
          .section-title { 
            font-size: 16pt; 
            font-weight: bold; 
            margin-top: 18pt; 
            margin-bottom: 10pt; 
            text-align: start;
          }
          .summary-section {
            text-align: center;
            font-style: italic;
            margin-bottom: 15pt;
          }
          .contact-info-table {
            width: 100%;
            margin: 15pt 0;
            border-collapse: collapse;
          }
          .contact-info-table td {
            text-align: center;
            padding: 5pt;
            vertical-align: top;
            width: 33.33%;
          }
          .contact-label {
            font-weight: bold;
            display: block;
            margin-bottom: 3pt;
          }
          .entry { 
            margin-bottom: 15pt;
            page-break-inside: avoid;
          }
          .entry-title { 
            font-weight: bold; 
            font-size: 12pt;
            margin-bottom: 3pt;
          }
          .entry-subtitle { 
            font-size: 11pt;
            margin-bottom: 5pt;
          }
          .description { 
            font-size: 11pt;
            text-align: justify;
            line-height: 1.3;
            margin-bottom: 8pt;
          }
          .cert-item, .achievement-item {
            margin-bottom: 8pt;
            font-size: 11pt;
          }
          .cert-url {
            font-size: 10pt;
            color: #0066cc;
            margin-left: 20pt;
            display: block;
          }
        </style>
      </head>
      <body>
    `

      // Header Section
      htmlContent += `
      <div class="header">
        <div class="name">${personalData.name || ""}</div>
        ${
          personalData.jobTitle
            ? `<div class="job-title">${personalData.jobTitle}</div>`
            : ""
        }
      </div>
    `

      // Professional Summary
      if (personalData.summary) {
        htmlContent += `
        <div class="section-title1">Professional Summary</div>
        <div class="summary-section">
          <div class="description">${convertHtmlToText(
            personalData.summary
          )}</div>
        </div>
      `
      }

      // ✅ Contact Information Table (updated)
      htmlContent += `
      <table class="contact-info-table">
        <tr>
          ${
            personalData.phone
              ? `
            <td>
              <span class="contact-label">Phone</span>
              <div>${personalData.phone}</div>
            </td>
          `
              : "<td></td>"
          }
          ${
            personalData.email
              ? `
            <td>
              <span class="contact-label">Email</span>
              <div>${personalData.email}</div>
            </td>
          `
              : "<td></td>"
          }
          ${
            personalData.address
              ? `
            <td>
              <span class="contact-label">Address</span>
              <div>${personalData.address}</div>
            </td>
          `
              : "<td></td>"
          }
        </tr>
      </table>
    `

      // Education Section
      if (qualifications.length > 0) {
        htmlContent += `<div class="section-title">Education</div>`
        qualifications.forEach((qualification) => {
          htmlContent += `
          <div class="entry">
            <div class="entry-title">
              ${qualification.degreeType || ""} in ${
            qualification.major || ""
          } | 
              ${formatDate(qualification.startDate)} - ${formatDate(
            qualification.endDate
          )}
            </div>
            <div class="entry-subtitle">
              ${qualification.institutionName || ""}${
            qualification.institutionCity
              ? ", " + qualification.institutionCity
              : ""
          }
            </div>
            ${
              qualification.gpa
                ? `<div style="font-weight: bold;">GPA: ${qualification.gpa}</div>`
                : ""
            }
          </div>
        `
        })
      }

      // Experience Section
      if (experiences.length > 0) {
        htmlContent += `<div class="section-title">Experience</div>`
        experiences.forEach((experience) => {
          htmlContent += `
          <div class="entry">
            <div class="entry-title">
              ${experience.jobTitle || ""} | 
              ${formatDate(experience.startDate)} - ${formatDate(
            experience.endDate
          )}
            </div>
            <div class="entry-subtitle">
              ${experience.companyName || ""}${
            experience.location ? ", " + experience.location : ""
          }
            </div>
            ${
              experience.description
                ? `<div class="description">${convertHtmlToText(
                    experience.description
                  )}</div>`
                : ""
            }
          </div>
        `
        })
      }

      // Certifications Section
      if (certifications.length > 0) {
        htmlContent += `<div class="section-title">Certifications</div>`
        certifications.forEach((certification) => {
          htmlContent += `
          <div class="cert-item">
            <strong>• ${certification.certificationTitle || ""}</strong> | 
            ${formatDate(certification.startDate)} - ${formatDate(
            certification.endDate
          )}
          <br/>
            ${
              certification.certificationUrl
                ? `<span class="cert-url">${certification.certificationUrl}</span>`
                : ""
            }
          </div>
        `
        })
      }

      // Achievements Section
      if (achievements.length > 0) {
        htmlContent += `<div class="section-title">Achievements</div>`
        achievements.forEach((achievement) => {
          htmlContent += `
          <div class="achievement-item">
            <strong>• ${achievement.awardTitle || ""}</strong>, ${
            achievement.issuer || ""
          } | 
            ${formatDate(achievement.startDate)} - ${formatDate(
            achievement.endDate
          )}
          </div>
        `
        })
      }

      htmlContent += `</body></html>`

      // Create and download Word document
      const blob = new Blob(["\ufeff", htmlContent], {
        type: "application/msword;charset=utf-8"
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${localStorage.getItem("resumeTitle") || "Resume"}.doc`
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      successToast("Word document generated successfully!")
    } catch (error) {
      console.error("Word Generation Error:", error)
      errorToast("Failed to generate Word document. Please try again.")
    } finally {
      setIsWordGenerating(false)
      SetLoading(false)
    }
  }

  const handleResetResume = async () => {
    SetLoading(true)

    const userId = localStorage.getItem("ResumeBuilder-Id")
    const accessToken = localStorage.getItem("access_token")

    if (!userId || !accessToken) {
      errorToast("Missing resume ID or access token.")
      SetLoading(false)
      return
    }

    const deleteUrl = `${BASE_URL}${API_ENDPOINTS.DeleteResumeBuilder}/${userId}`

    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      })

      const responseData = await response.json()

      if (response.ok && responseData.success) {
        successToast("Resume reset successfully!")

        // Clear related localStorage data
        localStorage.removeItem("ResumeBuilder-Id")
        localStorage.removeItem("resumeTitle")
        localStorage.removeItem("resumeBuilderPersonalData")
        localStorage.removeItem("resumeBuilderExperiences")
        localStorage.removeItem("resumeBuilderQualifications")
        localStorage.removeItem("resumeBuilderSkills")
        localStorage.removeItem("resumeBuilderAchievements")
        localStorage.removeItem("resumeBuilderLanguages")
        localStorage.removeItem("resumeBuilderCertifications")
        localStorage.removeItem("selectedTemplate")

        navigate("/scan-resume")
      } else {
        throw new Error(responseData?.msg || "Failed to delete resume")
      }
    } catch (error) {
      console.error("Error resetting resume:", error)
      errorToast("Something went wrong while resetting the resume.")
    } finally {
      SetLoading(false)
    }
  }

  const sanitizedSummary = useMemo(() => {
    const summary = personalData.summary || ""
    const clean = summary.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "")
    return DOMPurify.sanitize(clean)
  }, [personalData.summary])

  const sanitizedExperiences = useMemo(() => {
    return experiences.map((exp) => {
      const clean = (exp.description || "").replace(
        /<p>\s*<br\s*\/?>\s*<\/p>/gi,
        ""
      )
      const sanitized = DOMPurify.sanitize(clean)
      return { ...exp, sanitizedDescription: sanitized }
    })
  }, [experiences])

  const handleSave = () => {
    navigate("/scan-resume/main-ResumeBuilder")
  }

  const isDownloadDisabled = isPdfGenerating || isWordGenerating

  return (
    <>
      {loading ? (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <CircularIndeterminate />
        </div>
      ) : (
        <>
          <style>
            {`
          /* Mobile-first styles */
          #resume-content {
            width: 80mm !important;
            margin: auto;
            font-family: Arial, sans-serif;
            padding: 10px;
            box-sizing: border-box;
            background-color: white;
            color: black;
          }

               /* Make resume-content 200mm on large screens */
    @media screen and (min-width: 768px) {
      #resume-content {
        width: 250mm !important;
      }
    }

          /* PDF generation mode */
          #resume-content.pdf-mode {
            width: 200mm !important;
            padding: 20px;
          }

          /* Mobile text sizes */
          .resume-name {
            font-size: 16px;
          }
          .resume-job-title {
            font-size: 14px;
          }
          .section-heading {
            font-size: 14px;
          }
          .content-text {
            font-size: 12px;
          }
          .small-text {
            font-size: 10px;
          }

          /* PDF mode text sizes */
          .pdf-mode .resume-name {
            font-size: 24px;
          }
          .pdf-mode .resume-job-title {
            font-size: 18px;
          }
          .pdf-mode .section-heading {
            font-size: 20px;
          }
          .pdf-mode .content-text {
            font-size: 16px;
          }
          .pdf-mode .small-text {
            font-size: 14px;
          }

          /* Responsive contact info */
          @media (max-width: 80mm) {
            .contact-info {
              flex-direction: column;
              gap: 0.5rem;
            }
            .contact-info > div {
              width: 100%;
              text-align: center;
            }
          }
        `}
          </style>

          <div className="h-auto  overflow-auto">
            <div
              id="resume-content"
              className="main-page bg-white text-black"
              style={{
                width: "200mm",
                margin: "auto",
                fontFamily: "Arial, sans-serif",
                padding: "20px",
                boxSizing: "border-box"
              }}>
              <div className="flex-grow">
                {/* Resume Content: Name, Contact Information, Education, etc. */}
                <p className="text-center text-xl  md:text-3xl font-medium">
                  {personalData.name}
                </p>
                <div className="text-center md:text-lg flex justify-center ">
                  <p>{personalData.jobTitle}</p>
                </div>
                <hr className="border-t border-black my-4" />

                {/* Professional Summary */}
                <div>
                  <p className="md:text-lg font-semibold pb-2 text-center">
                    Professional Summary
                  </p>
                  <div
                    className="text-sm md:text-base text-justify space-y-2
                    [&_ul]:list-disc [&_ul]:pl-5
                    [&_ol]:list-decimal [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
                  />
                </div>

                {/* Contact Information */}
                <div className="flex justify-between  pt-6 gap-x-2 md:gap-x-4">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] md:text-sm px-1 md:px-2 ">
                      <strong>Phone</strong> <br />
                      {personalData.phone}
                    </p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] md:text-sm px-1 md:px-2 ">
                      <strong>Email</strong> <br /> {personalData.email}
                    </p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] md:text-sm px-1 md:px-2 ">
                      <strong>Address</strong> <br /> {personalData.address}
                    </p>
                  </div>
                </div>

                {/* Education Section */}
                {qualifications.length > 0 && (
                  <div className="mt-4">
                    <p className="md:text-xl font-bold pb-4">Education</p>
                    <div>
                      {qualifications.map((qualification, index) => (
                        <div key={index} className="mb-4 space-y-1 ">
                          <p className="font-semibold text-sm md:text-base">
                            {qualification.degreeType} in {qualification.major}{" "}
                            | {formatDate(qualification.startDate)} -{" "}
                            {formatDate(qualification.endDate)}
                          </p>
                          <p className="text-sm md:text-base">
                            {qualification.institutionName},{" "}
                            {qualification.institutionCity}
                          </p>
                          <p className="text-sm md:text-base">
                            <strong>GPA:</strong> {qualification.gpa}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relevant Experience */}
                {sanitizedExperiences.length > 0 && (
                  <div className="mt-4">
                    <p className="md:text-xl font-bold pb-4">Experience</p>
                    {sanitizedExperiences.map((experience, index) => (
                      <div key={index} className="mb-4 space-y-1">
                        <p className="text-sm md:text-base font-semibold">
                          {experience.jobTitle} |{" "}
                          {formatDate(experience.startDate)} -{" "}
                          {formatDate(experience.endDate)}
                        </p>
                        <p className="text-sm md:text-base">
                          {experience.companyName}, {experience.location}
                        </p>
                        <div
                          className="text-sm md:text-base text-justify space-y-2
            [&_ul]:list-disc [&_ul]:pl-5
            [&_ol]:list-decimal [&_ol]:pl-5"
                          dangerouslySetInnerHTML={{
                            __html: experience.sanitizedDescription
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div className="mt-4">
                    <p className="md:text-xl font-bold pb-2">Certifications</p>
                    <ul className="list-disc list-inside space-y-2">
                      {certifications.map((certification, index) => (
                        <li
                          key={index}
                          className="font-semibold text-sm md:text-base">
                          {certification.certificationTitle} |{" "}
                          {formatDate(certification.startDate)} -{" "}
                          {formatDate(certification.endDate)}
                          {certification.certificationUrl && (
                            <p className="text-xs md:text-sm text-blue-500 underline pl-5">
                              <a
                                href={certification.certificationUrl}
                                target="_blank"
                                rel="noopener noreferrer">
                                {certification.certificationUrl}
                              </a>
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Achievements */}
                {achievements.length > 0 && (
                  <div className="mt-4">
                    <p className="md:text-lg font-bold pb-2">Achievements</p>
                    <ul className="list-disc list-inside space-y-1">
                      {achievements.map((achievement, index) => (
                        <li key={index} className="text-sm md:text-base">
                          <strong>{achievement.awardTitle}</strong>,{" "}
                          {achievement.issuer}{" "}
                          {formatDate(achievement.startDate)} |{" "}
                          {formatDate(achievement.endDate)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <hr className="border-t border-black mt-4" />
            </div>
          </div>
          <div
            id="buttons-container"
            className="flex flex-col md:flex-row items-center md:justify-center px-4 md:px-10 py-6 gap-4 md:gap-10 w-full">
            <Button
              onClick={handleResetResume}
              className="p-3 flex items-center space-x-2 w-full md:w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              disabled={isDownloadDisabled}>
              Reset resume & start over
            </Button>

            {/* Download Dropdown */}
            <div className="relative w-full md:w-64" ref={dropdownRef}>
              <Button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-3 flex items-center justify-center space-x-2 w-full text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                disabled={isDownloadDisabled}>
                {isPdfGenerating ? (
                  "Generating PDF..."
                ) : isWordGenerating ? (
                  "Generating Word..."
                ) : (
                  <>
                    Download
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </Button>

              {/* Dropdown Menu */}
              {showDropdown && !isDownloadDisabled && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <button
                    onClick={generatePDF}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2 first:rounded-t-lg">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      Download as PDF
                    </span>
                  </button>
                  <hr className="border-gray-200" />
                  <button
                    onClick={generateWordDocument}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2 last:rounded-b-lg">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      Download as Word
                    </span>
                  </button>
                </div>
              )}
            </div>

            <Button
              onClick={handleSave}
              className="p-3 flex items-center space-x-2 w-full md:w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              disabled={isDownloadDisabled}>
              Save
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default ClassicalProfessional
