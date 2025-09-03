import React from "react";

const ProgressBarWithPoints = ({
  topLabel,
  topValue,
  bottomLabel,
  bottomValue,
}) => {
  // Ensure values are clamped between 0 and 100 for proper display
  const adjustedTopValue = Math.min(Math.max(topValue, 0), 100);
  const adjustedBottomValue = Math.min(Math.max(bottomValue, 0), 100);

  return (
    <div className="relative w-1/2 h-4 bg-purpleBackground rounded-lg">
      {/* Purple progress fill */}
      <div
        className="absolute h-full bg-purple-600 rounded-lg"
        style={{ width: `${adjustedBottomValue}%` }}
      ></div>

      {/* Top marker */}
      <div
        className="absolute top-2 transform -translate-x-1/2"
        style={{ left: `${adjustedTopValue}%` }}
      >
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white mx-auto"></div>
      </div>

      {/* Bottom marker */}
      <div
        className="absolute bottom-2 transform -translate-x-1/2"
        style={{ left: `${adjustedBottomValue}%` }}
      >
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-white mx-auto"></div>
      </div>

      {/* Top label */}
      <div
        className="absolute top-full mt-2 transform -translate-x-1/2"
        style={{ left: `${adjustedTopValue}%` }}
      >
        <p className="text-white text-xs font-medium text-center">
          {`${adjustedTopValue}%`}
        </p>
        <p className="text-white text-xs font-medium text-center">{topLabel}</p>
      </div>

      {/* Bottom label */}
      <div
        className="absolute bottom-full mb-2 transform -translate-x-1/2"
        style={{ left: `${adjustedBottomValue}%` }}
      >
        <p className="text-white text-xs font-medium text-center">
          {`${adjustedBottomValue}%`}
        </p>
        <p className="text-white text-xs font-medium text-center">
          {bottomLabel}
        </p>
      </div>
    </div>
  );
};

export default ProgressBarWithPoints;
