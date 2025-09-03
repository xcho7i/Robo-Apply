import React from "react";

const Dropdown = ({ label, options, onChange, className, placeholder }) => {
  return (
    <div className="w-full mx-auto">
      {label && (
        <label className="block text-primary text-base font-medium mb-2">
          {label}
        </label>
      )}
      <select
        onChange={onChange}
        defaultValue=""
        className={`block w-full bg-dropdownBackground text-primary border border-formBorders py-2 px-3 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none ${className}`}
      >
        {/* Placeholder option */}
        <option value="" disabled hidden>
          {placeholder}
        </option>

        {/* Other options */}
        {options.map((option, index) => (
          <option
            key={index}
            value={option}
            className="text-primary bg-inputBackGround"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
