// import React, { useState, useEffect } from "react"
// import DashBoardLayout from "../../dashboardLayout"
// import { FaCamera } from "react-icons/fa"
// import profilePic from "../../assets/profilePic.svg"
// import SimpleInputField from "../../components/SimpleInputFields"
// import Button from "../../components/Button"
// import { RiDeleteBin6Line } from "react-icons/ri"
// import DeleteAccountModal from "../../components/Modals/DeleteAccountModal"
// import { useNavigate } from "react-router-dom"
// import API_ENDPOINTS from "../../api/endpoints"
// import { successToast, errorToast } from "../../components/Toast"
// import CircularIndeterminate from "../../components/loader/circular"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// const PersonalProfile = () => {
//   const [imageSrc, setImageSrc] = useState(null)
//   const [imageResponse, setImageResponse] = useState(null)
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [email, setEmail] = useState("")
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const [isSuperUser, setIsSuperUser] = useState(false)

//   const Navigate = useNavigate()

//   // 🖼 Handle image selection and immediate upload
//   const handleImageChange = async (e) => {
//     const file = e.target.files[0]
//     if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
//       setImageSrc(URL.createObjectURL(file))
//       await handleImageUpload(file)
//     } else {
//       alert("Please select a valid JPG or PNG image.")
//     }
//   }

//   // 📤 Upload image to server
//   const handleImageUpload = async (file) => {
//     if (!file) return errorToast("Please upload a file.")
//     setLoading(true)

//     try {
//       const formData = new FormData()
//       formData.append("files", file)

//       const response = await fetch(`${BASE_URL}${API_ENDPOINTS.FileUpload}`, {
//         method: "POST",
//         body: formData
//       })

//       const data = await response.json()
//       if (!response.ok) throw new Error(data.message || "Upload failed.")

//       if (data.success && data.files?.length > 0) {
//         const imageUrlPath = data.files[0].urlPath
//         setImageResponse({ urlPath: imageUrlPath })
//         localStorage.setItem("profileImageUrlPath", imageUrlPath)
//         successToast("Image uploaded successfully!")
//       } else {
//         errorToast(data.message || "Image upload failed.")
//       }
//     } catch (err) {
//       console.error("Upload error:", err)
//       errorToast(err.message || "Error uploading image.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // 📤 Save profile info
//   const handleSubmit = async () => {
//     if (!firstName.trim() || !lastName.trim()) {
//       return errorToast("Please fill in your name.")
//     }

//     const token = localStorage.getItem("access_token")
//     if (!token) return errorToast("Authentication error. Please log in again.")

//     setLoading(true)
//     try {
//       const profileData = {
//         firstName,
//         lastName,
//         imageUrl: imageResponse?.urlPath || null
//       }

//       const response = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.UpdateProfile}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({ data: profileData }) // <--- Wrap in { data: ... }
//         }
//       )

//       const result = await response.json()
//       if (!response.ok) throw new Error(result.message)

//       // Update localStorage
//       const updatedUser = {
//         ...JSON.parse(localStorage.getItem("user_data") || "{}"),
//         ...profileData
//       }
//       localStorage.setItem("user_data", JSON.stringify(updatedUser))
//       window.dispatchEvent(new Event("userDataUpdated"))
//       successToast("Profile updated successfully!")
//     } catch (err) {
//       console.error("Profile update error:", err)
//       errorToast(err.message || "Failed to update profile.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDelete = () => Navigate("/accountcancelation")
//   const handleConfirmDelete = () => setIsDeleteModalOpen(false)

//   // 🧠 On mount: load user data
//   useEffect(() => {
//     const storedUserData = localStorage.getItem("user_data")
//     const savedImageUrl = localStorage.getItem("profileImageUrlPath")

//     if (storedUserData) {
//       try {
//         const user = JSON.parse(storedUserData)
//         if (user.firstName && user.lastName) {
//           setFirstName(user.firstName)
//           setLastName(user.lastName)
//         } else if (user.fullName) {
//           const parts = user.fullName.trim().split(" ")
//           setFirstName(parts[0] || "")
//           setLastName(parts.slice(1).join(" ") || "")
//         }
//         setEmail(user.email || "")
//         setImageSrc(user.imageUrl || "")
//         setIsSuperUser(user.email == "techoneoutsourcingng@gmail.com")
//       } catch (err) {
//         console.error("Failed to parse local user data:", err)
//       }
//     }

//     if (savedImageUrl) setImageResponse({ urlPath: savedImageUrl })
//   }, [])

//   const triggerFileSelect = () => document.getElementById("fileInput").click()

