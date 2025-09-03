import React, { useEffect, useRef, useState } from "react"

interface AnimatedCircularProgressProps {
  percentage: number
  duration?: number
  size?: number
  strokeWidth?: number
  onProgressUpdate?: (progress: number) => void
}

// Smoother easing function
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({
  percentage,
  duration = 2000,
  size = 200,
  strokeWidth = 20,
  onProgressUpdate
}) => {
  const [progress, setProgress] = useState(0)
  const [displayedPercent, setDisplayedPercent] = useState(0)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const onProgressUpdateRef = useRef(onProgressUpdate)

  // Update the ref when the callback changes
  useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate
  }, [onProgressUpdate])

  useEffect(() => {
    // Reset animation state
    setProgress(0)
    setDisplayedPercent(0)
    startTimeRef.current = null

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const normalizedTime = Math.min(elapsed / duration, 1)

      // Apply smoother easing
      const easedProgress = easeOutCubic(normalizedTime)
      const currentProgress = easedProgress * percentage

      setProgress(currentProgress)
      const roundedProgress = Math.round(currentProgress)
      setDisplayedPercent(roundedProgress)

      // Update parent component
      if (onProgressUpdateRef.current) {
        onProgressUpdateRef.current(roundedProgress)
      }

      if (normalizedTime < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Ensure final values are exact
        setProgress(percentage)
        setDisplayedPercent(percentage)
        if (onProgressUpdateRef.current) {
          onProgressUpdateRef.current(percentage)
        }
      }
    }

    // Start animation immediately if percentage > 0
    if (percentage > 0) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [percentage, duration])

  const radius = (size - strokeWidth) / 2
  const innerRadius = radius - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ overflow: "visible" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFD000"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-none"
          style={{
            filter: "drop-shadow(0 0 8px rgba(255, 208, 0, 0.3))"
          }}
        />
        {/* Inner white circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          fill="white"
          stroke="#f3f4f6"
          strokeWidth={2}
        />
      </svg>
      {/* Percentage text */}
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-gray-800"
        style={{ fontSize: size * 0.2 }}>
        {displayedPercent}%
      </div>
    </div>
  )
}

export default AnimatedCircularProgress
