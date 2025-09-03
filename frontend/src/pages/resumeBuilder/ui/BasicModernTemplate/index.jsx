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

// // Function to format date (same as before)
// const formatDate = (dateString) => {
//   if (!dateString) return "Present"
//   const date = new Date(dateString)
//   if (isNaN(date.getTime())) return "Present"
//   return date.toLocaleString("en-US", { month: "short", year: "numeric" })
// }

// const BasicModernTemplate = ({
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
//         isCenter = false
//       ) => {
//         pdf.setFontSize(fontSize)
//         pdf.setFont("helvetica", isBold ? "bold" : "normal")

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

//       // Add contact information
//       const contactInfo = [
//         personalData.address,
//         personalData.city,
//         personalData.country,
//         personalData.phone
//       ]
//         .filter(Boolean)
//         .join(", ")

//       if (contactInfo) {
//         addText(contactInfo, 10, false, true)
//       }

//       const webInfo = [personalData.linkedin, personalData.website]
//         .filter(Boolean)
//         .join(" | ")
//       if (webInfo) {
//         addText(webInfo, 10, false, true)
//       }

//       addLine()

//       // Professional Summary
//       if (personalData.summary) {
//         checkPageBreak(30)
//         addText("Professional Summary", 14, true)
//         addText(stripHtml(personalData.summary), 10)
//         yPosition += 5
//       }

//       // Education
//       if (qualifications.length > 0) {
//         checkPageBreak(30)
//         addLine()
//         addText("Education", 14, true)

//         qualifications.forEach((qualification, index) => {
//           checkPageBreak(25)

//           // Institution on left, dates on right
//           const institutionText = qualification.institutionName || ""
//           const dateText = `${formatDate(
//             qualification.startDate
//           )} - ${formatDate(qualification.endDate)}`

//           pdf.setFontSize(12)
//           pdf.setFont("Arial", "bold")

//           // Institution left
//           pdf.text(institutionText, margin, yPosition)

//           // Dates right-aligned
//           const dateWidth =
//             (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
//           pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)

//           yPosition += 8

//           // Degree info under institution
//           const degreeText = `${qualification.degreeType || ""} in ${
//             qualification.major || ""
//           }`
//           addText(degreeText, 10, true)

//           if (qualification.gpa) {
//             addText(`GPA: ${qualification.gpa}`, 10)
//           }

//           yPosition += 3
//         })
//       }

//       // Relevant Experience
//       if (experiences.length > 0) {
//         checkPageBreak(30)
//         addLine()
//         addText("Relevant Experience", 14, true)

//         experiences.forEach((experience, index) => {
//           checkPageBreak(30)

//           // Company (left) and dates (right)
//           const companyText = experience.companyName || ""
//           const dateText = `${formatDate(experience.startDate)} - ${formatDate(
//             experience.endDate
//           )}`

//           pdf.setFontSize(12)
//           pdf.setFont("Arial", "bold")

//           // Company left
//           pdf.text(companyText, margin, yPosition)

//           // Dates right
//           const dateWidth =
//             (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
//           pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)

//           yPosition += 8

//           // Job title (italic or bold)
//           if (experience.jobTitle) {
//             pdf.setFont("Arial", "italic")
//             pdf.setFontSize(11)
//             pdf.text(experience.jobTitle, margin, yPosition)
//             yPosition += 6
//           }

//           // Description as bullet list
//           if (experience.description) {
//             pdf.setFont("Arial", "normal")
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

//           yPosition += 5
//         })
//       }

//       // Achievements
//       if (achievements.length > 0) {
//         checkPageBreak(30)
//         addLine()
//         addText("Achievements", 14, true)

//         achievements.forEach((achievement, index) => {
//           checkPageBreak(25)

//           const awardText = achievement.awardTitle || ""
//           const dateText = `${formatDate(achievement.startDate)} - ${formatDate(
//             achievement.endDate
//           )}`

//           pdf.setFontSize(12)
//           pdf.setFont("Arial", "bold")

//           // Award title (left)
//           pdf.text(awardText, margin, yPosition)

//           // Dates (right)
//           const dateWidth =
//             (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
//           pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)

//           yPosition += 8

//           // Issuer (italic, below award title)
//           if (achievement.issuer) {
//             pdf.setFont("Arial", "italic")
//             pdf.setFontSize(11)
//             pdf.text(achievement.issuer, margin, yPosition)
//             yPosition += 6
//           }