//   return (
//     <DashBoardLayout>
//       {loading && (
//         <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-70 flex justify-center items-center text-white">
//           <CircularIndeterminate />
//         </div>
//       )}
//       <div className="bg-almostBlack w-full h-screen md:h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
//         <div className="w-full p-5 md:px-20 py-10">
//           {/* Image Upload Section */}
//           <div className="w-full border border-customGray bg-inputBackGround p-5 md:p-16 flex flex-col items-center">
//             <div className="relative mb-4">
//               <div className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-gray-300 flex justify-center items-center overflow-hidden">
//                 <img
//                   src={imageSrc || profilePic}
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                   loading="lazy"
//                 />
//               </div>
//               <div
//                 className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md cursor-pointer"
//                 onClick={triggerFileSelect}>
//                 <FaCamera className="w-3 h-3 md:w-5 md:h-5 text-gray-600" />
//               </div>
//               <input
//                 type="file"
//                 id="fileInput"
//                 accept="image/jpeg, image/png"
//                 onChange={handleImageChange}
//                 style={{ display: "none" }}
//               />
//             </div>
//             <p className="text-primary text-lg md:text-2xl font-semibold text-center">
//               Edit Profile Picture
//             </p>
//           </div>

//           {/* Personal Info Header */}
//           <div className="items-center justify-start w-full flex py-7">
//             <p className="text-xl font-normal border-b-2 border-purple pb-1">
//               Personal Information
//             </p>
//           </div>

//           {/* Input Fields */}
//           <div className="flex flex-col space-y-4 w-full">
//             <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
//               <SimpleInputField
//                 placeholder="First Name"
//                 value={firstName}
//                 onChange={(e) => setFirstName(e.target.value)}
//                 readOnly={!isSuperUser}
//                 className="w-full"
//               />
//               <SimpleInputField
//                 placeholder="Last Name"
//                 value={lastName}
//                 onChange={(e) => setLastName(e.target.value)}
//                 readOnly={!isSuperUser}
//                 className="w-full"
//               />
//             </div>
//             <SimpleInputField
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full"
//               readOnly
//             />
//           </div>

//           {/* Buttons */}
//           <div className="md:flex w-full justify-center md:justify-between items-center mt-10 md:mt-20">
//             <div className="justify-center md:justify-start w-full flex">
//               <Button
//                 onClick={handleDelete}
//                 className="p-3 px-5 text-primary font-bold bg-transparent border flex gap-2 items-center border-purpleBorder rounded-full hover:border-dangerBorder hover:text-danger transition"
//                 disabled={loading}>
//                 Delete Account <RiDeleteBin6Line />
//               </Button>
//             </div>
//             <div className="flex space-x-4 mt-10 md:mt-0 justify-center">
//               <Button
//                 onClick={() => Navigate(-1)}
//                 className="p-3 px-8 bg-none border border-purpleBorder text-primary rounded-full hover:bg-purpleBackground transition"
//                 disabled={loading}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleSubmit}
//                 className="p-3 px-10 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
//                 disabled={loading}>
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Delete Modal */}
//       <DeleteAccountModal
//         isOpen={isDeleteModalOpen}
//         onClose={() => setIsDeleteModalOpen(false)}
//         onConfirm={handleConfirmDelete}
//       />
//     </DashBoardLayout>
//   )
// }

// export default PersonalProfile

