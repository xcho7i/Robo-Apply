// import React, { useRef, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import Button from "../../../components/Button"
// import DashboardNavbar from "../../../dashboardNavbar"
// import { HiArrowLeft } from "react-icons/hi"
// import { IoIosArrowBack } from "react-icons/io"
// import { IoIosArrowForward } from "react-icons/io"

// import Slider from "react-slick"

// import basicModern from "../../../assets/resumeBuilder/basicModern.png"
// import classicProfessional from "../../../assets/resumeBuilder/classicProfessional.png"
// import modernProfessional from "../../../assets/resumeBuilder/modernProfessional.png"
// import creative from "../../../assets/resumeBuilder/Creative.jpg"
// import classic from "../../../assets/resumeBuilder/Classic.jpg"

// import "slick-carousel/slick/slick.css"
// import "slick-carousel/slick/slick-theme.css"

// import CircularIndeterminate from "../../../components/loader/circular"
// import API_ENDPOINTS from "../../../api/endpoints"
// import { successToast, errorToast } from "../../../components/Toast"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// const ChooseTemplateCreateResume = () => {
//   const navigate = useNavigate()
//   const sliderRef = useRef(null) // Reference for the slider
//   const [loading, setLoading] = useState(false)

//   const handleTemplateClick = (template) => {
//     setLoading(true)

//     // Save to localStorage
//     localStorage.setItem("selectedTemplate", template)

//     // Get all necessary stored data
//     const resumeId = localStorage.getItem("ResumeBuilder-Id")
//     const accessToken = localStorage.getItem("access_token")
//     const resumeTitle = localStorage.getItem("resumeTitle")

//     const personalData = JSON.parse(
//       localStorage.getItem("resumeBuilderPersonalData") || "{}"
//     )
//     const experiencesData = JSON.parse(
//       localStorage.getItem("resumeBuilderExperiences") || "[]"
//     )
//     const qualificationsData = JSON.parse(
//       localStorage.getItem("resumeBuilderQualifications") || "[]"
//     )
//     const storedSkills = JSON.parse(
//       localStorage.getItem("resumeBuilderSkills") || "[]"
//     )
//     const storedAchievements = JSON.parse(
//       localStorage.getItem("resumeBuilderAchievements") || "[]"
//     )
//     const storedLanguages = JSON.parse(
//       localStorage.getItem("resumeBuilderLanguages") || "[]"
//     )
//     const storedCertifications = JSON.parse(
//       localStorage.getItem("resumeBuilderCertifications") || "[]"
//     )

//     // Get selected template again as a string (just in case)
//     const selectedTemplate =
//       localStorage.getItem("selectedTemplate") || template

//     if (!resumeId || !accessToken) {
//       errorToast("Missing resume ID or access token")
//       setLoading(false)
//       return
//     }

//     // Format experiences
//     const formattedExperiences = experiencesData.map((exp) => ({
//       ...exp,
//       endDate: exp.endDate === "Present" ? null : exp.endDate
//     }))

//     // Merge all data, ensuring selectedTemplate is added
//     const mergedData = {
//       ...personalData,
//       experiences: formattedExperiences,
//       qualifications: qualificationsData,
//       skills: storedSkills,
//       achievements: storedAchievements,
//       languages: storedLanguages,
//       certifications: storedCertifications,
//       selectedTemplate: selectedTemplate // Explicitly include this
//     }

//     const finalFormData = {
//       resumeTitle,
//       ...mergedData
//     }

//     console.log("✅ Final payload with selectedTemplate:", finalFormData)

//     const updateUrl = `${BASE_URL}${API_ENDPOINTS.UpdateResumeBuilder}/${resumeId}`

//     fetch(updateUrl, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(finalFormData)
//     })
//       .then((res) => res.json())
//       .then((responseData) => {
//         console.log("Resume updated with template:", responseData)

//         if (responseData.success) {
//           successToast("Template selected and resume updated!")
//           navigate("/scan-resume/showResume")
//         } else {
//           errorToast("Failed to update template selection.")
//         }
//       })
//       .catch((error) => {
//         console.error("Error updating template:", error)
//         errorToast("Something went wrong while selecting template.")
//       })
//       .finally(() => {
//         setLoading(false)
//       })
//   }

