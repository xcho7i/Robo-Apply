import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { successToast, errorToast } from "../../Toast";
import SimpleInputField from "../../SimpleInputFields";
import Button from "../../Button";

const EditResumeNameModal = ({ isOpen, onClose, currentName, onSave }) => {
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = () => {
    if (!newName.trim()) {
      errorToast("Resume name cannot be empty.");
      return;
    }
    successToast("Resume Name is uploaded Successfully");
    onSave(newName.trim());
  };

  const handleOutsideClick = (event) => {
    if (event.target.id === "edit-modal-container") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="edit-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-modalPurple rounded-lg p-8 w-full max-w-[70%] md:max-w-[50%]  relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
        >
          <IoMdClose size={24} />
        </Button>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-primary">
            Change Resume Name For Resume- {currentName}
          </h2>
        </div>

        <SimpleInputField
          label="Enter the new name here:"
          placeholder="Your Name"
          onChange={(e) => setNewName(e.target.value)}
        />

        <div className="flex justify-center mt-6 space-x-4">
          <Button
            onClick={handleSave}
            className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditResumeNameModal;
