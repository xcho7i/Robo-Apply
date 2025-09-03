import React, { useState, useRef, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";

const ResumeManagerDropDown = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleOptionChange = (option) => {
    if (option.action) {
      option.action();
    }
    setIsOpen(false); // Close the dropdown after selecting an option
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-white text-purpleColor text-navbar font-bold p-1 rounded flex items-center"
        onClick={toggleDropdown}
      >
        <IoMdArrowDropdown className="" />
      </button>
      {isOpen && (
        <div className="absolute bg-lightGreyBackground rounded shadow-lg mt-1 right-0 w-48 z-10 py-1">
          {options.map((option, index) => (
            <div
              key={index}
              className="px-4 py-2 cursor-pointer text-base font-medium text-primary bg-almostBlack hover:bg-lightGreyBackgrounds transition-colors hover:bg-lightestGrey hover:text-black"
              onClick={() => handleOptionChange(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeManagerDropDown;
