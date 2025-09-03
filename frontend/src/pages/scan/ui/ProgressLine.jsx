import React from "react";
import "./ProgressLine.css";

const ProgressLine = ({
  label,
  backgroundColor = "#e5e5e5",
  visualParts = [
    {
      percentage: 0,
      color: "gray",
    },
    {
      percentage: 100,
      color: "green",
    },
  ],
}) => {
  const totalPercentage = visualParts.reduce(
    (total, part) => total + part.percentage,
    0
  );

  const maxPercentage = totalPercentage > 100 ? 100 : totalPercentage;

  const widths = visualParts.map(
    (item) => (item.percentage / totalPercentage) * maxPercentage
  );

  return (
    <>
      <div className="progressLabel">{label}</div>
      <div className="progressVisualFull" style={{ backgroundColor }}>
        {visualParts.map((item, index) => (
          <div
            key={index}
            style={{
              width: `${widths[index]}%`,
              backgroundColor: item.color,
            }}
            className="progressVisualPart"
          />
        ))}
      </div>
    </>
  );
};

export default ProgressLine;
