import React from "react";
import qualificationPic from "../../../../assets/resumeManagerIcons/qualification.svg"; // Ensure this icon is available
import EditButton from "../EditButton";
import DeleteButton from "../DeleteButton";
import Button from "../../../../components/Button";

const Qualification = ({
  qualifications,
  onEdit,
  onDelete,
  onAddQualification,
}) => {
  const sanitizeStartDate = (dateStr) => {
    if (!dateStr) return "";
    const str = String(dateStr); // Ensure it's a string
    const fixedDate = str.endsWith("-00") ? str.replace("-00", "-01") : str;
    const date = new Date(fixedDate);
    return isNaN(date) ? "" : date.toLocaleDateString();
  };

  const sanitizeEndDate = (dateStr) => {
    if (!dateStr || String(dateStr).toLowerCase() === "present")
      return "Present";
    const str = String(dateStr); // Ensure it's a string
    const fixedDate = str.endsWith("-00") ? str.replace("-00", "-01") : str;
    const date = new Date(fixedDate);
    return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
  };
  return (
    <div>
      <div className="items-center justify-start w-full flex py-7">
        <p className="text-xl font-normal text-primary border-b-2 border-purple pb-1">
          Education
        </p>
      </div>

      <div className="space-y-2 w-[95%] md:md:w-[80%] border border-customGray  rounded-lg">
        {qualifications.length === 0 ? (
          <div className="border border-dashed rounded-xl border-customGray m-5 p-5 md:p-10">
            <p className="text-primary text-center">No Education added</p>
          </div>
        ) : (
          qualifications.map((qualification, index) => (
            <div
              key={index}
              className="border border-x-0 border-t-0 px-5 mb-3 mx-2 md:px-10 py-5"
            >
              <div className="flex items-center justify-end">
                <EditButton onClick={() => onEdit(index)} />
                <DeleteButton onClick={() => onDelete(index)} />
              </div>
              <div className="flex w-full space-x-3 md:space-x-10">
                <div>
                  <img
                    src={qualificationPic}
                    alt="Qualification"
                    loading="lazy"
                  />
                </div>
                <div className="w-[80%] md:w-[90%] space-y-3 text-primary">
                  <div className="flex space-x-2 pt-3 md:pt-0 text-sm md:text-base font-semibold">
                    <p>{qualification.institutionName}</p>
                  </div>
                  <div className="flex space-x-2 text-xs md:text-base">
                    <p>{qualification.degreeType}</p>

                    {qualification.degreeType && qualification.major && (
                      <p>|</p>
                    )}

                    <p>{qualification.major}</p>
                  </div>
                  <div className="flex space-x-2 md:space-x-5 text-xs md:text-base">
                    {qualification.institutionCity && (
                      <p>
                        Location - {qualification.institutionCity}
                        {qualification.institutionState ? "," : ""}
                      </p>
                    )}
                    {qualification.institutionState && (
                      <p>{qualification.institutionState}</p>
                    )}{" "}
                  </div>
                  <div className="flex space-x-2 md:space-x-5 text-xs md:text-base">
                    <p>{sanitizeStartDate(qualification.startDate)} </p>
                    {qualification.startDate && <p>-</p>}
                    <p> {sanitizeEndDate(qualification.endDate)}</p>

                    {/* <p>
                      {new Date(qualification.startDate).toLocaleDateString()}
                    </p>
                    <p>-</p>
                    <p>
                      {qualification.endDate
                        ? qualification.endDate === "Present"
                          ? "Present"
                          : new Date(qualification.endDate).toLocaleDateString()
                        : "Present"}
                    </p> */}
                  </div>
                  <div>
                    {qualification.gpa && (
                      <p className="text-xs md:text-base">
                        GPA: {qualification.gpa}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        onClick={onAddQualification}
        className="my-5 text-lg text-primary hover:text-purpleText"
      >
        +Add More
      </Button>
    </div>
  );
};

export default Qualification;
