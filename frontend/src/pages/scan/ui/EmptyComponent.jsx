import React from "react";
import { TiTick } from "react-icons/ti";
import Button from "../../../components/Button";

const EmptyComponent = ({
  heading = "",
  titleComponent = null,
  tipTitle = "",
  tipContent = "",
  additionalInfo = "",
  onClose,
  onUpdateInfo,
}) => {
  return (
    <>
      <div>
        <h1 className="pt-10 text-sm md:text-lg mb-4">{heading}</h1>
        <div className="p-5 w-full relative text-white">
          <h3 className="font-bold text-sm md:text-lg top-0 left-2 mb-4">
            {tipTitle}
          </h3>
          <Button
            className="absolute top-3 right-3 bg-green rounded-full z-50 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
            onClick={onClose}
          >
            <TiTick size={24} color="white" />
          </Button>
          <p className="mb-4 text-sm md:text-lg">{tipContent}</p>
          <p className="border border-l-0 text-sm md:text-lg border-r-0 border-b-0 p-1">
            {additionalInfo}
          </p>
        </div>
      </div>
    </>
  );
};

export default EmptyComponent;
