import React from "react";
import extensionImage from "../../../../assets/extensionImage.svg";
import installLogo from "../../../../assets/extensionInstall/install.svg";
import detectJob from "../../../../assets/extensionInstall/detectJob.svg";
import autoFill from "../../../../assets/extensionInstall/autoFill.svg";
import customize from "../../../../assets/extensionInstall/customize.svg";

const ExtensionInstall = () => {
  return (
    <>
      <div className="pt-20">
        <div className="block lg:flex justify-between gap-20 items-center mx-auto lg:mx-[10%] ">
          <div className="w-full h-[420px] lg:w-[640px]  flex lg:justify-start justify-center">
            <img src={extensionImage} alt="Extension Install" loading="lazy" />
          </div>
          <div className="flex flex-col sm:flex-col sm:items-center  sm:justify-center lg:justify-start lg:items-start pt-10 lg:pt-0">
            <div className="text-center mb-5">
              <p className="text-white text-3xl font-semibold ">
                How to use AI Powered Jobs
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
                  Detect Job Application Forms
                </p>
                <p className="text-lightGrey text-base font-normal pt-4">
                  Learn how to automatically identify job forms.
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
                  Auto-Fill Your Applications
                </p>
                <p className="text-lightGrey text-base font-normal pt-4">
                  Seamlessly auto-fill forms with profile data.
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
                <img src={customize} loading="lazy" />
              </div>
              <div>
                <p className="text-white text-xl font-medium">
                  Customize Form-Filling Settings
                </p>
                <p className="text-lightGrey text-base font-normal pt-4">
                  Adjust settings for personalized form-filling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExtensionInstall;