//   const handleResetResume = async () => {
//     setLoading(true)

//     const userId = localStorage.getItem("ResumeBuilder-Id")
//     const accessToken = localStorage.getItem("access_token")

//     if (!userId || !accessToken) {
//       errorToast("Missing resume ID or access token.")
//       setLoading(false)
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
//       setLoading(false)
//     }
//   }

//   // Slider settings
//   const sliderSettings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: false,
//     autoplaySpeed: 3000,
//     arrows: false // Hide default arrows
//   }

//   // Templates data
//   const templates = [
//     {
//       name: "Basic Modern",
//       img: basicModern,
//       key: "basic"
//     },
//     {
//       name: "Classical Professional",
//       img: classicProfessional,
//       key: "classical"
//     },
//     {
//       name: "Modern Professional",
//       img: modernProfessional,
//       key: "modern"
//     },
//     {
//       name: "Creative",
//       img: creative,
//       key: "creative"
//     },
//     {
//       name: "Classic",
//       img: classic,
//       key: "classic"
//     }
//   ]

//   return (
//     <>
//       {loading ? (
//         <div className="flex items-center justify-center h-screen">
//           <CircularIndeterminate />
//         </div>
//       ) : (
//         <div className="flex flex-col bg-almostBlack">
//           <header>
//             <DashboardNavbar />
//           </header>

//           <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
//             <div className="w-full">
//               <div className="w-full px-3 md:px-10 py-5 md:py-10">
//                 <div className="flex items-center justify-between md:px-10 lg:px-20">
//                   <p className="text-primary text-lg md:text-3xl font-medium">
//                     AI ResumeBuilder
//                   </p>
//                   <Button
//                     onClick={() => navigate("/scan-resume/addAdditional")}
//                     className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//                     <HiArrowLeft className="mr-2" />
//                     Go Back
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex items-center justify-center h-full">
//                 <div className=" px-5 lg:px-10 w-full rounded-lg text-center space-y-5">
//                   <p className="text-primary text-lg lg:text-4xl font-medium">
//                     Choose one of our ATS - friendly resume templates.
//                   </p>
//                   <p className="text-primary text-base md:text-2xl font-normal pt-2 pb-5">
//                     You can always change it later.
//                   </p>

//                   {/* Slider for small screens */}
//                   <div className="block lg:hidden">
//                     <Slider ref={sliderRef} {...sliderSettings}>
//                       {templates.map((template) => (
//                         <div
//                           key={template.key}
//                           onClick={() => handleTemplateClick(template.key)}
//                           className="p-3 bg-resumeTemplateBackground items-center text-center justify-center hover:cursor-pointer">
//                           <img
//                             src={template.img}
//                             alt={template.name}
//                             loading="lazy"
//                           />
//                           <p className="text-primary text-xl font-normal pt-5 whitespace-nowrap">
//                             {template.name}
//                           </p>
//                         </div>
//                       ))}
//                     </Slider>

//                     {/* Navigation Buttons */}
//                     <div className="flex justify-center space-x-3 pt-5">
//                       <Button
//                         onClick={() => sliderRef.current.slickPrev()}
//                         className="px-2 py-2 text-navbar font-semibold rounded-lg bg-inputBackGround">
//                         <IoIosArrowBack />
//                       </Button>
//                       <Button
//                         onClick={() => sliderRef.current.slickNext()}
//                         className="px-2 py-2 text-navbar font-semibold rounded-lg bg-inputBackGround">
//                         <IoIosArrowForward />
//                       </Button>
//                     </div>
//                   </div>

//                   {/* Grid for large screens */}
//                   <div className="hidden lg:flex space-x-10 items-center justify-center">
//                     {templates.map((template) => (
//                       <div
//                         key={template.key}
//                         onClick={() => handleTemplateClick(template.key)}
//                         className="p-3 bg-resumeTemplateBackground  items-center text-center justify-center hover:cursor-pointer">
//                         <img
//                           src={template.img}
//                           alt={template.name}
//                           loading="lazy"
//                         />
//                         <p className="text-primary text-xl font-normal pt-5 whitespace-nowrap">
//                           {template.name}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center p-3 md:p-10 justify-center h-full space-x-3 md:space-x-10">
//                 <Button
//                   // onClick={() => navigate("/scan-resume")}
//                   onClick={handleResetResume}
//                   className="p-3 flex items-center space-x-2 whitespace-nowrap w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//                   Reset resume & start over
//                 </Button>
//                 {/* <Button className="p-3 px-3 flex items-center space-x-2 w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
//               Continue
//             </Button> */}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// export default ChooseTemplateCreateResume

