import { Input } from "antd"
import React from "react"

interface Props {
  label?: string
  placeholder: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  className?: string
  readOnly?: boolean
  error?: boolean
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  type?: string
  required?: boolean
}

const SimpleInputField = ({
  label,
  placeholder,
  value,
  onChange,
  className,
  readOnly = false,
  error = false,
  onKeyDown,
  type = "text",
  required = false
}: Props) => {
  return (
    <div className={`w-full  mb-2 ${className}`}>
      <label className="block text-primary text-sm font-medium mb-2">
        {label}
      </label>
      <Input
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        className={`placeholder:text-gray-500 appearance-none block w-full bg-dropdownBackground text-primary rounded py-3 md:py-4  px-3 
                   focus:outline-none focus:ring-1 text-sm 
                   ${
                     error
                       ? "border border-red-500 focus:ring-red-500" // Red border for error
                       : "border border-formBorders " // Default border
                   }
                   ${className}`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">This field is required</p> // Error message below the input
      )}
    </div>
  )
}

export default SimpleInputField
