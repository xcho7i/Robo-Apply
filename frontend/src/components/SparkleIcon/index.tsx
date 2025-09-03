import React from "react"

interface SparkleIconProps {
  className?: string
  size?: number
}

const SparkleIcon: React.FC<SparkleIconProps> = ({
  className = "",
  size = 16
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}>
      <path
        d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"
        fill="currentColor"
      />
      <path
        d="M19 3L20.09 6.91L24 8L20.09 9.09L19 13L17.91 9.09L14 8L17.91 6.91L19 3Z"
        fill="currentColor"
      />
      <path
        d="M5 5L5.91 7.91L9 9L5.91 10.09L5 13L4.09 10.09L1 9L4.09 7.91L5 5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default SparkleIcon
