import React, { useEffect, useRef } from "react";

const MultipleDropdownSelect = ({
  options,
  selectedOptions,
  onChange,
  label,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionChange = (option) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((item) => item !== option)); // Remove option
    } else {
      onChange([...selectedOptions, option]); // Add option
    }
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`border rounded-lg p-3 placeholder:text-primary w-full flex flex-wrap items-center cursor-pointer bg-dropdownBackground text-primary border-formBorders  ${className}`}
        onClick={toggleDropdown}
      >
        {selectedOptions.length ? (
          selectedOptions.map((option) => (
            <span
              key={option}
              className="bg-dropdownBackground text-primary rounded-lg px-3 py-2 mr-2 mb-2 flex items-center"
            >
              {option}
              <button
                className="ml-1 text-primary hover:font-bold  focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents closing the dropdown
                  onChange(selectedOptions.filter((item) => item !== option)); // Remove option
                }}
              >
                &times;
              </button>
            </span>
          ))
        ) : (
          <span className="text-primary text-base">
            {label || "Select options"}
          </span>
        )}
        <svg
          className={`w-6 h-6  ml-auto transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.25 7.5L10 12.5l4.75-5H5.25z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute  rounded-lg shadow-lg mt-2 w-full z-20">
          <div className="max-h-60 overflow-y-auto">
            {options.length ? (
              options.map((option) => (
                <div
                  key={option}
                  className={`p-2 text-lightGrey bg-multipleDropdownBackground hover:bg-slate-500 cursor-pointer ${
                    selectedOptions.includes(option) ? "bg-zinc-600" : ""
                  }`}
                  onClick={() => handleOptionChange(option)}
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

export default MultipleDropdownSelect;
