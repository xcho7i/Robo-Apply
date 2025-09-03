import React from "react"

interface AlertProps {
  variant?: "default" | "destructive" | "success" | "warning"
  className?: string
  children: React.ReactNode
}

export const Alert: React.FC<AlertProps> = ({
  variant = "default",
  className = "",
  children
}) => {
  const variantClasses = {
    default: "bg-purple/10 border-purple text-primary",
    destructive: "bg-red-500/10 border-red-500 text-red-500",
    success: "bg-green-500/10 border-green-500 text-green-500",
    warning: "bg-yellow-500/10 border-yellow-500 text-yellow-500"
  }

  return (
    <div
      className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}

export const AlertDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = "" }) => {
  return <div className={`text-sm ${className}`}>{children}</div>
}
