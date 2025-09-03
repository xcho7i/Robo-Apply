import React from "react"
import { AiOutlineLoading } from "react-icons/ai"
import { BiLoader } from "react-icons/bi"

interface Props {
  children: React.ReactNode
  className?: string
  type?: "button" | "submit" | "reset" | undefined
  onClick: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  style?: React.CSSProperties | undefined
  icon?: React.ReactNode
}

const GradientButton = ({
  children,
  className,
  type,
  onClick,
  disabled,
  style,
  icon
}: Props) => {
  return (
    <button
      type={type ? type : "button"}
      className={`py-2 px-2 md:px-7 flex items-center gap-3 text-base font-semibold bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd ${className} disabled:opacity-70`}
      onClick={onClick}
      disabled={disabled}
      style={style}>
      {icon}
      {children}
    </button>
  )
}

export default GradientButton
