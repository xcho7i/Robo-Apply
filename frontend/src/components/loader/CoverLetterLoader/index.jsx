import React, { useState, useEffect } from "react"

const CoverLetterLoader = () => {
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
    // Change messages and progress every 500ms (half second)
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1
        }
        return prev // Stay on the last message
      })

      setProgress((prev) => {
        // Calculate progress based on message index
        const progressPerStep = 98 / loadingMessages.length // 98% divided by number of messages (to reach 99% at the end)
        const newProgress = Math.min(
          1 + (currentMessageIndex + 1) * progressPerStep,
          99
        )
        return Math.round(newProgress)
      })
    }, 500) // Change both message and progress every 500ms (0.5 seconds)

    return () => clearInterval(interval)
  }, [loadingMessages.length, currentMessageIndex])

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
          className="h-full bg-gradient-to-r from-gradientStart to-gradientEnd transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-black">
          {progress}%
        </span>
      </div>
    </div>
  )
}

export default CoverLetterLoader
