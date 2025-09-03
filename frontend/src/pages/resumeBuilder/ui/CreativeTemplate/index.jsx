// import React, { useState, useMemo } from "react"
// import { useNavigate } from "react-router-dom"
// import html2pdf from "html2pdf.js"
// import Button from "../../../../components/Button"
// import CircularIndeterminate from "../../../../components/loader/circular"
// import API_ENDPOINTS from "../../../../api/endpoints"
// import { errorToast, successToast } from "../../../../components/Toast"
// import DOMPurify from "dompurify"
// import jsPDF from "jspdf"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// // Function to format date
// const formatDate = (dateString) => {
//   if (!dateString) return "Present"
//   const date = new Date(dateString)
//   if (isNaN(date.getTime())) return "Present"
//   return date.toLocaleString("en-US", { month: "short", year: "numeric" })
// }

// const Creative = ({
//   personalData,
//   skills,
//   achievements,
//   certifications,
//   experiences,
//   languages,
//   qualifications
// }) => {
//   console.log(">>>>>>>>>>experiences", experiences)
//   const navigate = useNavigate()
//   const [isPdfGenerating, setIsPdfGenerating] = useState(false)
//   const [loading, SetLoading] = useState(false)

//   // const generatePDF = async () => {
//   //   const resumeContent = document.getElementById("resume-content")
//   //   if (!resumeContent) return
//   //   SetLoading(true)

//   //   try {
//   //     setIsPdfGenerating(true)
//   //     const buttonsContainer = document.getElementById("buttons-container")
//   //     buttonsContainer.style.display = "none"

//   //     // Add a class to force A4 layout during PDF generation
//   //     resumeContent.classList.add("pdf-mode")

//   //     const opt = {
//   //       margin: [10, 7, 0, 7],
//   //       filename: `${localStorage.getItem("resumeTitle") || "Resume"}.pdf`,
//   //       image: { type: "jpeg", quality: 0.98 },
//   //       html2canvas: { scale: 2 },
//   //       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
//   //     }

//   //     await html2pdf().from(resumeContent).set(opt).save()

//   //     // Clean up
//   //     resumeContent.classList.remove("pdf-mode")
//   //     buttonsContainer.style.display = "flex"

//   //     setIsPdfGenerating(false)
//   //   } catch (error) {
//   //     console.error("PDF Generation Error:", error)
//   //     errorToast("Failed to generate PDF. Please try again.")
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
//       let yPosition = 15
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
//         isItalic = false,
//         letterSpacing = 0
//       ) => {
//         pdf.setFontSize(fontSize)

//         let fontStyle = "normal"
//         if (isBold && isItalic) fontStyle = "bolditalic"
//         else if (isBold) fontStyle = "bold"
//         else if (isItalic) fontStyle = "italic"

//         pdf.setFont("Arial", fontStyle)

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
//         yPosition += 3
//       }

//       // Helper function to add creative section header
//       const addCreativeHeader = (text, fontSize = 18) => {
//         pdf.setFontSize(fontSize)
//         pdf.setFont("arial", "bold")

//         // Center the header text
//         const textWidth =
//           (pdf.getStringUnitWidth(text.toUpperCase()) * fontSize) /
//           pdf.internal.scaleFactor
//         const x = (pageWidth - textWidth) / 2

//         pdf.text(text.toUpperCase(), x, yPosition)
//         yPosition += fontSize * 0.6

//         // Add underline (full width, from margin to margin)
//         const lineY = yPosition - 2
//         pdf.line(margin, lineY, pageWidth - margin, lineY)

//         yPosition += 8
//       }

//       // Helper function to check if we need a new page
//       const checkPageBreak = (requiredSpace = 25) => {
//         if (yPosition + requiredSpace > pageHeight - margin) {
//           pdf.addPage()
//           yPosition = 30
//         }
//       }

//       // Helper function to strip HTML tags
//       const stripHtml = (html) => {
//         if (!html) return ""
//         const temp = document.createElement("div")
//         temp.innerHTML = html
//         return temp.textContent || temp.innerText || ""
//       }

//       // Header Section - Name with wide letter spacing
//       const name = (personalData.name || "").toUpperCase()
//       addText(name, 26, true, true, false, 6)

//       // Job Title with letter spacing
//       if (personalData.jobTitle) {
//         const jobTitle = personalData.jobTitle.toUpperCase()
//         addText(jobTitle, 14, false, true, false, 3)
//       }

//       // Contact Information
//       const contactInfo = [
//         personalData.phone,
//         personalData.email,
//         `${personalData.city || ""}, ${personalData.country || ""}`
//       ]
//         .filter(Boolean)
//         .join(" | ")

//       if (contactInfo) {
//         addText(contactInfo, 11, false, true)
//       }

