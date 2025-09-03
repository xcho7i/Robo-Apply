import React from "react";
import linkedinLogo from "../../../../assets/socialMedia/LinkedIn.svg"; // Replace with your actual paths
import indeedLogo from "../../../../assets/socialMedia/indeed.svg";
import zipRecruiterLogo from "../../../../assets/socialMedia/Ziprecruiter.svg";
import diceLogo from "../../../../assets/socialMedia/dice.svg";
import monsterLogo from "../../../../assets/socialMedia/Monster.svg";
import simplyHiredLogo from "../../../../assets/socialMedia/SimplyHired.svg";
import Button from "../../../../components/Button";
import { SlArrowRight } from "react-icons/sl";

const Platforms = () => {
  const partners = [
    { name: "LinkedIn", logo: linkedinLogo },
    { name: "Indeed", logo: indeedLogo },
    { name: "ZipRecruiter", logo: zipRecruiterLogo },
    { name: "Dice", logo: diceLogo },
    { name: "Monster", logo: monsterLogo },
    { name: "SimplyHired", logo: simplyHiredLogo },
  ];

  return (
    <div className="py-6  mt-20 flex flex-col gap-4">
      {" "}
      <div className="text-center mb-5">
        <p className="text-white text-3xl font-semibold ">
          Works with Top Job Sites Like LinkedIn, indeed, and More
        </p>
      </div>{" "}
      <div
        style={{
          borderTop: "1px solid",
          borderImageSource:
            "radial-gradient(48.6% 799.61% at 50% 50%, #4776E6 0%, rgba(142, 84, 233, 0) 100%)",
          borderImageSlice: 1,
          padding: "1rem",
        }}
      >
        <div className="max-w-[1600px] mx-auto flex justify-between items-center hover:cursor-pointer  ">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 hover:scale-110 transition-transform duration-300 "
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-10 h-10 object-contain"
                loading="lazy"
              />
              <span className="text-white font-medium text-3xl">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-20 mb-20">
        <Button className="p-3 px-6 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-[#FFC107] text-black font-semibold rounded-full">
          <div className="flex justify-between items-center gap-4">
            <p>Start Applying today</p> <SlArrowRight />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Platforms;
