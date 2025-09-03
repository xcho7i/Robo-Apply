import React from "react"
import awardPic from "../../../../assets/resumeManagerIcons/award.svg" // Ensure this icon is available
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

const Achievement = ({ achievements, onEdit, onDelete, onAddAchievement }) => {
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
        <div className="items-center justify-start w-full flex py-5">
          <p className="text-xl text-primary font-normal border-b-2 border-purple pb-1">
            Achievements
          </p>
        </div>

        <div className="space-y-2 w-[95%] md:w-[80%] border border-customGray  rounded-lg">
          {achievements.length === 0 ? (
            <div className="border border-dashed rounded-xl border-customGray m-5 p-5 md:p-10">
              <p className="text-primary text-center ">No Achievements added</p>
            </div>
          ) : (
            achievements.map((achievement, index) => (
              <div
                key={index}
                className="border border-x-0 border-t-0 px-5 mx-2 mb-3 md:px-10 py-5">
                <div className="flex items-center justify-end">
                  <EditButton onClick={() => onEdit(index)} />
                  <DeleteButton onClick={() => onDelete(index)} />
                </div>
                <div className="flex w-full space-x-3 md:space-x-10">
                  <div>
                    <img src={awardPic} alt="Achievement" loading="lazy" />
                  </div>
                  <div className="w-[80%] md:w-[90%] text-primary space-y-3">
                    <div className=" text-sm md:text-lg font-semibold">
                      <p>{achievement.awardTitle}</p>
                    </div>
                    <div className="flex text-xs md:text-base space-x-3 md:space-x-5">
                      <p>{sanitizeStartDate(achievement.startDate)} </p>
                      {achievement.startDate && <p>-</p>}

                      <p> {sanitizeEndDate(achievement.endDate)}</p>

                      {/* <p>
                      {new Date(achievement.startDate).toLocaleDateString()}
                    </p>
                    <p>-</p>
                    <p>
                      {achievement.endDate
                        ? new Date(achievement.endDate).toLocaleDateString()
                        : "Present"}
                    </p> */}
                    </div>
                    <div
                      className="text-primary text-justify text-xs md:text-base experience-description"
                      dangerouslySetInnerHTML={{
                        __html: achievement.description
                      }}>
                      {/* <p>{achievement.description}</p> */}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Button
          onClick={onAddAchievement}
          className="my-5 text-lg text-primary hover:text-purpleText">
          +Add More
        </Button>
      </div>
    </>
  )
}

export default Achievement
