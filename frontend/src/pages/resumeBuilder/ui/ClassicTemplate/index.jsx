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

// const Classic = ({
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
//   //       margin: [16, 7, 16, 7],
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

//   const generatePDF = async () => {
//     SetLoading(true)

//     try {
//       setIsPdfGenerating(true)

//       // Create new jsPDF instance
//       const pdf = new jsPDF({
//         unit: "mm",
//         format: "a4",
//         orientation: "portrait"
//       })

//       // PDF dimensions and margins
//       const pageWidth = pdf.internal.pageSize.getWidth()
//       const pageHeight = pdf.internal.pageSize.getHeight()
//       const margin = 20
//       const lineHeight = 6
//       let yPosition = margin

//       // Helper function to add text with word wrapping
//       const addText = (
//         text,
//         fontSize = 10,
//         fontStyle = "normal",
//         maxWidth = null
//       ) => {
//         pdf.setFontSize(fontSize)
//         pdf.setFont("times", fontStyle)

//         const textWidth = maxWidth || pageWidth - 2 * margin
//         const lines = pdf.splitTextToSize(text, textWidth)

//         // Check if we need a new page
//         if (yPosition + lines.length * lineHeight > pageHeight - margin) {
//           pdf.addPage()
//           yPosition = margin
//         }

//         lines.forEach((line) => {
//           pdf.text(line, margin, yPosition)
//           yPosition += lineHeight
//         })

//         return lines.length * lineHeight
//       }

//       // Helper function for section headers
//       const addSectionHeader = (title) => {
//         yPosition += 5 // Extra space before section
//         addText(title.toUpperCase(), 14, "bold")
//         yPosition += 3 // Space after header
//       }

//       // Helper function to strip HTML tags
//       const stripHtml = (html) => {
//         const div = document.createElement("div")
//         div.innerHTML = html
//         return div.textContent || div.innerText || ""
//       }

//       // Add Header
//       pdf.setFillColor(247, 245, 251) // Background color
//       pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, "F")

//       pdf.setFontSize(18)
//       pdf.setFont("times", "bold")
//       const nameWidth = pdf.getTextWidth(personalData.name || "Your Name")
//       pdf.text(
//         personalData.name || "Your Name",
//         (pageWidth - nameWidth) / 2,
//         yPosition + 12
//       )

//       yPosition += 25

//       // Contact Information
//       const contactInfo = [
//         personalData.address,
//         personalData.phone,
//         personalData.email
//       ]
//         .filter(Boolean)
//         .join(" ; ")

//       if (contactInfo) {
//         pdf.setFontSize(9)
//         pdf.setFont("times", "normal")
//         const contactWidth = pdf.getTextWidth(contactInfo)
//         pdf.text(contactInfo, (pageWidth - contactWidth) / 2, yPosition)
//         yPosition += 10
//       }

//       // Professional Summary
//       if (personalData.summary) {
//         const cleanSummary = stripHtml(personalData.summary)
//         if (cleanSummary.trim()) {
//           addText(cleanSummary, 10, "normal")
//           yPosition += 5
//         }
//       }

//       // Work Experience
//       if (experiences.length > 0) {
//         addSectionHeader("Experience")

//         experiences.forEach((exp, index) => {
//           // Date range
//           const dateRange = `${formatDate(exp.startDate)} - ${formatDate(
//             exp.endDate
//           )}`
//           addText(dateRange, 9, "bold")

//           // Job title and company
//           const jobInfo = `${exp.jobTitle} | ${exp.companyName} | ${
//             exp.location || personalData.city
//           }`
//           addText(jobInfo, 10, "bold")

//           if (exp.description) {
//             pdf.setFont("Arial", "normal")
//             pdf.setFontSize(10)

//             // Extract <li> items from HTML description
//             const tempDiv = document.createElement("div")
//             tempDiv.innerHTML = exp.description
//             const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
//               (li) => li.textContent.trim()
//             )

//             liItems.forEach((item) => {
//               pdf.text(`• ${item}`, margin, yPosition)
//               yPosition += 5 // space between list items
//             })
//           }

//           if (index < experiences.length - 1) {
//             yPosition += 3 // Space between experiences
//           }
//         })
//       }

//       // Skills
//       if (skills.length > 0) {
//         addSectionHeader("Skills")
//         const skillsText = skills.map((skill) => skill.skill).join(" • ")
//         addText(skillsText, 10, "normal")
//       }

