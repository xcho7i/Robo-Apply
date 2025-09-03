// import React, { useState, useEffect } from "react"
// import { IoMdClose } from "react-icons/io"
// import FileUploader from "../../fileUploader"
// import SimpleInputField from "../../SimpleInputFields"
// import Button from "../../Button"
// import { successToast, errorToast } from "../../Toast"
// import CircularIndeterminate from "../../loader/circular"
// import API_ENDPOINTS from "../../../api/endpoints"
// import CircularProgressWithPercentage from "../../loader/CircularProgressWithPercentage"
// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// const ResumeUploadModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   resumeName: initialResumeName
// }) => {
//   const [resumeName, setResumeName] = useState(initialResumeName || "")
//   const [uploadedFile, setUploadedFile] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [fileResponse, setFileResponse] = useState(null) // State to store file upload response

//   useEffect(() => {
//     if (initialResumeName) {
//       setResumeName(initialResumeName) // Set initial resume name if provided
//     }
//   }, [initialResumeName])

//   // Handle file upload and store the file response in state
//   const handleFileUpload = async (file) => {
//     setUploadedFile(file)

//     if (!file) {
//       errorToast("Please upload a file.")
//       return
//     }

//     setLoading(true) // Show loader

//     const fullUrl = `${BASE_URL}${API_ENDPOINTS.FileUpload}`
//     console.log("+++++++++++++", fullUrl)
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
//       // console.log("File upload response:", data);

//       // Check if the response has the correct file data
//       if (data.success && data.files && data.files.length > 0) {
//         // Extract the urlPath from the response
//         const fileUrlPath = data.files[0].urlPath
//         console.log("+++++++++++", fileUrlPath)
//         // Save the file URL in the state (fileResponse)
//         setFileResponse({ urlPath: fileUrlPath })
//         localStorage.setItem("resumeUrlPath", fileUrlPath)

//         successToast("File uploaded successfully!")
//       } else {
//         errorToast(data.message || "File upload failed!")
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error)
//       errorToast(error.message || "Error uploading file.")
//     } finally {
//       setLoading(false) // Hide loader
//     }
//   }

//   // Handle form submission and send the uploaded file response to resume manager API
//   const handleSubmit = async () => {
//     if (!resumeName.trim()) {
//       errorToast("Please enter a resume name.")
//       return
//     }
//     localStorage.setItem("resumeName", resumeName)

//     if (!fileResponse) {
//       errorToast("Please upload a file to proceed.")
//       return
//     }

//     setLoading(true) // Show loader

//     const fullUrl = `${BASE_URL}${API_ENDPOINTS.ResumeManager}`

//     try {
//       const formData = {
//         // resumeName,
//         url: fileResponse.urlPath // Send the file response saved in the state
//       }

//       const response = await fetch(fullUrl, {
//         method: "POST",
//         body: JSON.stringify(formData),
//         headers: {
//           "Content-Type": "application/json"
//         }
//       })

//       const result = await response.json()
//       console.log("Resume manager response:", result)

//       if (response.ok) {
//         localStorage.setItem("resumeResponse", JSON.stringify(result))
//         successToast("Resume updated successfully!")
//         onSubmit(resumeName, fileResponse) // Pass the response data to onSubmit
//         onClose() // Close modal after successful submission
//       } else {
//         errorToast(result.message || "Failed to update resume.")
//       }
//     } catch (error) {
//       console.error("Error submitting to resume manager:", error)
//       errorToast("Error submitting to resume manager.")
//     } finally {
//       setLoading(false) // Hide loader
//     }
//   }

//   if (!isOpen) return null // Modal is not rendered if it's not open

//   return (
//     <div
//       id="modal-container"
//       className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
//       onClick={(event) => event.target.id === "modal-container" && onClose()} // Close if clicked outside
//     >
//       <div className="bg-modalPurple rounded-lg px-5 py-3 md:px-10 md:py-7 w-full max-w-[80%] md:max-w-[40%] relative border">
//         <Button
//           onClick={onClose}
//           className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
//           <IoMdClose size={24} />
//         </Button>
//         <div className="flex justify-between items-center mb-7 md:mb-14">
//           <h2 className="text-base md:text-2xl font-semibold text-primary">
//             {initialResumeName ? "Replace Resume" : "Upload Resume / CV"}
//           </h2>
//         </div>

//         {/* Resume Name Input Field */}
//         <SimpleInputField
//           placeholder="Enter Resume Name"
//           value={resumeName}
//           onChange={(e) => setResumeName(e.target.value)}
//           readOnly={!!initialResumeName} // Make read-only if replacing
//         />

//         <div className="flex justify-start text-base md:text-lg items-center my-4 md:my-8 mx-4 space-x-10">
//           <p className="text-primary">Upload Your Resume/CV</p>
//         </div>

//         {/* File Uploader */}
//         <div className="w-full px-0">
//           <FileUploader
//             onFileUpload={handleFileUpload}
//             resetFile={uploadedFile === null}
//           />
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-center items-center mt-6">
//           {loading ? (
//             // <CircularIndeterminate />
//             <CircularProgressWithPercentage />
//           ) : (
//             <Button
//               onClick={handleSubmit}
//               className="p-3 flex items-center text-center justify-center space-x-2 w-full text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//               {initialResumeName ? "Replace Now" : "Create Now"}
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ResumeUploadModal

