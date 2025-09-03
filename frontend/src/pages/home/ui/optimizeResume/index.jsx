import React from "react";
import scanResumeImage from "../../../../assets/resumeScan.svg";
import scannerImage from "../../../../assets/scanImage.svg";
import Button from "../../../../components/Button";

const OptimizeResume = () => {
  return (
    <>
      <div className="mx-[10%] pt-20">
        <div className="lg:flex w-full">
          <div className="lg:w-[50%] mb-10 lg:mb-0 justify-center flex">
            <img src={scanResumeImage} loading="lazy" />
          </div>
          <div className="w-full justify-end items-center flex">
            <div className="lg:w-[600px]">
              <p className="text-4xl font-semibold mb-10 ">
                Optimize Your Resume for Success
              </p>
              <p className="text-justify leading-relaxed mb-10">
                In today's competitive job market, having a resume that stands
                out is crucial. Our AI-powered platform scans your resume to
                ensure it's tailored to match the job requirements. We analyze
                key elements such as keywords, formatting, and structure,
                providing you with actionable feedback to improve your chances
                of landing that dream job. With our intuitive tools, you can
                easily optimize your resume for any application, making sure it
                gets noticed by recruiters and passes through applicant tracking
                systems seamlessly.
              </p>
              <Button className="p-3 px-4 flex items-center space-x-2 max-w-40 min-w-max  h-12 text-navbar  bg-gradient-to-b from-gradientStart to-gradientEnd rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                <img src={scannerImage} className="px-1" loading="lazy" />
                Scan Your Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OptimizeResume;
