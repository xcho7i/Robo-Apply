import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { errorToast } from "../../../../components/Toast";
import Button from "../../../../components/Button";
import SimpleInputField from "../../../../components/SimpleInputFields";
import DatePickerInput from "../../../../components/DatePickerInput";

const CertificateModal = ({
  isOpen,
  onClose,
  onAddCertification,
  initialData = {},
  onSave,
}) => {
  const [certificationTitle, setCertificationTitle] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [certificationUrl, setCertificationUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCertificationTitle(initialData.certificationTitle || "");
      setStartDate(
        initialData.startDate ? new Date(initialData.startDate) : null
      );
      setEndDate(initialData.endDate ? new Date(initialData.endDate) : null);
      setCertificationUrl(initialData.certificationUrl || "");
    }
  }, [isOpen, initialData]);

  const handleSaveCertification = () => {
    if (!certificationTitle || !startDate) {
      errorToast("Please fill in all required fields.");
      return;
    }

    const certificationData = {
      certificationTitle,
      startDate,
      endDate,
      certificationUrl,
    };

    if (initialData.id !== undefined) {
      onSave(initialData.id, certificationData);
    } else {
      onAddCertification(certificationData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="certificate-modal-container"
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) =>
        e.target.id === "certificate-modal-container" && onClose()
      }
    >
      <div className="bg-modalPurple rounded-lg p-4 md:p-8  max-w-[90%] md:max-w-[50%] mt-10 relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
        >
          <IoMdClose size={24} />
        </Button>

        <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4">
          {initialData.id !== undefined
            ? "Edit Certification"
            : "Add Certification"}
        </h2>

        <div className="md:flex md:flex-col md:space-y-4 border border-x-0 border-customGray py-5">
          <SimpleInputField
            placeholder="Certification Title"
            value={certificationTitle}
            onChange={(e) => setCertificationTitle(e.target.value)}
            className="w-full"
          />
          <div className="md:flex md:space-x-4">
            <DatePickerInput
              placeholder="Start Date"
              selectedDate={startDate}
              onChange={setStartDate}
              className="w-full"
            />
            <DatePickerInput
              placeholder="End Date"
              selectedDate={endDate}
              onChange={setEndDate}
              className="w-full"
            />
          </div>
          <SimpleInputField
            placeholder="Certification URL"
            value={certificationUrl}
            onChange={(e) => setCertificationUrl(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex justify-end mt-3 mb-5 space-x-4">
          <Button
            onClick={onClose}
            className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            Close
          </Button>
          <Button
            onClick={handleSaveCertification}
            className="px-4 py-3 font-medium bg-gradient-to-b min-w-max w-40 from-gradientStart to-gradientEnd text-white rounded-lg hover:ring-2 hover:ring-gradientEnd"
          >
            {initialData.id !== undefined
              ? "Save Changes"
              : "Add Certification"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
