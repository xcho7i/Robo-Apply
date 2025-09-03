import React from "react";

const InputField = ({ type, placeholder, className, ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`max-h-[60px] border border-customGray text-primary bg-inputBackGround rounded-lg p-3 w-full focus:border-customPurple focus:outline-none placeholder:text-primary ${className}`}
      {...props}
    />
  );
};

export default InputField;