//       yPosition += 10

//       // Professional Summary
//       if (personalData.summary) {
//         checkPageBreak(40)
//         addCreativeHeader("Professional Summary")
//         addText(stripHtml(personalData.summary), 11, false, false, false)
//         yPosition += 8
//       }

//       // Work Experience
//       if (experiences.length > 0) {
//         checkPageBreak(40)
//         addCreativeHeader("Work Experience")

//         experiences.forEach((experience, index) => {
//           checkPageBreak(35)

//           // Company name and dates on same line
//           const companyText = experience.companyName || ""
//           const dateText = `${formatDate(experience.startDate)} - ${formatDate(
//             experience.endDate
//           )}`

//           // Split the line - company on left, dates on right
//           pdf.setFontSize(12)
//           pdf.setFont("helvetica", "bold")
//           pdf.text(companyText, margin, yPosition)

//           const dateWidth =
//             (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
//           pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)
//           yPosition += 8

//           // Job title in italics
//           if (experience.jobTitle) {
//             addText(experience.jobTitle, 11, false, false, true)
//           }

//           // Description (render each <li> as a separate bullet point)
//           if (experience.description) {
//             pdf.setFont("helvetica", "normal")
//             pdf.setFontSize(10)

//             // Extract <li> items from HTML description
//             const tempDiv = document.createElement("div")
//             tempDiv.innerHTML = experience.description
//             const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
//               (li) => li.textContent.trim()
//             )

//             liItems.forEach((item) => {
//               pdf.text(`•   ${item}`, margin, yPosition)
//               yPosition += 5 // space between list items
//             })
//           }

//           yPosition += 8
//         })
//       }

//       // Education
//       if (qualifications.length > 0) {
//         checkPageBreak(40)
//         addCreativeHeader("Education")

//         qualifications.forEach((qualification, index) => {
//           checkPageBreak(25)

//           // Degree and institution on left, dates on right
//           const degreeText = `${qualification.degreeType || ""} in ${
//             qualification.major || ""
//           }, ${qualification.institutionName || ""}`
//           const dateText = `${formatDate(
//             qualification.startDate
//           )} - ${formatDate(qualification.endDate)}`

//           pdf.setFontSize(12)
//           pdf.setFont("helvetica", "bold")

//           // Split text if too long
//           const maxDegreeWidth = maxWidth - 40 // Leave space for dates
//           const degreeLines = pdf.splitTextToSize(degreeText, maxDegreeWidth)
//           pdf.text(degreeLines, margin, yPosition)

//           // Dates on the right
//           const dateWidth =
//             (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
//           pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)

//           yPosition += degreeLines.length * 6 + 3

//           // GPA
//           if (qualification.gpa) {
//             addText(`GPA: ${qualification.gpa}`, 11)
//           }

//           yPosition += 8
//         })
//       }

//       // Achievements
//       if (achievements.length > 0) {
//         checkPageBreak(40)
//         addCreativeHeader("Achievements")

//         achievements.forEach((achievement, index) => {
//           checkPageBreak(30)

//           // Award title and dates
//           const awardText = achievement.awardTitle || ""
//           const dateText = `${formatDate(achievement.startDate)} - ${formatDate(
//             achievement.endDate
//           )}`

//           pdf.setFontSize(12)
//           pdf.setFont("helvetica", "bold")
//           pdf.text(awardText, margin, yPosition)

//           const dateWidth =
//             (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
//           pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)
//           yPosition += 8

//           // Issuer in italics
//           if (achievement.issuer) {
//             addText(achievement.issuer, 11, false, false, true)
//           }

//           if (achievement.description) {
//             pdf.setFont("helvetica", "normal")
//             pdf.setFontSize(10)

//             // Extract <li> items from HTML description
//             const tempDiv = document.createElement("div")
//             tempDiv.innerHTML = achievement.description
//             const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
//               (li) => li.textContent.trim()
//             )

//             liItems.forEach((item) => {
//               pdf.text(`•   ${item}`, margin, yPosition)
//               yPosition += 5 // space between list items
//             })
//           }

//           yPosition += 5
//         })
//       }

//       // Skills
//       if (skills.length > 0) {
//         checkPageBreak(30)
//         addCreativeHeader("Skills")

//         // Format skills in a grid-like layout (3 columns)
//         const skillsPerRow = 3
//         for (let i = 0; i < skills.length; i += skillsPerRow) {
//           checkPageBreak(15)
//           const rowSkills = skills.slice(i, i + skillsPerRow)

//           // Calculate positions for centered alignment
//           const skillWidth = maxWidth / skillsPerRow

//           pdf.setFontSize(12)
//           pdf.setFont("helvetica", "normal")

