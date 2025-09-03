import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VerticalBarChart = () => {
  const [searchabilityScore, setSearchabilityScore] = useState(0);

  useEffect(() => {
    const rawData = JSON.parse(localStorage.getItem("resumeScoreData") || "[]");
    const searchability = rawData.find(
      (item) => item.title === "Searchability"
    );
    if (searchability && typeof searchability.progress === "number") {
      setSearchabilityScore(searchability.progress);
    }
  }, []);

  const data = {
    labels: ["50"], // Only one label
    datasets: [
      {
        label: "Match Ratio History",
        data: [searchabilityScore], // Single bar with value 50
        backgroundColor: ["#9A3CF9"], // Single bar color
        borderColor: ["#9A3CF9"],
        borderWidth: 1,
        barThickness: 40, // Explicitly set bar thickness (adjust as needed)
        maxBarThickness: 40, // Ensures the bar doesn't get too wide
      },
    ],
  };

  const options = {
    indexAxis: "x",
    scales: {
      x: {
        grid: {
          drawBorder: false,
          drawTicks: false,
        },
        ticks: {
          display: false, // Hide x-axis labels to make the bar look centered
        },
        barPercentage: 0.2, // Adjusts individual bar width (lower value makes it thinner)
        categoryPercentage: 0.5, // Controls how much space the category takes
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          drawBorder: false,
        },
        ticks: {
          display: true,
          callback: function (value) {
            return ` ${value} `;
          },
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#9a3cf9",
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div
      className="p-6 rounded-lg shadow-lg  bg-primary"
      style={{
        position: "relative",
        maxWidth: "450px",
        maxHeight: "300px",
      }}
    >
      <Bar data={data} options={options} />
    </div>
  );
};

export default VerticalBarChart;