//           // Description as bullet list
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

//           yPosition += 5
//         })
//       }

//       // Add a final line before the bottom sections
//       addLine()

//       // Certifications
//       if (certifications.length > 0) {
//         checkPageBreak(15)
//         const certText = certifications
//           .map((cert) => cert.certificationTitle)
//           .filter(Boolean)
//           .join(", ")

//         pdf.setFontSize(10)

//         // Bold label
//         pdf.setFont("helvetica", "bold")
//         pdf.text("Certifications: ", margin, yPosition)

//         // Measure label width to align wrapped text
//         const labelWidth =
//           (pdf.getStringUnitWidth("Certifications: ") * 10) /
//           pdf.internal.scaleFactor

//         // Wrap the certifications list inside maxWidth - labelWidth
//         pdf.setFont("helvetica", "normal")
//         const wrappedCerts = pdf.splitTextToSize(
//           certText,
//           maxWidth - labelWidth
//         )

//         // Print first line after label
//         pdf.text(wrappedCerts[0], margin + labelWidth + 1, yPosition)

//         // Print remaining lines (indented under the list, not under label)
//         for (let i = 1; i < wrappedCerts.length; i++) {
//           yPosition += 5
//           pdf.text(wrappedCerts[i], margin, yPosition)
//         }

//         yPosition += 8
//       }

//       // Skills
//       if (skills.length > 0) {
//         checkPageBreak(15)
//         const skillsText = skills
//           .map((skill) => skill.skill)
//           .filter(Boolean)
//           .join(", ")

//         pdf.setFontSize(10)

//         // Bold label
//         pdf.setFont("helvetica", "bold")
//         pdf.text("Skills: ", margin, yPosition)

//         // Measure label width to align wrapped text
//         const labelWidth =
//           (pdf.getStringUnitWidth("Skills: ") * 10) / pdf.internal.scaleFactor

//         // Wrap the skills list inside maxWidth - labelWidth
//         pdf.setFont("helvetica", "normal")
//         const wrappedSkills = pdf.splitTextToSize(
//           skillsText,
//           maxWidth - labelWidth
//         )

//         // Print first line after label
//         pdf.text(wrappedSkills[0], margin + labelWidth + 1, yPosition)

//         // Print remaining lines (indented under the list, not under label)
//         for (let i = 1; i < wrappedSkills.length; i++) {
//           yPosition += 5
//           pdf.text(wrappedSkills[i], margin, yPosition)
//         }

//         yPosition += 8
//       }

//       // Languages
//       if (languages.length > 0) {
//         checkPageBreak(15)
//         const languagesText = languages
//           .map((lang) => lang.language)
//           .filter(Boolean)
//           .join(", ")

//         pdf.setFontSize(10)

//         pdf.setFont("helvetica", "bold")
//         pdf.text("Languages: ", margin, yPosition)

//         const labelWidth =
//           (pdf.getStringUnitWidth("Languages: ") * 10) /
//           pdf.internal.scaleFactor

//         pdf.setFont("helvetica", "normal")
//         const wrappedLangs = pdf.splitTextToSize(
//           languagesText,
//           maxWidth - labelWidth
//         )

//         pdf.text(wrappedLangs[0], margin + labelWidth + 1, yPosition)

//         for (let i = 1; i < wrappedLangs.length; i++) {
//           yPosition += 5
//           pdf.text(wrappedLangs[i], margin, yPosition)
//         }

//         yPosition += 8
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
//             font-family: Arial, sans-serif;
//             padding: 10px;
//             box-sizing: border-box;
//             background-color: white;
//             color: black;
//           }

//            /* Make resume-content 200mm on large screens */
//     @media screen and (min-width: 768px) {
//       #resume-content {
//         width: 250mm !important;
//       }
//     }

//           /* PDF generation mode - A4 size */
//           #resume-content.pdf-mode {
//             width: 200mm !important;
//             padding: 20px;
//           }

//           /* Responsive text sizes */
//           .mobile-text-xs {
//             font-size: 8px;
//           }
//           .mobile-text-sm {
//             font-size: 10px;
//           }
//           .mobile-text-base {
//             font-size: 12px;
//           }
//           .mobile-text-lg {
//             font-size: 14px;
//           }
//           .mobile-text-xl {
//             font-size: 16px;
//           }

//           /* PDF mode text sizes */
//           .pdf-mode .mobile-text-xs {
//             font-size: 12px;
//           }
//           .pdf-mode .mobile-text-sm {
//             font-size: 14px;
//           }
//           .pdf-mode .mobile-text-base {
//             font-size: 16px;
//           }
//           .pdf-mode .mobile-text-lg {
//             font-size: 18px;
//           }
//           .pdf-mode .mobile-text-xl {
//             font-size: 24px;
//           }
//         `}
//           </style>
//           <div className="h-auto  overflow-auto ">
//             <div
//               id="resume-content"
//               className="w-full bg-primary text-black"
//               style={{
//                 width: "200mm",
//                 margin: "auto",
//                 fontFamily: "Arial, sans-serif",
//                 padding: "20px",
//                 boxSizing: "border-box"
//               }}>
//               <div className="text-center w-full pb-1">
//                 <p className=" text-2xl whitespace-nowrap md:text-4xl font-bold">
//                   {personalData.name}
//                 </p>
//               </div>
//               <div className="text-center text-[8px] md:text-xs flex justify-center pt-1 space-x-1">
//                 <p>{personalData.address},</p>
//                 <p>{personalData.city},</p>
//                 <p>{personalData.country} |</p>
//                 <p>{personalData.phone}</p>
//               </div>
//               <div className="text-center text-[10px] md:text-base flex justify-center space-x-1">
//                 <p>{personalData.linkedin} </p>
//                 <p>{personalData.website}</p>
//               </div>

//               <hr className="border-t-2 border-black my-6" />

//               {/* Professional Summary */}
//               <div>
//                 <p className="md:text-xl font-bold pb-3">
//                   Professional Summary
//                 </p>
//                 {/* <p className="text-sm md:text-base text-justify">
//                   {personalData.summary}
//                 </p> */}
//                 <div
//                   className="text-sm md:text-base text-justify space-y-2
//                     [&_ul]:list-disc [&_ul]:pl-5
//                     [&_ol]:list-decimal [&_ol]:pl-5"
//                   dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
//                 />
//               </div>

//               {/* Education */}
//               {qualifications.length > 0 && (
//                 <div>
//                   <hr className="border-t-2 border-black my-6" />
//                   <p className="md:text-xl font-bold pb-4">Education</p>
//                   <div>
//                     {qualifications.map((qualification, index) => (
//                       <div key={index} className="mb-4 space-y-1">
//                         <div className="w-full text-sm md:text-base flex justify-between">
//                           <p>{qualification.institutionName}</p>
//                           <p>
//                             {formatDate(qualification.startDate)} -{" "}
//                             {formatDate(qualification.endDate)}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm md:text-base font-bold">
//                             {qualification.degreeType} in {qualification.major}
//                           </p>
//                         </div>
//                         <div className="flex text-sm md:text-base">
//                           <p className="font-bold pr-2">GPA: </p>
//                           <p>{qualification.gpa}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Relevant Experience */}
//               {experiences.length > 0 && (
//                 <div>
//                   <hr className="border-t-2 border-black my-6" />
//                   <p className="md:text-xl font-bold pb-4">
//                     Relevant Experience
//                   </p>
//                   {/* {experiences.map((experience, index) => (
//                     <div
//                       key={index}
//                       className="mb-5 space-y-1 text-sm md:text-base">
//                       <div className="w-full flex justify-between">
//                         <p>{experience.companyName}</p>
//                         <p>
//                           {formatDate(experience.startDate)} -{" "}
//                           {formatDate(experience.endDate)}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="font-bold">{experience.jobTitle}</p>
//                       </div>
//                       <div>
//                         <p>{experience.description}</p>
//                       </div>
//                     </div>
//                   ))} */}
//                   {sanitizedExperiences.map((experience, index) => (
//                     <div
//                       key={index}
//                       className="mb-5 space-y-1 text-sm md:text-base">
//                       <div className="w-full flex justify-between">
//                         <p>{experience.companyName}</p>
//                         <p>
//                           {formatDate(experience.startDate)} -{" "}
//                           {formatDate(experience.endDate)}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="font-bold">{experience.jobTitle}</p>
//                       </div>
//                       <div
//                         className="text-sm md:text-base text-justify space-y-2
//         [&_ul]:list-disc [&_ul]:pl-5
//         [&_ol]:list-decimal [&_ol]:pl-5"
//                         dangerouslySetInnerHTML={{
//                           __html: experience.sanitizedDescription
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Achievements */}
//               {achievements.length > 0 && (
//                 <div>
//                   <hr className="border-t-2 border-black my-6" />
//                   <p className="md:text-xl font-bold pb-4">Achievements</p>
//                   {sanitizedAchievements.map((achievement, index) => (
//                     <div
//                       key={index}
//                       className="mb-5 space-y-1 text-sm md:text-base">
//                       <div className="w-full flex justify-between">
//                         <p>{achievement.awardTitle}</p>
//                         <p>
//                           {formatDate(achievement.startDate)} -{" "}
//                           {formatDate(achievement.endDate)}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="font-bold">{achievement.issuer}</p>
//                       </div>
//                       <div
//                         className="text-sm md:text-base text-justify space-y-2
//             [&_ul]:list-disc [&_ul]:pl-5
//             [&_ol]:list-decimal [&_ol]:pl-5"
//                         dangerouslySetInnerHTML={{
//                           __html: achievement.sanitizedDescription
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {/* {achievements.length > 0 && (
//                 <div>
//                   <hr className="border-t-2 border-black my-6" />
//                   <p className="md:text-xl font-bold pb-4">Achievements</p>
//                   {achievements.map((achievement, index) => (
//                     <div
//                       key={index}
//                       className="mb-5 space-y-1 text-sm md:text-base">
//                       <div className="w-full flex justify-between">
//                         <p>{achievement.awardTitle}</p>
//                         <p>
//                           {formatDate(achievement.startDate)} -{" "}
//                           {formatDate(achievement.endDate)}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="font-bold">{achievement.issuer}</p>
//                       </div>
//                       <div>
//                         <p>{achievement.description}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )} */}
//               <hr className="border-t-2 border-black my-6" />

