"use client"
import React from "react"

type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
type Size = "default" | "sm" | "lg" | "icon"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean // kept for API compatibility, but not used
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-[var(--brand-yellow)] text-[var(--brand-bgBlue)] shadow-xs hover:bg-[color-mix(in_oklch,var(--brand-yellow)_80%,black)]",
  destructive:
    "bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-400/40 dark:bg-red-500",
  outline:
    "border-2 border-[var(--brand-purple)] text-white bg-[var(--brand-bgBlue)] shadow-xs hover:bg-[color-mix(in_oklch,var(--brand-purple)_10%,var(--brand-bgBlue))]",
  secondary: "bg-gray-200 text-gray-800 shadow-xs hover:bg-gray-300",
  ghost:
    "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white",
  link: "text-blue-600 underline-offset-4 hover:underline"
}

const sizeClasses: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 py-1.5 text-sm",
  lg: "h-10 px-6 py-2.5 text-base",
  icon: "h-9 w-9 p-0 flex items-center justify-center"
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}) => {
  const classes =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
