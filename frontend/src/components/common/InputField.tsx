"use client"
import React from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Eye, EyeOff } from "lucide-react"

interface InputFieldProps extends React.ComponentProps<typeof Input> {
  label: string
  id: string
  labelClassName?: string
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  labelClassName,
  type,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === "password"
  return (
    <div className="flex flex-col sm:gap-3 gap-1">
      <Label
        htmlFor={id}
        className={`${labelClassName ? labelClassName : "text-white"}`}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (
              <EyeOff size={18} className="text-red-500" />
            ) : (
              <Eye size={18} className="text-green-500" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export { InputField }