//               {/* Certifications */}
//               {certifications.length > 0 && (
//                 <div className="flex text-sm md:text-base">
//                   <p className="font-bold pr-1">Certifications: </p>
//                   <p className="">
//                     {certifications
//                       .map(
//                         (certification) => `${certification.certificationTitle}`
//                       )
//                       .join(", ")}
//                   </p>
//                 </div>
//               )}

//               {/* Skills */}
//               {skills.length > 0 && (
//                 <div className="flex text-sm md:text-base">
//                   <p className="font-bold pr-1">Skills: </p>
//                   <p>{skills.map((skill) => `${skill.skill}`).join(", ")}</p>
//                 </div>
//               )}

//               {/* Languages */}
//               {languages.length > 0 && (
//                 <div className="flex ">
//                   <p className="font-bold pr-1">Languages: </p>
//                   <p>
//                     {languages
//                       .map((language) => `${language.language}`)
//                       .join(", ")}
//                   </p>
//                 </div>
//               )}

//               <hr className="border-t-2 border-black my-6" />
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

// export default BasicModernTemplate

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

// Function to format date (same as before)
const formatDate = (dateString) => {
  if (!dateString) return "Present"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Present"
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

const BasicModernTemplate = ({
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
        isCenter = false
      ) => {
        pdf.setFontSize(fontSize)
        pdf.setFont("helvetica", isBold ? "bold" : "normal")

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

      // Add contact information
      const contactInfo = [
        personalData.address,
        personalData.city,
        personalData.country,
        personalData.phone
      ]
        .filter(Boolean)
        .join(", ")

      if (contactInfo) {
        addText(contactInfo, 10, false, true)
      }

      const webInfo = [personalData.linkedin, personalData.website]
        .filter(Boolean)
        .join(" | ")
      if (webInfo) {
        addText(webInfo, 10, false, true)
      }

      addLine()

      // Professional Summary
      if (personalData.summary) {
        checkPageBreak(30)
        addText("Professional Summary", 14, true)
        addText(stripHtml(personalData.summary), 10)
        yPosition += 5
      }

      // Education
      if (qualifications.length > 0) {
        checkPageBreak(30)
        addLine()
        addText("Education", 14, true)

        qualifications.forEach((qualification, index) => {
          checkPageBreak(25)

          // Institution on left, dates on right
          const institutionText = qualification.institutionName || ""
          const dateText = `${formatDate(
            qualification.startDate
          )} - ${formatDate(qualification.endDate)}`

          pdf.setFontSize(12)
          pdf.setFont("Arial", "bold")

          // Institution left
          pdf.text(institutionText, margin, yPosition)

          // Dates right-aligned
          const dateWidth =
            (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
          pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)

          yPosition += 8

          // Degree info under institution
          const degreeText = `${qualification.degreeType || ""} in ${
            qualification.major || ""
          }`
          addText(degreeText, 10, true)

          if (qualification.gpa) {
            addText(`GPA: ${qualification.gpa}`, 10)
          }

          yPosition += 3
        })
      }

      // Relevant Experience
      if (experiences.length > 0) {
        checkPageBreak(30)
        addLine()
        addText("Relevant Experience", 14, true)

        experiences.forEach((experience, index) => {
          checkPageBreak(30)

          // Company (left) and dates (right)
          const companyText = experience.companyName || ""
          const dateText = `${formatDate(experience.startDate)} - ${formatDate(
            experience.endDate
          )}`

          pdf.setFontSize(12)
          pdf.setFont("Arial", "bold")

          // Company left
          pdf.text(companyText, margin, yPosition)

          // Dates right
          const dateWidth =
            (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
          pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)

          yPosition += 8

          // Job title (italic or bold)
          if (experience.jobTitle) {
            pdf.setFont("Arial", "italic")
            pdf.setFontSize(11)
            pdf.text(experience.jobTitle, margin, yPosition)
            yPosition += 6
          }

          // Description as bullet list
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

          yPosition += 5
        })
      }

      // Achievements
      if (achievements.length > 0) {
        checkPageBreak(30)
        addLine()
        addText("Achievements", 14, true)

        achievements.forEach((achievement, index) => {
          checkPageBreak(25)

          const awardText = achievement.awardTitle || ""
          const dateText = `${formatDate(achievement.startDate)} - ${formatDate(
            achievement.endDate
          )}`

          pdf.setFontSize(12)
          pdf.setFont("Arial", "bold")

          // Award title (left)
          pdf.text(awardText, margin, yPosition)

          // Dates (right)
          const dateWidth =
            (pdf.getStringUnitWidth(dateText) * 12) / pdf.internal.scaleFactor
          pdf.text(dateText, pageWidth - margin - dateWidth, yPosition)

          yPosition += 8

          // Issuer (italic, below award title)
          if (achievement.issuer) {
            pdf.setFont("Arial", "italic")
            pdf.setFontSize(11)
            pdf.text(achievement.issuer, margin, yPosition)
            yPosition += 6
          }

          // Description as bullet list
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

          yPosition += 5
        })
      }

      // Add a final line before the bottom sections
      addLine()

      // Certifications
      if (certifications.length > 0) {
        checkPageBreak(15)
        const certText = certifications
          .map((cert) => cert.certificationTitle)
          .filter(Boolean)
          .join(", ")

        pdf.setFontSize(10)

        // Bold label
        pdf.setFont("helvetica", "bold")
        pdf.text("Certifications: ", margin, yPosition)

        // Measure label width to align wrapped text
        const labelWidth =
          (pdf.getStringUnitWidth("Certifications: ") * 10) /
          pdf.internal.scaleFactor

        // Wrap the certifications list inside maxWidth - labelWidth
        pdf.setFont("helvetica", "normal")
        const wrappedCerts = pdf.splitTextToSize(
          certText,
          maxWidth - labelWidth
        )

        // Print first line after label
        pdf.text(wrappedCerts[0], margin + labelWidth + 1, yPosition)

        // Print remaining lines (indented under the list, not under label)
        for (let i = 1; i < wrappedCerts.length; i++) {
          yPosition += 5
          pdf.text(wrappedCerts[i], margin, yPosition)
        }

        yPosition += 8
      }

      // Skills
      if (skills.length > 0) {
        checkPageBreak(15)
        const skillsText = skills
          .map((skill) => skill.skill)
          .filter(Boolean)
          .join(", ")

        pdf.setFontSize(10)

        // Bold label
        pdf.setFont("helvetica", "bold")
        pdf.text("Skills: ", margin, yPosition)

        // Measure label width to align wrapped text
        const labelWidth =
          (pdf.getStringUnitWidth("Skills: ") * 10) / pdf.internal.scaleFactor

        // Wrap the skills list inside maxWidth - labelWidth
        pdf.setFont("helvetica", "normal")
        const wrappedSkills = pdf.splitTextToSize(
          skillsText,
          maxWidth - labelWidth
        )

        // Print first line after label
        pdf.text(wrappedSkills[0], margin + labelWidth + 1, yPosition)

        // Print remaining lines (indented under the list, not under label)
        for (let i = 1; i < wrappedSkills.length; i++) {
          yPosition += 5
          pdf.text(wrappedSkills[i], margin, yPosition)
        }

        yPosition += 8
      }

      // Languages
      if (languages.length > 0) {
        checkPageBreak(15)
        const languagesText = languages
          .map((lang) => lang.language)
          .filter(Boolean)
          .join(", ")

        pdf.setFontSize(10)

        pdf.setFont("helvetica", "bold")
        pdf.text("Languages: ", margin, yPosition)

        const labelWidth =
          (pdf.getStringUnitWidth("Languages: ") * 10) /
          pdf.internal.scaleFactor

        pdf.setFont("helvetica", "normal")
        const wrappedLangs = pdf.splitTextToSize(
          languagesText,
          maxWidth - labelWidth
        )

        pdf.text(wrappedLangs[0], margin + labelWidth + 1, yPosition)

        for (let i = 1; i < wrappedLangs.length; i++) {
          yPosition += 5
          pdf.text(wrappedLangs[i], margin, yPosition)
        }

        yPosition += 8
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
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
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
          font-family: 'Calibri', 'Arial', sans-serif; 
          font-size: 11pt;
          line-height: 1.15; 
          margin: 0;
          color: #000000;
        }
        .header { 
          text-align: center; 
          margin-bottom: 16pt; 
          border-bottom: 2pt solid #000000;
          padding-bottom: 8pt;
        }
        .name { 
          font-size: 18pt; 
          font-weight: bold; 
          margin-bottom: 6pt;
          text-transform: uppercase;
          letter-spacing: 1pt;
        }
        .contact-info { 
          font-size: 10pt; 
          margin-bottom: 4pt;
          color: #333333;
        }
        .section-title { 
          font-size: 12pt; 
          font-weight: bold; 
          margin-top: 16pt; 
          margin-bottom: 8pt; 
          text-transform: uppercase;
        }
        .entry-header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 4pt;
          align-items: flex-start;
        }
        .entry-title { 
          font-weight: bold; 
          font-size: 11pt;
          margin-bottom: 2pt;
        }
        .entry-subtitle { 
          font-style: italic; 
          font-size: 10pt;
          color: #555555;
          margin-bottom: 4pt;
        }
        .date-range { 
          font-size: 10pt;
          color: #666666;
          white-space: nowrap;
          text-align: right;
        }
        .description { 
          font-size: 11pt;
          margin-bottom: 8pt;
          text-align: justify;
          line-height: 1.2;
        }
        .entry { 
          margin-bottom: 12pt;
          page-break-inside: avoid;
        }
        .skills-section, .cert-section, .lang-section { 
          margin-bottom: 8pt; 
          font-size: 11pt;
        }
        .section-content {
          margin-left: 0pt;
        }
        .gpa {
          font-size: 10pt;
          color: #666666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        .left-col {
          width: 70%;
          vertical-align: top;
        }
        .right-col {
          width: 30%;
          text-align: right;
          vertical-align: top;
        }
     .divider {
  border-bottom: 2pt solid #000000;
  margin: 12pt 0;
  width: 100%;
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
  `

      if (
        personalData.address ||
        personalData.city ||
        personalData.country ||
        personalData.phone
      ) {
        const contactInfo = [
          personalData.address,
          personalData.city,
          personalData.country,
          personalData.phone
        ]
          .filter(Boolean)
          .join(", ")
        htmlContent += `<div class="contact-info">${contactInfo}</div>`
      }

      if (personalData.linkedin || personalData.website) {
        const webInfo = [personalData.linkedin, personalData.website]
          .filter(Boolean)
          .join(" | ")
        htmlContent += `<div class="contact-info">${webInfo}</div>`
      }

      htmlContent += `</div>`

      // Professional Summary
      if (personalData.summary) {
        htmlContent += `
      <div class="section-title">Professional Summary</div>
      <div class="section-content divider ">
        <div class="description ">${convertHtmlToText(
          personalData.summary
        )}</div>
      </div>
<hr style="border: 2pt solid #000000; margin: 12pt 0;" />

      `
      }

      // Education Section
      if (qualifications.length > 0) {
        htmlContent += `<div class="section-title">Education</div><div class="section-content">`
        qualifications.forEach((qualification) => {
          htmlContent += `
        <div class="entry">
          <table>
            <tr>
              <td class="left-col">
                <div class="entry-title">${
                  qualification.institutionName || ""
                }</div>
              </td>
              <td class="right-col">
                <div class="date-range">${formatDate(
                  qualification.startDate
                )} - ${formatDate(qualification.endDate)}</div>
              </td>
            </tr>
          </table>
          <div class="entry-subtitle">${qualification.degreeType || ""} in ${
            qualification.major || ""
          }</div>
          ${
            qualification.gpa
              ? `<div class="gpa">GPA: ${qualification.gpa}</div>`
              : ""
          }
        </div>
      `
        })
        htmlContent += `</div><hr style="border: 2pt solid #000000; margin: 12pt 0;" />
`
      }

      // Experience Section
      if (experiences.length > 0) {
        htmlContent += `<div class="section-title">Relevant Experience</div><div class="section-content">`
        experiences.forEach((experience) => {
          htmlContent += `
        <div class="entry">
          <table>
            <tr>
              <td class="left-col">
                <div class="entry-title">${experience.companyName || ""}</div>
              </td>
              <td class="right-col">
                <div class="date-range">${formatDate(
                  experience.startDate
                )} - ${formatDate(experience.endDate)}</div>
              </td>
            </tr>
          </table>
          <div class="entry-subtitle">${experience.jobTitle || ""}</div>
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
        htmlContent += `</div><hr style="border: 2pt solid #000000; margin: 12pt 0;" />
`
      }

      // Achievements Section
      if (achievements.length > 0) {
        htmlContent += `<div class="section-title">Achievements</div><div class="section-content">`
        achievements.forEach((achievement) => {
          htmlContent += `
        <div class="entry">
          <table>
            <tr>
              <td class="left-col">
                <div class="entry-title">${achievement.awardTitle || ""}</div>
              </td>
              <td class="right-col">
                <div class="date-range">${formatDate(
                  achievement.startDate
                )} - ${formatDate(achievement.endDate)}</div>
              </td>
            </tr>
          </table>
          <div class="entry-subtitle">${achievement.issuer || ""}</div>
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
        htmlContent += `</div><hr style="border: 2pt solid #000000; margin: 12pt 0;" />
`
      }

      // Bottom sections with improved formatting
      let hasBottomSections = false
      let bottomContent = ""

      if (certifications.length > 0) {
        const certText = certifications
          .map((cert) => cert.certificationTitle)
          .filter(Boolean)
          .join(", ")
        bottomContent += `
      <div class="cert-section">
        <strong>Certifications:</strong> ${certText}
      </div>
    `
        hasBottomSections = true
      }

      if (skills.length > 0) {
        const skillsText = skills
          .map((skill) => skill.skill)
          .filter(Boolean)
          .join(", ")
        bottomContent += `
      <div class="skills-section">
        <strong>Skills:</strong> ${skillsText}
      </div>
    `
        hasBottomSections = true
      }

      if (languages.length > 0) {
        const languagesText = languages
          .map((lang) => lang.language)
          .filter(Boolean)
          .join(", ")
        bottomContent += `
      <div class="lang-section">
        <strong>Languages:</strong> ${languagesText}
      </div>
    `
        hasBottomSections = true
      }

      if (hasBottomSections) {
        htmlContent += `
      <div class="section-title">Additional Information</div>
      <div class="section-content">
        ${bottomContent}
      </div>
     <hr style="border: 2pt solid #000000; margin: 12pt 0;" />

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

          /* PDF generation mode - A4 size */
          #resume-content.pdf-mode {
            width: 200mm !important;
            padding: 20px;
          }

          /* Responsive text sizes */
          .mobile-text-xs {
            font-size: 8px;
          }
          .mobile-text-sm {
            font-size: 10px;
          }
          .mobile-text-base {
            font-size: 12px;
          }
          .mobile-text-lg {
            font-size: 14px;
          }
          .mobile-text-xl {
            font-size: 16px;
          }

          /* PDF mode text sizes */
          .pdf-mode .mobile-text-xs {
            font-size: 12px;
          }
          .pdf-mode .mobile-text-sm {
            font-size: 14px;
          }
          .pdf-mode .mobile-text-base {
            font-size: 16px;
          }
          .pdf-mode .mobile-text-lg {
            font-size: 18px;
          }
          .pdf-mode .mobile-text-xl {
            font-size: 24px;
          }
        `}
          </style>
          <div className="h-auto  overflow-auto ">
            <div
              id="resume-content"
              className="w-full bg-primary text-black"
              style={{
                width: "200mm",
                margin: "auto",
                fontFamily: "Arial, sans-serif",
                padding: "20px",
                boxSizing: "border-box"
              }}>
              <div className="text-center w-full pb-1">
                <p className=" text-2xl whitespace-nowrap md:text-4xl font-bold">
                  {personalData.name}
                </p>
              </div>
              <div className="text-center text-[8px] md:text-xs flex justify-center pt-1 space-x-1">
                <p>{personalData.address},</p>
                <p>{personalData.city},</p>
                <p>{personalData.country} |</p>
                <p>{personalData.phone}</p>
              </div>
              <div className="text-center text-[10px] md:text-base flex justify-center space-x-1">
                <p>{personalData.linkedin} </p>
                <p>{personalData.website}</p>
              </div>

              <hr className="border-t-2 border-black my-6" />

              {/* Professional Summary */}
              <div>
                <p className="md:text-xl font-bold pb-3">
                  Professional Summary
                </p>
                <div
                  className="text-sm md:text-base text-justify space-y-2
                    [&_ul]:list-disc [&_ul]:pl-5
                    [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
                />
              </div>

              {/* Education */}
              {qualifications.length > 0 && (
                <div>
                  <hr className="border-t-2 border-black my-6" />
                  <p className="md:text-xl font-bold pb-4">Education</p>
                  <div>
                    {qualifications.map((qualification, index) => (
                      <div key={index} className="mb-4 space-y-1">
                        <div className="w-full text-sm md:text-base flex justify-between">
                          <p>{qualification.institutionName}</p>
                          <p>
                            {formatDate(qualification.startDate)} -{" "}
                            {formatDate(qualification.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm md:text-base font-bold">
                            {qualification.degreeType} in {qualification.major}
                          </p>
                        </div>
                        <div className="flex text-sm md:text-base">
                          <p className="font-bold pr-2">GPA: </p>
                          <p>{qualification.gpa}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Experience */}
              {experiences.length > 0 && (
                <div>
                  <hr className="border-t-2 border-black my-6" />
                  <p className="md:text-xl font-bold pb-4">
                    Relevant Experience
                  </p>
                  {sanitizedExperiences.map((experience, index) => (
                    <div
                      key={index}
                      className="mb-5 space-y-1 text-sm md:text-base">
                      <div className="w-full flex justify-between">
                        <p>{experience.companyName}</p>
                        <p>
                          {formatDate(experience.startDate)} -{" "}
                          {formatDate(experience.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold">{experience.jobTitle}</p>
                      </div>
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

              {/* Achievements */}
              {achievements.length > 0 && (
                <div>
                  <hr className="border-t-2 border-black my-6" />
                  <p className="md:text-xl font-bold pb-4">Achievements</p>
                  {sanitizedAchievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="mb-5 space-y-1 text-sm md:text-base">
                      <div className="w-full flex justify-between">
                        <p>{achievement.awardTitle}</p>
                        <p>
                          {formatDate(achievement.startDate)} -{" "}
                          {formatDate(achievement.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold">{achievement.issuer}</p>
                      </div>
                      <div
                        className="text-sm md:text-base text-justify space-y-2
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
              <hr className="border-t-2 border-black my-6" />

              {/* Certifications */}
              {certifications.length > 0 && (
                <div className="flex text-sm md:text-base">
                  <p className="font-bold pr-1">Certifications: </p>
                  <p className="">
                    {certifications
                      .map(
                        (certification) => `${certification.certificationTitle}`
                      )
                      .join(", ")}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex text-sm md:text-base">
                  <p className="font-bold pr-1">Skills: </p>
                  <p>{skills.map((skill) => `${skill.skill}`).join(", ")}</p>
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <div className="flex ">
                  <p className="font-bold pr-1">Languages: </p>
                  <p>
                    {languages
                      .map((language) => `${language.language}`)
                      .join(", ")}
                  </p>
                </div>
              )}

              <hr className="border-t-2 border-black my-6" />
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

export default BasicModernTemplate
