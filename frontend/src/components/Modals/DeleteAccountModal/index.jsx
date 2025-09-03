import React from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../../Button";

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
  const handleOutsideClick = (event) => {
    if (event.target.id === "delete-account-modal-container") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="delete-account-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-modalPurple rounded-lg p-8 w-full max-w-[40%] relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
        >
          <IoMdClose size={24} />
        </Button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-primary">
            Delete Account
          </h2>
        </div>

        <p className="text-primary mb-6">
          Are you sure you want to delete your account permanently? This action
          cannot be undone, and all your data will be lost.
        </p>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={onClose}
            className="px-4 py-3 font-medium w-32 bg-lightGreyBackground text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            No
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 py-3 font-medium w-32 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
