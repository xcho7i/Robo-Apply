import React from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../../Button";

const ReportSubmitModal = ({ isOpen, onClose }) => {
  const handleOutsideClick = (event) => {
    if (event.target.id === "report-submit-modal-container") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="report-submit-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-modalPurple rounded-lg p-4 md:p-8 w-full max-w-[85%] md:max-w-[30%] relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
        >
          <IoMdClose size={24} />
        </Button>

        <div className="flex flex-col items-left justify-center">
          <h2 className="text-2xl font-semibold text-primary mb-4 mx-2">
            Report
          </h2>
          <p className="text-primary text-lg mb-6 mx-2">
            Question report successful!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportSubmitModal;
