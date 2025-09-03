import React, { useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";

const PasswordInput = ({ placeholder, className, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className="border border-customGray text-primary placeholder:text-white bg-inputBackGround rounded-lg p-3 w-full focus:border-customPurple focus:outline-none"
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-2 top-3 text-gray-500"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
      </button>
    </div>
  );
};

export default PasswordInput;
