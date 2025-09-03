import React from "react";

const MinMaxBar = ({
  value,
  min = 400,
  max = 1000,
  totalMin = 0,
  totalMax = 1500,
}) => {
  const getPosition = (point) =>
    ((point - totalMin) / (totalMax - totalMin)) * 100;
  const getFillWidth = () => {
    const fillStart = totalMin;
    const fillEnd = Math.min(Math.max(value, totalMin), totalMax);
    return getPosition(fillEnd) - getPosition(fillStart);
  };

  const minPosition = getPosition(min);
  const maxPosition = getPosition(max);

  return (
    <div className="w-full  mx-auto  px-2">
      {/* Min and Max markers */}
      <div className="relative  mb-1">
        <div
          className="absolute top-0 w-1 h-7 bg-dangerColor z-50"
          style={{ left: `${minPosition}%` }}
        />
        <div
          className="absolute top-0  h-7 w-1 bg-purpleBackground z-50"
          style={{ left: `${maxPosition}%` }}
        />
      </div>

      {/* Bar */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-purple"
          style={{ width: `${getFillWidth()}%` }}
        />
      </div>

      {/* Labels */}
      <div className="relative  h-6  text-xs">
        <span className="absolute left-0 top-0 text-gray-500">{totalMin}</span>
        <span className="absolute right-0 top-0 text-gray-500">{totalMax}</span>
        <span
          className="absolute top-3 text-danger"
          style={{ left: `${minPosition}%`, transform: "translateX(-50%)" }}
        >
          Min: {min}
        </span>
        <span
          className="absolute top-3 text-tickPurle"
          style={{ left: `${maxPosition}%`, transform: "translateX(-50%)" }}
        >
          Max: {max}
        </span>
      </div>

      {/* Value label */}
      {/* <div className="text-center mt-2">
        <span className="text-primary font-semibold">Value: {value}</span>
      </div> */}
    </div>
  );
};

export default MinMaxBar;
