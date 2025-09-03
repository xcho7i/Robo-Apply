// "use client"

// import React, { useState, useEffect } from "react"
// import FormCardLayout from "../../../components/common/FormCardLayout"
// import FormHeading from "../../../components/common/FormHeading"
// import FormPara from "../../../components/common/FormPara"
// import StepNavigation from "../../../components/common/StepNavigation"
// import { InputField } from "../../../components/common/InputField"
// import { Info } from "lucide-react"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "../../../components/ui/select"
// import { errorToast, successToast } from "../../../components/Toast"
// import API_ENDPOINTS from "../../../api/endpoints"
// import ProgressBar from "@/src/components/common/ProgressBar"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// interface StepTenProps {
//   onboardingData: any
//   setOnboardingData: (data: any) => void
//   onNextStep: (stepPlus?: number) => void
//   onPreviousStep: (stepMinus?: number) => void
// }

// // Comprehensive countries data
// const countries = [
//   { code: "US", name: "United States" },
//   { code: "AF", name: "Afghanistan" },
//   { code: "AL", name: "Albania" },
//   { code: "DZ", name: "Algeria" },
//   { code: "AD", name: "Andorra" },
//   { code: "AO", name: "Angola" },
//   { code: "AG", name: "Antigua and Barbuda" },
//   { code: "AR", name: "Argentina" },
//   { code: "AM", name: "Armenia" },
//   { code: "AU", name: "Australia" },
//   { code: "AT", name: "Austria" },
//   { code: "AZ", name: "Azerbaijan" },
//   { code: "BS", name: "Bahamas" },
//   { code: "BH", name: "Bahrain" },
//   { code: "BD", name: "Bangladesh" },
//   { code: "BB", name: "Barbados" },
//   { code: "BY", name: "Belarus" },
//   { code: "BE", name: "Belgium" },
//   { code: "BZ", name: "Belize" },
//   { code: "BJ", name: "Benin" },
//   { code: "BT", name: "Bhutan" },
//   { code: "BO", name: "Bolivia" },
//   { code: "BA", name: "Bosnia and Herzegovina" },
//   { code: "BW", name: "Botswana" },
//   { code: "BR", name: "Brazil" },
//   { code: "BN", name: "Brunei" },
//   { code: "BG", name: "Bulgaria" },
//   { code: "BF", name: "Burkina Faso" },
//   { code: "BI", name: "Burundi" },
//   { code: "CV", name: "Cabo Verde" },
//   { code: "KH", name: "Cambodia" },
//   { code: "CM", name: "Cameroon" },
//   { code: "CA", name: "Canada" },
//   { code: "CF", name: "Central African Republic" },
//   { code: "TD", name: "Chad" },
//   { code: "CL", name: "Chile" },
//   { code: "CN", name: "China" },
//   { code: "CO", name: "Colombia" },
//   { code: "KM", name: "Comoros" },
//   { code: "CG", name: "Congo" },
//   { code: "CR", name: "Costa Rica" },
//   { code: "HR", name: "Croatia" },
//   { code: "CU", name: "Cuba" },
//   { code: "CY", name: "Cyprus" },
//   { code: "CZ", name: "Czech Republic" },
//   { code: "CD", name: "Democratic Republic of the Congo" },
//   { code: "DK", name: "Denmark" },
//   { code: "DJ", name: "Djibouti" },
//   { code: "DM", name: "Dominica" },
//   { code: "DO", name: "Dominican Republic" },
//   { code: "EC", name: "Ecuador" },
//   { code: "EG", name: "Egypt" },
//   { code: "SV", name: "El Salvador" },
//   { code: "GQ", name: "Equatorial Guinea" },
//   { code: "ER", name: "Eritrea" },
//   { code: "EE", name: "Estonia" },
//   { code: "ET", name: "Ethiopia" },
//   { code: "FJ", name: "Fiji" },
//   { code: "FI", name: "Finland" },
//   { code: "FR", name: "France" },
//   { code: "GA", name: "Gabon" },
//   { code: "GM", name: "Gambia" },
//   { code: "GE", name: "Georgia" },
//   { code: "DE", name: "Germany" },
//   { code: "GH", name: "Ghana" },
//   { code: "GR", name: "Greece" },
//   { code: "GD", name: "Grenada" },
//   { code: "GT", name: "Guatemala" },
//   { code: "GN", name: "Guinea" },
//   { code: "GW", name: "Guinea-Bissau" },
//   { code: "GY", name: "Guyana" },
//   { code: "HT", name: "Haiti" },
//   { code: "HN", name: "Honduras" },
//   { code: "HU", name: "Hungary" },
//   { code: "IS", name: "Iceland" },
//   { code: "IN", name: "India" },
//   { code: "ID", name: "Indonesia" },
//   { code: "IR", name: "Iran" },
//   { code: "IQ", name: "Iraq" },
//   { code: "IE", name: "Ireland" },
//   { code: "IL", name: "Israel" },
//   { code: "IT", name: "Italy" },
//   { code: "JM", name: "Jamaica" },
//   { code: "JP", name: "Japan" },
//   { code: "JO", name: "Jordan" },
//   { code: "KZ", name: "Kazakhstan" },
//   { code: "KE", name: "Kenya" },
//   { code: "KI", name: "Kiribati" },
//   { code: "KW", name: "Kuwait" },
//   { code: "KG", name: "Kyrgyzstan" },
//   { code: "LA", name: "Laos" },
//   { code: "LV", name: "Latvia" },
//   { code: "LB", name: "Lebanon" },
//   { code: "LS", name: "Lesotho" },
//   { code: "LR", name: "Liberia" },
//   { code: "LY", name: "Libya" },
//   { code: "LI", name: "Liechtenstein" },
//   { code: "LT", name: "Lithuania" },
//   { code: "LU", name: "Luxembourg" },
//   { code: "MG", name: "Madagascar" },
//   { code: "MW", name: "Malawi" },
//   { code: "MY", name: "Malaysia" },
//   { code: "MV", name: "Maldives" },
//   { code: "ML", name: "Mali" },
//   { code: "MT", name: "Malta" },
//   { code: "MH", name: "Marshall Islands" },
//   { code: "MR", name: "Mauritania" },
//   { code: "MU", name: "Mauritius" },
//   { code: "MX", name: "Mexico" },
//   { code: "FM", name: "Micronesia" },
//   { code: "MD", name: "Moldova" },
//   { code: "MC", name: "Monaco" },
//   { code: "MN", name: "Mongolia" },
//   { code: "ME", name: "Montenegro" },
//   { code: "MA", name: "Morocco" },
//   { code: "MZ", name: "Mozambique" },
//   { code: "MM", name: "Myanmar" },
//   { code: "NA", name: "Namibia" },
//   { code: "NR", name: "Nauru" },
//   { code: "NP", name: "Nepal" },
//   { code: "NL", name: "Netherlands" },
//   { code: "NZ", name: "New Zealand" },
//   { code: "NI", name: "Nicaragua" },
//   { code: "NE", name: "Niger" },
//   { code: "NG", name: "Nigeria" },
//   { code: "NO", name: "Norway" },
//   { code: "OM", name: "Oman" },
//   { code: "PK", name: "Pakistan" },
//   { code: "PW", name: "Palau" },
//   { code: "PA", name: "Panama" },
//   { code: "PG", name: "Papua New Guinea" },
//   { code: "PY", name: "Paraguay" },
//   { code: "PE", name: "Peru" },
//   { code: "PH", name: "Philippines" },
//   { code: "PL", name: "Poland" },
//   { code: "PT", name: "Portugal" },
//   { code: "QA", name: "Qatar" },
//   { code: "RO", name: "Romania" },
//   { code: "RU", name: "Russia" },
//   { code: "RW", name: "Rwanda" },
//   { code: "KN", name: "Saint Kitts and Nevis" },
//   { code: "LC", name: "Saint Lucia" },
//   { code: "VC", name: "Saint Vincent and the Grenadines" },
//   { code: "WS", name: "Samoa" },
//   { code: "SM", name: "San Marino" },
//   { code: "ST", name: "Sao Tome and Principe" },
//   { code: "SA", name: "Saudi Arabia" },
//   { code: "SN", name: "Senegal" },
//   { code: "RS", name: "Serbia" },
//   { code: "SC", name: "Seychelles" },
//   { code: "SL", name: "Sierra Leone" },
//   { code: "SG", name: "Singapore" },
//   { code: "SK", name: "Slovakia" },
//   { code: "SI", name: "Slovenia" },
//   { code: "SB", name: "Solomon Islands" },
//   { code: "SO", name: "Somalia" },
//   { code: "ZA", name: "South Africa" },
//   { code: "SS", name: "South Sudan" },
//   { code: "ES", name: "Spain" },
//   { code: "LK", name: "Sri Lanka" },
//   { code: "SD", name: "Sudan" },
//   { code: "SR", name: "Suriname" },
//   { code: "SZ", name: "Eswatini" },
//   { code: "SE", name: "Sweden" },
//   { code: "CH", name: "Switzerland" },
//   { code: "SY", name: "Syria" },
//   { code: "TW", name: "Taiwan" },
//   { code: "TJ", name: "Tajikistan" },
//   { code: "TZ", name: "Tanzania" },
//   { code: "TH", name: "Thailand" },
//   { code: "TL", name: "Timor-Leste" },
//   { code: "TG", name: "Togo" },
//   { code: "TO", name: "Tonga" },
//   { code: "TT", name: "Trinidad and Tobago" },
//   { code: "TN", name: "Tunisia" },
//   { code: "TR", name: "Turkey" },
//   { code: "TM", name: "Turkmenistan" },
//   { code: "TV", name: "Tuvalu" },
//   { code: "UG", name: "Uganda" },
//   { code: "UA", name: "Ukraine" },
//   { code: "AE", name: "United Arab Emirates" },
//   { code: "GB", name: "United Kingdom" },
//   { code: "UY", name: "Uruguay" },
//   { code: "UZ", name: "Uzbekistan" },
//   { code: "VU", name: "Vanuatu" },
//   { code: "VA", name: "Vatican City" },
//   { code: "VE", name: "Venezuela" },
//   { code: "VN", name: "Vietnam" },
//   { code: "YE", name: "Yemen" },
//   { code: "ZM", name: "Zambia" },
//   { code: "ZW", name: "Zimbabwe" }
// ]