import React, { useState, useEffect } from "react"
import { IoMdClose } from "react-icons/io"
import FileUploader from "../../fileUploader"
import SimpleInputField from "../../SimpleInputFields"
import Button from "../../Button"
import { successToast, errorToast } from "../../Toast"
import CircularIndeterminate from "../../loader/circular"
import API_ENDPOINTS from "../../../api/endpoints"
import CircularProgressWithPercentage from "../../loader/CircularProgressWithPercentage"
const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const ResumeUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  resumeName: initialResumeName
}) => {
  const [resumeName, setResumeName] = useState(initialResumeName || "")
  const [jobTitle, setJobTitle] = useState("") // Add job title state
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fileResponse, setFileResponse] = useState(null) // State to store file upload response

  useEffect(() => {
    if (initialResumeName) {
      setResumeName(initialResumeName) // Set initial resume name if provided
    }

    // Load job title from localStorage if available
    // const savedJobTitle = localStorage.getItem("jobTitle")
    // if (savedJobTitle) {
    //   setJobTitle(savedJobTitle)
    // }
  }, [initialResumeName])

  // Handle file upload and store the file response in state
  const handleFileUpload = async (file) => {
    setUploadedFile(file)

    if (!file) {
      errorToast("Please upload a file.")
      return
    }

    setLoading(true) // Show loader

    const fullUrl = `${BASE_URL}${API_ENDPOINTS.FileUpload}`
    console.log("+++++++++++++", fullUrl)
    try {
      const formData = new FormData()
      formData.append("files", file) // Use 'files' as the key

      const response = await fetch(fullUrl, {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "File upload failed!")
      }

      const data = await response.json()
      // console.log("File upload response:", data);

      // Check if the response has the correct file data
      if (data.success && data.files && data.files.length > 0) {
        // Extract the urlPath from the response
        const fileUrlPath = data.files[0].urlPath
        console.log("+++++++++++", fileUrlPath)
        // Save the file URL in the state (fileResponse)
        setFileResponse({ urlPath: fileUrlPath })
        localStorage.setItem("resumeUrlPath", fileUrlPath)

        successToast("File uploaded successfully!")
      } else {
        errorToast(data.message || "File upload failed!")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      errorToast(error.message || "Error uploading file.")
    } finally {
      setLoading(false) // Hide loader
    }
  }

  // Handle form submission and send the uploaded file response to resume manager API
  const handleSubmit = async () => {
    if (!resumeName.trim()) {
      errorToast("Please enter a resume name.")
      return
    }

    if (!jobTitle.trim()) {
      errorToast("Please enter a job title.")
      return
    }

    // Save both resume name and job title to localStorage
    localStorage.setItem("resumeName", resumeName)
    localStorage.setItem("jobTitle", jobTitle)

    if (!fileResponse) {
      errorToast("Please upload a file to proceed.")
      return
    }

    setLoading(true) // Show loader

    const fullUrl = `${BASE_URL}${API_ENDPOINTS.ResumeManager}`

    try {
      const formData = {
        // resumeName,
        url: fileResponse.urlPath // Send the file response saved in the state
      }

      const response = await fetch(fullUrl, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json"
        }
      })

      const result = await response.json()
      console.log("Resume manager response:", result)

      if (response.ok) {
        localStorage.setItem("resumeResponse", JSON.stringify(result))
        successToast("Resume updated successfully!")
        onSubmit(resumeName, fileResponse) // Pass the response data to onSubmit
        onClose() // Close modal after successful submission
      } else {
        errorToast(result.message || "Failed to update resume.")
      }
    } catch (error) {
      console.error("Error submitting to resume manager:", error)
      errorToast("Error submitting to resume manager.")
    } finally {
      setLoading(false) // Hide loader
    }
  }

  if (!isOpen) return null // Modal is not rendered if it's not open

  return (
    <div
      id="modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(event) => event.target.id === "modal-container" && onClose()} // Close if clicked outside
    >
      <div className="bg-modalPurple rounded-lg px-5 py-3 md:px-10 md:py-7 w-full max-w-[80%] md:max-w-[40%] relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
          <IoMdClose size={24} />
        </Button>
        <div className="flex justify-between items-center mb-7 md:mb-14">
          <h2 className="text-base md:text-2xl font-semibold text-primary">
            {initialResumeName ? "Replace Resume" : "Upload Resume / CV"}
          </h2>
        </div>

        {/* Resume Name Input Field */}
        <SimpleInputField
          placeholder="Enter Resume Name"
          value={resumeName}
          onChange={(e) => setResumeName(e.target.value)}
          readOnly={!!initialResumeName} // Make read-only if replacing
          className="mb-4"
        />

        {/* Job Title Input Field */}
        <SimpleInputField
          placeholder="Enter Job Title (e.g., Software Engineer)"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="mb-4"
        />

        <div className="flex justify-start text-base md:text-lg items-center my-4 md:my-8 mx-4 space-x-10">
          <p className="text-primary">Upload Your Resume/CV</p>
        </div>

        {/* File Uploader */}
        <div className="w-full px-0">
          <FileUploader
            onFileUpload={handleFileUpload}
            resetFile={uploadedFile === null}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center items-center mt-6">
          {loading ? (
            // <CircularIndeterminate />
            <CircularProgressWithPercentage />
          ) : (
            <Button
              onClick={handleSubmit}
              className="p-3 flex items-center text-center justify-center space-x-2 w-full text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
              {initialResumeName ? "Replace Now" : "Create Now"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeUploadModal
