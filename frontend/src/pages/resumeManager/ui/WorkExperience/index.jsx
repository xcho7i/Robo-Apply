import React from "react"
import experiencePic from "../../../../assets/resumeManagerIcons/work-experience.svg"
import EditButton from "../EditButton"
import DeleteButton from "../DeleteButton"
import Button from "../../../../components/Button"
const listStyles = `
    .experience-description ul {
      list-style-type: disc !important;
      list-style-position: inside !important;
      margin-left: 1rem !important;
      padding-left: 0.5rem !important;
    }
    
    .experience-description ol {
      list-style-type: decimal !important;
      list-style-position: inside !important;
      margin-left: 1rem !important;
      padding-left: 0.5rem !important;
    }
    
    .experience-description li {
      margin-bottom: 0.25rem !important;
      padding-left: 0.25rem !important;
    }
    
    .experience-description p {
      margin-bottom: 0.5rem !important;
    }
    
    .experience-description strong {
      font-weight: 600 !important;
    }
  `

const WorkExperience = ({ experiences, onEdit, onDelete, onAddExperience }) => {
  const sanitizeStartDate = (dateStr) => {
    if (!dateStr) return ""
    const str = String(dateStr) // Ensure it's a string
    const fixedDate = str.endsWith("-00") ? str.replace("-00", "-01") : str
    const date = new Date(fixedDate)
    return isNaN(date) ? "" : date.toLocaleDateString()
  }

  const sanitizeEndDate = (dateStr) => {
    if (!dateStr || String(dateStr).toLowerCase() === "present")
      return "Present"
    const str = String(dateStr) // Ensure it's a string
    const fixedDate = str.endsWith("-00") ? str.replace("-00", "-01") : str
    const date = new Date(fixedDate)
    return isNaN(date) ? "Invalid Date" : date.toLocaleDateString()
  }

  return (
    <>
      <style>{listStyles}</style>

      <div>
        <div className="items-center justify-start w-full flex py-7">
          <p className="text-xl text-primary font-normal border-b-2 border-purple pb-1">
            Work Experience
          </p>
        </div>

        <div className="space-y-2 w-[95%] md:w-[80%] border border-customGray  rounded-lg">
          {experiences.length === 0 ? (
            <div className="border border-dashed rounded-xl border-customGray m-5 p-5 md:p-10">
              <p className="text-text-primary text-center">
                No Experience added
              </p>
            </div>
          ) : (
            experiences.map((experience, index) => (
              <div
                key={index}
                className="border border-x-0 border-t-0 px-5 mb-3 mx-2 md:px-10 py-5">
                <div className="flex items-center justify-end">
                  <EditButton onClick={() => onEdit(index)} />
                  <DeleteButton onClick={() => onDelete(index)} />
                </div>
                <div className="flex w-full space-x-3 md:space-x-10">
                  <div>
                    <img src={experiencePic} alt="Experience" loading="lazy" />
                  </div>
                  <div className="w-[90%] space-y-3 text-primary">
                    <div className="flex space-x-2 pt-3 md:pt-0 text-xs md:text-base font-semibold">
                      <p>{experience.jobTitle}</p>
                      {experience.jobTitle && experience.experienceType
                        ? "| "
                        : ""}
                      <p>{experience.experienceType}</p>
                    </div>
                    <div className="flex space-x-2 md:space-x-5 text-[10px] md:text-base">
                      <p>
                        {experience.companyName}
                        {experience.companyName && experience.location
                          ? ", "
                          : " "}
                        {experience.location}
                      </p>
                    </div>

                    {/* <div className="flex space-x-3 md:space-x-5 text-xs md:text-base">
            

                    <p>{sanitizeStartDate(experience.startDate)}</p>
                    {experience.startDate && <p>-</p>}
                    <p>{sanitizeEndDate(experience.endDate)}</p>
                  </div> */}

                    <div
                      className="text-primary text-justify text-xs md:text-base experience-description"
                      dangerouslySetInnerHTML={{
                        __html: experience.description
                      }}
                    />
                    {/* <div>
                    <p className="text-xs md:text-base text">
                      {experience.description}
                    </p>
                  </div> */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Button
          onClick={onAddExperience}
          className="mt-5 text-lg text-primary hover:text-purpleText">
          +Add More
        </Button>
      </div>
    </>
  )
}

export default WorkExperience