// const StepTen: React.FC<StepTenProps> = ({
//   onboardingData,
//   setOnboardingData,
//   onNextStep,
//   onPreviousStep
// }) => {
//   const [country, setCountry] = useState(onboardingData.country || "")
//   const [phone, setPhone] = useState(onboardingData.phone || "")
//   const [phoneError, setPhoneError] = useState("")
//   const [resume, setResume] = useState<File | null>(null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)
//   const [fileResponse, setFileResponse] = useState<any>(null)

//   useEffect(() => {
//     // Initialize country from onboarding data
//     if (onboardingData.country) {
//       setCountry(onboardingData.country)
//     }
//     // Initialize phone from onboarding data
//     if (onboardingData.phone) {
//       setPhone(onboardingData.phone)
//     }
//     // Initialize resume file name from onboarding data
//     if (onboardingData.resumeName) {
//       // Create a dummy file object to show the filename
//       const dummyFile = new File([""], onboardingData.resumeName)
//       setResume(dummyFile)
//     }
//   }, [onboardingData.country, onboardingData.phone, onboardingData.resumeName])

//   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value
//     setPhone(value)

//     // More flexible phone validation
//     if (value.trim() === "") {
//       setPhoneError("Phone number is required")
//     } else if (value.length < 7) {
//       setPhoneError("Phone number should be at least 7 digits")
//     } else if (value.length > 15) {
//       setPhoneError("Phone number should not exceed 15 digits")
//     } else if (!/^[\d\s\-\+\(\)\.]+$/.test(value)) {
//       setPhoneError(
//         "Phone number can only contain numbers, spaces, hyphens, plus signs, parentheses, and dots"
//       )
//     } else {
//       setPhoneError("")
//     }
//   }