//       // Education
//       if (qualifications.length > 0) {
//         addSectionHeader("Education")

//         qualifications.forEach((qual, index) => {
//           // Date
//           addText(formatDate(qual.endDate), 9, "bold")

//           // Degree info
//           const degreeInfo = `${qual.degreeType} | ${qual.major} | ${
//             qual.institutionName
//           } | ${qual.location || personalData.city}`
//           addText(degreeInfo, 10, "bold")

//           // GPA and additional info
//           if (qual.gpa || qual.additionalInfo) {
//             const extraInfo = [
//               qual.gpa ? `${qual.gpa} GPA` : "",
//               qual.additionalInfo || ""
//             ]
//               .filter(Boolean)
//               .join(" • ")

//             if (extraInfo) {
//               addText(extraInfo, 9, "normal")
//             }
//           }

//           if (index < qualifications.length - 1) {
//             yPosition += 3
//           }
//         })
//       }

//       // Achievements
//       if (achievements.length > 0) {
//         addSectionHeader("Achievements")

//         achievements.forEach((achievement, index) => {
//           // Date range
//           const dateRange = `${formatDate(
//             achievement.startDate
//           )} - ${formatDate(achievement.endDate)}`
//           addText(dateRange, 9, "bold")

//           // Award info
//           const awardInfo = `${achievement.awardTitle} | ${achievement.issuer}`
//           addText(awardInfo, 10, "bold")

//           if (achievement.description) {
//             pdf.setFont("Arial", "normal")
//             pdf.setFontSize(10)

//             // Extract <li> items from HTML description
//             const tempDiv = document.createElement("div")
//             tempDiv.innerHTML = achievement.description
//             const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
//               (li) => li.textContent.trim()
//             )

//             liItems.forEach((item) => {
//               pdf.text(`• ${item}`, margin, yPosition)
//               yPosition += 5 // space between list items
//             })
//           }

//           if (index < achievements.length - 1) {
//             yPosition += 3
//           }
//         })
//       }

//       // Languages
//       if (languages.length > 0) {
//         addSectionHeader("Languages")
//         const languagesText = languages
//           .map(
//             (lang) =>
//               `${lang.language}${
//                 lang.proficiency ? ` (${lang.proficiency})` : ""
//               }`
//           )
//           .join(" • ")
//         addText(languagesText, 10, "normal")
//       }

//       // Save the PDF
//       const filename = `${localStorage.getItem("resumeTitle") || "Resume"}.pdf`
//       pdf.save(filename)

//       setIsPdfGenerating(false)
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
//             font-family: 'Times New Roman', serif;
//             padding: 10px;
//             box-sizing: border-box;
//             background-color: white;
//             color: black;
//             line-height: 1.5;
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

//           /* Section headers styling - Enhanced for PDF */
//           .section-header {
//             font-weight: bold !important;
//             font-size: 22px !important;
//             margin: 25px 0 10px 0 !important;
//             font-family: 'Times New Roman', serif !important;
//           }

//           /* PDF mode text sizes - Enhanced specificity */
//           .pdf-mode .section-header,
//           #resume-content.pdf-mode .section-header,
//           .pdf-mode h2.section-header,
//           #resume-content.pdf-mode h2.section-header {
//             font-size: 22px !important;
//             font-weight: bold !important;
//             margin: 30px 0 10px 0 !important;
//             font-family: 'Times New Roman', serif !important;
//             color: black !important;
//           }

//           .pdf-mode .name-title {
//             font-size: 28px !important;
//           }

//           .pdf-mode .contact-info {
//             font-size: 12px !important;
//           }

//           .pdf-mode .section-content {
//             font-size: 12px !important;
//           }

//           .pdf-mode .job-title {
//             font-size: 14px !important;
//           }

//           .pdf-mode .company-name {
//             font-size: 12px !important;
//           }

//           /* Additional CSS for better PDF rendering */
//           .pdf-mode * {
//             -webkit-print-color-adjust: exact !important;
//             color-adjust: exact !important;
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
//                 fontFamily: "'Times New Roman', serif",
//                 padding: "40px",
//                 boxSizing: "border-box"
//               }}>
//               {/* Header Section */}
//               <div className="text-center mb-6">
//                 <div
//                   className="w-full px-4 mb-4 flex items-center justify-center"
//                   style={{
//                     backgroundColor: "rgb(247, 245, 251)",
//                     paddingTop: "16px",
//                     paddingBottom: "16px"
//                   }}>
//                   <h1 className="name-title text-2xl md:text-3xl mb-4 mt-4 font-bold text-black m-0">
//                     {personalData.name || "Your Name"}
//                   </h1>
//                 </div>
//                 <div className="contact-info text-xs md:text-sm">
//                   {personalData.address && (
//                     <span>{personalData.address}; </span>
//                   )}
//                   {personalData.phone && <span>{personalData.phone} </span>}
//                   {personalData.email && <span>{personalData.email}</span>}
//                 </div>
//               </div>

