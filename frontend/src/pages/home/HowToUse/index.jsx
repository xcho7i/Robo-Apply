import React from "react";
import extensionImage from "../../../assets/extensionImage.svg";
import installLogo from "../../../assets/extensionInstall/install.svg";
import detectJob from "../../../assets/extensionInstall/detectJob.svg";
import autoFill from "../../../assets/extensionInstall/autoFill.svg";
import customize from "../../../assets/extensionInstall/customize.svg";
import sign_up_image from "../../../assets/sign_up_image.png";

import FirstApply from "../../../assets/FirstApply.svg";
import SecondApply from "../../../assets/SecondApply.svg";
import ThirdApply from "../../../assets/ThirdApply.svg";
import FourthApply from "../../../assets/FourthApply.svg";
import FifthApply from "../../../assets/FifthApply.svg";
import Button from "../../../components/Button";

const HowToUse = () => {
  return (
    <>
      <div className="text-white pt-28 flex justify-center flex-col items-center gap-10">
        <div className="w-full text-center flex  items-center justify-center ">
          <p className="text-5xl font-medium pr-5">How To Use</p>
          <span className="text-[#A047F9] font-bold text-6xl">Robo</span>
          <span className="text-[#FFC107] font-bold text-6xl"> Apply</span>
        </div>
        <div className="w-full text-center">
          <p className="text-3xl font-medium">
            Achieve clear, impactful results without the complexity.
          </p>
        </div>
      </div>
      {/* First  */}
      <div className="pt-20 flex justify-center gap-10 ">
        <div className="flex flex-col sm:flex-col sm:items-center  sm:justify-center lg:justify-start lg:items-start pt-10 lg:pt-0 ">
          <div className="text-center mb-5 flex gap-10">
            <div className="w-10 h-10 rounded-full bg-[#FFC107] flex flex-col justify-center items-center">
              <p className="text-black font-bold text-center text-xl "> 1 </p>
            </div>
            <p className="text-white text-3xl font-semibold ">
              Add Extension to Chrome
            </p>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div className="">
              <img src={installLogo} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">
                Install the Extension
              </p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Quickly add the extension to your browser.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full h-[420px] lg:w-[640px]  flex lg:justify-start justify-center ">
          <img src={FirstApply} alt="First Apply" loading="lazy" />
        </div>
      </div>

      {/* Second  */}
      <div className="pt-20 flex justify-center gap-10">
        <div className="w-full h-[420px] lg:w-[640px]  flex lg:justify-start justify-center">
          <img src={SecondApply} alt="Extension Install" loading="lazy" />
        </div>

        <div className="flex flex-col sm:flex-col sm:items-center  sm:justify-center lg:justify-start lg:items-start pt-10 lg:pt-0">
          <div className="text-center mb-5 flex gap-10">
            <div className="w-10 h-10 rounded-full bg-[#FFC107] flex flex-col justify-center items-center">
              <p className="text-black font-bold text-center text-xl "> 2 </p>
            </div>
            <p className="text-white text-3xl font-semibold ">
              Pin the extension by clicking the pin
            </p>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div className="">
              <img src={installLogo} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">
                Open the extension menu
              </p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Click on the extension Icon in your Chrome browser
              </p>
            </div>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 rounded-lg hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div>
              <img src={detectJob} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">Pin RoboApply</p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Click the pin button for quick access
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Third */}

      <div className="pt-20 flex justify-center gap-10">
        <div className="flex flex-col sm:flex-col sm:items-center  sm:justify-center lg:justify-start lg:items-start pt-10 lg:pt-0">
          <div className="text-center mb-5 flex gap-10">
            <div className="w-10 h-10 rounded-full bg-[#FFC107] flex flex-col justify-center items-center">
              <p className="text-black font-bold text-center text-xl "> 3 </p>
            </div>
            <p className="text-white text-3xl font-semibold ">
              Login to RoboApply
            </p>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div className="">
              <img src={installLogo} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">Open RoboApply</p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Click the Roboapply icon in the chrome bar
              </p>
            </div>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 rounded-lg hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div>
              <img src={detectJob} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">Sign in</p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Use your Google account to log in.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full h-[420px] lg:w-[640px]  flex lg:justify-start justify-center">
          <img src={ThirdApply} alt="Extension Install" loading="lazy" />
        </div>
      </div>

      {/* Fourth */}
      <div className="pt-20 flex justify-center gap-10">
        <div className="w-full h-[420px] lg:w-[640px]  flex lg:justify-start justify-center">
          <img src={FourthApply} alt="Extension Install" loading="lazy" />
        </div>

        <div className="flex flex-col sm:flex-col sm:items-center  sm:justify-center lg:justify-start lg:items-start pt-10 lg:pt-0">
          <div className="text-center mb-5 flex gap-10">
            <div className="w-10 h-10 rounded-full bg-[#FFC107] flex flex-col justify-center items-center">
              <p className="text-black font-bold text-center text-xl "> 4 </p>
            </div>
            <p className="text-white text-3xl font-semibold ">
              Complete your resume
            </p>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div className="">
              <img src={installLogo} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">
                Open resume manager
              </p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Click on the Resume Manager option in the side bar
              </p>
            </div>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 rounded-lg hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div>
              <img src={detectJob} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">
                Fill your Details
              </p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Enter your information to start using RoboApply
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fifth */}
      <div className="pt-20 flex justify-center gap-10">
        <div className="flex flex-col sm:flex-col sm:items-center  sm:justify-center lg:justify-start lg:items-start pt-10 lg:pt-0">
          <div className="text-center mb-5 flex gap-10">
            <div className="w-10 h-10 rounded-full bg-[#FFC107] flex flex-col justify-center items-center">
              <p className="text-black font-bold text-center text-xl "> 5 </p>
            </div>
            <p className="text-white text-3xl font-semibold ">Start Applying</p>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div className="">
              <img src={installLogo} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">
                Click Start Applying
              </p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Begin the application process
              </p>
            </div>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 rounded-lg hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div>
              <img src={detectJob} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">Fetch Filters</p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Fetch the filters by clicking on the fetch filter button
              </p>
            </div>
          </div>
          <div
            className="flex gap-5 lg:w-[560px] justify-start p-4 rounded-lg hover:bg-[rgba(255,255,255,0.02)] hover:border hover:cursor-pointer"
            style={{
              border: "0.8px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderImageSource =
                "linear-gradient(180deg, #FFFFFF -47.32%, rgba(255, 255, 255, 0) 83.2%, #FFFFFF 195.98%)";
              e.currentTarget.style.borderImageSlice = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderImageSource = "none";
            }}
          >
            <div>
              <img src={autoFill} loading="lazy" />
            </div>
            <div>
              <p className="text-white text-xl font-medium">
                Begin the process
              </p>
              <p className="text-lightGrey text-base font-normal pt-4">
                Start your automated job applications
              </p>
            </div>
          </div>
        </div>
        <div className="w-full h-[420px] lg:w-[640px]  flex lg:justify-start justify-center">
          <img src={FifthApply} alt="Extension Install" loading="lazy" />
        </div>
      </div>
      {/* add button */}
      <div className="font-normal text-2xl flex flex-col gap-10 justify-center items-center pt-20">
        <Button className="p-3 px-6 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-[#FFC107] text-black font-semibold rounded-full">
          <div className="flex justify-between items-center gap-4">
            <p>Get Started Today</p>
          </div>
        </Button>
      </div>
    </>
  );
};

export default HowToUse;
