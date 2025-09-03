import React from "react";
import { FaRegEdit } from "react-icons/fa";

const EditButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-purple hover:text-primary transition-colors ${className}`}
    >
      <FaRegEdit size={20} />
    </button>
  );
};

export default EditButton;
