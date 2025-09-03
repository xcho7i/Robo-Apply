import React, { useState, useEffect } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import DashBoardLayout from "../../../dashboardLayout";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import { errorToast } from "../../../components/Toast";

const ProfessionalSkills = () => {
  const [skillsList, setSkillsList] = useState([]); // state to hold skills from localStorage
  const [selectedSkills, setSelectedSkills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get skills from localStorage
    const savedSkills = JSON.parse(
      localStorage.getItem("skillsDataCoverLetter")
    );
    if (Array.isArray(savedSkills)) {
      setSkillsList(savedSkills);
    }

    const storedSelectedSkills = JSON.parse(
      localStorage.getItem("coverLetterSkills")
    );
    if (storedSelectedSkills) {
      setSelectedSkills(storedSelectedSkills);
    }
  }, []);

  const handleSelectSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((item) => item !== skill));
    } else if (selectedSkills.length < 3) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleContinue = () => {
    if (selectedSkills.length >= 1 && selectedSkills.length <= 3) {
      localStorage.setItem("coverLetterSkills", JSON.stringify(selectedSkills));
      navigate("/coverletter/experience");
    } else {
      errorToast("Please select at least 1 skill.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <DashBoardLayout>
      <div className="flex flex-col h-full bg-almostBlack">
        <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full">
            {/* Stepper UI */}
            <div className="w-full py-5 px-3">
              <div className="flex items-center justify-center relative">
                <div className="flex items-center">
                  {/* Steps */}
                  {[1, 2, 3].map((step, idx) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full ${
                            step === 1
                              ? "bg-stepperBackground"
                              : "border border-stepperBackground"
                          } text-primary`}
                        >
                          {step}
                        </div>
                        <span className="text-primary text-xs md:text-sm mt-2 absolute top-12">
                          {["Add details", "Personalize", "Download"][idx]}
                        </span>
                      </div>
                      {step !== 3 && (
                        <div className="flex items-center">
                          <div className="w-5 md:w-28 lg:w-32 h-1 flex-grow border-t-2"></div>
                          <div className="text-lg md:text-2xl">{`>`}</div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="px-[5%] md:px-[20%] ">
              <div className="text-center pt-20 border border-l-0 border-r-0 border-t-0 border-purple pb-5">
                <p className="text-primary text-xl md:text-4xl font-semibold">
                  Pick top 3 of your professional skills
                </p>
              </div>
            </div>

            {/* Skills List */}
            <div className="px-[5%] md:px-[30%] mt-20 flex flex-wrap md:mt-10 gap-4">
              {skillsList.length === 0 ? (
                <p className="text-primary text-center w-full">
                  No skills found. Please go back and try again.
                </p>
              ) : (
                skillsList.map((skill, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectSkill(skill)}
                    className={`relative text-primary py-5 px-10 rounded-lg flex items-center justify-center cursor-pointer 
                      ${
                        selectedSkills.includes(skill)
                          ? "border-2 border-customPurple bg-modalPurple"
                          : "border-2 border-customGray bg-lightGreyBackground"
                      }`}
                  >
                    {selectedSkills.includes(skill) && (
                      <IoCheckmarkCircle className="absolute bottom-10 right-2 text-prupleText text-3xl" />
                    )}
                    {skill}
                  </div>
                ))
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center space-x-4 mt-10">
              <Button
                onClick={handleBack}
                className="py-3 px-8 md:px-12 flex items-center justify-center bg-almostBlack text-xl font-bold rounded-full border-2 border-purple hover:ring-2 hover:ring-purple focus:ring-2 focus:ring-purple"
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="py-3 px-4 sm:px-10 flex items-center justify-center text-xl font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashBoardLayout>
  );
};

export default ProfessionalSkills;
