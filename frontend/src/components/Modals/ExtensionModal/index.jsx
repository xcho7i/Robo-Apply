import React from "react";
import { IoMdClose } from "react-icons/io";
import { FaExternalLinkAlt } from "react-icons/fa";
import Button from "../../Button";
import logo from "../../../assets/logo.svg";

const ExtensionModal = ({
  onClose,
  link = "#",
}) => {
  const handleOutsideClick = (event) => {
    if (event.target.id === "modal-background") {
      onClose();
    }
  };

  return (
    <div
      id="modal-background"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm"
      onClick={handleOutsideClick}
    >
      <div
        id="edit-modal-container"
        className="relative w-full max-w-[90%] md:max-w-[80%]  lg:max-w-[60%] bg-[#2e1b42] text-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border-2 border-white"
      >
        <Button
          className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gradient-to-b rounded-full z-50 text-sm lg:text-lg text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
          onClick={onClose}
        >
          <IoMdClose size={18} color="#000" />
        </Button>

        <h1 className="text-lg sm:text-xl font-medium text-gray-300 text-start mb-4">
          Start Applying On LinkedIn Now
        </h1>

        <div className="mt-4 border-t border-b border-l-0 border-r-0 border-gray-600 px-10 sm:px-10 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <h2 className="font-base md:font-semibold  text-xs md:text-xl lg:text-lg border-b-2 lg:whitespace-nowrap text-gray-100">
              Install RoboApply Extension And Test Yourself
            </h2>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <FaExternalLinkAlt size={20} />
            </a>
          </div>

          <ul className="mt-3 space-y-2 text-gray-300 text-xs sm:text-sm lg:text-base">
            <li>➤ Go to RoboApply Chrome Extension page by clicking here</li>
            <li>➤ Install our extension to send referrals and apply to jobs automatically.</li>
            <li>
              ➤ Only 1 click is required to install our{" "}
              <span className="font-bold">RoboApply</span> extension.
            </li>
          </ul>
        </div>

        <div className="flex items-center  md:justify-between mt-6 flex-wrap lg:flex-nowrap">
          <div className="flex items-center mb-4 sm:mb-0">
            <img src={logo} alt="RoboApply Logo" className="h-4 lg:h-6 " />
            <span className="ml-2 text-gray-300 text-xs  sm:text-sm">
              : Job Application Bot
            </span>
          </div>

          <Button className="flex items-center justify-center gap-2 text-sm lg:text-base font-semibold w-full sm:w-36 h-8  whitespace-nowrap text-white bg-gradient-to-b from-gradientStart to-gradientEnd rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
         Add To Chrome
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionModal;
