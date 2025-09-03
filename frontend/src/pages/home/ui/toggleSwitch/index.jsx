import React from "react";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 50,
  height: 20,
  padding: 0,
  display: "flex",
  "&:active .MuiSwitch-thumb": {
    width: 24,
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(30px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#EAEAEA",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 16,
    height: 16,
    boxShadow: "0 0 5px rgba(0,0,0,0.3)", // Enhanced shadow on thumb
    // backgroundColor: "#8C20F8",
    backgroundColor: "#FFC107",
  },
  "& .MuiSwitch-track": {
    borderRadius: 20,
    backgroundColor: "#ccc",
    opacity: 1,
  },
}));

const ToggleSwitch = ({ isYearly, setIsYearly }) => {
  const handleChange = (event) => {
    setIsYearly(event.target.checked);
  };

  return (
    <div className="flex items-center gap-6">
      <span
        className={`text-xl font-semibold ${
          !isYearly ? "text-white" : "text-[#CCCBCE]"
        }`}
        onClick={() => setIsYearly(false)}
      >
        Monthly
      </span>

      {/* Added shadow effects */}
      <div className="flex items-center justify-center shadow-lg shadow-gray-500/50 rounded-xl">
        <CustomSwitch checked={isYearly} onChange={handleChange} />
      </div>

      <span
        className={`text-xl font-semibold ${
          isYearly ? "text-white" : "text-[#CCCBCE]"
        }`}
        onClick={() => setIsYearly(true)}
      >
        Yearly
      </span>
    </div>
  );
};

export default ToggleSwitch;
