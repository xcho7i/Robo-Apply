import React from "react"

interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "success"
  className?: string
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className = "",
  children
}) => {
  const variantClasses = {
    default: "bg-purple text-white",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-red-500 text-white",
    success: "bg-green-500 text-white"
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
