import React from "react";
import certificationPic from "../../../../assets/resumeManagerIcons/certification.svg"; // Ensure this icon is available
import EditButton from "../EditButton";
import DeleteButton from "../DeleteButton";
import Button from "../../../../components/Button";

import link from "../../../../assets/resumeManagerIcons/link.svg";

const Certification = ({
  certifications,
  onEdit,
  onDelete,
  onAddCertification,
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
      <div className="items-center justify-start w-full flex py-3">
        <p className="text-xl font-normal border-b-2 border-purple pb-1">
          Certifications
        </p>
      </div>

      <div className="space-y-2 w-[95%] md:w-[80%] border border-customGray  rounded-lg">
        {certifications.length === 0 ? (
          <div className="border border-dashed rounded-xl border-customGray m-5 p-5 md:p-10">
            <p className="text-primary text-center">No Certifications added</p>
          </div>
        ) : (
          certifications.map((certification, index) => (
            <div
              key={index}
              className="border border-x-0 border-t-0 px-5 md:px-10 py-5"
            >
              <div className="flex items-center justify-end">
                <EditButton onClick={() => onEdit(index)} />
                <DeleteButton onClick={() => onDelete(index)} />
              </div>
              <div className="flex w-full space-x-3 md:space-x-10">
                <div>
                  <img
                    src={certificationPic}
                    alt="Certification"
                    loading="lazy"
                  />
                </div>
                <div className="w-[80%] md:w-[90%] text-primary space-y-3">
                  <div className=" md:text-lg font-semibold">
                    <p>{certification.certificationTitle}</p>
                  </div>
                  <div className="flex text-xs md:text-base space-x-3 md:space-x-5">
                    {/* <p>
                      {new Date(certification.startDate).toLocaleDateString()}
                    </p>
                    <p>-</p>
                    <p>
                      {certification.endDate
                        ? new Date(certification.endDate).toLocaleDateString()
                        : "Present"}
                    </p> */}
                    <p>{sanitizeStartDate(certification.startDate)} </p>
                    {certification.startDate && <p>-</p>}
                    <p> {sanitizeEndDate(certification.endDate)}</p>
                  </div>
                  {certification.certificationUrl && (
                    <div className="flex gap-1 text-sm md:text-base">
                      <img src={link} alt="link" loading="lazy" />
                      <a
                        href={certification.certificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-purpleText no-underline"
                      >
                        Certification URL
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        onClick={onAddCertification}
        className="my-5 text-lg text-primary hover:text-purpleText"
      >
        +Add More
      </Button>
    </div>
  );
};

export default Certification;
