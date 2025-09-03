import React from "react";

const CircularProgressBar = ({ progress, size = 100, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const gapCount = 10;
  const gapAngle = 360 / gapCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        className="text-primary"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />

      <circle
        className="text-purple"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        }}
      />

      <g fill="transparent" strokeWidth={strokeWidth}>
        {Array.from({ length: gapCount }).map((_, index) => {
          const angle = gapAngle * index;
          const x1 =
            size / 2 + radius * Math.cos((angle - 90) * (Math.PI / 180));
          const y1 =
            size / 2 + radius * Math.sin((angle - 90) * (Math.PI / 180));
          const x2 =
            size / 2 + radius * Math.cos((angle + 3 - 90) * (Math.PI / 180));
          const y2 =
            size / 2 + radius * Math.sin((angle + 3 - 90) * (Math.PI / 180));

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(44, 33, 54, 1)"
              strokeWidth={strokeWidth}
            />
          );
        })}
      </g>

      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="32px"
        fontWeight="bold"
      >
        {`${progress}%`}
      </text>
    </svg>
  );
};

export default CircularProgressBar;
