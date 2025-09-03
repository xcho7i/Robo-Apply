import React from "react";
import Button from "../../../components/Button";
import VideoShow from "../ui/videoLink";
import { SlArrowRight } from "react-icons/sl";
import { CiPlay1 } from "react-icons/ci";
import background2 from "../../../assets/background2.png";
import background_gradient from "../../../assets/background_gradient.png";
import Platforms from "../ui/platforms";

const HomeHeader2 = () => {
  return (
    <div>
      <div className="w-full items-center justify-center flex pt-10">
        <div className="flex space-x-2 py-3 px-5  bg-black min-w-max w-40 items-center justify-center rounded-full">
          <div className="py-1 px-2 border border-purple bg-purple rounded-full">
            <p className="text-sm">New</p>
          </div>
          <div>
            <p className="text-purple">Latest integration just arrived</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
        }}
        className="text-center pt-14"
      >
        <p className="text-large font-normal text-[#B2B2B2]">
          Get Hired Faster with{" "}
          <span className="text-[#A047F9] font-bold inline -mr-0.5">Robo</span>
          <span className="text-[#FFC107] font-bold inline"> Apply</span>
        </p>

        <p className="text-large text-primary font-bold">
          Transform Your Job Search with Job
        </p>
        <div className="pt-5 flex items-center justify-center">
          <p className="text-7xl font-bold text-[#FFC107]">
            Application Automation
          </p>
        </div>
        <div className="pt-5 flex items-center justify-center">
          <p className="text-lg font-base text-white">
            Let RoboApply Handle Your Job Applications, so you Don't Have to
            worry
          </p>
        </div>
        <div className="flex items-center justify-center gap-10 pt-10">
          <Button
            style={{
              boxShadow: `
            0 0 55px 20px rgba(255, 255, 255, 0.2), 
            0 0 110px 50px rgba(128, 0, 255, 0.3), 
            0 0 100px 100px rgba(128, 0, 255, 0.2)
          `,
            }}
            className="p-3 px-6 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-[#FFC107] text-black font-semibold rounded-full"
          >
            <div className="flex justify-center text-center items-center gap-2 text-lg font-bold">
              <p className="">Get Started</p> <SlArrowRight />
            </div>
          </Button>

          <button
            className="text-lg font-bold"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 20px",
              color: "white",
              fontWeight: "bold",
              backgroundColor: "transparent", // Original background color
              border: "2px solid #FFC107",
              borderRadius: "50px",
              cursor: "pointer",
              transition: "background-color 0.3s ease-in-out",
              boxShadow: `
                0 0 55px 20px rgba(255, 255, 255, 0.2), 
            0 0 110px 50px rgba(128, 0, 255, 0.3), 
            0 0 100px 100px rgba(128, 0, 255, 0.2)
              `,
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "16px" }}>
              <CiPlay1 fontSize={20} />
            </span>
            How it works
          </button>
        </div>
      </div>

      {/* Video Show and Platforms */}
      <div
        style={{
          position: "relative", // Keep it properly scoped
          zIndex: 1,
          marginTop: "20px", // Avoid overlapping with header content
        }}
      >
        <VideoShow />
        <Platforms />
      </div>
    </div>
  );
};

export default HomeHeader2;
