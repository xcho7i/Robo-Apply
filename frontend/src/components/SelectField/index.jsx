import React, { useState } from "react";
import Droddown from "../../assets/contact/dropdown.svg";

const SelectField = ({ options, onChange, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const handleOptionClick = (option) => {
    setSelectedOption(option.label); // Set the label instead of value
    setIsOpen(false);
    if (onChange) {
      onChange(option.value);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Selected Option */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-[60px] cursor-pointer border border-customGray text-primary bg-inputBackGround rounded-lg p-3 w-full focus:border-customPurple focus:outline-none flex items-center justify-between"
      >
        {/* Centered Selected Option */}
        <span className="truncate">
          {selectedOption || placeholder || "Select an option"}
        </span>
        <img
          src={Droddown}
          alt="Dropdown Icon"
          className="w-4 h-4"
          loading="lazy"
        />
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-inputBackGround border border-customGray rounded-lg shadow-lg max-h-60 overflow-y-auto w-full">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(option)}
              className="p-3 cursor-pointer hover:bg-[#8C20F8] hover:text-white flex items-center"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectField;
