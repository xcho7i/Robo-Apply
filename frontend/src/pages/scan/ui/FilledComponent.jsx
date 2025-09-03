import React from "react"
import { IoMdClose } from "react-icons/io"
import Button from "../../../components/Button"

const FilledComponent = ({
  heading = "",
  titleComponent = null,
  tipTitle = "",
  tipContent = "",
  additionalInfo = "",
  buttonText = "",
  onClose,
  onUpdateInfo
}) => {
  return (
    <>
      <div>
        <h1 className="pt-10 text-sm md:text-lg">{heading}</h1>
        <div className="border rounded p-5 w-full relative bg-modalPurple text-white">
          <h3 className="font-semibold md:font-bold text-sm md:text-lg top-0 left-2 mb-4">
            {tipTitle}
          </h3>
          <Button
            className="absolute top-3 right-3 bg-gradient-to-b rounded-full z-50 text-sm md:text-lg text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
            onClick={onClose}>
            <IoMdClose size={24} color="#000" />
          </Button>
          <p className="mb-4 text-sm md:text-lg">{tipContent}</p>
          <p className="border border-l-0 border-r-0 border-b-0 p-1">
            {additionalInfo}
          </p>
          {buttonText && (
            <Button
              className="mt-2 px-2 py-2  text-xs w-30 border border-customPurple text-white rounded"
              onClick={onUpdateInfo}>
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default FilledComponent