//               {/* Professional Summary */}
//               {personalData.summary && (
//                 <div className="mb-6">
//                   <div
//                     className="section-content text-xs md:text-sm text-justify leading-relaxed"
//                     dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
//                   />
//                 </div>
//               )}

//               {/* Work Experience */}
//               {experiences.length > 0 && (
//                 <div className="mb-6">
//                   <h2
//                     className="section-header"
//                     style={{
//                       fontSize: "22px",
//                       fontWeight: "bold",
//                       fontFamily: "'Times New Roman', serif",
//                       margin: "25px 0 10px 0",
//                       color: "black"
//                     }}>
//                     Experience
//                   </h2>
//                   {sanitizedExperiences.map((experience, index) => (
//                     <div key={index} className="mb-4">
//                       <div className="mb-1">
//                         <p className="job-title font-bold text-xs md:text-sm uppercase tracking-wide">
//                           {formatDate(experience.startDate)} -{" "}
//                           {formatDate(experience.endDate)}
//                         </p>
//                         <p className="company-name text-xs md:text-sm font-bold">
//                           {experience.jobTitle} | {experience.companyName} |{" "}
//                           {experience.location || personalData.city}
//                         </p>
//                       </div>
//                       <div
//                         className="section-content text-xs md:text-sm leading-relaxed
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

//               {/* Skills */}
//               {skills.length > 0 && (
//                 <div className="mb-6">
//                   <h2
//                     className="section-header"
//                     style={{
//                       fontSize: "22px",
//                       fontWeight: "bold",
//                       fontFamily: "'Times New Roman', serif",
//                       margin: "25px 0 10px 0",
//                       color: "black"
//                     }}>
//                     Skills
//                   </h2>
//                   <div className="section-content text-xs md:text-sm">
//                     {skills.map((skill, index) => (
//                       <span key={index}>
//                         {skill.skill}
//                         {index < skills.length - 1 && " • "}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Education */}
//               {qualifications.length > 0 && (
//                 <div className="mb-6">
//                   <h2
//                     className="section-header"
//                     style={{
//                       fontSize: "22px",
//                       fontWeight: "bold",
//                       fontFamily: "'Times New Roman', serif",
//                       margin: "25px 0 10px 0",
//                       color: "black"
//                     }}>
//                     Education
//                   </h2>
//                   {qualifications.map((qualification, index) => (
//                     <div key={index} className="mb-3">
//                       <p className="job-title font-bold text-xs md:text-sm uppercase tracking-wide">
//                         {formatDate(qualification.endDate)}
//                       </p>
//                       <p className="company-name text-xs md:text-sm font-bold">
//                         {qualification.degreeType} | {qualification.major} |{" "}
//                         {qualification.institutionName} |{" "}
//                         {qualification.location || personalData.city}
//                       </p>
//                       {qualification.gpa && (
//                         <p className="text-xs md:text-sm">
//                           {qualification.gpa} GPA
//                           {qualification.additionalInfo &&
//                             ` • ${qualification.additionalInfo}`}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Achievements */}
//               {achievements.length > 0 && (
//                 <div className="mb-6">
//                   <h2
//                     className="section-header"
//                     style={{
//                       fontSize: "22px",
//                       fontWeight: "bold",
//                       fontFamily: "'Times New Roman', serif",
//                       margin: "25px 0 10px 0",
//                       color: "black"
//                     }}>
//                     Achievements
//                   </h2>
//                   {sanitizedAchievements.map((achievement, index) => (
//                     <div key={index} className="mb-3">
//                       <p className="job-title font-bold text-xs md:text-sm uppercase tracking-wide">
//                         {formatDate(achievement.startDate)} -{" "}
//                         {formatDate(achievement.endDate)}
//                       </p>
//                       <p className="company-name text-xs md:text-sm font-bold">
//                         {achievement.awardTitle} | {achievement.issuer}
//                       </p>
//                       <div
//                         className="section-content text-xs md:text-sm leading-relaxed
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

