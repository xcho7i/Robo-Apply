import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import qualificationPic from "../../../../assets/resumeManagerIcons/qualification.svg";
import Button from "../../../../components/Button";

const EducationCard = ({ qualification, onEdit, onDelete }) => (
  <div className="border w-full border-customGray bg-dropdownBackground rounded-lg mt-2 px-3 md:px-10 py-3 md:py-5">
    {/* <div className="border border-x-0 border-t-0 px-10 py-5"> */}
    {/* <div className="flex items-center justify-end space-x-3 pb-2"> */}
    <div className="flex items-center justify-end space-x-4">
      <Button
        onClick={onEdit}
        className="text-purple hover:text-primary transition-colors"
      >
        <FaEdit size={18} />
      </Button>
      <Button
        onClick={onDelete}
        className="text-purple hover:text-primary transition-colors"
      >
        <FaTrash size={18} />
      </Button>
    </div>
    {/* <div className="flex w-full space-x-10"> */}
    <div className="flex w-full space-x-4 md:space-x-10 mt-3">
      <div>
        <img
          src={qualificationPic}
          alt="Qualification"
          className="w-10 h-10 md:w-16 md:h-16 object-contain"
          loading="lazy"
        />
      </div>
      {/* <div className="w-[90%] space-y-3"> */}
      <div className="w-[80%] md:w-[90%] space-y-3 text-primary">
        <p className="font-semibold">{qualification.institutionName}</p>
        <div className="flex space-x-2 text-sm md:text-base text-primary">
          <p>{qualification.degreeType}</p>
          <p>|</p>
          <p>{qualification.major}</p>
        </div>

        <div className="flex space-x-2 md:space-x-2 text-xs md:text-base text-primary">
          <p>{new Date(qualification.startDate).toLocaleDateString()}</p>
          <p>-</p>
          <p>
            {qualification.endDate
              ? qualification.endDate === "Present"
                ? "Present"
                : new Date(qualification.endDate).toLocaleDateString()
              : "Present"}
          </p>
        </div>
        <div className="flex space-x-2 md:space-x-3 text-xs md:text-base text-primary">
          <p>{qualification.institutionCity},</p>
          <p>{qualification.institutionState}</p>
        </div>
        <div className=" text-sm md:text-base text-primary">
          <p>GPA - {qualification.gpa}</p>
        </div>
      </div>
    </div>
    {/* </div> */}
  </div>
);

export default EducationCard;