import React, { useState, useEffect } from "react"
import DashBoardLayout from "../../dashboardLayout"
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa"
import profilePic from "../../assets/profilePic.svg"
import SimpleInputField from "../../components/SimpleInputFields"
import Button from "../../components/Button"
import { RiDeleteBin6Line } from "react-icons/ri"
import { IoMdClose } from "react-icons/io"
import DeleteAccountModal from "../../components/Modals/DeleteAccountModal"
import { useNavigate } from "react-router-dom"
import API_ENDPOINTS from "../../api/endpoints"
import { successToast, errorToast } from "../../components/Toast"
import CircularIndeterminate from "../../components/loader/circular"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// Create Password Modal Component
const ChangePasswordModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewPassword("")
      setConfirmPassword("")
      setErrors({})
    }
  }, [isOpen])

  // Password validation
  const validatePassword = (password) => {
    const errors = {}

    if (password.length < 8) {
      errors.length = "Password must be at least 8 characters long"
    }

    if (!/(?=.*[0-9])/.test(password)) {
      errors.number = "Password must contain at least 1 number"
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.capital = "Password must contain at least 1 capital letter"
    }

    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      errors.special = "Password must contain at least 1 special character"
    }

    return errors
  }

  const handlePasswordChange = (e) => {
    const password = e.target.value
    setNewPassword(password)

    if (password) {
      const validationErrors = validatePassword(password)
      setErrors((prev) => ({ ...prev, ...validationErrors }))

      // Clear errors if validation passes
      if (Object.keys(validationErrors).length === 0) {
        setErrors((prev) => {
          const { length, number, capital, special, ...rest } = prev
          return rest
        })
      }
    }
  }

  const handleConfirmPasswordChange = (e) => {
    const confirmPwd = e.target.value
    setConfirmPassword(confirmPwd)

    if (confirmPwd && newPassword && confirmPwd !== newPassword) {
      setErrors((prev) => ({ ...prev, match: "Passwords do not match" }))
    } else {
      setErrors((prev) => {
        const { match, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate password
    const passwordErrors = validatePassword(newPassword)

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      passwordErrors.match = "Passwords do not match"
    }

    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors)
      return
    }

    onSubmit(newPassword)
  }

  const isFormValid = () => {
    return (
      newPassword &&
      confirmPassword &&
      newPassword === confirmPassword &&
      Object.keys(validatePassword(newPassword)).length === 0
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1">
          <IoMdClose size={24} />
        </Button>

        {/* Modal Header */}
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
          Create Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                maxLength={20}  
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple pr-10"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                maxLength={20}  
                onChange={handleConfirmPasswordChange}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple pr-10"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-medium">Password requirements:</p>
            <ul className="space-y-1">
              <li
                className={
                  newPassword.length >= 8 ? "text-green-600" : "text-red-500"
                }>
                • At least 8 characters
              </li>
              <li className={newPassword.length <= 20 ? "text-green-600" : "text-red-500"}>
  • Maximum 20 characters
</li>
              <li
                className={
                  /(?=.*[0-9])/.test(newPassword)
                    ? "text-green-600"
                    : "text-red-500"
                }>
                • At least 1 number
              </li>
              <li
                className={
                  /(?=.*[A-Z])/.test(newPassword)
                    ? "text-green-600"
                    : "text-red-500"
                }>
                • At least 1 capital letter
              </li>
              <li
                className={
                  /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(
                    newPassword
                  )
                    ? "text-green-600"
                    : "text-red-500"
                }>
                • At least 1 special character
              </li>
              <li
                className={
                  newPassword &&
                  confirmPassword &&
                  newPassword === confirmPassword
                    ? "text-green-600"
                    : "text-red-500"
                }>
                • Passwords match
              </li>
            </ul>
          </div>

          {/* Error Messages */}
          {/* {Object.keys(errors).length > 0 && (
            <div className="text-red-500 text-sm space-y-1">
              {Object.values(errors).map((error, index) => (
                <p key={index}>• {error}</p>
              ))}
            </div>
          )} */}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`px-4 py-2 rounded-lg transition ${
                isFormValid() && !loading
                  ? "bg-gradient-to-b from-gradientStart to-gradientEnd text-white hover:bg-purple-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}>
              {loading ? "Changing..." : "Create Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PersonalProfile = () => {
  const [imageSrc, setImageSrc] = useState(null)
  const [imageResponse, setImageResponse] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [isSuperUser, setIsSuperUser] = useState(false)

  const Navigate = useNavigate()

  // 🖼 Handle image selection and immediate upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setImageSrc(URL.createObjectURL(file))
      await handleImageUpload(file)
    } else {
      alert("Please select a valid JPG or PNG image.")
    }
  }

  // 📤 Upload image to server
  const handleImageUpload = async (file) => {
    if (!file) return errorToast("Please upload a file.")
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.FileUpload}`, {
        method: "POST",
        body: formData
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Upload failed.")

      if (data.success && data.files?.length > 0) {
        const imageUrlPath = data.files[0].urlPath
        setImageResponse({ urlPath: imageUrlPath })
        localStorage.setItem("profileImageUrlPath", imageUrlPath)
        successToast("Image uploaded successfully!")
      } else {
        errorToast(data.message || "Image upload failed.")
      }
    } catch (err) {
      console.error("Upload error:", err)
      errorToast(err.message || "Error uploading image.")
    } finally {
      setLoading(false)
    }
  }

  // 📤 Save profile info
  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      return errorToast("Please fill in your name.")
    }

    const token = localStorage.getItem("access_token")
    if (!token) return errorToast("Authentication error. Please log in again.")

    setLoading(true)
    try {
      const profileData = {
        firstName,
        lastName,
        imageUrl: imageResponse?.urlPath || null
      }

      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.UpdateProfile}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ data: profileData })
        }
      )

      const result = await response.json()
      if (!response.ok) throw new Error(result.message)

      // Update localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user_data") || "{}"),
        ...profileData
      }
      localStorage.setItem("user_data", JSON.stringify(updatedUser))
      window.dispatchEvent(new Event("userDataUpdated"))
      successToast("Profile updated successfully!")
    } catch (err) {
      console.error("Profile update error:", err)
      errorToast(err.message || "Failed to update profile.")
    } finally {
      setLoading(false)
    }
  }

  // 🔐 Handle password change
  const handlePasswordChange = async (newPassword) => {
    const token = localStorage.getItem("access_token")
    if (!token) return errorToast("Authentication error. Please log in again.")

    setPasswordLoading(true)
    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.ChangePassword}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ newPassword })
        }
      )

      const result = await response.json()
      if (!response.ok)
        throw new Error(result.message || "Failed to Create Password")

      successToast("Password changed successfully!")
      setIsChangePasswordModalOpen(false)
    } catch (err) {
      console.error("Password change error:", err)
      errorToast(err.message || "Failed to Create Password.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDelete = () => Navigate("/accountcancelation")
  const handleConfirmDelete = () => setIsDeleteModalOpen(false)

  // 🧠 On mount: load user data
  useEffect(() => {
    const storedUserData = localStorage.getItem("user_data")
    const savedImageUrl = localStorage.getItem("profileImageUrlPath")

    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData)
        if (user.firstName && user.lastName) {
          setFirstName(user.firstName)
          setLastName(user.lastName)
        } else if (user.fullName) {
          const parts = user.fullName.trim().split(" ")
          setFirstName(parts[0] || "")
          setLastName(parts.slice(1).join(" ") || "")
        }
        setEmail(user.email || "")
        setImageSrc(user.imageUrl || "")
        setIsSuperUser(user.email == "techoneoutsourcingng@gmail.com")
      } catch (err) {
        console.error("Failed to parse local user data:", err)
      }
    }

    if (savedImageUrl) setImageResponse({ urlPath: savedImageUrl })
  }, [])

  const triggerFileSelect = () => document.getElementById("fileInput").click()

  return (
    <DashBoardLayout>
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-70 flex justify-center items-center text-white">
          <CircularIndeterminate />
        </div>
      )}
      <div className="bg-almostBlack w-full h-screen md:h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full p-5 md:px-20 py-10">
          {/* Image Upload Section */}
          <div className="w-full border border-customGray bg-inputBackGround p-5 md:p-16 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-gray-300 flex justify-center items-center overflow-hidden">
                <img
                  src={imageSrc || profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div
                className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md cursor-pointer"
                onClick={triggerFileSelect}>
                <FaCamera className="w-3 h-3 md:w-5 md:h-5 text-gray-600" />
              </div>
              <input
                type="file"
                id="fileInput"
                accept="image/jpeg, image/png"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
            <p className="text-primary text-lg md:text-2xl font-semibold text-center">
              Edit Profile Picture
            </p>
          </div>

          {/* Personal Info Header */}
          <div className="items-center justify-start w-full flex py-7">
            <p className="text-xl font-normal border-b-2 border-purple pb-1">
              Personal Information
            </p>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col space-y-4 w-full">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <SimpleInputField
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                // readOnly={!isSuperUser}
                className="w-full"
              />
              <SimpleInputField
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                // readOnly={!isSuperUser}
                className="w-full"
              />
            </div>
            <SimpleInputField
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              // readOnly
            />
          </div>

          {/* Create Password Button */}
          <div className="w-full flex justify-center md:justify-start mt-6">
            <Button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="p-3 px-6 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-lg hover:bg-purple-700 transition"
              disabled={loading}>
              Create Password
            </Button>
          </div>

          {/* Buttons */}
          <div className="md:flex w-full justify-center md:justify-between items-center mt-10 md:mt-20">
            <div className="justify-center md:justify-start w-full flex">
              <Button
                onClick={handleDelete}
                className="p-3 px-5 text-primary font-bold bg-transparent border flex gap-2 items-center border-purpleBorder rounded-full hover:border-dangerBorder hover:text-danger transition"
                disabled={loading}>
                Delete Account <RiDeleteBin6Line />
              </Button>
            </div>
            <div className="flex space-x-4 mt-10 md:mt-0 justify-center">
              <Button
                onClick={() => Navigate(-1)}
                className="p-3 px-8 bg-none border border-purpleBorder text-primary rounded-full hover:bg-purpleBackground transition"
                disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="p-3 px-10 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                disabled={loading}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Create Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
        loading={passwordLoading}
      />
    </DashBoardLayout>
  )
}

export default PersonalProfile
