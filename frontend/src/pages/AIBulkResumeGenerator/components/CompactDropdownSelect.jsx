import React, { useEffect, useRef, useState } from "react"

const CompactDropdownSelect = ({
  options = [],
  selectedOption,
  onChange,
  label = "Select an option",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  const handleOptionSelect = (option) => {
    onChange(option)
    setIsOpen(false)
  }

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`border rounded h-8 px-2 w-full flex items-center justify-between cursor-pointer bg-transparent text-white border-customGray/50 hover:border-purple transition-colors`}
        onClick={toggleDropdown}>
        <span className="text-white text-xs truncate">
          {selectedOption || label}
        </span>
        <svg
          className={`w-3 h-3 ml-1 transform transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor">
          <path d="M5.25 7.5L10 12.5l4.75-5H5.25z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute rounded-lg shadow-lg mt-1 w-full z-20 border border-customGray/50">
          <div className="max-h-48 overflow-y-auto">
            {options.length ? (
              options.map((option) => (
                <div
                  key={option}
                  className={`px-2 py-1 text-white bg-almostBlack hover:bg-customGray/20 cursor-pointer text-xs ${
                    selectedOption === option ? "bg-purple/20 text-purple" : ""
                  }`}
                  onClick={() => handleOptionSelect(option)}>
                  {option}
                </div>
              ))
            ) : (
              <div className="px-2 py-1 text-jobSeekersColor text-xs">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CompactDropdownSelect
