import { BsFillCheckCircleFill } from "react-icons/bs"

import circleIcon from "../../../../assets/resumeManagerIcons/circleIcon.svg"
import fileIconImage from "../../../../assets/resumeManagerIcons/fileImageIcon.svg"

import Button from "../../../../components/Button"
import ResumeManagerDropDown from "../ResumeManagerDropdown"

const ResumeCard = ({ resumeName, status, options, onEditClick }) => {
  return (
    <div className="w-full border border-primary px-5 py-2 rounded-xl bg-black space-y-1 hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
      <div className="w-full flex justify-between">
        <div className="w-fit px-2 rounded-md flex space-x-2 items-center border-2 border-almostBlackBorder">
          {/* Status Icon */}
          {status == "Completed" ? (
            <BsFillCheckCircleFill className="text-green-600" />
          ) : (
            <img src={circleIcon} alt="Status Icon" loading="lazy" />
          )}
          <p className="text-primary">{status}</p>
        </div>
        <div>
          <ResumeManagerDropDown options={options} />
        </div>
      </div>
      <div className="w-full items-center justify-center py-5 bg-almostBlack rounded-lg space-y-2">
        <div className="w-full items-center justify-center flex">
          <img
            src={fileIconImage}
            alt="File Icon"
            className="w-24"
            loading="lazy"
          />
        </div>
        <div className="w-full items-center justify-center flex">
          <p className="text-primary text-xl font-medium">{resumeName}</p>
        </div>
      </div>
      <div className="w-full items-center justify-center flex pt-3">
        <Button
          onClick={onEditClick}
          className="py-3 px-5 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
          Edit Resume
        </Button>
      </div>
    </div>
  )
}

export default ResumeCard
