import React from "react"

import circleIcon from "../../../../assets/resumeManagerIcons/circleIcon.svg"
import fileIconImage from "../../../../assets/resumeManagerIcons/uploadResumeIcon.svg"
import { FaTrashAlt } from "react-icons/fa"
import Button from "../../../../components/Button"
import { IoEyeSharp } from "react-icons/io5"
import { IoDownloadOutline } from "react-icons/io5"

const CoverLetterCard = ({
  coverLetterName,

  onEditClick,
  onDeleteClick
}) => {
  return (
    <div className="w-full border border-primary px-5 py-2 rounded-xl bg-black space-y-1 hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center justify-center gap-2">
          <img src={circleIcon} />
          <p className="text-primary text-xl font-medium">{coverLetterName}</p>
        </div>

        <Button onClick={onDeleteClick} className="text-redColor p-2">
          <FaTrashAlt className="w-5 h-5 hover:opacity-80" />
        </Button>
      </div>
      <div className="w-full items-center justify-center py-5 bg-almostBlack rounded-lg space-y-2">
        <div className="w-full items-center justify-center flex">
          <div className="p-5 bg-none rounded-full">
            <img
              src={fileIconImage}
              alt="File Icon"
              className="w-24 "
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div className="w-full items-center justify-center space-x-10 flex pt-3">
        <Button
          onClick={onEditClick}
          className="py-3 px-5 flex items-center space-x-2  min-w-28 text-navbar font-bold rounded-lg border border-purple gap-2 hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
          <IoEyeSharp className="text-primary w-6 h-6" />
          Open
        </Button>
        <Button
          onClick={onEditClick}
          className="py-3 px-5 border border-purple flex items-center text-center gap-2 space-x-2 min-w-28   text-navbar font-semibold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
          <IoDownloadOutline className=" w-6 h-6" />
          PDF
        </Button>
      </div>
    </div>
  )
}

export default CoverLetterCard
