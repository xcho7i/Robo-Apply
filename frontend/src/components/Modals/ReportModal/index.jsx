import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../../Button";
import SimpleInputField from "../../SimpleInputFields";
import { errorToast } from "../../Toast";

const ReportModal = ({ isOpen, onClose }) => {
  const [reportText, setReportText] = useState("");
  const [inputError, setInputError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReportText("");
      setInputError(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!reportText.trim()) {
      setInputError(true);
      errorToast("Report cannot be empty.");
      return;
    }
    console.log("Report Submitted:", reportText.trim());
    onClose();
  };

  const handleOutsideClick = (event) => {
    if (event.target.id === "report-modal-container") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="report-modal-container"
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

        <div className="flex justify-between items-center mb-6 mx-3">
          <h2 className="text-2xl font-semibold text-primary">Report</h2>
        </div>

        <SimpleInputField
          label="Please provide us your concerns about this question and what should be the correct answer to this question."
          placeholder="Report here!"
          value={reportText}
          onChange={(e) => {
            setReportText(e.target.value);
            if (inputError && e.target.value.trim()) {
              setInputError(false);
            }
          }}
          className={inputError ? "border-dangerBorder" : ""}
        />

        <div className="flex justify-center mt-6 space-x-4">
          <Button
            onClick={handleSave}
            className="mx-3 px-4 py-3 font-medium bg-gradient-to-b w-full from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