//           rowSkills.forEach((skill, index) => {
//             const xPosition = margin + index * skillWidth + skillWidth / 2
//             const textWidth =
//               (pdf.getStringUnitWidth(skill.skill) * 12) /
//               pdf.internal.scaleFactor
//             pdf.text(skill.skill, xPosition - textWidth / 2, yPosition)
//           })

//           yPosition += 12
//         }
//         yPosition += 5
//       }

//       // Certifications and Languages (if needed - currently commented out in original)
//       const hasBottomSection = certifications.length > 0 || languages.length > 0

//       if (hasBottomSection) {
//         checkPageBreak(20)

//         // Add a subtle line
//         pdf.line(margin, yPosition, pageWidth - margin, yPosition)
//         yPosition += 8
//       }

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

//   const sanitizedAchievements = useMemo(() => {
//     return achievements.map((achievement) => {
//       const clean = (achievement.description || "").replace(
//         /<p>\s*<br\s*\/?>\s*<\/p>/gi,
//         ""
//       )
//       const sanitized = DOMPurify.sanitize(clean)
//       return { ...achievement, sanitizedDescription: sanitized }
//     })
//   }, [achievements])

//   const handleSave = () => {
//     navigate("/scan-resume/main-ResumeBuilder")
//   }

//   return (
//     <>
//       {loading ? (
//         <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
//           <CircularIndeterminate />
//         </div>
//       ) : (
//         <>
//           <style>
//             {`
//           /* Default mobile styles - 80mm width */
//           #resume-content {
//             width: 80mm !important;
//             margin: auto;
//             font-family: 'Arial', sans-serif;
//             padding: 10px;
//             box-sizing: border-box;
//             background-color: white;
//             color: black;
//             line-height: 1.4;
//           }

//           /* Make resume-content 200mm on large screens */
//           @media screen and (min-width: 768px) {
//             #resume-content {
//               width: 250mm !important;
//               padding: 40px;
//             }
//           }

//           /* PDF generation mode - A4 size */
//           #resume-content.pdf-mode {
//             width: 200mm !important;
//             padding: 40px;
//           }

//           /* Section headers styling */
//           .section-header {
//             font-weight: bold;
//             font-size: 18px;
//             text-transform: uppercase;
//             letter-spacing: 2px;
//             text-align: center;
//             margin: 30px 0 10px 0;
//           }

//           /* PDF mode text sizes */
//           .pdf-mode .section-header {
//             font-size: 20px;
//             margin: 35px 0 15px 0;
//           }

//           .pdf-mode .header-section {
//             margin-top: 40px;
//           }

//           .pdf-mode .name-title {
//             font-size: 32px;
//           }

//           .pdf-mode .job-title {
//             font-size: 18px;
//           }

//           .pdf-mode .contact-info {
//             font-size: 14px;
//           }

//           .pdf-mode .section-content {
//             font-size: 14px;
//           }
//         `}
//           </style>
//           <div className="h-auto overflow-auto">
//             <div
//               id="resume-content"
//               className="w-full bg-white text-black"
//               style={{
//                 width: "200mm",
//                 margin: "auto",
//                 fontFamily: "'Arial', sans-serif",
//                 padding: "40px",
//                 boxSizing: "border-box"
//               }}>
//               {/* Header Section */}
//               <div className="header-section text-center mb-8">
//                 <h1
//                   className="name-title text-3xl md:text-4xl font-bold tracking-widest mb-2"
//                   style={{ letterSpacing: "6px", fontWeight: "300" }}>
//                   {personalData.name?.toUpperCase() || "LINDSAY WATSON"}
//                 </h1>
//                 <p
//                   className="job-title text-base md:text-lg tracking-wide mb-4"
//                   style={{ letterSpacing: "3px", fontWeight: "300" }}>
//                   {personalData.jobTitle?.toUpperCase() || "LINDSAY WATSON"}
//                 </p>
//                 <div className="contact-info text-sm flex justify-center items-center space-x-2">
//                   <span>{personalData.phone}</span>
//                   <span>|</span>
//                   <span>{personalData.email}</span>
//                   <span>|</span>
//                   <span>
//                     {personalData.city}, {personalData.country}
//                   </span>
//                 </div>
//               </div>

//               {/* Professional Summary */}
//               {personalData.summary && (
//                 <div className="mb-8">
//                   <h2 className="section-header">Professional Summary</h2>
//                   <hr className="border-t border-black mt-2 mb-4" />
//                   <div
//                     className="section-content text-sm md:text-base text-justify leading-relaxed"
//                     dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
//                   />
//                 </div>
//               )}

