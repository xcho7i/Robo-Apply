import React from "react";
import { IoMdCheckmark } from "react-icons/io";
import Thirty_Day from "../../../assets/30days.svg";
import whatWeDo from "../../../assets/whatWeDo.svg";
import frameOne from "../../../assets/frame1.svg";
import frameTwo from "../../../assets/frame2.svg";
import Button from "../../../components/Button";

const WhatWeDo = () => {
  const items = [
    {
      title: "Save Time, Get Hired",
      description:
        "Let RoboApply's Job GPT automate your job applications so you can focus on growth.",
    },
    {
      title: "Quick and Easy Application",
      description:
        "Our Job GPT automatically fills the job application based on your information.",
    },
    {
      title: "Advanced AI Security",
      description:
        "Stay worry-free—our advanced AI keeps your profile safe and ensures you never get blocked.",
    },
  ];

  return (
    <>
      <img src={whatWeDo} className="w-full pt-20" loading="lazy" />

      <div className="flex justify-center mt-20 ">
        <div className="text-white p-6 rounded-lg  shadow-lg w-3/4 bg-[#1a1322] ">
          {/* <h2 className="text-3xl font-bold text-center mb-6">What We Do</h2> */}
          <div className="space-y-4 ">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 bg-primaryBackground p-4 rounded-lg border shadow-sm shadow-white"
              >
                <div className="bg-[#EAB308] p-2 rounded-full text-2xl">
                  <IoMdCheckmark color="black" />{" "}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#954CDE]">
                    {item.title}
                  </h3>
                  <p className="text-normal text-white">{item.description}</p>
                </div>
              </div>
            ))}
            {/* <div className="flex justify-center">
              <div className="flex items-center space-x-4 bg-[#2C283C] px-20 py-4 rounded-lg justify-between w-3/4">
                <div>
                  <h3 className="text-xl font-semibold text-[#954CDE]">
                    30 DAYS MONEY BACK GURANTEE
                  </h3>
                  <p className="text-normal text-white">
                    Get an interview within 30 days or your money
                    back—guaranteed!
                  </p>
                </div>
                <div>
                  <img src={Thirty_Day} className="w-24 h-24"></img>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className=" items-center justify-center flex">
        <div className="p-4 w-[75%] my-20 items-center justify-center flex">
          <img src={frameOne} loading="lazy" />
        </div>
      </div>
      <div className=" items-center justify-center flex">
        <div className="p-4 w-[75%]  items-center justify-center flex">
          <img src={frameTwo} loading="lazy" />
        </div>
      </div>
      <div className="font-normal text-2xl flex flex-col gap-10 justify-center items-center pt-20">
        <Button className="p-3 px-6 text-center justify-center flex items-center space-x-2 w-56 min-w-max h-12 text-navbar bg-[#FFC107] text-black font-semibold rounded-full">
          Get Started
        </Button>
      </div>
    </>
  );
};

export default WhatWeDo;