import React, { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../../components/Button"
import DashboardNavbar from "../../../dashboardNavbar"
import { HiArrowLeft } from "react-icons/hi"
import { IoIosArrowBack } from "react-icons/io"
import { IoIosArrowForward } from "react-icons/io"

import Slider from "react-slick"

import basicModern from "../../../assets/resumeBuilder/basicModern.png"
import classicProfessional from "../../../assets/resumeBuilder/classicProfessional.png"
import modernProfessional from "../../../assets/resumeBuilder/modernProfessional.png"
import creative from "../../../assets/resumeBuilder/Creative.jpg"
import classic from "../../../assets/resumeBuilder/Classic.jpg"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

import CircularIndeterminate from "../../../components/loader/circular"
import API_ENDPOINTS from "../../../api/endpoints"
import { successToast, errorToast } from "../../../components/Toast"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// Custom styles for white dots
const sliderCustomStyles = `
  .slick-dots li button:before {
    color: white !important;
    font-size: 12px !important;
    opacity: 0.7 !important;
  }
  
  .slick-dots li.slick-active button:before {
    color: white !important;
    opacity: 1 !important;
  }
  
  .slick-dots {
    bottom: -45px !important;
  }
`

const ChooseTemplateCreateResume = () => {
  const navigate = useNavigate()
  const sliderRef = useRef(null) // Reference for the slider
  const [loading, setLoading] = useState(false)

  const handleTemplateClick = (template) => {
    setLoading(true)

    // Save to localStorage
    localStorage.setItem("selectedTemplate", template)

    // Get all necessary stored data
    const resumeId = localStorage.getItem("ResumeBuilder-Id")
    const accessToken = localStorage.getItem("access_token")
    const resumeTitle = localStorage.getItem("resumeTitle")

    const personalData = JSON.parse(
      localStorage.getItem("resumeBuilderPersonalData") || "{}"
    )
    const experiencesData = JSON.parse(
      localStorage.getItem("resumeBuilderExperiences") || "[]"
    )
    const qualificationsData = JSON.parse(
      localStorage.getItem("resumeBuilderQualifications") || "[]"
    )
    const storedSkills = JSON.parse(
      localStorage.getItem("resumeBuilderSkills") || "[]"
    )
    const storedAchievements = JSON.parse(
      localStorage.getItem("resumeBuilderAchievements") || "[]"
    )
    const storedLanguages = JSON.parse(
      localStorage.getItem("resumeBuilderLanguages") || "[]"
    )
    const storedCertifications = JSON.parse(
      localStorage.getItem("resumeBuilderCertifications") || "[]"
    )

    // Get selected template again as a string (just in case)
    const selectedTemplate =
      localStorage.getItem("selectedTemplate") || template

    if (!resumeId || !accessToken) {
      errorToast("Missing resume ID or access token")
      setLoading(false)
      return
    }

    // Format experiences
    const formattedExperiences = experiencesData.map((exp) => ({
      ...exp,
      endDate: exp.endDate === "Present" ? null : exp.endDate
    }))

    // Merge all data, ensuring selectedTemplate is added
    const mergedData = {
      ...personalData,
      experiences: formattedExperiences,
      qualifications: qualificationsData,
      skills: storedSkills,
      achievements: storedAchievements,
      languages: storedLanguages,
      certifications: storedCertifications,
      selectedTemplate: selectedTemplate // Explicitly include this
    }

    const finalFormData = {
      resumeTitle,
      ...mergedData
    }

    console.log("✅ Final payload with selectedTemplate:", finalFormData)

    const updateUrl = `${BASE_URL}${API_ENDPOINTS.UpdateResumeBuilder}/${resumeId}`

    fetch(updateUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(finalFormData)
    })
      .then((res) => res.json())
      .then((responseData) => {
        console.log("Resume updated with template:", responseData)

        if (responseData.success) {
          successToast("Template selected and resume updated!")
          navigate("/scan-resume/showResume")
        } else {
          errorToast("Failed to update template selection.")
        }
      })
      .catch((error) => {
        console.error("Error updating template:", error)
        errorToast("Something went wrong while selecting template.")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleResetResume = async () => {
    setLoading(true)

    const userId = localStorage.getItem("ResumeBuilder-Id")
    const accessToken = localStorage.getItem("access_token")

    if (!userId || !accessToken) {
      errorToast("Missing resume ID or access token.")
      setLoading(false)
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
      setLoading(false)
    }
  }

  // Responsive slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Default for large screens
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: true, // Hide default arrows
    responsive: [
      {
        breakpoint: 1024, // lg breakpoint in Tailwind (1024px)
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768, // md breakpoint
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 640, // sm breakpoint
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }

  // Templates data
  const templates = [
    {
      name: "Basic Modern",
      img: basicModern,
      key: "basic"
    },
    {
      name: "Classical Professional",
      img: classicProfessional,
      key: "classical"
    },
    {
      name: "Modern Professional",
      img: modernProfessional,
      key: "modern"
    },
    {
      name: "Creative",
      img: creative,
      key: "creative"
    },
    {
      name: "Classic",
      img: classic,
      key: "classic"
    }
  ]

  return (
    <>
      <style>{sliderCustomStyles}</style>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <CircularIndeterminate />
        </div>
      ) : (
        <div className="flex flex-col bg-almostBlack h-screen">
          <header>
            <DashboardNavbar />
          </header>

          <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
            <div className="w-full">
              <div className="w-full px-3 md:px-10 py-5 md:py-10">
                <div className="flex items-center justify-between md:px-10 lg:px-20">
                  <p className="text-primary text-lg md:text-3xl font-medium">
                    AI ResumeBuilder
                  </p>
                  <Button
                    onClick={() => navigate("/scan-resume/addAdditional")}
                    className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                    <HiArrowLeft className="mr-2" />
                    Go Back
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center h-full">
                <div className="px-5 lg:px-10 w-full rounded-lg text-center space-y-5">
                  <p className="text-primary text-lg lg:text-4xl font-medium">
                    Choose one of our ATS - friendly resume templates.
                  </p>
                  <p className="text-primary text-base md:text-2xl font-normal pt-2 pb-5">
                    You can always change it later.
                  </p>

                  {/* Responsive Slider for all screen sizes */}
                  <div className="w-full max-w-7xl mx-auto">
                    <Slider ref={sliderRef} {...sliderSettings}>
                      {templates.map((template) => (
                        <div key={template.key} className="px-2">
                          <div
                            onClick={() => handleTemplateClick(template.key)}
                            className="p-3  items-center text-center justify-center hover:cursor-pointer transition-transform hover:scale-105">
                            <div className="flex justify-center mb-4">
                              <img
                                src={template.img}
                                alt={template.name}
                                loading="lazy"
                                className="w-48 h-64 sm:w-56 sm:h-72 lg:w-full lg:h-[50%] object-contain rounded-lg shadow-lg"
                              />
                            </div>
                            <p className="text-primary text-lg lg:text-xl font-normal whitespace-nowrap">
                              {template.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </Slider>

                    {/* Navigation Buttons */}
                    {/* <div className="flex justify-center space-x-3 pt-5">
                      <Button
                        onClick={() => sliderRef.current.slickPrev()}
                        className="px-3 py-2 text-navbar font-semibold rounded-lg bg-inputBackGround hover:bg-opacity-80 transition-all">
                        <IoIosArrowBack className="text-xl" />
                      </Button>
                      <Button
                        onClick={() => sliderRef.current.slickNext()}
                        className="px-3 py-2 text-navbar font-semibold rounded-lg bg-inputBackGround hover:bg-opacity-80 transition-all">
                        <IoIosArrowForward className="text-xl" />
                      </Button>
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 md:p-10 mt-10 justify-center h-full space-x-3 md:space-x-10">
                <Button
                  onClick={handleResetResume}
                  className="p-3 flex items-center space-x-2 whitespace-nowrap w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                  Reset resume & start over
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChooseTemplateCreateResume
