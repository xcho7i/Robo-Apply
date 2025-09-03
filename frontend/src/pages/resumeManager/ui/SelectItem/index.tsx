import { Children } from "react"

interface Props {
  label: string
  value: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  className?: string
  error?: boolean | string
  onKeyDown?: React.KeyboardEventHandler<HTMLSelectElement>
  required?: boolean
  children: React.ReactNode
}

function SelectItem({
  label,
  value,
  onChange,
  className,
  error = false,
  onKeyDown,
  required = false,
  children
}: Props) {
  return (
    <div className={`w-full flex flex-col gap-0.5 mb-2 `}>
      <label className="block text-primary  font-medium mb-2">{label}</label>
      <select
        required={required}
        value={value}
        onChange={onChange}
        className={`block w-full bg-dropdownBackground text-primary border border-formBorders p-3 py-2.5 rounded-md shadow-sm
                           ${
                             error
                               ? "border border-red-500 focus:ring-red-500" // Red border for error
                               : "border border-formBorders " // Default border
                           }
                   
        ${className}`}>
        {children}
      </select>
      {error && (
        <p className="text-red-500 text-sm">This field is required</p> // Error message below the input
      )}
    </div>
  )
}
export default SelectItem
