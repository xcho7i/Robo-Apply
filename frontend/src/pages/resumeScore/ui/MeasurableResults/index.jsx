import React from "react";
import { MdOutlineDone } from "react-icons/md";
import { ImCross } from "react-icons/im";

const MeasurableResults = ({ resultData, sectionTitle }) => {
  const { resultIcon, metrics, description, status } = resultData;

  return (
    <div className="w-full items-center justify-center mt-12  text-left">
      {/* Dynamic Section Title */}
      <p className="text-primary text-3xl font-medium">{sectionTitle}</p>

      <div className="w-full items-center justify-center flex">
        {/* Left Section: Icon and Metrics */}
        <div className="w-2/6 items-center justify-between flex gap-10 px-10">
          <div>
            <img src={resultIcon} alt="Result Icon" loading="lazy" />
          </div>
          <div className="text-lg text-primary font-medium">
            {metrics.map((metric, index) => (
              <p key={index}>{metric}</p>
            ))}
          </div>
        </div>

        {/* Middle Section: Description */}
        <div className="w-3/6 items-center justify-center flex pl-20 pr-10">
          <p className="text-primary text-xl font-normal text-justify">
            Your resume contains {metrics.length} instance(s) of measurable
            metrics, including {metrics.join(", ")}. {description}
          </p>
        </div>

        {/* Right Section: Status Icon */}
        <div className="w-1/6 flex items-center justify-center text-3xl text-center px-5">
          {status === "complete" ? (
            <MdOutlineDone className="text-purple" />
          ) : (
            <ImCross className="text-danger" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasurableResults;
