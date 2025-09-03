import React from "react";
import { RiDeleteBin6Line } from "react-icons/ri";

const DeleteButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-purple hover:text-primary transition-colors ${className}`}
    >
      <RiDeleteBin6Line size={20} />
    </button>
  );
};

export default DeleteButton;
