import React from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../../Button";

const CommingSoonModal = ({ isOpen, onClose }) => {
    const handleOutsideClick = (event) => {
        if (event.target.id === "comming-soon-modal-container") {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            id="comming-soon-modal-container"
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleOutsideClick}
        >
            <div className="bg-modalPurple rounded-lg p-4 md:p-8 w-full md:max-w-[40%] relative border">
                <Button
                    onClick={onClose}
                    className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
                >
                    <IoMdClose size={24} />
                </Button>

                <div className="mb-6">
                    <h2 className="text-lg md:text-2xl font-semibold text-primary">
                        Coming Soon
                    </h2>
                </div>

                <p className="text-xs md:text-base  text-primary mb-6">
                    This feature is coming soon. Stay tuned!
                </p>

                <div className="flex justify-end space-x-4">
                    <Button
                        onClick={onClose}
                        className="px-4 py-3 font-medium w-32 bg-lightGreyBackground text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CommingSoonModal ;
