import React from "react";
import faq_header from "../../../assets/faq_header_icon.png";
import faq_ellpise from "../../../assets/faq_ellipse.svg";
const FaqHeader = () => {
  return (
    <div className="flex justify-center flex-col items-center ">
      <div className="flex justify-center  flex-col items-center gap-10   relative  p-10  w-3/4 rounded-md">
        <img src={faq_ellpise} className="absolute" loading="lazy"></img>
        <img
          src={faq_header}
          className="relative z-[9]"
          loading="lazy"
        ></img>{" "}
        <p className="text-4xl font-normal text-white]">
          Frequently Asked Questions
          <span className="text-[#A047F9] font-bold">Robo</span>{" "}
          <span className="text-[#FFC107] font-bold"> Apply</span>
        </p>
        <p className="text-lg text-primary ">
          Achieve clear, impactful results without the complexity.
        </p>
        <div className="cursor-pointer relative z-20 p-3 px-8 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-[#D19732] rounded-full text-black font-bold gap-2 hover:ring-2 hover:ring-white focus:ring-2">
          Get Started!!
        </div>
      </div>
    </div>
  );
};

export default FaqHeader;
