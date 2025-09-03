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

// const formatDate = (dateString) => {
//   if (!dateString) return "Present" // If date is null, undefined, or empty, return "Present"
//   const date = new Date(dateString)
//   // Check if date is invalid
//   if (isNaN(date.getTime())) return "Present"
//   return date.toLocaleString("en-US", { month: "short", year: "numeric" })
// }

// const ModernProfessional = ({
//   personalData,
//   skills,
//   achievements,
//   certifications,
//   experiences,
//   languages,
//   qualifications
// }) => {
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

//   //     // Add PDF generation mode class
//   //     resumeContent.classList.add("pdf-mode")

//   //     const options = {
//   //       margin: [10, 10, 5, 10],
//   //       filename: `${localStorage.getItem("resumeTitle") || "Resume"}.pdf`,
//   //       image: { type: "png", quality: 1 },
//   //       html2canvas: { scale: 2, useCORS: true, allowTaint: true },
//   //       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
//   //     }

//   //     await html2pdf().from(resumeContent).set(options).save()

//   //     // Cleanup
//   //     resumeContent.classList.remove("pdf-mode")
//   //     buttonsContainer.style.display = "flex"

//   //     setIsPdfGenerating(false)
//   //     SetLoading(false)
//   //   } catch (error) {
//   //     console.error("PDF Generation Error:", error)
//   //     alert("Failed to generate PDF. Please try again.")
//   //     setIsPdfGenerating(false)
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

//       // Helper function to add section header with full-width background
//       const addSectionHeader = (text, fontSize = 16) => {
//         pdf.setFontSize(fontSize)
//         pdf.setFont("helvetica", "bolditalic")

//         const rectHeight = fontSize * 0.8

//         // Full-width rectangle (inside margins)
//         pdf.setFillColor(240, 240, 240) // Light gray
//         pdf.roundedRect(
//           margin,
//           yPosition - fontSize * 0.6,
//           maxWidth,
//           rectHeight,
//           5,
//           5,
//           "F"
//         )

//         // Add the text inside
//         pdf.setTextColor(0, 0, 0)
//         pdf.text(text, margin + 5, yPosition)

//         // 👇 smaller spacing (was + 5)
//         yPosition += fontSize * 0.8 + 2
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

//       // Add header - Name and Job Title
//       addText(personalData.name || "", 22, true)
//       if (personalData.jobTitle) {
//         addText(personalData.jobTitle, 16, true)
//       }

//       // Add contact information
//       const contactInfo = [
//         personalData.state,
//         personalData.city,
//         personalData.country,
//         personalData.phone,
//         personalData.linkedin,
//         personalData.website
//       ]
//         .filter(Boolean)
//         .join(" | ")

//       if (contactInfo) {
//         addText(contactInfo, 10)
//       }

//       yPosition += 5

//       // Professional Summary
//       if (personalData.summary) {
//         checkPageBreak(40)
//         addSectionHeader("Summary")
//         addText(stripHtml(personalData.summary), 10)
//         yPosition += 8
//       }

//       // Skills
//       if (skills.length > 0) {
//         checkPageBreak(30)
//         addSectionHeader("Skills")

//         const colCount = 3
//         const colWidth = maxWidth / colCount
//         const fontSize = 10
//         pdf.setFontSize(fontSize)
//         pdf.setFont("helvetica", "normal")

//         for (let i = 0; i < skills.length; i += colCount) {
//           const rowSkills = skills.slice(i, i + colCount)

//           rowSkills.forEach((skill, idx) => {
//             const x = margin + idx * colWidth + 2 // +2 for padding
//             pdf.text(skill.skill, x, yPosition)
//           })

//           yPosition += fontSize // move down for next row
//           checkPageBreak(10)
//         }

//         yPosition += 5
//       }

//       if (experiences.length > 0) {
//         checkPageBreak(40)
//         addSectionHeader("Professional Experience")

//         experiences.forEach((experience, index) => {
//           checkPageBreak(35)

