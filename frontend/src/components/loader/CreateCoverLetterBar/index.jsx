import React, { useState, useEffect } from "react"

const CreateCoverLetterBar = () => {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)

  const stages = [
    "Fetching information ....",
    "Making cover letter ....",
    "Almost Done ...."
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        setCurrentStage(currentStage + 1)
        setProgress(((currentStage + 1) / stages.length) * 100)
      }
    }, 2500) // 2.5 seconds gap between each stage

    // Initial progress setup
    if (currentStage === 0) {
      setProgress(33.33)
    }

    return () => clearTimeout(timer)
  }, [currentStage, stages.length])

  // Animate progress bar fill
  useEffect(() => {
    const progressTimer = setTimeout(() => {
      setProgress(((currentStage + 1) / stages.length) * 100)
    }, 100)

    return () => clearTimeout(progressTimer)
  }, [currentStage, stages.length])

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Dynamic stage text with fade transition */}
      <div className="h-16 flex items-center justify-center">
        <p
          key={currentStage}
          className="text-lightGrey text-2xl text-center pb-5 transition-opacity duration-500 ease-in-out">
          {stages[currentStage]}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-gray-200 rounded-full relative overflow-hidden">
        {/* Animated Progress Bar */}
        <div
          className="h-full bg-gradient-to-r from-gradientStart to-gradientEnd rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${progress}%` }}>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex items-center justify-center mt-4 space-x-4">
        {stages.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              index <= currentStage
                ? "bg-gradient-to-r from-gradientStart to-gradientEnd"
                : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default CreateCoverLetterBar
