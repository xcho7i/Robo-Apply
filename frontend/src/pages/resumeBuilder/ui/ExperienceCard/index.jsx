import React from "react"
import { FaEdit, FaTrash } from "react-icons/fa"
import experiencePic from "../../../..//assets/resumeManagerIcons/work-experience.svg"

const ExperienceCard = ({ experience, onEdit, onDelete }) => {
  // Custom styles for lists to ensure they display properly
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

  return (
    <>
      <style>{listStyles}</style>
      <div className="border w-full border-customGray bg-dropdownBackground rounded-lg mt-2 px-3 md:px-10 py-3 md:py-5">
        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={onEdit}
            className="text-purple hover:text-primary transition-colors">
            <FaEdit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="text-purple hover:text-primary transition-colors">
            <FaTrash size={18} />
          </button>
        </div>

        {/* Experience Details */}
        <div className="flex w-full space-x-4 md:space-x-10 mt-3">
          {/* Experience Icon */}
          <div className="flex-shrink-0">
            <img
              src={experiencePic}
              alt="Experience"
              className="w-10 h-10 md:w-16 md:h-16 object-contain"
              loading="lazy"
            />
          </div>

          {/* Details Section */}
          <div className="w-[80%] md:w-[90%] space-y-3">
            <div className="md:flex md:space-x-2 text-primary">
              <p className="font-medium whitespace-nowrap md:font-semibold">
                {experience.jobTitle}
              </p>
              <p className="hidden md:block">|</p>
              <p className="text-primary">{experience.experienceType}</p>
            </div>
            <div className="md:flex md:space-x-2 text-sm md:text-base text-primary">
              <p>{experience.companyName}</p>
              <p className="hidden md:block">,</p>
              <p>{experience.location}</p>
            </div>
            <div className="flex space-x-2 md:space-x-5 text-xs md:text-base text-primary">
              <p>{new Date(experience.startDate).toLocaleDateString()}</p>
              <p>-</p>
              <p>
                {experience.endDate === "Present"
                  ? "Present"
                  : new Date(experience.endDate).toLocaleDateString()}
              </p>
            </div>
            <div
              className="text-primary text-justify text-xs md:text-base experience-description"
              dangerouslySetInnerHTML={{ __html: experience.description }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default ExperienceCard
