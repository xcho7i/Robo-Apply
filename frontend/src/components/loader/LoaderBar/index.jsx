// import React from "react"

// const LoaderBar = () => {
//   return (
//     <div className="flex flex-col items-center justify-center">
//       <p className="text-primary text-2xl md:text-4xl font-medium text-center">
//         Uploading Resume
//       </p>
//       <p className="text-lightGrey text-2xl text-center pt-7 pb-5">
//         Fetching information ....
//       </p>
//       {/* Loader Bar */}
//       <div className="w-full h-2 bg-gray-200 rounded-full">
//         <div className="h-full bg-gradient-to-r from-gradientStart to-gradientEnd animate-pulse rounded-full"></div>
//       </div>
//     </div>
//   )
// }

// export default LoaderBar
import React, { useState, useEffect } from "react"

const LoaderBar = () => {
  const loadingMessages = [
    "Loading your selected layout and structure…",
    "Adding your personal and contact information…",
    "Organizing your work experience and achievements…",
    "Fitting in your skills, education, and certifications…",
    "Almost done—finalizing your information!"
  ]

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(1) // start at 1%

  useEffect(() => {
    const totalSteps = loadingMessages.length
    const stepPercent = 100 / totalSteps

    // Update progress gradually until it reaches 99
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 99) {
          return prev + 1
        } else {
          clearInterval(interval)
          return prev
        }
      })
    }, 100) // update every 0.1s for smooth animation

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Change messages according to step
    const stepDuration = 99 / loadingMessages.length // approx progress per step
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, stepDuration * 100) // sync with progress increment speed

    return () => clearInterval(interval)
  }, [loadingMessages.length])

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <p className="text-primary text-2xl md:text-4xl font-medium text-center">
        Uploading Resume
      </p>

      <p className="text-lightGrey text-lg text-center pt-5 pb-5">
        {loadingMessages[currentMessageIndex]}
      </p>

      {/* Loader Bar */}
      <div className="relative w-96 h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gradientStart to-gradientEnd transition-all duration-200 ease-in-out"
          style={{ width: `${progress}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-black">
          {progress}%
        </span>
      </div>
    </div>
  )
}

export default LoaderBar