//           const experienceHeader = `${experience.companyName || ""}, ${
//             experience.jobTitle || ""
//           }`
//           const dateText = `${formatDate(experience.startDate)} - ${formatDate(
//             experience.endDate
//           )}`

//           // Set font size and bold
//           const fontSize = 12
//           pdf.setFontSize(fontSize)
//           pdf.setFont("helvetica", "bold")

//           // Left side: Company + Job Title
//           pdf.text(experienceHeader, margin, yPosition)

//           // Right side: Dates
//           const textWidth =
//             (pdf.getStringUnitWidth(dateText) * fontSize) /
//             pdf.internal.scaleFactor
//           pdf.text(dateText, pageWidth - margin - textWidth, yPosition)

//           yPosition += fontSize

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
//               pdf.text(`• ${item}`, margin, yPosition)
//               yPosition += 5 // space between list items
//             })
//           }

//           yPosition += 8
//         })
//       }

//       if (qualifications.length > 0) {
//         checkPageBreak(40)
//         addSectionHeader("Education")

//         qualifications.forEach((qualification, index) => {
//           checkPageBreak(25)

//           const degreeText = `${qualification.degreeType || ""} in ${
//             qualification.major || ""
//           }`
//           const dateText = `${formatDate(
//             qualification.startDate
//           )} - ${formatDate(qualification.endDate)}`

//           // Bold, same line, justify between
//           pdf.setFontSize(12)
//           pdf.setFont("helvetica", "bold")

//           const degreeWidth =
//             (pdf.getStringUnitWidth(degreeText) * 12) / pdf.internal.scaleFactor
//           const dateWidth =
//             (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor

//           const rightX = pageWidth - margin - dateWidth

//           // Print degree (left-aligned)
//           pdf.text(degreeText, margin, yPosition)

//           // Print dates (right-aligned)
//           pdf.text(dateText, rightX, yPosition)

//           yPosition += 6

//           // Institution
//           if (qualification.institutionName) {
//             pdf.setFont("helvetica", "normal")
//             pdf.setFontSize(10)
//             pdf.text(qualification.institutionName, margin, yPosition)
//             yPosition += 5
//           }

//           // GPA
//           if (qualification.gpa) {
//             pdf.setFont("helvetica", "bold")
//             pdf.setFontSize(10)
//             pdf.text(`GPA: ${qualification.gpa}`, margin, yPosition)
//             yPosition += 5
//           }

//           yPosition += 8
//         })
//       }

//       // Additional Information
//       const hasAdditionalInfo =
//         certifications.length > 0 ||
//         languages.length > 0 ||
//         achievements.length > 0

//       if (hasAdditionalInfo) {
//         checkPageBreak(20)
//         addSectionHeader("Additional Information")

//         // Certifications
//         if (certifications.length > 0) {
//           const certText = certifications
//             .map((cert) => cert.certificationTitle)
//             .filter(Boolean)
//             .join(", ")
//           addText(`Certifications: ${certText}`, 10, true)
//           yPosition += 2
//         }

//         // Languages
//         if (languages.length > 0) {
//           const languagesText = languages
//             .map((lang) => lang.language)
//             .filter(Boolean)
//             .join(", ")
//           addText(`Languages: ${languagesText}`, 10, true)
//           yPosition += 2
//         }

//         // Achievements
//         if (achievements.length > 0) {
//           const achievementsText = achievements
//             .map((achievement) => achievement.awardTitle)
//             .filter(Boolean)
//             .join(", ")
//           addText(`Achievements: ${achievementsText}`, 10, true)
//         }
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
//           /* Mobile-first styles */
//           #resume-content {
//             width: 80mm !important;
//             margin: auto;
//             font-family: Arial, sans-serif;
//             padding: 15px;
//             box-sizing: border-box;
//             background-color: white;
//             color: black;
//           }

//                    /* Make resume-content 200mm on large screens */
//     @media screen and (min-width: 768px) {
//       #resume-content {
//         width: 250mm !important;
//       }
//     }

//           /* PDF generation mode */
//           #resume-content.pdf-mode {
//             width: 210mm !important;
//             padding: 40px;
//           }

//           /* Mobile text sizes */
//           .resume-name {
//             font-size: 20px;
//           }
//           .resume-job-title {
//             font-size: 16px;
//           }
//           .contact-info {
//             font-size: 10px;
//             white-space: normal;
//             word-wrap: break-word;
//           }
//           .section-heading {
//             font-size: 16px;
//             padding: 8px 16px;
//             margin-bottom: 12px;
//           }
//           .content-text {
//             font-size: 12px;
//           }

//           /* PDF mode text sizes */
//           .pdf-mode .resume-name {
//             font-size: 32px;
//           }
//           .pdf-mode .resume-job-title {
//             font-size: 24px;
//           }
//           .pdf-mode .contact-info {
//             font-size: 14px;
//           }
//           .pdf-mode .section-heading {
//             font-size: 20px;
//             padding: 8px 16px;
//             margin-bottom: 20px;
//           }
//           .pdf-mode .content-text {
//             font-size: 16px;
//           }

//           /* Skills grid for mobile */
//           .skills-grid {
//             display: grid;
//             grid-template-columns: repeat(2, 1fr);
//             gap: 8px;
//             padding-left: 12px;
//           }

//           /* Skills grid for PDF */
//           .pdf-mode .skills-grid {
//             grid-template-columns: repeat(3, 1fr);
//             gap: 16px;
//             padding-left: 20px;
//           }

//           /* Responsive flex containers */
//           .flex-container {
//             display: flex;
//             flex-direction: column;
//           }

//           .pdf-mode .flex-container {
//             flex-direction: row;
//             justify-content: space-between;
//           }

//           @media (max-width: 80mm) {
//             .contact-info {
//               flex-direction: column;
//               gap: 4px;
//             }
//           }
//         `}
//           </style>
//           <div className="h-auto   overflow-auto">
//             <div
//               id="resume-content"
//               className="w-full bg-white text-black"
//               style={{
//                 width: "200mm",
//                 margin: "auto",
//                 fontFamily: "Arial, sans-serif",
//                 padding: "20px",
//                 boxSizing: "border-box"
//               }}>
//               <style>
//                 {`
//       @media (min-width: 768px) {
//         #resume-content {
//           padding: 40px !important;
//         }
//       }
//     `}
//               </style>
//               <p className="text-left text-2xl md:text-4xl font-bold">
//                 {personalData.name}
//               </p>
//               <p className="text-left text-lg md:text-2xl font-bold">
//                 {personalData.jobTitle}
//               </p>

//               <div className="text-left text-[10px] md:text-sm flex pt-1 space-x-1">
//                 <p>
//                   {personalData.state}, {personalData.city},{" "}
//                   {personalData.country} | {personalData.phone} |{" "}
//                   {personalData.linkedin} | {personalData.website}
//                 </p>
//               </div>

//               {/* Professional Summary */}
//               <div className="mt-5">
//                 <p className=" md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
//                   Summary
//                 </p>
//                 {/* <p className="text-sm md:text-normal text-justify">
//                   {personalData.summary}
//                 </p> */}

//                 <div
//                   className="text-sm md:text-base text-justify space-y-2
//                     [&_ul]:list-disc [&_ul]:pl-5
//                     [&_ol]:list-decimal [&_ol]:pl-5"
//                   dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
//                 />
//               </div>

