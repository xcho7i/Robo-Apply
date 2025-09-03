import React from "react"
import awardPic from "../../../../assets/resumeManagerIcons/award.svg"
import EditButton from "../../../resumeManager/ui/EditButton"
import DeleteButton from "../../../resumeManager/ui/DeleteButton"
import Button from "../../../../components/Button"

const AddAchievementsResume = ({
  achievements,
  onEditAchievement,
  onDeleteAchievement,
  onAddAchievement,
  setAchivements
}) => {
  // Custom styles for lists to ensure they display properly
  const listStyles = `
    .achievement-description ul {
      list-style-type: disc !important;
      list-style-position: inside !important;
      margin-left: 1rem !important;
      padding-left: 0.5rem !important;
    }
    
    .achievement-description ol {
      list-style-type: decimal !important;
      list-style-position: inside !important;
      margin-left: 1rem !important;
      padding-left: 0.5rem !important;
    }
    
    .achievement-description li {
      margin-bottom: 0.25rem !important;
      padding-left: 0.25rem !important;
    }
    
    .achievement-description p {
      margin-bottom: 0.5rem !important;
    }
    
    .achievement-description strong {
      font-weight: 600 !important;
    }
  `
  return (
    <div>
      <style>{listStyles}</style>
      <p className="text-xl text-primary font-normal mb-5 inline-block border-b-2 border-purple">
        Achievements
      </p>
      <div className="space-y-2 lg:space-y-3">
        {achievements.length === 0 ? (
          <div className="border border-dashed rounded-xl border-customGray p-16">
            <p className="text-primary text-center whitespace-nowrap">
              No Achievements added
            </p>
          </div>
        ) : (
          achievements.map((achievement, index) => (
            <div
              key={index}
              className="space-y-2 border border-customGray lg:px-5 lg:pb-5 rounded-lg">
              <div className="border border-x-0 border-t-0 px-5 lg:py-5 py-2">
                <div className="flex items-center justify-end">
                  <EditButton onClick={() => onEditAchievement(index)} />
                  <DeleteButton onClick={() => onDeleteAchievement(index)} />
                </div>
                <div className="flex w-full space-x-5 lg:space-x-10">
                  {/* Always show the image by removing any conditional display classes */}
                  <div className="flex-shrink-0">
                    <img
                      src={awardPic}
                      className="w-12 h-12"
                      alt="Achievement"
                      loading="lazy"
                    />
                  </div>
                  <div className="w-full space-y-1 lg:space-y-3">
                    <div className="text-lg font-semibold text-primary">
                      <p>{achievement.awardTitle}</p>
                    </div>
                    <div className="flex flex-col text-primary lg:flex-row lg:space-x-3 text-sm lg:text-base">
                      <p>{achievement.issuer}</p>
                      <div className="flex space-x-2 text-primary lg:space-x-2 text-sm">
                        <p>
                          {new Date(achievement.startDate).toLocaleDateString()}
                        </p>
                        <p>-</p>
                        <p>
                          {achievement.endDate
                            ? new Date(achievement.endDate).toLocaleDateString()
                            : "Present"}
                        </p>
                      </div>
                    </div>
                    <div
                      className="text-primary text-sm lg:text-base achievement-description"
                      dangerouslySetInnerHTML={{
                        __html: achievement.description
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Button
        onClick={() => {
          onAddAchievement()
          onEditAchievement(null)
          setAchivements(null)
        }}
        className="my-3 lg:my-5 text-lg font-semibold text-primary hover:text-purpleText">
        + Add More Achievements
      </Button>
    </div>
  )
}

export default AddAchievementsResume
