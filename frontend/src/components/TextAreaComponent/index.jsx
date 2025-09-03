import React from "react"

const TextAreaComponent = ({ placeholder, onTextChange, value, className }) => {
  const handleChange = (e) => {
    onTextChange(e.target.value)
  }

  return (
    <textarea
      className={`w-[100%] h-40 p-3 border border-customGray rounded-lg text-primary placeholder:text-gray-500  bg-dropdownBackground ${className}`} // Include custom className
      placeholder={placeholder}
      onChange={handleChange}
      value={value} // Controlled by the parent state
    />
  )
}

export default TextAreaComponent
