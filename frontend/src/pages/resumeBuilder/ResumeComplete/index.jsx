import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import DashboardNavbar from "../../../dashboardNavbar";
import Button from "../../../components/Button";
import completeImage from "../../../assets/resumeBuilder/completeImg.svg";
import starImage from "../../../assets/resumeBuilder/star.svg";

const ResumeComplete = () => {
  const navigate = useNavigate();
  const [resumeTitle, setResumeTitle] = useState("");

  useEffect(() => {
    // Get the resume title from localStorage and set it to the state
    const title = localStorage.getItem("resumeTitle");
    if (title) {
      setResumeTitle(title);
    }
  }, []);
  return (
    <>
      <div className="flex flex-col bg-almostBlack h-screen">
        <header>
          <DashboardNavbar />
        </header>

        <div className="bg-almostBlack w-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full px-3 md:px-10 py-5 md:py-10">
            <div className="flex items-center justify-between md:px-10 lg:px-20">
              <p className="text-primary text-lg md:text-3xl font-medium">
                AI ResumeBuilder
              </p>
              <Button
                onClick={() => navigate("/scan-resume/showResume")}
                className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              >
                <HiArrowLeft className="mr-2" />
                Go Back
              </Button>
            </div>
            <div className="flex flex-col  items-center justify-center h-full">
              <div className="py-20 px-10 w-full rounded-lg text-center space-y-5">
                <div className="flex justify-center">
                  <img src={completeImage} loading="lazy" />
                </div>
              </div>
              <div className="py-10 px-5 md:px-10 w-full text-primary rounded-lg text-center space-y-5">
                <p className="text-xl md:text-4xl font-semibold">
                  You’ve finished creating your resume
                </p>
                <p className="text-lg md:text-2xl font-normal text-primary">
                  Use this resume as the base to optimize for future job
                  applications
                </p>
              </div>
              <div className=" md:w-[30%] items-center justify-center text-center space-y-5">
                {/* <p className="text-base font-normal text-lightestGrey">
                  Give your resume a name
                </p> */}
                <p className="text-lg font-semibold text-primary flex items-center justify-center text-center">
                  <img className="pr-2" src={starImage} loading="lazy" />
                  {resumeTitle ? resumeTitle : "Untitled Resume"}
                </p>
                <div className="justify-center flex items-center ">
                  <Button
                    onClick={() => navigate("/scan")}
                    className="p-3 flex items-center space-x-2 w-64 justify-center text-center text-navbar font-bold rounded-full bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  >
                    Scan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeComplete;
