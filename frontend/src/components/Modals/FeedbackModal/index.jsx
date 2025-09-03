import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { errorToast } from "../../Toast";
import SimpleInputField from "../../SimpleInputFields";
import Button from "../../Button";

const FeedbackModal = ({ isOpen, onClose, onSave, feedbackType }) => {
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFeedbackText(""); // Reset feedback text when modal opens
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!feedbackText.trim()) {
      errorToast("Feedback cannot be empty.");
      return;
    }
    onSave(feedbackText.trim()); // Pass the feedback to parent component
    onClose(); // Close feedback modal
  };

  const handleOutsideClick = (event) => {
    if (event.target.id === "feedback-modal-container") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="feedback-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-modalPurple rounded-lg p-8 w-full max-w-[85%] md:max-w-[35%] relative border">
        {/* Close button */}
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
        >
          <IoMdClose size={24} />
        </Button>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary">
            {feedbackType || "Give Feedback"}
          </h2>
        </div>

        {/* Feedback input field */}
        <SimpleInputField
          label="Your feedback is important to us. Please share your thoughts, questions, or any concerns you have for this new job match score feature in the space below. We appreciate your time and input!"
          placeholder="Share your feedback"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />

        <div className="flex justify-center mt-6 space-x-4">
          {/* Save button */}
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

export default FeedbackModal;
