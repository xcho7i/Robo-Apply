import React from "react";

const CircularProgressBarScan = ({
  progress,
  size = 100,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Define 20 distinct colors for the progress segments
  const segmentColors = [
    "#D3D3D3", // Light Grey
    "#E8E8E8", // Slightly Darker Grey
    "#FFFFCC", // Very Light Yellow
    "#FFF9B0", // Light Yellow
    "#FFD700", // Gold Yellow
    "#FFC300", // Deep Yellow
    "#FFA500", // Orange
    "#FF8C00", // Dark Orange
    "#FF4500", // Orange-Red
    "#FF6347", // Tomato
    "#FF69B4", // Pink
    "#FF1493", // Deep Pink
    "#C71585", // Medium Violet
    "#9400D3", // Dark Violet
    "#8A2BE2", // Blue Violet
    "#4169E1", // Royal Blue
    "#1E90FF", // Dodger Blue
    "#00BFFF", // Deep Sky Blue
    "#87CEEB", // Sky Blue
    "#00FA9A", // Medium Spring Green
  ];

  // Remaining section with 5 green shades
  const remainingColors = [
    "#5F8575", // Shade 1
    // "#228B22", // Shade 2
    // "#4F7942", // Shade 3
    // "#008000", // Shade 4
    // "#355E3B", // Shade 5
  ];

  // Calculate color for progress segments
  const calculateSegmentColor = (progressValue) => {
    const segmentLength = 100 / segmentColors.length;
    const index = Math.min(
      Math.floor(progressValue / segmentLength),
      segmentColors.length - 1
    );
    return segmentColors[index];
  };

  // Create progress segments
  const segments = [];
  for (let i = 0; i < progress; i += 5) {
    segments.push({
      color: calculateSegmentColor(i),
      start: (i / 100) * circumference,
      end: Math.min(
        ((i + 5) / 100) * circumference,
        (progress / 100) * circumference
      ),
    });
  }

  // Create remaining segments
  const remainingOffset = (progress / 100) * circumference;
  const remainingSegmentLength = (100 - progress) / remainingColors.length;

  const remainingSegments = remainingColors.map((color, index) => {
    const start =
      remainingOffset + (index * remainingSegmentLength * circumference) / 100;
    const end = start + (remainingSegmentLength * circumference) / 100;
    return { color, start, end };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="white" />
      {/* Render Progress Circle Segments */}
      {segments.map((segment, index) => (
        <circle
          key={`progress-${index}`}
          stroke={segment.color}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${segment.end - segment.start} ${circumference}`}
          strokeDashoffset={-segment.start}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      ))}

      {/* Render Remaining Circle Segments */}
      {remainingSegments.map((segment, index) => (
        <circle
          key={`remaining-${index}`}
          stroke={segment.color}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${segment.end - segment.start} ${circumference}`}
          strokeDashoffset={-segment.start}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      ))}

      {/* Display progress percentage */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="Black"
        fontSize="24px"
        fontWeight="bold"
      >
        {`${progress}%`}
      </text>
    </svg>
  );
};

export default CircularProgressBarScan;
