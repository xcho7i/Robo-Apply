import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { FiFileText } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";
import ProgressLine from "./ProgressLine";
import Searchability from "./Searchability";
import HardSkills from "./HardSkills";
import SoftSkills from "./SoftSkills";
import RecruiterTips from "./RecruiterTips";
import FormatingComponent from "./FormatingComponent";

const TabContent = ({ activeTab }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});

  const getProgressColor = (progress) => {
    if (progress === 0) return "#DDE1EA";
    if (progress < 50) return "#F68E8E";
    if (progress >= 50 && progress < 100) return "#9A3CF9";
    if (progress === 100) return "#77BE9C";
  };

  // Load and parse the resumeScoreData from localStorage
  const storedData = localStorage.getItem("resumeScoreData");
  const sectionsData = storedData ? JSON.parse(storedData) : [];

  const sections = sectionsData.map((section) => ({
    ...section,
    description:
      section.progress === 100
        ? `${section.title} Complete`
        : `${section.title} Incomplete`,
  }));

  const toggleDropdown = (index) => {
    setOpenDropdowns((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  if (activeTab === "Report") {
    return (
      <div>
        {sections.map((section, index) => {
          const color = getProgressColor(section.progress);

          return (
            <div
              key={index}
              className="grid grid-cols-2 items-center py-4 border-b border-gray-700 gap-4"
            >
              <div>
                <div className="flex flex-row items-center space-x-2">
                  <h4 className="text-sm font-bold">{section.title}</h4>
                  <div
                    className="text-xs font-semibold rounded-full py-[0.28rem] px-2"
                    style={{ backgroundColor: color, color: "white" }}
                  >
                    {section.progress}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {section.description}
                </p>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-full">
                <div>
                  <ProgressLine
                    visualParts={[{ percentage: section.progress, color }]}
                  />
                </div>

                <FaChevronDown
                  size={16}
                  className="text-gray-400 cursor-pointer"
                  onClick={() => toggleDropdown(index)}
                />
              </div>

              {openDropdowns[index] && (
                <div className="col-span-2 mt-2 w-full">
                  {section.progress === 100 ? (
                    `${section.title} Completed`
                  ) : (
                    <>
                      {section.title === "Searchability" && <Searchability />}
                      {section.title === "Hard Skills" && <HardSkills />}
                      {section.title === "Soft Skills" && <SoftSkills />}
                      {section.title === "Recruiter Tips" && <RecruiterTips />}
                      {section.title === "Formatting" && <FormatingComponent />}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

const Report = () => {
  const [activeTab, setActiveTab] = useState("Report");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="secondary"
        indicatorColor="secondary"
        sx={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          "& .MuiTab-root": {
            textTransform: "none",
            color: "white",
            "&.Mui-selected": {
              color: "#9A3CF9",
              fontWeight: "bold",
            },
          },
        }}
        TabIndicatorProps={{
          style: {
            backgroundColor: "#9A3CF9",
          },
        }}
      >
        <Tab
          icon={<FiFileText />}
          iconPosition="start"
          label="Report"
          value="Report"
        />
      </Tabs>

      <Box sx={{ mt: 4 }}>
        <TabContent activeTab={activeTab} />
      </Box>
    </div>
  );
};

export default Report;
