import React, { useState, useEffect } from "react"

const CoverLetterFinalLoader = () => {
  const loadingMessages = [
    "Analyzing the job description and keywords…",
    "Highlighting your most relevant experience…",
    "Crafting a personalized introduction…",
    "Adding strong closing and call-to-action…",
    "Finalizing tone and formatting for ATS success…"
  ]

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(1) // start at 1%

  useEffect(() => {
    // Update progress gradually until it reaches 99
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 99) {
          return prev + 1
        } else {
          clearInterval(progressInterval)
          return prev
        }
      })
    }, 100) // update every 0.1s for smooth animation

    return () => clearInterval(progressInterval)
  }, [])

  useEffect(() => {
    // Change messages every 500ms (half second)
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1
        }
        return prev // Stay on the last message
      })
    }, 500) // Change message every 500ms (0.5 seconds)

    return () => clearInterval(messageInterval)
  }, [loadingMessages.length])

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <p className="text-primary text-2xl md:text-4xl font-medium text-center">
      Regenerate Resume
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

export default CoverLetterFinalLoader