//   const handleCountryChange = (value: string) => {
//     console.log("Country changed to:", value) // Debug log
//     setCountry(value)
//   }

//   // File upload API handler
//   const handleFileUpload = async (file: File) => {
//     if (!file) {
//       errorToast("Please upload a file.")
//       return
//     }

//     setIsUploading(true) // Show loader

//     const fullUrl = `${BASE_URL}${API_ENDPOINTS.FileUpload}`
//     console.log("File upload URL:", fullUrl)

//     try {
//       const formData = new FormData()
//       formData.append("files", file) // Use 'files' as the key

//       const response = await fetch(fullUrl, {
//         method: "POST",
//         body: formData
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "File upload failed!")
//       }

//       const data = await response.json()
//       console.log("File upload response:", data)

//       // Check if the response has the correct file data
//       if (data.success && data.files && data.files.length > 0) {
//         // Extract the urlPath from the response
//         const fileUrlPath = data.files[0].urlPath
//         console.log("File URL Path:", fileUrlPath)

//         // Save the file URL in the state
//         setFileResponse({ urlPath: fileUrlPath })

//         // Store the file URL path in localStorage and onboarding data
//         localStorage.setItem("resumeUrlPath", fileUrlPath)

//         // Update onboarding data with the API response instead of base64
//         setOnboardingData((prev: any) => ({
//           ...prev,
//           resumeName: file.name,
//           resumeData: fileUrlPath, // Store the URL path instead of base64
//           resumeType: file.type
//         }))

//         successToast("File uploaded successfully!")
//       } else {
//         errorToast(data.message || "File upload failed!")
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error)
//       errorToast(
//         error instanceof Error ? error.message : "Error uploading file."
//       )
//     } finally {
//       setIsUploading(false) // Hide loader
//     }
//   }

//   const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (isSubmitting || isUploading) return

//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0]
//       setResume(file)

//       // Call the file upload API instead of converting to base64
//       await handleFileUpload(file)
//     }
//   }

//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault()
//     if (isSubmitting || isUploading) return

//     setIsSubmitting(true)

//     try {
//       console.log("Saving country:", country) // Debug log
//       setOnboardingData((prev: any) => ({
//         ...prev,
//         country: country,
//         phone: phone
//       }))
//       onNextStep(3)
//     } catch (err) {
//       console.error("Step 10 Error:", err)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div>
//       <div className="w-full mb-4">
//         <ProgressBar step={10} />
//       </div>
//       <FormHeading
//         whiteText="Enter your desired "
//         yellowText="location!"
//         className="mb-10"
//       />
//       <FormCardLayout>
//         <form
//           className="w-full max-w-2xl p-6 sm:p-10 space-y-8"
//           onSubmit={handleSubmit}>
//           <div className="space-y-6">
//             {/* Location */}
//             <div>
//               <label className="text-white block mb-2">Location</label>
//               <Select value={country} onValueChange={handleCountryChange}>
//                 <SelectTrigger className="w-full text-white">
//                   <SelectValue placeholder="Select a Country" />
//                 </SelectTrigger>
//                 <SelectContent className="max-h-[300px] overflow-y-auto">
//                   {countries.map((c) => (
//                     <SelectItem
//                       key={c.code}
//                       value={c.name}
//                       className="text-white hover:bg-gray-700">
//                       {c.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Phone Number */}
//             <div>
//               <InputField
//                 label="Phone Number (Optional)"
//                 id="phone"
//                 value={phone}
//                 onChange={handlePhoneChange}
//                 placeholder="Enter only numbers"
//               />
//             </div>

//             {/* Resume Upload */}
//             <div>
//               <div className="flex items-center gap-1 mb-2">
//                 <label className="text-white text-sm">Resume (Optional)</label>
//                 <Info className="w-3 h-3 text-yellow-400" />
//               </div>
//               <label className="inline-block hover:scale-105 transition-all duration-300">
//                 <input
//                   type="file"
//                   accept=".pdf,.doc,.docx"
//                   className="hidden"
//                   onChange={handleResumeChange}
//                   disabled={isUploading}
//                 />
//                 <span
//                   className={`bg-white text-black text-sm px-2 py-1 rounded cursor-pointer font-medium border border-gray-300 hover:bg-gray-100 hover:scale-105 transition-all duration-300 ${
//                     isUploading ? "opacity-50 cursor-not-allowed" : ""
//                   }`}>
//                   {isUploading ? "⏳ Uploading..." : "+ Upload Resume"}
//                 </span>
//                 {resume && !isUploading && (
//                   <span className="ml-3 text-white text-sm">
//                     ✅ {resume.name}
//                   </span>
//                 )}
//                 {isUploading && (
//                   <span className="ml-3 text-yellow-400 text-sm">
//                     Uploading resume...
//                   </span>
//                 )}
//               </label>
//             </div>
//           </div>

