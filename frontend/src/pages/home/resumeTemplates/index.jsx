import React from "react";
import resume_templates from "../../../assets/resume_templates.svg";
import Button from "../../../components/Button";
import { SlArrowRight } from "react-icons/sl";
import resume_score from "../../../assets/resume_score.png";
const ResumeTemplates = () => {
  return (
    <div className="flex flex-col gap-20 justify-center items-center">
      <div className="text-center ">
        <div className="text-white  flex justify-center flex-col items-center gap-10">
          <div className="w-full">
            <p className="text-5xl font-semibold">
              Beautiful Professional Resume Effortlessly with
            </p>
            <div className="flex justify-center items-center pt-5">
              <span className="text-[#A047F9] font-bold text-6xl">Robo</span>
              <span
                className="text-[#FFC107] font-bold text-6xl"
                style={{ letterSpacing: "-0.05em" }}
              >
                Apply
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-10 justify-center items-center pt-5">
            <div className="w-full space-y-10 flex justify-center items-center ">
              <div className="w-[30%] flex justify-center ">
                <p className="font-semibold text-4xl text-center">
                  Choose ATS Friendly Resume Templates
                </p>
              </div>
            </div>
            <div className="w-full space-y-10 flex justify-center items-center ">
              <div className="w-[40%] flex justify-center ">
                <p className="text-center">
                  Use our resume and CV builder to create the best application
                  documents possible in minutes. With 200+ customizable resume
                  templates and plenty of free CV template configurations,
                  you’re guaranteed to create an impeccable resume.
                </p>
              </div>
            </div>
            <img
              src={resume_templates}
              alt="Resume Templates"
              className="w-[70%] h-auto"
              loading="lazy"
            />
            <Button className="p-3 px-6 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-[#FFC107] text-black font-semibold rounded-full">
              <div className="flex justify-between items-center gap-4">
                <p>Create my resume</p>
                <SlArrowRight />
              </div>
            </Button>
          </div>
        </div>
      </div>
      <div className="text-center ">
        <div className="text-white w-full text-3xl font-semibold flex justify-center flex-col items-center gap-10">
          <div className="w-[40%] ">
            <span>AI Resume Score</span>
          </div>
          <div className="w-[40%] text-lg font-normal">
            <span>
              Use our resume and CV builder to create the best application
              documents possible in minutes. With 200+ customizable resume
              templates and plenty of free CV template configurations, you’re
              guaranteed to create an impeccable resume.
            </span>
          </div>
          <div>
            <img src={resume_score} className=" pb-20" loading="lazy"></img>
          </div>
          <div className="font-normal text-2xl flex flex-col gap-10 justify-center items-center">
            <Button className="p-3 px-6 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-[#FFC107] text-black font-semibold rounded-full">
              <div className="flex justify-between items-center gap-4">
                <p>Score my resume</p> <SlArrowRight />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplates;
