// src/components/TrackComponent.js
import React, { useEffect, useState } from "react";
import CircularProgressBarScan from "../../../../components/CircularProgressBarScan";
import trackImg from "../../../../assets/resumeBuilder/trackImg.svg";

const TrackComponent = ({
  companyName,
  role,
  description,
  createdAt,
  progress,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="rounded-md border border-primary flex p-2 w-[100%] md:[80%] items-center justify-between">
      <div className="flex space-x-5">
        <div>
          <CircularProgressBarScan
            progress={progress}
            size={isMobile ? 80 : 120}
            strokeWidth={15}
          />
        </div>
        <div className="flex flex-col justify-center items-start space-y-2">
          <p className="font-semibold text-base md:text-lg">
            {companyName} - {role}
          </p>
          <p className="text-xs md:text-sm text-lightestGrey">{description}</p>
          <p className="text-xs md:text-sm text-lightestGrey">
            Created {createdAt}
          </p>
        </div>
      </div>
      <div className="justify-start  flex  space-x-1 mb-auto lg:mb-0  pr-5 md:pr-2">
        <img src={trackImg} alt="Track Icon" loading="lazy" />
        <p className="text-start font-medium">Track</p>
      </div>
    </div>
  );
};

export default TrackComponent;