//               {skills.length > 0 && (
//                 <div className="my-5">
//                   <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
//                     Skills
//                   </p>
//                   <div className="flex flex-wrap ml-5 gap-y-2">
//                     {skills.map((skill, index) => (
//                       <p
//                         key={index}
//                         className="w-1/3 text-left text-xs md:text-base break-words">
//                         {skill.skill}
//                       </p>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Professional Experience */}
//               {sanitizedExperiences.length > 0 && (
//                 <div className="my-5">
//                   <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
//                     Professional Experience
//                   </p>
//                   {sanitizedExperiences.map((experience, index) => (
//                     <div key={index} className="mb-4 space-y-1">
//                       <div className="w-full flex text-[10px] md:text-normal font-semibold items-center">
//                         <p className="flex-grow ">
//                           {experience.companyName}, {experience.jobTitle}
//                         </p>
//                         <p className="flex-grow text-left text-[8px] md:text-normal">
//                           {formatDate(experience.startDate)} -{" "}
//                           {formatDate(experience.endDate)}
//                         </p>
//                       </div>
//                       <div
//                         className="text-[10px] md:text-normal text-justify space-y-2
//           [&_ul]:list-disc [&_ul]:pl-5
//           [&_ol]:list-decimal [&_ol]:pl-5"
//                         dangerouslySetInnerHTML={{
//                           __html: experience.sanitizedDescription
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* {experiences.length > 0 && (
//                 <div className="my-5">
//                   <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
//                     Professional Experience
//                   </p>
//                   {experiences.map((experience, index) => (
//                     <div key={index} className="mb-4 space-y-1">
//                       <div className="w-full flex text-[10px] md:text-normal font-semibold items-center">
//                         <p className="flex-grow ">
//                           {experience.companyName}, {experience.jobTitle}
//                         </p>
//                         <p className="flex-grow text-left text-[8px] md:text-normal">
//                           {formatDate(experience.startDate)} -{" "}
//                           {formatDate(experience.endDate)}
//                         </p>
//                       </div>
//                       <div className="text-[10px] md:text-normal text-justify">
//                         <p>{experience.description}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )} */}

//               {/* Education */}
//               {qualifications.length > 0 && (
//                 <div className="my-5">
//                   <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
//                     Education
//                   </p>
//                   <div>
//                     {qualifications.map((qualification, index) => (
//                       <div
//                         key={index}
//                         className="mb-4 space-y-1 text-[10px] md:text-normal">
//                         <div className="w-full flex font-semibold items-center">
//                           <p className="flex-grow">
//                             {qualification.degreeType} in {qualification.major}
//                           </p>
//                           <p className="text-[8px] md:text-normal flex-grow text-left">
//                             {formatDate(qualification.startDate)} -{" "}
//                             {formatDate(qualification.endDate)}
//                           </p>
//                         </div>
//                         <div>
//                           <p>{qualification.institutionName}</p>
//                         </div>
//                         <div className="flex">
//                           <p className="font-bold pr-2">GPA: </p>
//                           <p>{qualification.gpa}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Additional Information */}
//               {(certifications.length > 0 ||
//                 languages.length > 0 ||
//                 achievements.length > 0) && (
//                 <div className="my-5">
//                   <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
//                     Additional Information
//                   </p>
//                   <div className="text-[10px] md:text-normal items-center">
//                     {/* Certifications */}
//                     {certifications.length > 0 && (
//                       <div className="flex mb-1">
//                         <p className="font-bold pr-1">Certifications: </p>
//                         <p>
//                           {certifications
//                             .map(
//                               (certification) =>
//                                 `${certification.certificationTitle}`
//                             )
//                             .join(", ")}
//                         </p>
//                       </div>
//                     )}

//                     {/* Languages */}
//                     {languages.length > 0 && (
//                       <div className="flex pt-1 mb-1">
//                         <p className="font-bold pr-1">Languages: </p>
//                         <p>
//                           {languages
//                             .map((language) => `${language.language}`)
//                             .join(", ")}
//                         </p>
//                       </div>
//                     )}

//                     {/* Achievements */}
//                     {achievements.length > 0 && (
//                       <div className="flex pt-1">
//                         <p className="font-bold pr-1">Achievements: </p>
//                         <p>
//                           {achievements
//                             .map((achievement) => `${achievement.awardTitle}`)
//                             .join(", ")}
//                         </p>
//                       </div>
//                     )}
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

// export default ModernProfessional

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

const formatDate = (dateString) => {
  if (!dateString) return "Present" // If date is null, undefined, or empty, return "Present"
  const date = new Date(dateString)
  // Check if date is invalid
  if (isNaN(date.getTime())) return "Present"
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

const ModernProfessional = ({
  personalData,
  skills,
  achievements,
  certifications,
  experiences,
  languages,
  qualifications
}) => {
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

      // Helper function to add section header with full-width background
      const addSectionHeader = (text, fontSize = 16) => {
        pdf.setFontSize(fontSize)
        pdf.setFont("helvetica", "bolditalic")

        const rectHeight = fontSize * 0.8

        // Full-width rectangle (inside margins)
        pdf.setFillColor(240, 240, 240) // Light gray
        pdf.roundedRect(
          margin,
          yPosition - fontSize * 0.6,
          maxWidth,
          rectHeight,
          5,
          5,
          "F"
        )

        // Add the text inside
        pdf.setTextColor(0, 0, 0)
        pdf.text(text, margin + 5, yPosition)

        // 👇 smaller spacing (was + 5)
        yPosition += fontSize * 0.8 + 2
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

      // Add header - Name and Job Title
      addText(personalData.name || "", 24, true)
      if (personalData.jobTitle) {
        addText(personalData.jobTitle, 16, true)
      }

      // Add contact information
      const contactInfo = [
        personalData.state,
        personalData.city,
        personalData.country,
        personalData.phone,
        personalData.linkedin,
        personalData.website
      ]
        .filter(Boolean)
        .join(" | ")

      if (contactInfo) {
        addText(contactInfo, 10)
      }

      yPosition += 5

      // Professional Summary
      if (personalData.summary) {
        checkPageBreak(40)
        addSectionHeader("Summary")
        addText(stripHtml(personalData.summary), 10)
        yPosition += 8
      }

      // Skills
      if (skills.length > 0) {
        checkPageBreak(30)
        addSectionHeader("Skills")

        const colCount = 3
        const colWidth = maxWidth / colCount
        const fontSize = 10
        pdf.setFontSize(fontSize)
        pdf.setFont("helvetica", "normal")

        for (let i = 0; i < skills.length; i += colCount) {
          const rowSkills = skills.slice(i, i + colCount)

          rowSkills.forEach((skill, idx) => {
            const x = margin + idx * colWidth + 2 // +2 for padding
            pdf.text(skill.skill, x, yPosition)
          })

          yPosition += fontSize // move down for next row
          checkPageBreak(10)
        }

        yPosition += 5
      }

      if (experiences.length > 0) {
        checkPageBreak(40)
        addSectionHeader("Professional Experience")

        experiences.forEach((experience, index) => {
          checkPageBreak(35)

          const experienceHeader = `${experience.companyName || ""}, ${
            experience.jobTitle || ""
          }`
          const dateText = `${formatDate(experience.startDate)} - ${formatDate(
            experience.endDate
          )}`

          // Set font size and bold
          const fontSize = 12
          pdf.setFontSize(fontSize)
          pdf.setFont("helvetica", "bold")

          // Left side: Company + Job Title
          pdf.text(experienceHeader, margin, yPosition)

          // Right side: Dates
          const textWidth =
            (pdf.getStringUnitWidth(dateText) * fontSize) /
            pdf.internal.scaleFactor
          pdf.text(dateText, pageWidth - margin - textWidth, yPosition)

          yPosition += fontSize

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
              pdf.text(`• ${item}`, margin, yPosition)
              yPosition += 5 // space between list items
            })
          }

          yPosition += 8
        })
      }

      if (qualifications.length > 0) {
        checkPageBreak(40)
        addSectionHeader("Education")

        qualifications.forEach((qualification, index) => {
          checkPageBreak(25)

          const degreeText = `${qualification.degreeType || ""} in ${
            qualification.major || ""
          }`
          const dateText = `${formatDate(
            qualification.startDate
          )} - ${formatDate(qualification.endDate)}`

          // Bold, same line, justify between
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")

          const degreeWidth =
            (pdf.getStringUnitWidth(degreeText) * 12) / pdf.internal.scaleFactor
          const dateWidth =
            (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor

          const rightX = pageWidth - margin - dateWidth

          // Print degree (left-aligned)
          pdf.text(degreeText, margin, yPosition)

          // Print dates (right-aligned)
          pdf.text(dateText, rightX, yPosition)

          yPosition += 6

          // Institution
          if (qualification.institutionName) {
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(10)
            pdf.text(qualification.institutionName, margin, yPosition)
            yPosition += 5
          }

          // GPA
          if (qualification.gpa) {
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(10)
            pdf.text(`GPA: ${qualification.gpa}`, margin, yPosition)
            yPosition += 5
          }

          yPosition += 8
        })
      }

      // Additional Information
      const hasAdditionalInfo =
        certifications.length > 0 ||
        languages.length > 0 ||
        achievements.length > 0

      if (hasAdditionalInfo) {
        checkPageBreak(20)
        addSectionHeader("Additional Information")

        // Certifications
        if (certifications.length > 0) {
          const certText = certifications
            .map((cert) => cert.certificationTitle)
            .filter(Boolean)
            .join(", ")
          addText(`Certifications: ${certText}`, 10, true)
          yPosition += 2
        }

        // Languages
        if (languages.length > 0) {
          const languagesText = languages
            .map((lang) => lang.language)
            .filter(Boolean)
            .join(", ")
          addText(`Languages: ${languagesText}`, 10, true)
          yPosition += 2
        }

        // Achievements
        if (achievements.length > 0) {
          const achievementsText = achievements
            .map((achievement) => achievement.awardTitle)
            .filter(Boolean)
            .join(", ")
          addText(`Achievements: ${achievementsText}`, 10, true)
        }
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

      // Helper function to convert HTML to text while preserving lists
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
          li.style.marginBottom = "4pt"
        })

        return temp.innerHTML
      }

      // Build Word document content
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
        font-family: Arial, sans-serif; 
        font-size: 12pt;
        line-height: 1.2; 
        margin: 0;
        color: #000000;
      }
      .header { 
        text-align: left; 
        margin-bottom: 20pt;
        padding-bottom: 10pt;
      }
      .name { 
        font-size: 22pt; 
        font-weight: bold; 
        margin-bottom: 8pt;
      }
      .job-title { 
        font-size: 16pt; 
        font-weight: bold;
        margin-bottom: 10pt;
      }
      .contact-info {
        font-size: 10pt;
        margin-bottom: 10pt;
      }
      .section-title { 
        font-size: 16pt; 
        font-weight: bold; 
        font-style: italic; 
        margin-top: 18pt; 
        margin-bottom: 10pt; 
        background-color: #f0f0f0; 
        padding: 12pt 20pt;
        border-radius: 0 20pt 20pt 0; 
      }
      .entry { 
        margin-bottom: 15pt;
        page-break-inside: avoid;
      }
      .entry-header {
        width: 100%;
        margin-bottom: 3pt;
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
      }

      .additional-info {
        font-size: 10pt;
        margin-bottom: 8pt;
      }
      .additional-label {
        font-weight: bold;
        display: inline;
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
    <div class="contact-info">
      ${[
        personalData.state,
        personalData.city,
        personalData.country,
        personalData.phone,
        personalData.linkedin,
        personalData.website
      ]
        .filter(Boolean)
        .join(" | ")}
    </div>
  </div>
`

      // Professional Summary
      if (personalData.summary) {
        htmlContent += `
    <div class="section-title">Summary</div>
    <div class="description">
      ${convertHtmlToText(personalData.summary)}
    </div>
  `
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
    `
      }

      // Professional Experience
      if (experiences.length > 0) {
        htmlContent += `<div class="section-title">Professional Experience</div>`
        experiences.forEach((experience) => {
          htmlContent += `
      <div class="entry">
        <table class="entry-header" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-weight: bold; font-size: 12pt; text-align: left;">
              ${experience.companyName || ""}, ${experience.jobTitle || ""}
            </td>
            <td style="font-weight: bold; font-size: 12pt; text-align: right;">
              ${formatDate(experience.startDate)} - ${formatDate(
            experience.endDate
          )}
            </td>
          </tr>
        </table>
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

      // Education Section
      if (qualifications.length > 0) {
        htmlContent += `<div class="section-title">Education</div>`
        qualifications.forEach((qualification) => {
          htmlContent += `
      <div class="entry">
        <table class="entry-header" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-weight: bold; font-size: 12pt; text-align: left;">
              ${qualification.degreeType || ""} in ${qualification.major || ""}
            </td>
            <td style="font-weight: bold; font-size: 12pt; text-align: right;">
              ${formatDate(qualification.startDate)} - ${formatDate(
            qualification.endDate
          )}
            </td>
          </tr>
        </table>
        ${
          qualification.institutionName
            ? `<div class="entry-subtitle">${qualification.institutionName}</div>`
            : ""
        }
        ${
          qualification.gpa
            ? `<div style="font-weight: bold;">GPA: ${qualification.gpa}</div>`
            : ""
        }
      </div>
    `
        })
      }

      // Additional Information
      const hasAdditionalInfo =
        certifications.length > 0 ||
        languages.length > 0 ||
        achievements.length > 0

      if (hasAdditionalInfo) {
        htmlContent += `<div class="section-title">Additional Information</div>`

        // Certifications
        if (certifications.length > 0) {
          const certText = certifications
            .map((cert) => cert.certificationTitle)
            .filter(Boolean)
            .join(", ")
          htmlContent += `
      <div class="additional-info">
        <span class="additional-label">Certifications:</span> ${certText}
      </div>
    `
        }

        // Languages
        if (languages.length > 0) {
          const languagesText = languages
            .map((lang) => lang.language)
            .filter(Boolean)
            .join(", ")
          htmlContent += `
      <div class="additional-info">
        <span class="additional-label">Languages:</span> ${languagesText}
      </div>
    `
        }

        // Achievements
        if (achievements.length > 0) {
          const achievementsText = achievements
            .map((achievement) => achievement.awardTitle)
            .filter(Boolean)
            .join(", ")
          htmlContent += `
      <div class="additional-info">
        <span class="additional-label">Achievements:</span> ${achievementsText}
      </div>
    `
        }
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
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
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
            padding: 15px;
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
            width: 210mm !important;
            padding: 40px;
          }

          /* Mobile text sizes */
          .resume-name {
            font-size: 20px;
          }
          .resume-job-title {
            font-size: 16px;
          }
          .contact-info {
            font-size: 10px;
            white-space: normal;
            word-wrap: break-word;
          }
          .section-heading {
            font-size: 16px;
            padding: 8px 16px;
            margin-bottom: 12px;
          }
          .content-text {
            font-size: 12px;
          }

          /* PDF mode text sizes */
          .pdf-mode .resume-name {
            font-size: 32px;
          }
          .pdf-mode .resume-job-title {
            font-size: 24px;
          }
          .pdf-mode .contact-info {
            font-size: 14px;
          }
          .pdf-mode .section-heading {
            font-size: 20px;
            padding: 8px 16px;
            margin-bottom: 20px;
          }
          .pdf-mode .content-text {
            font-size: 16px;
          }

          /* Skills grid for mobile */
          .skills-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            padding-left: 12px;
          }

          /* Skills grid for PDF */
          .pdf-mode .skills-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            padding-left: 20px;
          }

          /* Responsive flex containers */
          .flex-container {
            display: flex;
            flex-direction: column;
          }

          .pdf-mode .flex-container {
            flex-direction: row;
            justify-content: space-between;
          }

          @media (max-width: 80mm) {
            .contact-info {
              flex-direction: column;
              gap: 4px;
            }
          }
        `}
          </style>
          <div className="h-auto   overflow-auto">
            <div
              id="resume-content"
              className="w-full bg-white text-black"
              style={{
                width: "200mm",
                margin: "auto",
                fontFamily: "Arial, sans-serif",
                padding: "20px",
                boxSizing: "border-box"
              }}>
              <style>
                {`
      @media (min-width: 768px) {
        #resume-content {
          padding: 40px !important;
        }
      }
    `}
              </style>
              <p className="text-left text-2xl md:text-4xl font-bold">
                {personalData.name}
              </p>
              <p className="text-left text-lg md:text-2xl font-bold">
                {personalData.jobTitle}
              </p>

              <div className="text-left text-[10px] md:text-sm flex pt-1 space-x-1">
                <p>
                  {personalData.state}, {personalData.city},{" "}
                  {personalData.country} | {personalData.phone} |{" "}
                  {personalData.linkedin} | {personalData.website}
                </p>
              </div>

              {/* Professional Summary */}
              <div className="mt-5">
                <p className=" md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
                  Summary
                </p>
                <div
                  className="text-sm md:text-base text-justify space-y-2
                    [&_ul]:list-disc [&_ul]:pl-5
                    [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
                />
              </div>

              {skills.length > 0 && (
                <div className="my-5">
                  <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
                    Skills
                  </p>
                  <div className="flex flex-wrap ml-5 gap-y-1">
                    {skills.map((skill, index) => (
                      <p
                        key={index}
                        className="w-1/3 text-left text-xs md:text-base break-words">
                        {skill.skill}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Experience */}
              {sanitizedExperiences.length > 0 && (
                <div className="my-5">
                  <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
                    Professional Experience
                  </p>
                  {sanitizedExperiences.map((experience, index) => (
                    <div key={index} className="mb-4 space-y-1">
                      <div className="w-full flex text-[10px] md:text-normal font-semibold items-center">
                        <p className="flex-grow ">
                          {experience.companyName}, {experience.jobTitle}
                        </p>
                        <p className="flex-grow text-left text-[8px] md:text-normal">
                          {formatDate(experience.startDate)} -{" "}
                          {formatDate(experience.endDate)}
                        </p>
                      </div>
                      <div
                        className="text-[10px] md:text-normal text-justify space-y-2
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

              {/* Education */}
              {qualifications.length > 0 && (
                <div className="my-5">
                  <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
                    Education
                  </p>
                  <div>
                    {qualifications.map((qualification, index) => (
                      <div
                        key={index}
                        className="mb-4 space-y-1 text-[10px] md:text-normal">
                        <div className="w-full flex font-semibold items-center">
                          <p className="flex-grow">
                            {qualification.degreeType} in {qualification.major}
                          </p>
                          <p className="text-[8px] md:text-normal flex-grow text-left">
                            {formatDate(qualification.startDate)} -{" "}
                            {formatDate(qualification.endDate)}
                          </p>
                        </div>
                        <div>
                          <p>{qualification.institutionName}</p>
                        </div>
                        <div className="flex">
                          <p className="font-bold pr-2">GPA: </p>
                          <p>{qualification.gpa}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(certifications.length > 0 ||
                languages.length > 0 ||
                achievements.length > 0) && (
                <div className="my-5">
                  <p className="md:text-xl font-bold py-2 px-4 mb-5 rounded-full italic border bg-lightestGrey">
                    Additional Information
                  </p>
                  <div className="text-[10px] md:text-normal items-center">
                    {/* Certifications */}
                    {certifications.length > 0 && (
                      <div className="flex mb-1">
                        <p className="font-bold pr-1">Certifications: </p>
                        <p>
                          {certifications
                            .map(
                              (certification) =>
                                `${certification.certificationTitle}`
                            )
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Languages */}
                    {languages.length > 0 && (
                      <div className="flex pt-1 mb-1">
                        <p className="font-bold pr-1">Languages: </p>
                        <p>
                          {languages
                            .map((language) => `${language.language}`)
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Achievements */}
                    {achievements.length > 0 && (
                      <div className="flex pt-1">
                        <p className="font-bold pr-1">Achievements: </p>
                        <p>
                          {achievements
                            .map((achievement) => `${achievement.awardTitle}`)
                            .join(", ")}
                        </p>
                      </div>
                    )}
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

export default ModernProfessional
