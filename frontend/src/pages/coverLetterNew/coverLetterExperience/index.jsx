import React, { useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import DashBoardLayout from "../../../dashboardLayout";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import { errorToast } from "../../../components/Toast";

const CoverLetterExperience = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const navigate = useNavigate();

  const experiences = ["~1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

  const handleContinue = () => {
    if (selectedIndex === null) {
      errorToast("Please select your experience.");
      return;
    }

    // Store selected experience
    const selectedValue =
      selectedIndex === experiences.length
        ? "Just starting out"
        : experiences[selectedIndex];
    localStorage.setItem("coverLetterExperience", selectedValue);

    // Navigate accordingly
    if (selectedValue === "Just starting out") {
      navigate("/coverletter/education");
    } else {
      navigate("/coverletter/oldexperience");
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
                  {[1, 2, 3].map((step, idx) => (
                    <React.Fragment key={idx}>
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
                          {step === 1
                            ? "Add details"
                            : step === 2
                            ? "Personalize"
                            : "Download"}
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
            <div className="px-[5%] md:px-[20%]">
              <div className="text-center pt-20 border border-l-0 border-r-0 border-t-0 border-purple pb-5">
                <p className="text-primary text-xl md:text-4xl font-semibold">
                  How many years of relevant experience do you have?
                </p>
              </div>
            </div>

            {/* Experience options */}
            <div className="px-[5%] md:px-[25%] mt-20">
              <div className="flex flex-wrap gap-2 justify-between">
                {experiences.map((experience, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`relative w-[9%] min-w-[60px] py-10 text-center text-xl font-semibold cursor-pointer rounded-md 
                      ${
                        selectedIndex === index
                          ? "border-2 border-customPurple bg-modalPurple"
                          : "border-2 border-customGray bg-lightGreyBackground"
                      } text-primary`}
                  >
                    {selectedIndex === index && (
                      <IoCheckmarkCircle className="absolute bottom-24 right-1 text-prupleText text-2xl" />
                    )}
                    {experience}
                  </div>
                ))}

                {/* Just starting out option */}
                <div
                  onClick={() => setSelectedIndex(experiences.length)} // Unique index
                  className={`relative w-full text-center text-xl font-semibold py-10 mt-4 cursor-pointer rounded-md
                    ${
                      selectedIndex === experiences.length
                        ? "border-2 border-customPurple bg-modalPurple"
                        : "border-2 border-customGray bg-lightGreyBackground"
                    } text-primary`}
                >
                  {selectedIndex === experiences.length && (
                    <IoCheckmarkCircle className="absolute bottom-24 right-4 text-prupleText text-2xl" />
                  )}
                  Just starting out
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
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

export default CoverLetterExperience;
