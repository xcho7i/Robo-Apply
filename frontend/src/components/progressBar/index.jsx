import React from "react";

const ProgressBar = ({ label, progress }) => {
  return (
    <div>
      <div className="flex justify-between text-center">
        <div className="flex justify-between w-full pb-2 items-center">
          <p className="text-primary text-xs lg:text-sm font-normal">{label}</p>
          <p className="px-1.5 text-sm font-semibold text-primary">
            {progress}
          </p>
        </div>
      </div>
      <div
        className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden "
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="flex flex-col justify-center rounded-full overflow-hidden text-xs text-primary text-center whitespace-nowrap transition duration-500"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(180deg, #AF63FB 0%, #8C20F8 100%)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
