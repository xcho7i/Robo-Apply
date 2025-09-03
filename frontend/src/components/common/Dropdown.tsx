"use client"

import React from "react"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select"

interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface DropdownProps {
  label?: string
  id?: string
  labelClassName?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  options: DropdownOption[]
  className?: string
  triggerClassName?: string
  disabled?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  id,
  labelClassName,
  placeholder = "Select an option",
  value,
  onValueChange,
  options,
  className,
  triggerClassName,
  disabled = false
}) => {
  return (
    <div className={`flex flex-col sm:gap-3 gap-1 ${className || ""}`}>
      {label && (
        <Label
          htmlFor={id}
          className={`${labelClassName ? labelClassName : "text-white"}`}>
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={triggerClassName} id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon && option.icon}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default Dropdown