//               {/* Work Experience */}
//               {experiences.length > 0 && (
//                 <div className="mb-8">
//                   <h2 className="section-header">Work Experience</h2>
//                   <hr className="border-t border-black mt-2 mb-4" />
//                   {sanitizedExperiences.map((experience, index) => (
//                     <div key={index} className="mb-6">
//                       <div className="flex justify-between items-start mb-1">
//                         <h3 className="font-bold text-sm md:text-base">
//                           {experience.companyName}
//                         </h3>
//                         <span className="text-sm text-right">
//                           {formatDate(experience.startDate)} -{" "}
//                           {formatDate(experience.endDate)}
//                         </span>
//                       </div>
//                       <p className="italic text-sm md:text-base mt-2 mb-4">
//                         {experience.jobTitle}
//                       </p>
//                       <div
//                         className="section-content text-sm leading-relaxed
//                           [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
//                           [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
//                           [&_li]:mb-1"
//                         dangerouslySetInnerHTML={{
//                           __html: experience.sanitizedDescription
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Education */}
//               {qualifications.length > 0 && (
//                 <div className="mb-8">
//                   <h2 className="section-header">Education</h2>
//                   <hr className="border-t border-black mt-2 mb-4" />
//                   {qualifications.map((qualification, index) => (
//                     <div key={index} className="mb-4">
//                       <div className="flex justify-between items-start mb-1">
//                         <h3 className="font-bold text-sm md:text-base">
//                           {qualification.degreeType} in {qualification.major},{" "}
//                           {qualification.institutionName}
//                         </h3>
//                         <span className="text-sm text-right">
//                           {formatDate(qualification.startDate)} -{" "}
//                           {formatDate(qualification.endDate)}
//                         </span>
//                       </div>
//                       {qualification.gpa && (
//                         <p className="text-sm">GPA: {qualification.gpa}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Achievements */}
//               {achievements.length > 0 && (
//                 <div className="mb-8">
//                   <h2 className="section-header">Achievements</h2>
//                   <hr className="border-t border-black mt-2 mb-4" />
//                   {sanitizedAchievements.map((achievement, index) => (
//                     <div key={index} className="mb-4">
//                       <div className="flex justify-between items-start mb-1">
//                         <h3 className="font-bold text-sm md:text-base">
//                           {achievement.awardTitle}
//                         </h3>
//                         <span className="text-sm text-right">
//                           {formatDate(achievement.startDate)} -{" "}
//                           {formatDate(achievement.endDate)}
//                         </span>
//                       </div>
//                       <p className="italic text-sm mb-2">
//                         {achievement.issuer}
//                       </p>
//                       <div
//                         className="section-content text-sm leading-relaxed
//                           [&_ul]:list-disc [&_ul]:pl-5
//                           [&_ol]:list-decimal [&_ol]:pl-5"
//                         dangerouslySetInnerHTML={{
//                           __html: achievement.sanitizedDescription
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Skills */}
//               {skills.length > 0 && (
//                 <div className="mb-6">
//                   <h2 className="section-header">Skills</h2>
//                   <hr className="border-t border-black mt-2 mb-4" />
//                   <div className="flex flex-wrap gap-y-2">
//                     {skills.map((skill, index) => (
//                       <div
//                         key={index}
//                         className="w-1/3 text-center text-sm md:text-base py-1 break-words">
//                         {skill.skill}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Bottom Section - Certifications and Languages */}
//               <div className="mt-8 pt-4 border-t border-gray-300">
//                 {/* {certifications.length > 0 && (
//                   <div className="mb-2 text-sm md:text-base">
//                     <span className="font-bold">Certifications: </span>
//                     {certifications
//                       .map((cert) => cert.certificationTitle)
//                       .join(", ")}
//                   </div>
//                 )}

//                 {languages.length > 0 && (
//                   <div className="text-sm md:text-base">
//                     <span className="font-bold">Languages: </span>
//                     {languages.map((lang) => lang.language).join(", ")}
//                   </div>
//                 )} */}
//               </div>
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

// export default Creative