//           <div className="w-full flex justify-end mt-4">
//             <StepNavigation
//               currentStep={10}
//               onNext={handleSubmit}
//               onPrevious={onPreviousStep}
//               isLoading={isSubmitting || isUploading}
//               disabled={isSubmitting || isUploading || !country}
//             />
//           </div>
//         </form>
//       </FormCardLayout>
//     </div>
//   )
// }

// export default StepTen

"use client"

import React, { useState, useEffect } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import { InputField } from "../../../components/common/InputField"
import { Info } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../components/ui/select"
import { errorToast, successToast } from "../../../components/Toast"
import API_ENDPOINTS from "../../../api/endpoints"
import ProgressBar from "@/src/components/common/ProgressBar"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

interface StepTenProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: (stepMinus?: number) => void
}

// Comprehensive countries data with phone codes
const countries = [
  {
    code: "US",
    name: "United States",
    phoneCode: "+1",
    format: "(XXX) XXX-XXXX"
  },
  { code: "AF", name: "Afghanistan", phoneCode: "+93", format: "XX XXX XXXX" },
  { code: "AL", name: "Albania", phoneCode: "+355", format: "XX XXX XXXX" },
  { code: "DZ", name: "Algeria", phoneCode: "+213", format: "XXX XX XX XX" },
  { code: "AD", name: "Andorra", phoneCode: "+376", format: "XXX XXX" },
  { code: "AO", name: "Angola", phoneCode: "+244", format: "XXX XXX XXX" },
  {
    code: "AG",
    name: "Antigua and Barbuda",
    phoneCode: "+1",
    format: "(XXX) XXX-XXXX"
  },
  { code: "AR", name: "Argentina", phoneCode: "+54", format: "XX XXXX XXXX" },
  { code: "AM", name: "Armenia", phoneCode: "+374", format: "XX XXX XXX" },
  { code: "AU", name: "Australia", phoneCode: "+61", format: "XXX XXX XXX" },
  { code: "AT", name: "Austria", phoneCode: "+43", format: "XXX XXXXXXX" },
  { code: "AZ", name: "Azerbaijan", phoneCode: "+994", format: "XX XXX XX XX" },
  { code: "BS", name: "Bahamas", phoneCode: "+1", format: "(XXX) XXX-XXXX" },
  { code: "BH", name: "Bahrain", phoneCode: "+973", format: "XXXX XXXX" },
  { code: "BD", name: "Bangladesh", phoneCode: "+880", format: "XXXX XXXXXX" },
  { code: "BB", name: "Barbados", phoneCode: "+1", format: "(XXX) XXX-XXXX" },
  { code: "BY", name: "Belarus", phoneCode: "+375", format: "XX XXX XX XX" },
  { code: "BE", name: "Belgium", phoneCode: "+32", format: "XXX XX XX XX" },
  { code: "BZ", name: "Belize", phoneCode: "+501", format: "XXX XXXX" },
  { code: "BJ", name: "Benin", phoneCode: "+229", format: "XX XX XX XX" },
  { code: "BT", name: "Bhutan", phoneCode: "+975", format: "XX XXX XXX" },
  { code: "BO", name: "Bolivia", phoneCode: "+591", format: "XXXX XXXX" },
  {
    code: "BA",
    name: "Bosnia and Herzegovina",
    phoneCode: "+387",
    format: "XX XXX XXX"
  },
  { code: "BW", name: "Botswana", phoneCode: "+267", format: "XX XXX XXX" },
  { code: "BR", name: "Brazil", phoneCode: "+55", format: "(XX) XXXXX-XXXX" },
  { code: "BN", name: "Brunei", phoneCode: "+673", format: "XXX XXXX" },
  { code: "BG", name: "Bulgaria", phoneCode: "+359", format: "XX XXX XXXX" },
  {
    code: "BF",
    name: "Burkina Faso",
    phoneCode: "+226",
    format: "XX XX XX XX"
  },
  { code: "BI", name: "Burundi", phoneCode: "+257", format: "XX XX XX XX" },
  { code: "CV", name: "Cabo Verde", phoneCode: "+238", format: "XXX XX XX" },
  { code: "KH", name: "Cambodia", phoneCode: "+855", format: "XX XXX XXX" },
  { code: "CM", name: "Cameroon", phoneCode: "+237", format: "XXXX XXXX" },
  { code: "CA", name: "Canada", phoneCode: "+1", format: "(XXX) XXX-XXXX" },
  {
    code: "CF",
    name: "Central African Republic",
    phoneCode: "+236",
    format: "XX XX XX XX"
  },
  { code: "TD", name: "Chad", phoneCode: "+235", format: "XX XX XX XX" },
  { code: "CL", name: "Chile", phoneCode: "+56", format: "X XXXX XXXX" },
  { code: "CN", name: "China", phoneCode: "+86", format: "XXX XXXX XXXX" },
  { code: "CO", name: "Colombia", phoneCode: "+57", format: "XXX XXX XXXX" },
  { code: "KM", name: "Comoros", phoneCode: "+269", format: "XXX XXXX" },
  { code: "CG", name: "Congo", phoneCode: "+242", format: "XX XXX XXXX" },
  { code: "CR", name: "Costa Rica", phoneCode: "+506", format: "XXXX XXXX" },
  { code: "HR", name: "Croatia", phoneCode: "+385", format: "XX XXX XXXX" },
  { code: "CU", name: "Cuba", phoneCode: "+53", format: "X XXX XXXX" },
  { code: "CY", name: "Cyprus", phoneCode: "+357", format: "XX XXX XXX" },
  {
    code: "CZ",
    name: "Czech Republic",
    phoneCode: "+420",
    format: "XXX XXX XXX"
  },
  {
    code: "CD",
    name: "Democratic Republic of the Congo",
    phoneCode: "+243",
    format: "XXX XXX XXX"
  },
  { code: "DK", name: "Denmark", phoneCode: "+45", format: "XX XX XX XX" },
  { code: "DJ", name: "Djibouti", phoneCode: "+253", format: "XX XX XX XX" },
  { code: "DM", name: "Dominica", phoneCode: "+1", format: "(XXX) XXX-XXXX" },
  {
    code: "DO",
    name: "Dominican Republic",
    phoneCode: "+1",
    format: "(XXX) XXX-XXXX"
  },
  { code: "EC", name: "Ecuador", phoneCode: "+593", format: "XX XXX XXXX" },
  { code: "EG", name: "Egypt", phoneCode: "+20", format: "XXX XXX XXXX" },
  { code: "SV", name: "El Salvador", phoneCode: "+503", format: "XXXX XXXX" },
  {
    code: "GQ",
    name: "Equatorial Guinea",
    phoneCode: "+240",
    format: "XXX XXX XXX"
  },
  { code: "ER", name: "Eritrea", phoneCode: "+291", format: "X XXX XXX" },
  { code: "EE", name: "Estonia", phoneCode: "+372", format: "XXXX XXXX" },
  { code: "ET", name: "Ethiopia", phoneCode: "+251", format: "XX XXX XXXX" },
  { code: "FJ", name: "Fiji", phoneCode: "+679", format: "XXX XXXX" },
  { code: "FI", name: "Finland", phoneCode: "+358", format: "XX XXX XXXX" },
  { code: "FR", name: "France", phoneCode: "+33", format: "XX XX XX XX XX" },
  { code: "GA", name: "Gabon", phoneCode: "+241", format: "XX XX XX XX" },
  { code: "GM", name: "Gambia", phoneCode: "+220", format: "XXX XXXX" },
  { code: "GE", name: "Georgia", phoneCode: "+995", format: "XXX XXX XXX" },
  { code: "DE", name: "Germany", phoneCode: "+49", format: "XXXX XXXXXXX" },
  { code: "GH", name: "Ghana", phoneCode: "+233", format: "XXX XXX XXXX" },
  { code: "GR", name: "Greece", phoneCode: "+30", format: "XXX XXX XXXX" },
  { code: "GD", name: "Grenada", phoneCode: "+1", format: "(XXX) XXX-XXXX" },
  { code: "GT", name: "Guatemala", phoneCode: "+502", format: "XXXX XXXX" },
  { code: "GN", name: "Guinea", phoneCode: "+224", format: "XXX XXX XXX" },
  { code: "GW", name: "Guinea-Bissau", phoneCode: "+245", format: "XXX XXXX" },
  { code: "GY", name: "Guyana", phoneCode: "+592", format: "XXX XXXX" },
  { code: "HT", name: "Haiti", phoneCode: "+509", format: "XX XX XXXX" },
  { code: "HN", name: "Honduras", phoneCode: "+504", format: "XXXX XXXX" },
  { code: "HU", name: "Hungary", phoneCode: "+36", format: "XX XXX XXXX" },
  { code: "IS", name: "Iceland", phoneCode: "+354", format: "XXX XXXX" },
  { code: "IN", name: "India", phoneCode: "+91", format: "XXXXX XXXXX" },
  { code: "ID", name: "Indonesia", phoneCode: "+62", format: "XXX XXX XXXX" },
  { code: "IR", name: "Iran", phoneCode: "+98", format: "XXX XXX XXXX" },
  { code: "IQ", name: "Iraq", phoneCode: "+964", format: "XXX XXX XXXX" },
  { code: "IE", name: "Ireland", phoneCode: "+353", format: "XX XXX XXXX" },
  { code: "IL", name: "Israel", phoneCode: "+972", format: "XX XXX XXXX" },
  { code: "IT", name: "Italy", phoneCode: "+39", format: "XXX XXX XXXX" },
  { code: "JM", name: "Jamaica", phoneCode: "+1", format: "(XXX) XXX-XXXX" },
  { code: "JP", name: "Japan", phoneCode: "+81", format: "XX XXXX XXXX" },
  { code: "JO", name: "Jordan", phoneCode: "+962", format: "X XXXX XXXX" },
  { code: "KZ", name: "Kazakhstan", phoneCode: "+7", format: "XXX XXX XX XX" },
  { code: "KE", name: "Kenya", phoneCode: "+254", format: "XXX XXXXXX" },
  { code: "KI", name: "Kiribati", phoneCode: "+686", format: "XX XXX" },
  { code: "KW", name: "Kuwait", phoneCode: "+965", format: "XXXX XXXX" },
  { code: "KG", name: "Kyrgyzstan", phoneCode: "+996", format: "XXX XXX XXX" },
  { code: "LA", name: "Laos", phoneCode: "+856", format: "XX XXX XXX" },
  { code: "LV", name: "Latvia", phoneCode: "+371", format: "XXXX XXXX" },
  { code: "LB", name: "Lebanon", phoneCode: "+961", format: "XX XXX XXX" },
  { code: "LS", name: "Lesotho", phoneCode: "+266", format: "XXXX XXXX" },
  { code: "LR", name: "Liberia", phoneCode: "+231", format: "XXX XXX XXX" },
  { code: "LY", name: "Libya", phoneCode: "+218", format: "XXX XXX XXX" },
  { code: "LI", name: "Liechtenstein", phoneCode: "+423", format: "XXX XX XX" },
  { code: "LT", name: "Lithuania", phoneCode: "+370", format: "XXX XXXXX" },
  { code: "LU", name: "Luxembourg", phoneCode: "+352", format: "XXX XXX XXX" },
  { code: "MG", name: "Madagascar", phoneCode: "+261", format: "XX XX XXX XX" },
  { code: "MW", name: "Malawi", phoneCode: "+265", format: "XXX XXX XXX" },
  { code: "MY", name: "Malaysia", phoneCode: "+60", format: "XX XXXX XXXX" },
  { code: "MV", name: "Maldives", phoneCode: "+960", format: "XXX XXXX" },
  { code: "ML", name: "Mali", phoneCode: "+223", format: "XX XX XX XX" },
  { code: "MT", name: "Malta", phoneCode: "+356", format: "XXXX XXXX" },
  {
    code: "MH",
    name: "Marshall Islands",
    phoneCode: "+692",
    format: "XXX XXXX"
  },
  { code: "MR", name: "Mauritania", phoneCode: "+222", format: "XXXX XXXX" },
  { code: "MU", name: "Mauritius", phoneCode: "+230", format: "XXXX XXXX" },
  { code: "MX", name: "Mexico", phoneCode: "+52", format: "XXX XXX XXXX" },
  { code: "FM", name: "Micronesia", phoneCode: "+691", format: "XXX XXXX" },
  { code: "MD", name: "Moldova", phoneCode: "+373", format: "XXXX XXXX" },
  { code: "MC", name: "Monaco", phoneCode: "+377", format: "XX XX XX XX" },
  { code: "MN", name: "Mongolia", phoneCode: "+976", format: "XXXX XXXX" },
  { code: "ME", name: "Montenegro", phoneCode: "+382", format: "XX XXX XXX" },
  { code: "MA", name: "Morocco", phoneCode: "+212", format: "XXX XXXXXX" },
  { code: "MZ", name: "Mozambique", phoneCode: "+258", format: "XX XXX XXXX" },
  { code: "MM", name: "Myanmar", phoneCode: "+95", format: "XX XXX XXXX" },
  { code: "NA", name: "Namibia", phoneCode: "+264", format: "XX XXX XXXX" },
  { code: "NR", name: "Nauru", phoneCode: "+674", format: "XXX XXXX" },
  { code: "NP", name: "Nepal", phoneCode: "+977", format: "XXX XXX XXXX" },
  { code: "NL", name: "Netherlands", phoneCode: "+31", format: "XX XXX XXXX" },
  { code: "NZ", name: "New Zealand", phoneCode: "+64", format: "XXX XXX XXXX" },
  { code: "NI", name: "Nicaragua", phoneCode: "+505", format: "XXXX XXXX" },
  { code: "NE", name: "Niger", phoneCode: "+227", format: "XX XX XX XX" },
  { code: "NG", name: "Nigeria", phoneCode: "+234", format: "XXX XXX XXXX" },
  { code: "NO", name: "Norway", phoneCode: "+47", format: "XXX XX XXX" },
  { code: "OM", name: "Oman", phoneCode: "+968", format: "XXXX XXXX" },
  { code: "PK", name: "Pakistan", phoneCode: "+92", format: "XXX XXX XXXX" },
  { code: "PW", name: "Palau", phoneCode: "+680", format: "XXX XXXX" },
  { code: "PA", name: "Panama", phoneCode: "+507", format: "XXXX XXXX" },
  {
    code: "PG",
    name: "Papua New Guinea",
    phoneCode: "+675",
    format: "XXX XXXX"
  },
  { code: "PY", name: "Paraguay", phoneCode: "+595", format: "XXX XXX XXX" },
  { code: "PE", name: "Peru", phoneCode: "+51", format: "XXX XXX XXX" },
  { code: "PH", name: "Philippines", phoneCode: "+63", format: "XXX XXX XXXX" },
  { code: "PL", name: "Poland", phoneCode: "+48", format: "XXX XXX XXX" },
  { code: "PT", name: "Portugal", phoneCode: "+351", format: "XXX XXX XXX" },
  { code: "QA", name: "Qatar", phoneCode: "+974", format: "XXXX XXXX" },
  { code: "RO", name: "Romania", phoneCode: "+40", format: "XXX XXX XXX" },
  { code: "RU", name: "Russia", phoneCode: "+7", format: "XXX XXX XX XX" },
  { code: "RW", name: "Rwanda", phoneCode: "+250", format: "XXX XXX XXX" },
  {
    code: "KN",
    name: "Saint Kitts and Nevis",
    phoneCode: "+1",
    format: "(XXX) XXX-XXXX"
  },
  {
    code: "LC",
    name: "Saint Lucia",
    phoneCode: "+1",
    format: "(XXX) XXX-XXXX"
  },
  {
    code: "VC",
    name: "Saint Vincent and the Grenadines",
    phoneCode: "+1",
    format: "(XXX) XXX-XXXX"
  },
  { code: "WS", name: "Samoa", phoneCode: "+685", format: "XX XXX" },
  { code: "SM", name: "San Marino", phoneCode: "+378", format: "XXXX XXXXXX" },
  {
    code: "ST",
    name: "Sao Tome and Principe",
    phoneCode: "+239",
    format: "XXX XXXX"
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    phoneCode: "+966",
    format: "XX XXX XXXX"
  },
  { code: "SN", name: "Senegal", phoneCode: "+221", format: "XX XXX XX XX" },
  { code: "RS", name: "Serbia", phoneCode: "+381", format: "XX XXX XXXX" },
  { code: "SC", name: "Seychelles", phoneCode: "+248", format: "X XX XX XX" },
  { code: "SL", name: "Sierra Leone", phoneCode: "+232", format: "XX XXX XXX" },
  { code: "SG", name: "Singapore", phoneCode: "+65", format: "XXXX XXXX" },
  { code: "SK", name: "Slovakia", phoneCode: "+421", format: "XXX XXX XXX" },
  { code: "SI", name: "Slovenia", phoneCode: "+386", format: "XX XXX XXX" },
  { code: "SB", name: "Solomon Islands", phoneCode: "+677", format: "XXXXX" },
  { code: "SO", name: "Somalia", phoneCode: "+252", format: "XX XXX XXX" },
  { code: "ZA", name: "South Africa", phoneCode: "+27", format: "XX XXX XXXX" },
  { code: "SS", name: "South Sudan", phoneCode: "+211", format: "XXX XXX XXX" },
  { code: "ES", name: "Spain", phoneCode: "+34", format: "XXX XXX XXX" },
  { code: "LK", name: "Sri Lanka", phoneCode: "+94", format: "XX XXX XXXX" },
  { code: "SD", name: "Sudan", phoneCode: "+249", format: "XXX XXX XXX" },
  { code: "SR", name: "Suriname", phoneCode: "+597", format: "XXX XXXX" },
  { code: "SZ", name: "Eswatini", phoneCode: "+268", format: "XXXX XXXX" },
  { code: "SE", name: "Sweden", phoneCode: "+46", format: "XXX XXX XXXX" },
  { code: "CH", name: "Switzerland", phoneCode: "+41", format: "XX XXX XX XX" },
  { code: "SY", name: "Syria", phoneCode: "+963", format: "XXX XXX XXX" },
  { code: "TW", name: "Taiwan", phoneCode: "+886", format: "XXX XXX XXX" },
  { code: "TJ", name: "Tajikistan", phoneCode: "+992", format: "XX XXX XXXX" },
  { code: "TZ", name: "Tanzania", phoneCode: "+255", format: "XXX XXX XXX" },
  { code: "TH", name: "Thailand", phoneCode: "+66", format: "XX XXX XXXX" },
  { code: "TL", name: "Timor-Leste", phoneCode: "+670", format: "XXX XXXX" },
  { code: "TG", name: "Togo", phoneCode: "+228", format: "XX XX XX XX" },
  { code: "TO", name: "Tonga", phoneCode: "+676", format: "XXXXX" },
  {
    code: "TT",
    name: "Trinidad and Tobago",
    phoneCode: "+1",
    format: "(XXX) XXX-XXXX"
  },
  { code: "TN", name: "Tunisia", phoneCode: "+216", format: "XX XXX XXX" },
  { code: "TR", name: "Turkey", phoneCode: "+90", format: "XXX XXX XX XX" },
  { code: "TM", name: "Turkmenistan", phoneCode: "+993", format: "XX XXXXXX" },
  { code: "TV", name: "Tuvalu", phoneCode: "+688", format: "XXXXX" },
  { code: "UG", name: "Uganda", phoneCode: "+256", format: "XXX XXXXXX" },
  { code: "UA", name: "Ukraine", phoneCode: "+380", format: "XX XXX XX XX" },
  {
    code: "AE",
    name: "United Arab Emirates",
    phoneCode: "+971",
    format: "XX XXX XXXX"
  },
  {
    code: "GB",
    name: "United Kingdom",
    phoneCode: "+44",
    format: "XXXX XXX XXXX"
  },
  { code: "UY", name: "Uruguay", phoneCode: "+598", format: "XXXX XXXX" },
  { code: "UZ", name: "Uzbekistan", phoneCode: "+998", format: "XX XXX XX XX" },
  { code: "VU", name: "Vanuatu", phoneCode: "+678", format: "XXXXX" },
  {
    code: "VA",
    name: "Vatican City",
    phoneCode: "+39",
    format: "XXX XXX XXXX"
  },
  { code: "VE", name: "Venezuela", phoneCode: "+58", format: "XXX XXX XXXX" },
  { code: "VN", name: "Vietnam", phoneCode: "+84", format: "XXX XXX XXXX" },
  { code: "YE", name: "Yemen", phoneCode: "+967", format: "XXX XXX XXX" },
  { code: "ZM", name: "Zambia", phoneCode: "+260", format: "XXX XXX XXX" },
  { code: "ZW", name: "Zimbabwe", phoneCode: "+263", format: "XX XXX XXXX" }
]

const StepTen: React.FC<StepTenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [country, setCountry] = useState(onboardingData.country || "")
  const [phone, setPhone] = useState(onboardingData.phone || "")
  const [phoneError, setPhoneError] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileResponse, setFileResponse] = useState<any>(null)
  const [selectedCountryData, setSelectedCountryData] = useState<any>(null)

  useEffect(() => {
    // Initialize country from onboarding data
    if (onboardingData.country) {
      setCountry(onboardingData.country)
      const countryData = countries.find(
        (c) => c.name === onboardingData.country
      )
      setSelectedCountryData(countryData)
    }
    // Initialize phone from onboarding data
    if (onboardingData.phone) {
      setPhone(onboardingData.phone)
    }
    // Initialize resume file name from onboarding data
    if (onboardingData.resumeName) {
      const dummyFile = new File([""], onboardingData.resumeName)
      setResume(dummyFile)
    }
  }, [onboardingData.country, onboardingData.phone, onboardingData.resumeName])

  // Format phone number based on country
  const formatPhoneNumber = (value: string, countryData: any) => {
    if (!countryData || !countryData.format) return value

    // Remove all non-digit characters except the country code
    const digitsOnly = value.replace(/[^\d+]/g, "")

    // If the number doesn't start with the country code, add it
    let formattedNumber = digitsOnly
    if (!formattedNumber.startsWith(countryData.phoneCode)) {
      // Remove any existing + or country code at the start
      const cleanNumber = formattedNumber.replace(/^\+?[\d]*/, "")
      formattedNumber = countryData.phoneCode + cleanNumber
    }

    // Apply the format pattern
    const format = countryData.format
    let formatted = countryData.phoneCode + " "
    const numberPart = formattedNumber.substring(countryData.phoneCode.length)

    // Apply formatting based on the format pattern
    let numberIndex = 0
    for (let i = 0; i < format.length && numberIndex < numberPart.length; i++) {
      const char = format[i]
      if (char === "X") {
        formatted += numberPart[numberIndex]
        numberIndex++
      } else if (char !== "X" && numberIndex > 0) {
        formatted += char
      }
    }

    return formatted
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // If a country is selected, format the phone number
    if (selectedCountryData) {
      // Allow user to type freely but format automatically
      const formattedValue = formatPhoneNumber(value, selectedCountryData)
      setPhone(formattedValue)
    } else {
      // If no country selected, allow free input
      setPhone(value)
    }

    // Validation
    if (value.trim() === "") {
      setPhoneError("")
    } else if (value.length < 7) {
      setPhoneError("Phone number should be at least 7 digits")
    } else if (value.length > 20) {
      setPhoneError("Phone number should not exceed 20 characters")
    } else {
      setPhoneError("")
    }
  }

  const handleCountryChange = (value: string) => {
    console.log("Country changed to:", value)
    setCountry(value)

    // Find the selected country data
    const countryData = countries.find((c) => c.name === value)
    setSelectedCountryData(countryData)

    // Clear the existing phone number and start fresh with new country code
    if (countryData) {
      setPhone(countryData.phoneCode + " ")
    } else {
      setPhone("")
    }

    // Clear any phone validation errors
    setPhoneError("")
  }

  // File upload API handler
  const handleFileUpload = async (file: File) => {
    if (!file) {
      errorToast("Please upload a file.")
      return
    }

    setIsUploading(true)

    const fullUrl = `${BASE_URL}${API_ENDPOINTS.FileUpload}`
    console.log("File upload URL:", fullUrl)

    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch(fullUrl, {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "File upload failed!")
      }

      const data = await response.json()
      console.log("File upload response:", data)

      if (data.success && data.files && data.files.length > 0) {
        const fileUrlPath = data.files[0].urlPath
        console.log("File URL Path:", fileUrlPath)

        setFileResponse({ urlPath: fileUrlPath })
        localStorage.setItem("resumeUrlPath", fileUrlPath)

        setOnboardingData((prev: any) => ({
          ...prev,
          resumeName: file.name,
          resumeData: fileUrlPath,
          resumeType: file.type
        }))

        successToast("File uploaded successfully!")
      } else {
        errorToast(data.message || "File upload failed!")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      errorToast(
        error instanceof Error ? error.message : "Error uploading file."
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting || isUploading) return

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setResume(file)

      await handleFileUpload(file)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting || isUploading) return

    setIsSubmitting(true)

    try {
      console.log("Saving country:", country)
      setOnboardingData((prev: any) => ({
        ...prev,
        country: country,
        phone: phone
      }))
      onNextStep(3)
    } catch (err) {
      console.error("Step 10 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="w-full mb-4">
        <ProgressBar step={10} />
      </div>
      <FormHeading
        whiteText="Enter your desired "
        yellowText="location!"
        className="mb-10"
      />
      <FormCardLayout>
        <form
          className="w-full max-w-2xl p-6 sm:p-10 space-y-8"
          onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Location */}
            <div>
              <label className="text-white block mb-2">Location</label>
              <Select value={country} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-full text-white">
                  <SelectValue placeholder="Select a Country" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {countries.map((c) => (
                    <SelectItem
                      key={c.code}
                      value={c.name}
                      className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-gray-400 text-sm">
                          ({c.phoneCode})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-white block mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder={
                    selectedCountryData
                      ? `${
                          selectedCountryData.phoneCode
                        } ${selectedCountryData.format.replace(/X/g, "0")}`
                      : "Enter phone number"
                  }
                  className="w-full p-3 bg-transparent border-2 border-brand-bgBlue-form-input-border text-white rounded-lg focus:outline-none focus:border-brand-purple placeholder:text-gray-400"
                />
                {selectedCountryData && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                    {selectedCountryData.format}
                  </div>
                )}
              </div>
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
              {selectedCountryData && (
                <p className="text-xs text-gray-400 mt-1">
                  Format: {selectedCountryData.phoneCode}{" "}
                  {selectedCountryData.format}
                </p>
              )}
            </div>

            {/* Resume Upload */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="text-white text-sm">Resume (Optional)</label>
                <Info className="w-3 h-3 text-yellow-400" />
              </div>
              <label className="inline-block hover:scale-105 transition-all duration-300">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeChange}
                  disabled={isUploading}
                />
                <span
                  className={`bg-white text-black text-sm px-2 py-1 rounded cursor-pointer font-medium border border-gray-300 hover:bg-gray-100 hover:scale-105 transition-all duration-300 ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}>
                  {isUploading ? "⏳ Uploading..." : "+ Upload Resume"}
                </span>
                {resume && !isUploading && (
                  <span className="ml-3 text-white text-sm">
                    ✅ {resume.name}
                  </span>
                )}
                {isUploading && (
                  <span className="ml-3 text-yellow-400 text-sm">
                    Uploading resume...
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="w-full flex justify-end mt-4">
            <StepNavigation
              currentStep={10}
              onNext={handleSubmit}
              onPrevious={onPreviousStep}
              isLoading={isSubmitting || isUploading}
              disabled={isSubmitting || isUploading || !country}
            />
          </div>
        </form>
      </FormCardLayout>
    </div>
  )
}

export default StepTen
