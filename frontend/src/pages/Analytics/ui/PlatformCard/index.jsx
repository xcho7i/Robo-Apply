import React from "react";
import Button from "../../../../components/Button";

const PlatformCard = ({
  icon,
  platformName,
  totalJobs,
  linkIcon,
  onShowTable,
}) => {
  return (
    <div className="border border-primary rounded-lg  px-5 py-8 w-full space-y-5">
      <div className="flex  gap-2 px-2 items-center">
        <img src={icon} alt={`${platformName} icon`} loading="lazy" />
        <p className="text-xl font-medium text-primary">{platformName}</p>
      </div>
      <div className="px-4 py-3 bg-analyticsBoxBackground rounded-lg flex items-center justify-between">
        <p className="text-primary text-medium font-medium">Total Jobs</p>
        <p className="text-white text-2xl font-medium">{totalJobs}</p>
      </div>
      <div>
        <Button
          onClick={onShowTable}
          className="flex items-center justify-center w-full gap-3 text-base font-semibold px-3 py-3 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded-full hover:ring-2 hover:ring-gradientEnd"
        >
          Check by links
          <img src={linkIcon} alt="Link Icon" loading="lazy" />
        </Button>
      </div>
    </div>
  );
};

export default PlatformCard;
