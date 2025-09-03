import React, { useEffect, useRef, useState } from "react";

const SingleDropdownSelect = ({
  options = [],
  selectedOption,
  onChange,
  label = "Select an option",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleOptionSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`border rounded-lg p-3 w-full flex items-center justify-between cursor-pointer bg-dropdownBackground text-primary border-formBorders`}
        onClick={toggleDropdown}
      >
        <span className="text-primary text-base">
          {selectedOption || label}
        </span>
        <svg
          className={`w-6 h-6 ml-2 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.25 7.5L10 12.5l4.75-5H5.25z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute rounded-lg shadow-lg mt-2 w-full z-20">
          <div className="max-h-60 overflow-y-auto">
            {options.length ? (
              options.map((option) => (
                <div
                  key={option}
                  className={`p-2 text-lightGrey bg-multipleDropdownBackground hover:bg-slate-500 cursor-pointer ${
                    selectedOption === option ? "bg-zinc-600" : ""
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="p-2 text-primary">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleDropdownSelect;