//               {/* Certifications */}
//               {/* {certifications.length > 0 && (
//                 <div className="mb-6">
//                   <h2
//                     className="section-header"
//                     style={{
//                       fontSize: "22px",
//                       fontWeight: "bold",
//                       fontFamily: "'Times New Roman', serif",
//                       margin: "25px 0 10px 0",
//                       color: "black"
//                     }}>
//                     Certifications
//                   </h2>
//                   <div className="section-content text-xs md:text-sm">
//                     {certifications.map((cert, index) => (
//                       <span key={index}>
//                         {cert.certificationTitle}
//                         {index < certifications.length - 1 && " • "}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )} */}

//               {/* Languages */}
//               {languages.length > 0 && (
//                 <div className="mb-6">
//                   <h2
//                     className="section-header"
//                     style={{
//                       fontSize: "22px",
//                       fontWeight: "bold",
//                       fontFamily: "'Times New Roman', serif",
//                       margin: "25px 0 10px 0",
//                       color: "black"
//                     }}>
//                     Languages
//                   </h2>
//                   <div className="section-content text-xs md:text-sm">
//                     {languages.map((lang, index) => (
//                       <span key={index}>
//                         {lang.language}
//                         {lang.proficiency && ` (${lang.proficiency})`}
//                         {index < languages.length - 1 && " • "}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
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

// export default Classic

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

