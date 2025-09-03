interface Props {
  label: string
  placeholder: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  className?: string
  readOnly?: boolean
  error?: string | boolean
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  type?: string
  required?: boolean
}

function InputItem({
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
}: Props) {
  let errorMessage = "This field is required"

  if (typeof error == "string") {
    if (error.includes("Your first name") || error.includes("Your last name")) {
      errorMessage = error
    }
  }

  return (
    <div className={`w-full flex flex-col gap-0.5 mb-2 `}>
      <label className="block text-primary   font-medium mb-2">{label}</label>
      <input
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        className={`placeholder:text-gray-500 appearance-none block w-full bg-dropdownBackground text-primary rounded p-3 focus:outline-none focus:ring-1 text-sm 
                   ${
                     error
                       ? "border border-red-500 focus:ring-red-500" // Red border for error
                       : "border border-formBorders " // Default border
                   }
                   ${className}`}
      />
      {error && (
        <p className="text-red-500 text-sm">{errorMessage}</p> // Error message below the input
      )}
    </div>
  )
}
export default InputItem