import React, { useState, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import html2pdf from "html2pdf.js"
import Button from "../../../../components/Button"
import CircularIndeterminate from "../../../../components/loader/circular"
import API_ENDPOINTS from "../../../../api/endpoints"
import { errorToast, successToast } from "../../../../components/Toast"
import DOMPurify from "dompurify"
import jsPDF from "jspdf"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// Function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Present"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Present"
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

const Creative = ({
  personalData,
  skills,
  achievements,
  certifications,
  experiences,
  languages,
  qualifications
}) => {
  console.log(">>>>>>>>>>experiences", experiences)
  const navigate = useNavigate()
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [isWordGenerating, setIsWordGenerating] = useState(false)
  const [loading, SetLoading] = useState(false)
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
      let yPosition = 15
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
        isItalic = false,
        letterSpacing = 0
      ) => {
        pdf.setFontSize(fontSize)

        let fontStyle = "normal"
        if (isBold && isItalic) fontStyle = "bolditalic"
        else if (isBold) fontStyle = "bold"
        else if (isItalic) fontStyle = "italic"

        pdf.setFont("Arial", fontStyle)

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
        yPosition += 3
      }

      // Helper function to add creative section header
      const addCreativeHeader = (text, fontSize = 18) => {
        pdf.setFontSize(fontSize)
        pdf.setFont("arial", "bold")

        // Center the header text
        const textWidth =
          (pdf.getStringUnitWidth(text.toUpperCase()) * fontSize) /
          pdf.internal.scaleFactor
        const x = (pageWidth - textWidth) / 2

        pdf.text(text.toUpperCase(), x, yPosition)
        yPosition += fontSize * 0.6

        // Add underline (full width, from margin to margin)
        const lineY = yPosition - 2
        pdf.line(margin, lineY, pageWidth - margin, lineY)

        yPosition += 8
      }

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace = 25) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage()
          yPosition = 30
        }
      }

      // Helper function to strip HTML tags
      const stripHtml = (html) => {
        if (!html) return ""
        const temp = document.createElement("div")
        temp.innerHTML = html
        return temp.textContent || temp.innerText || ""
      }

      // Header Section - Name with wide letter spacing
      const name = (personalData.name || "").toUpperCase()
      addText(name, 26, true, true, false, 6)

      // Job Title with letter spacing
      if (personalData.jobTitle) {
        const jobTitle = personalData.jobTitle.toUpperCase()
        addText(jobTitle, 14, false, true, false, 3)
      }

      // Contact Information
      const contactInfo = [
        personalData.phone,
        personalData.email,
        `${personalData.city || ""}, ${personalData.country || ""}`
      ]
        .filter(Boolean)
        .join(" | ")

      if (contactInfo) {
        addText(contactInfo, 11, false, true)
      }

      yPosition += 10

      // Professional Summary
      if (personalData.summary) {
        checkPageBreak(40)
        addCreativeHeader("Professional Summary")
        addText(stripHtml(personalData.summary), 11, false, false, false)
        yPosition += 8
      }

      // Work Experience
      if (experiences.length > 0) {
        checkPageBreak(40)
        addCreativeHeader("Work Experience")

        experiences.forEach((experience, index) => {
          checkPageBreak(35)

          // Company name and dates on same line
          const companyText = experience.companyName || ""
          const dateText = `${formatDate(experience.startDate)} - ${formatDate(
            experience.endDate
          )}`

          // Split the line - company on left, dates on right
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")
          pdf.text(companyText, margin, yPosition)

          const dateWidth =
            (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
          pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)
          yPosition += 8

          // Job title in italics
          if (experience.jobTitle) {
            addText(experience.jobTitle, 11, false, false, true)
          }

          // Description (render each <li> as a separate bullet point)
          if (experience.description) {
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(10)

            // Extract <li> items from HTML description
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = experience.description
            const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
              (li) => li.textContent.trim()
            )

            liItems.forEach((item) => {
              pdf.text(`•   ${item}`, margin, yPosition)
              yPosition += 5 // space between list items
            })
          }

          yPosition += 8
        })
      }

      // Education
      if (qualifications.length > 0) {
        checkPageBreak(40)
        addCreativeHeader("Education")

        qualifications.forEach((qualification, index) => {
          checkPageBreak(25)

          // Degree and institution on left, dates on right
          const degreeText = `${qualification.degreeType || ""} in ${
            qualification.major || ""
          }, ${qualification.institutionName || ""}`
          const dateText = `${formatDate(
            qualification.startDate
          )} - ${formatDate(qualification.endDate)}`

          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")

          // Split text if too long
          const maxDegreeWidth = maxWidth - 40 // Leave space for dates
          const degreeLines = pdf.splitTextToSize(degreeText, maxDegreeWidth)
          pdf.text(degreeLines, margin, yPosition)

          // Dates on the right
          const dateWidth =
            (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
          pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)

          yPosition += degreeLines.length * 6 + 3

          // GPA
          if (qualification.gpa) {
            addText(`GPA: ${qualification.gpa}`, 11)
          }

          yPosition += 8
        })
      }

      // Achievements
      if (achievements.length > 0) {
        checkPageBreak(40)
        addCreativeHeader("Achievements")

        achievements.forEach((achievement, index) => {
          checkPageBreak(30)

          // Award title and dates
          const awardText = achievement.awardTitle || ""
          const dateText = `${formatDate(achievement.startDate)} - ${formatDate(
            achievement.endDate
          )}`

          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")
          pdf.text(awardText, margin, yPosition)

          const dateWidth =
            (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
          pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)
          yPosition += 8

          // Issuer in italics
          if (achievement.issuer) {
            addText(achievement.issuer, 11, false, false, true)
          }

          if (achievement.description) {
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(10)

            // Extract <li> items from HTML description
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = achievement.description
            const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
              (li) => li.textContent.trim()
            )

            liItems.forEach((item) => {
              pdf.text(`•   ${item}`, margin, yPosition)
              yPosition += 5 // space between list items
            })
          }

          yPosition += 5
        })
      }

      // Skills
      if (skills.length > 0) {
        checkPageBreak(30)
        addCreativeHeader("Skills")

        // Format skills in a grid-like layout (3 columns)
        const skillsPerRow = 3
        for (let i = 0; i < skills.length; i += skillsPerRow) {
          checkPageBreak(15)
          const rowSkills = skills.slice(i, i + skillsPerRow)

          // Calculate positions for centered alignment
          const skillWidth = maxWidth / skillsPerRow

          pdf.setFontSize(12)
          pdf.setFont("helvetica", "normal")

          rowSkills.forEach((skill, index) => {
            const xPosition = margin + index * skillWidth + skillWidth / 2
            const textWidth =
              (pdf.getStringUnitWidth(skill.skill) * 12) /
              pdf.internal.scaleFactor
            pdf.text(skill.skill, xPosition - textWidth / 2, yPosition)
          })

          yPosition += 12
        }
        yPosition += 5
      }

      // Certifications and Languages (if needed - currently commented out in original)
      const hasBottomSection = certifications.length > 0 || languages.length > 0

      if (hasBottomSection) {
        checkPageBreak(20)

        // Add a subtle line
        pdf.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 8
      }

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

      // Helper function to convert HTML to text with bullet points
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

      // Build comprehensive Word document content with Creative styling
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
            font-family: 'Arial', sans-serif; 
            font-size: 12pt;
            line-height: 1.4; 
            margin: 0;
            color: #000000;
          }
          .header { 
            text-align: center; 
            margin-bottom: 25pt; 
          }
          .name { 
            font-size: 24pt; 
            font-weight: bold; 
            letter-spacing: 6pt;
            text-transform: uppercase;
            margin-bottom: 8pt;
            font-weight: 300;
          }
          .job-title { 
            font-size: 16pt; 
            letter-spacing: 3pt;
            text-transform: uppercase;
            margin-bottom: 15pt;
            font-weight: 300;
          }
          .contact-info {
            font-size: 12pt;
            margin-bottom: 15pt;
          }
          .section-title { 
            font-size: 18pt; 
            font-weight: bold; 
            text-transform: uppercase;
            letter-spacing: 2pt;
            text-align: center;
            margin-top: 25pt; 
            margin-bottom: 10pt; 
            border-bottom: 1pt solid #000000;
            padding-bottom: 5pt;
          }
          .summary-section {
            text-align: center;
            margin-bottom: 20pt;
          }
          .entry { 
            margin-bottom: 20pt;
            page-break-inside: avoid;
          }
          .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5pt;
          }
          .entry-title { 
            font-weight: bold; 
            font-size: 12pt;
          }
          .entry-date {
            font-size: 12pt;
            text-align: right;
          }
          .entry-subtitle { 
            font-size: 11pt;
            font-style: italic;
            margin-bottom: 8pt;
          }
          .description { 
            font-size: 11pt;
            text-align: justify;
            line-height: 1.3;
            margin-bottom: 8pt;
          }
          .skills-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            gap: 10pt;
          }
          .skill-item {
            text-align: center;
            font-size: 12pt;
            width: 30%;
            margin-bottom: 10pt;
          }
              /* Skills as a borderless table */
      .skills-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-bottom: 5pt;
      }
      .skills-table td {
        border: none;
        padding: 6pt 12pt;
        vertical-align: top;
        width: 33.3333%;
        font-size: 11pt;
        text-align:  center;
      }

        </style>
      </head>
      <body>
    `

      // Header Section with Creative styling
      htmlContent += `
      <div class="header">
        <div class="name">${(personalData.name || "").toUpperCase()}</div>
        ${
          personalData.jobTitle
            ? `<div class="job-title">${personalData.jobTitle.toUpperCase()}</div>`
            : ""
        }
        <div class="contact-info">
          ${[
            personalData.phone,
            personalData.email,
            `${personalData.city || ""}, ${personalData.country || ""}`
          ]
            .filter(Boolean)
            .join(" | ")}
        </div>
      </div>
    `

      // Professional Summary
      if (personalData.summary) {
        htmlContent += `
        <div class="section-title">Professional Summary</div>
        <div class="summary-section">
          <div class="description">${convertHtmlToText(
            personalData.summary
          )}</div>
        </div>
      `
      }

      // Work Experience
      if (experiences.length > 0) {
        htmlContent += `<div class="section-title">Work Experience</div>`
        experiences.forEach((experience) => {
          htmlContent += `
          <div class="entry">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-weight: bold; font-size: 12pt; width: 70%;">
                  ${experience.companyName || ""}
                </td>
                <td style="font-size: 12pt; text-align: right; width: 30%;">
                  ${formatDate(experience.startDate)} - ${formatDate(
            experience.endDate
          )}
                </td>
              </tr>
            </table>
            <div class="entry-subtitle">
              ${experience.jobTitle || ""}
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

      // Education
      if (qualifications.length > 0) {
        htmlContent += `<div class="section-title">Education</div>`
        qualifications.forEach((qualification) => {
          htmlContent += `
          <div class="entry">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-weight: bold; font-size: 12pt; width: 70%;">
                  ${qualification.degreeType || ""} in ${
            qualification.major || ""
          }, ${qualification.institutionName || ""}
                </td>
                <td style="font-size: 12pt; text-align: right; width: 30%;">
                  ${formatDate(qualification.startDate)} - ${formatDate(
            qualification.endDate
          )}
                </td>
              </tr>
            </table>
            ${
              qualification.gpa
                ? `<div style=" margin-top: 5pt;">GPA: ${qualification.gpa}</div>`
                : ""
            }
          </div>
        `
        })
      }

      // Achievements
      if (achievements.length > 0) {
        htmlContent += `<div class="section-title">Achievements</div>`
        achievements.forEach((achievement) => {
          htmlContent += `
          <div class="entry">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-weight: bold; font-size: 12pt; width: 70%;">
                  ${achievement.awardTitle || ""}
                </td>
                <td style="font-size: 12pt; text-align: right; width: 30%;">
                  ${formatDate(achievement.startDate)} - ${formatDate(
            achievement.endDate
          )}
                </td>
              </tr>
            </table>
            <div class="entry-subtitle">
              ${achievement.issuer || ""}
            </div>
            ${
              achievement.description
                ? `<div class="description">${convertHtmlToText(
                    achievement.description
                  )}</div>`
                : ""
            }
          </div>
        `
        })
      }

      // Skills Section - borderless table with 3 columns
      if (skills.length > 0) {
        htmlContent += `
      <div class="section-title">Skills</div>
      
      <table class="skills-table" border="0" cellspacing="0" cellpadding="0">
        <tbody>
    `

        for (let i = 0; i < skills.length; i++) {
          if (i % 3 === 0) htmlContent += "<tr>"
          htmlContent += `<td>${skills[i].skill || ""}</td>`
          if (i % 3 === 2) htmlContent += "</tr>"
        }

        // close last row if incomplete
        const remainder = skills.length % 3
        if (remainder !== 0) {
          for (let j = 0; j < 3 - remainder; j++) {
            htmlContent += "<td></td>"
          }
          htmlContent += "</tr>"
        }

        htmlContent += `
        </tbody>
      </table>
       <hr style="border: 0; border-top: 1pt solid #000000; margin: 15pt 0;" />
    `
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

  const sanitizedAchievements = useMemo(() => {
    return achievements.map((achievement) => {
      const clean = (achievement.description || "").replace(
        /<p>\s*<br\s*\/?>\s*<\/p>/gi,
        ""
      )
      const sanitized = DOMPurify.sanitize(clean)
      return { ...achievement, sanitizedDescription: sanitized }
    })
  }, [achievements])

  const handleSave = () => {
    navigate("/scan-resume/main-ResumeBuilder")
  }

  const isDownloadDisabled = isPdfGenerating || isWordGenerating

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <CircularIndeterminate />
        </div>
      ) : (
        <>
          <style>
            {`
          /* Default mobile styles - 80mm width */
          #resume-content {
            width: 80mm !important;
            margin: auto;
            font-family: 'Arial', sans-serif;
            padding: 10px;
            box-sizing: border-box;
            background-color: white;
            color: black;
            line-height: 1.4;
          }

          /* Make resume-content 200mm on large screens */
          @media screen and (min-width: 768px) {
            #resume-content {
              width: 250mm !important;
              padding: 40px;
            }
          }

          /* PDF generation mode - A4 size */
          #resume-content.pdf-mode {
            width: 200mm !important;
            padding: 40px;
          }

          /* Section headers styling */
          .section-header {
            font-weight: bold;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: center;
            margin: 30px 0 10px 0;
          }

          /* PDF mode text sizes */
          .pdf-mode .section-header {
            font-size: 20px;
            margin: 35px 0 15px 0;
          }

          .pdf-mode .header-section {
            margin-top: 40px;
          }

          .pdf-mode .name-title {
            font-size: 32px;
          }

          .pdf-mode .job-title {
            font-size: 18px;
          }

          .pdf-mode .contact-info {
            font-size: 14px;
          }

          .pdf-mode .section-content {
            font-size: 14px;
          }
        `}
          </style>
          <div className="h-auto overflow-auto">
            <div
              id="resume-content"
              className="w-full bg-white text-black"
              style={{
                width: "200mm",
                margin: "auto",
                fontFamily: "'Arial', sans-serif",
                padding: "40px",
                boxSizing: "border-box"
              }}>
              {/* Header Section */}
              <div className="header-section text-center mb-8">
                <h1
                  className="name-title text-3xl md:text-4xl font-bold tracking-widest mb-2"
                  style={{ letterSpacing: "6px", fontWeight: "300" }}>
                  {personalData.name?.toUpperCase() || "LINDSAY WATSON"}
                </h1>
                <p
                  className="job-title text-base md:text-lg tracking-wide mb-4"
                  style={{ letterSpacing: "3px", fontWeight: "300" }}>
                  {personalData.jobTitle?.toUpperCase() || "LINDSAY WATSON"}
                </p>
                <div className="contact-info text-sm flex justify-center items-center space-x-2">
                  <span>{personalData.phone}</span>
                  <span>|</span>
                  <span>{personalData.email}</span>
                  <span>|</span>
                  <span>
                    {personalData.city}, {personalData.country}
                  </span>
                </div>
              </div>

              {/* Professional Summary */}
              {personalData.summary && (
                <div className="mb-8">
                  <h2 className="section-header">Professional Summary</h2>
                  <hr className="border-t border-black mt-2 mb-4" />
                  <div
                    className="section-content text-sm md:text-base text-justify leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
                  />
                </div>
              )}

              {/* Work Experience */}
              {experiences.length > 0 && (
                <div className="mb-8">
                  <h2 className="section-header">Work Experience</h2>
                  <hr className="border-t border-black mt-2 mb-4" />
                  {sanitizedExperiences.map((experience, index) => (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm md:text-base">
                          {experience.companyName}
                        </h3>
                        <span className="text-sm text-right">
                          {formatDate(experience.startDate)} -{" "}
                          {formatDate(experience.endDate)}
                        </span>
                      </div>
                      <p className="italic text-sm md:text-base mt-2 mb-4">
                        {experience.jobTitle}
                      </p>
                      <div
                        className="section-content text-sm leading-relaxed
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                          [&_li]:mb-1"
                        dangerouslySetInnerHTML={{
                          __html: experience.sanitizedDescription
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {qualifications.length > 0 && (
                <div className="mb-8">
                  <h2 className="section-header">Education</h2>
                  <hr className="border-t border-black mt-2 mb-4" />
                  {qualifications.map((qualification, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm md:text-base">
                          {qualification.degreeType} in {qualification.major},{" "}
                          {qualification.institutionName}
                        </h3>
                        <span className="text-sm text-right">
                          {formatDate(qualification.startDate)} -{" "}
                          {formatDate(qualification.endDate)}
                        </span>
                      </div>
                      {qualification.gpa && (
                        <p className="text-sm">GPA: {qualification.gpa}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="mb-8">
                  <h2 className="section-header">Achievements</h2>
                  <hr className="border-t border-black mt-2 mb-4" />
                  {sanitizedAchievements.map((achievement, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm md:text-base">
                          {achievement.awardTitle}
                        </h3>
                        <span className="text-sm text-right">
                          {formatDate(achievement.startDate)} -{" "}
                          {formatDate(achievement.endDate)}
                        </span>
                      </div>
                      <p className="italic text-sm mb-2">
                        {achievement.issuer}
                      </p>
                      <div
                        className="section-content text-sm leading-relaxed
                          [&_ul]:list-disc [&_ul]:pl-5
                          [&_ol]:list-decimal [&_ol]:pl-5"
                        dangerouslySetInnerHTML={{
                          __html: achievement.sanitizedDescription
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="section-header">Skills</h2>
                  <hr className="border-t border-black mt-2 mb-4" />
                  <div className="flex flex-wrap gap-y-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="w-1/3 text-center text-sm md:text-base py-1 break-words">
                        {skill.skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Section - Certifications and Languages */}
              <div className="mt-8 pt-4 border-t border-gray-300">
                {/* {certifications.length > 0 && (
                  <div className="mb-2 text-sm md:text-base">
                    <span className="font-bold">Certifications: </span>
                    {certifications
                      .map((cert) => cert.certificationTitle)
                      .join(", ")}
                  </div>
                )}

                {languages.length > 0 && (
                  <div className="text-sm md:text-base">
                    <span className="font-bold">Languages: </span>
                    {languages.map((lang) => lang.language).join(", ")}
                  </div>
                )} */}
              </div>
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

export default Creative