const Classic = ({
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
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      })

      // PDF dimensions and margins
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const lineHeight = 6
      let yPosition = margin

      // Helper function to add text with word wrapping
      const addText = (
        text,
        fontSize = 10,
        fontStyle = "normal",
        maxWidth = null
      ) => {
        pdf.setFontSize(fontSize)
        pdf.setFont("times", fontStyle)

        const textWidth = maxWidth || pageWidth - 2 * margin
        const lines = pdf.splitTextToSize(text, textWidth)

        // Check if we need a new page
        if (yPosition + lines.length * lineHeight > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }

        lines.forEach((line) => {
          pdf.text(line, margin, yPosition)
          yPosition += lineHeight
        })

        return lines.length * lineHeight
      }

      // Helper function for section headers
      const addSectionHeader = (title) => {
        yPosition += 5 // Extra space before section
        addText(title.toUpperCase(), 14, "bold")
        yPosition += 3 // Space after header
      }

      // Helper function to strip HTML tags
      const stripHtml = (html) => {
        const div = document.createElement("div")
        div.innerHTML = html
        return div.textContent || div.innerText || ""
      }

      // Add Header
      pdf.setFillColor(247, 245, 251) // Background color
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, "F")

      pdf.setFontSize(18)
      pdf.setFont("times", "bold")
      const nameWidth = pdf.getTextWidth(personalData.name || "Your Name")
      pdf.text(
        personalData.name || "Your Name",
        (pageWidth - nameWidth) / 2,
        yPosition + 12
      )

      yPosition += 25

      // Contact Information
      const contactInfo = [
        personalData.address,
        personalData.phone,
        personalData.email
      ]
        .filter(Boolean)
        .join(" ; ")

      if (contactInfo) {
        pdf.setFontSize(9)
        pdf.setFont("times", "normal")
        const contactWidth = pdf.getTextWidth(contactInfo)
        pdf.text(contactInfo, (pageWidth - contactWidth) / 2, yPosition)
        yPosition += 10
      }

      // Professional Summary
      if (personalData.summary) {
        const cleanSummary = stripHtml(personalData.summary)
        if (cleanSummary.trim()) {
          addText(cleanSummary, 10, "normal")
          yPosition += 5
        }
      }

      // Work Experience
      if (experiences.length > 0) {
        addSectionHeader("Experience")

        experiences.forEach((exp, index) => {
          // Date range
          const dateRange = `${formatDate(exp.startDate)} - ${formatDate(
            exp.endDate
          )}`
          addText(dateRange, 9, "bold")

          // Job title and company
          const jobInfo = `${exp.jobTitle} | ${exp.companyName} | ${
            exp.location || personalData.city
          }`
          addText(jobInfo, 10, "bold")

          if (exp.description) {
            pdf.setFont("Arial", "normal")
            pdf.setFontSize(10)

            // Extract <li> items from HTML description
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = exp.description
            const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
              (li) => li.textContent.trim()
            )

            liItems.forEach((item) => {
              pdf.text(`• ${item}`, margin, yPosition)
              yPosition += 5 // space between list items
            })
          }

          if (index < experiences.length - 1) {
            yPosition += 3 // Space between experiences
          }
        })
      }

      // Skills
      if (skills.length > 0) {
        addSectionHeader("Skills")
        const skillsText = skills.map((skill) => skill.skill).join(" • ")
        addText(skillsText, 10, "normal")
      }

      // Education
      if (qualifications.length > 0) {
        addSectionHeader("Education")

        qualifications.forEach((qual, index) => {
          // Date
          addText(formatDate(qual.endDate), 9, "bold")

          // Degree info
          const degreeInfo = `${qual.degreeType} | ${qual.major} | ${
            qual.institutionName
          } | ${qual.location || personalData.city}`
          addText(degreeInfo, 10, "bold")

          // GPA and additional info
          if (qual.gpa || qual.additionalInfo) {
            const extraInfo = [
              qual.gpa ? `${qual.gpa} GPA` : "",
              qual.additionalInfo || ""
            ]
              .filter(Boolean)
              .join(" • ")

            if (extraInfo) {
              addText(extraInfo, 9, "normal")
            }
          }

          if (index < qualifications.length - 1) {
            yPosition += 3
          }
        })
      }

      // Achievements
      if (achievements.length > 0) {
        addSectionHeader("Achievements")

        achievements.forEach((achievement, index) => {
          // Date range
          const dateRange = `${formatDate(
            achievement.startDate
          )} - ${formatDate(achievement.endDate)}`
          addText(dateRange, 9, "bold")

          // Award info
          const awardInfo = `${achievement.awardTitle} | ${achievement.issuer}`
          addText(awardInfo, 10, "bold")

          if (achievement.description) {
            pdf.setFont("Arial", "normal")
            pdf.setFontSize(10)

            // Extract <li> items from HTML description
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = achievement.description
            const liItems = Array.from(tempDiv.querySelectorAll("li")).map(
              (li) => li.textContent.trim()
            )

            liItems.forEach((item) => {
              pdf.text(`• ${item}`, margin, yPosition)
              yPosition += 5 // space between list items
            })
          }

          if (index < achievements.length - 1) {
            yPosition += 3
          }
        })
      }

      // Languages
      if (languages.length > 0) {
        addSectionHeader("Languages")
        const languagesText = languages
          .map(
            (lang) =>
              `${lang.language}${
                lang.proficiency ? ` (${lang.proficiency})` : ""
              }`
          )
          .join(" • ")
        addText(languagesText, 10, "normal")
      }

      // Save the PDF
      const filename = `${localStorage.getItem("resumeTitle") || "Resume"}.pdf`
      pdf.save(filename)

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

      // Build comprehensive Word document content with Classic styling
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
            margin: 1in;
            size: 8.5in 11in;
          }
          body { 
            font-family: 'Times New Roman', serif; 
            font-size: 12pt;
            line-height: 1.5; 
            margin: 0;
            color: #000000;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20pt;
            background-color: #f7f5fb;
            padding: 16pt 12pt;
          }
          .name { 
            font-size: 18pt; 
            font-weight: bold; 
            margin-bottom: 10pt;
            margin-top: 0;
          }
          .contact-info {
            font-size: 9pt;
            margin-bottom: 0;
          }
          .section-title { 
            font-size: 14pt; 
            font-weight: bold; 
            text-transform: uppercase;
            margin-top: 20pt; 
            margin-bottom: 8pt; 
          }
          .summary-section {
            margin-bottom: 15pt;
            text-align: justify;
          }
          .entry { 
            margin-bottom: 15pt;
            page-break-inside: avoid;
          }
          .entry-header {
            margin-bottom: 3pt;
          }
          .entry-date { 
            font-weight: bold; 
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 1pt;
          }
          .entry-title { 
            font-weight: bold; 
            font-size: 10pt;
            margin-bottom: 5pt;
          }
          .description { 
            font-size: 10pt;
            text-align: justify;
            line-height: 1.3;
          }
          .skills-content {
            font-size: 10pt;
          }
        </style>
      </head>
      <body>
    `

      // Header Section with Classic styling
      htmlContent += `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20pt;">
        <tr>
          <td style="background-color: #f7f5fb; padding: 16pt 12pt; text-align: center; border: none;">
            <h1 style="font-size: 18pt; font-weight: bold; margin: 0; padding: 0; font-family: 'Times New Roman', serif;">
              ${personalData.name || "Your Name"}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding-top: 8pt; font-size: 9pt; border: none;">
            ${[personalData.address, personalData.phone, personalData.email]
              .filter(Boolean)
              .join(" ; ")}
          </td>
        </tr>
      </table>
    `

      // Professional Summary
      if (personalData.summary) {
        htmlContent += `
        <div class="summary-section">
          <div class="description">${convertHtmlToText(
            personalData.summary
          )}</div>
        </div>
      `
      }

      // Work Experience
      if (experiences.length > 0) {
        htmlContent += `<div class="section-title">Experience</div>`
        experiences.forEach((experience) => {
          htmlContent += `
          <div class="entry">
            <div class="entry-header">
              <div class="entry-date">
                ${formatDate(experience.startDate)} - ${formatDate(
            experience.endDate
          )}
              </div>
              <div class="entry-title">
                ${experience.jobTitle || ""} | ${
            experience.companyName || ""
          } | ${experience.location || personalData.city || ""}
              </div>
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

      // Skills
      if (skills.length > 0) {
        htmlContent += `
        <div class="section-title">Skills</div>
        <div class="skills-content">
          ${skills.map((skill) => skill.skill).join(" • ")}
        </div>
      `
      }

      // Education
      if (qualifications.length > 0) {
        htmlContent += `<div class="section-title">Education</div>`
        qualifications.forEach((qualification) => {
          htmlContent += `
          <div class="entry">
            <div class="entry-header">
              <div class="entry-date">
                ${formatDate(qualification.endDate)}
              </div>
              <div class="entry-title">
                ${qualification.degreeType || ""} | ${
            qualification.major || ""
          } | ${qualification.institutionName || ""} | ${
            qualification.location || personalData.city || ""
          }
              </div>
            </div>
            ${
              qualification.gpa || qualification.additionalInfo
                ? `<div class="description">
                    ${qualification.gpa ? `${qualification.gpa} GPA` : ""}${
                    qualification.gpa && qualification.additionalInfo
                      ? " • "
                      : ""
                  }${qualification.additionalInfo || ""}
                   </div>`
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
            <div class="entry-header">
              <div class="entry-date">
                ${formatDate(achievement.startDate)} - ${formatDate(
            achievement.endDate
          )}
              </div>
              <div class="entry-title">
                ${achievement.awardTitle || ""} | ${achievement.issuer || ""}
              </div>
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

      // Languages
      if (languages.length > 0) {
        htmlContent += `
        <div class="section-title">Languages</div>
        <div class="skills-content">
          ${languages
            .map(
              (lang) =>
                `${lang.language}${
                  lang.proficiency ? ` (${lang.proficiency})` : ""
                }`
            )
            .join(" • ")}
        </div>
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
            font-family: 'Times New Roman', serif;
            padding: 10px;
            box-sizing: border-box;
            background-color: white;
            color: black;
            line-height: 1.5;
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

          /* Section headers styling - Enhanced for PDF */
          .section-header {
            font-weight: bold !important;
            font-size: 22px !important;
            margin: 25px 0 10px 0 !important;
            font-family: 'Times New Roman', serif !important;
          }

          /* PDF mode text sizes - Enhanced specificity */
          .pdf-mode .section-header,
          #resume-content.pdf-mode .section-header,
          .pdf-mode h2.section-header,
          #resume-content.pdf-mode h2.section-header {
            font-size: 22px !important;
            font-weight: bold !important;
            margin: 30px 0 10px 0 !important;
            font-family: 'Times New Roman', serif !important;
            color: black !important;
          }

          .pdf-mode .name-title {
            font-size: 28px !important;
          }

          .pdf-mode .contact-info {
            font-size: 12px !important;
          }

          .pdf-mode .section-content {
            font-size: 12px !important;
          }

          .pdf-mode .job-title {
            font-size: 14px !important;
          }

          .pdf-mode .company-name {
            font-size: 12px !important;
          }

          /* Additional CSS for better PDF rendering */
          .pdf-mode * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
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
                fontFamily: "'Times New Roman', serif",
                padding: "40px",
                boxSizing: "border-box"
              }}>
              {/* Header Section */}
              <div className="text-center mb-6">
                <div
                  className="w-full px-4 mb-4 flex items-center justify-center"
                  style={{
                    backgroundColor: "rgb(247, 245, 251)",
                    paddingTop: "16px",
                    paddingBottom: "16px"
                  }}>
                  <h1 className="name-title text-2xl md:text-3xl mb-4 mt-4 font-bold text-black m-0">
                    {personalData.name || "Your Name"}
                  </h1>
                </div>
                <div className="contact-info text-xs md:text-sm">
                  {personalData.address && (
                    <span>{personalData.address}; </span>
                  )}
                  {personalData.phone && <span>{personalData.phone} </span>}
                  {personalData.email && <span>{personalData.email}</span>}
                </div>
              </div>

              {/* Professional Summary */}
              {personalData.summary && (
                <div className="mb-6">
                  <div
                    className="section-content text-xs md:text-sm text-justify leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
                  />
                </div>
              )}

              {/* Work Experience */}
              {experiences.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="section-header"
                    style={{
                      fontSize: "22px",
                      fontWeight: "bold",
                      fontFamily: "'Times New Roman', serif",
                      margin: "25px 0 10px 0",
                      color: "black"
                    }}>
                    Experience
                  </h2>
                  {sanitizedExperiences.map((experience, index) => (
                    <div key={index} className="mb-4">
                      <div className="mb-1">
                        <p className="job-title font-bold text-xs md:text-sm uppercase tracking-wide">
                          {formatDate(experience.startDate)} -{" "}
                          {formatDate(experience.endDate)}
                        </p>
                        <p className="company-name text-xs md:text-sm font-bold">
                          {experience.jobTitle} | {experience.companyName} |{" "}
                          {experience.location || personalData.city}
                        </p>
                      </div>
                      <div
                        className="section-content text-xs md:text-sm leading-relaxed
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

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="section-header"
                    style={{
                      fontSize: "22px",
                      fontWeight: "bold",
                      fontFamily: "'Times New Roman', serif",
                      margin: "25px 0 10px 0",
                      color: "black"
                    }}>
                    Skills
                  </h2>
                  <div className="section-content text-xs md:text-sm">
                    {skills.map((skill, index) => (
                      <span key={index}>
                        {skill.skill}
                        {index < skills.length - 1 && " • "}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {qualifications.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="section-header"
                    style={{
                      fontSize: "22px",
                      fontWeight: "bold",
                      fontFamily: "'Times New Roman', serif",
                      margin: "25px 0 10px 0",
                      color: "black"
                    }}>
                    Education
                  </h2>
                  {qualifications.map((qualification, index) => (
                    <div key={index} className="mb-3">
                      <p className="job-title font-bold text-xs md:text-sm uppercase tracking-wide">
                        {formatDate(qualification.endDate)}
                      </p>
                      <p className="company-name text-xs md:text-sm font-bold">
                        {qualification.degreeType} | {qualification.major} |{" "}
                        {qualification.institutionName} |{" "}
                        {qualification.location || personalData.city}
                      </p>
                      {qualification.gpa && (
                        <p className="text-xs md:text-sm">
                          {qualification.gpa} GPA
                          {qualification.additionalInfo &&
                            ` • ${qualification.additionalInfo}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="section-header"
                    style={{
                      fontSize: "22px",
                      fontWeight: "bold",
                      fontFamily: "'Times New Roman', serif",
                      margin: "25px 0 10px 0",
                      color: "black"
                    }}>
                    Achievements
                  </h2>
                  {sanitizedAchievements.map((achievement, index) => (
                    <div key={index} className="mb-3">
                      <p className="job-title font-bold text-xs md:text-sm uppercase tracking-wide">
                        {formatDate(achievement.startDate)} -{" "}
                        {formatDate(achievement.endDate)}
                      </p>
                      <p className="company-name text-xs md:text-sm font-bold">
                        {achievement.awardTitle} | {achievement.issuer}
                      </p>
                      <div
                        className="section-content text-xs md:text-sm leading-relaxed
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

              {/* Languages */}
              {languages.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="section-header"
                    style={{
                      fontSize: "22px",
                      fontWeight: "bold",
                      fontFamily: "'Times New Roman', serif",
                      margin: "25px 0 10px 0",
                      color: "black"
                    }}>
                    Languages
                  </h2>
                  <div className="section-content text-xs md:text-sm">
                    {languages.map((lang, index) => (
                      <span key={index}>
                        {lang.language}
                        {lang.proficiency && ` (${lang.proficiency})`}
                        {index < languages.length - 1 && " • "}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

export default Classic
