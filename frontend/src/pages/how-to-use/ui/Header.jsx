import React from "react";
import faq_ellpise from "../../../assets/faq_ellipse.svg";
const Header = () => {
  return (
    <div className="flex justify-center mt-10">
      <img src={faq_ellpise} className="absolute top-20 z-10" loading="lazy" />
      <div className="flex flex-col relative z-20 gap-4 justify-center items-center">
        <p className="text-4xl font-normal text-white ">
          How To Apply
          <span className="text-[#A047F9] font-bold">Robo</span>{" "}
          <span className="text-[#FFC107] font-bold"> Apply</span>
        </p>
        <p className="w-3/4 text-center">
          Achieve clear, impactful results without the complexity.
        </p>
        <div className="cursor-pointer relative z-20 p-3 px-8 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-[#FFC107] rounded-full text-black font-bold gap-2 hover:ring-2 hover:ring-white focus:ring-2">
          Get Started!!
        </div>
      </div>
    </div>
  );
};

export default Header;
