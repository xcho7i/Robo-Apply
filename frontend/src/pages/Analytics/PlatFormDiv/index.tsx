// // PlatFormDiv.js

// import React, { useState } from "react";
// import linkedinPic from "../../../assets/dashboardIcons/linkedinImage.svg";
// import IndeedPic from "../../../assets/dashboardIcons/indeedImage.svg";
// import zipPic from "../../../assets/dashboardIcons/ziprecruiterImage.svg";
// import monsterPic from "../../../assets/dashboardIcons/monsterImage.svg";
// import SimplyPic from "../../../assets/dashboardIcons/simplyHiredImage.svg";
// import glassPic from "../../../assets/dashboardIcons/glassdoorImage.svg";
// import LinkIcon from "../../../assets/analytics/linkIcon.svg";
// import PlatformCard from "../ui/PlatformCard";
// import PlatformTable from "../ui/PlatformTable";

// const dummyPlatforms = [
//   {
//     id: 1,
//     platformName: "LinkedIn",
//     icon: linkedinPic,
//     totalJobs: 4162,
//     linkIcon: LinkIcon,
//   },
//   {
//     id: 2,
//     platformName: "Indeed",
//     icon: IndeedPic,
//     totalJobs: 3120,
//     linkIcon: LinkIcon,
//   },
//   {
//     id: 3,
//     platformName: "Dice",
//     icon: glassPic,
//     totalJobs: 2045,
//     linkIcon: LinkIcon,
//   },
//   {
//     id: 4,
//     platformName: "ZipRecruiter",
//     icon: zipPic,
//     totalJobs: 2045,
//     linkIcon: LinkIcon,
//   },
//   {
//     id: 5,
//     platformName: "Monster",
//     icon: monsterPic,
//     totalJobs: 2045,
//     linkIcon: LinkIcon,
//   },
//   {
//     id: 6,
//     platformName: "SimplyHired",
//     icon: SimplyPic,
//     totalJobs: 2045,
//     linkIcon: LinkIcon,
//   },
//   // Add more dummy platforms as needed
// ];

// const dummyJobData = [
//   {
//     companyName: "TechOne",
//     jobTitle: "Frontend Developer",
//     byResume: "Philip Maya",
//     jobDate: "2024-11-01",
//     jobLink: "https://techone.com/jobs/frontend-developer",
//   },
//   {
//     companyName: "Innovatech",
//     jobTitle: "Backend Developer",
//     byResume: "Philip Maya",
//     jobDate: "2024-10-21",
//     jobLink: "https://innovatech.com/jobs/backend-developer",
//   },
//   {
//     companyName: "Innovatech",
//     jobTitle: "Devops Developer",
//     byResume: "Alex Smith",
//     jobDate: "2024-10-21",
//     jobLink: "https://innovatech.com/jobs/backend-developer",
//   },
//   {
//     companyName: "Innovatech",
//     jobTitle: "Backend Developer",
//     byResume: "Philip Maya",
//     jobDate: "2024-10-21",
//     jobLink: "https://innovatech.com/jobs/backend-developer",
//   },
//   // Add more dummy job data as needed
// ];

// const uniqueCompanies = [
//   ...new Set(dummyJobData.map((job) => job.companyName)),
// ];
// const uniqueJobTitles = [...new Set(dummyJobData.map((job) => job.jobTitle))];
// const uniqueResumes = [...new Set(dummyJobData.map((job) => job.byResume))];

// const PlatFormDiv = () => {
//   const [showTable, setShowTable] = useState(false);
//   const [selectedCompany, setSelectedCompany] = useState("");
//   const [selectedJobTitle, setSelectedJobTitle] = useState("");
//   const [selectedResume, setSelectedResume] = useState("");
//   const [selectedPlatform, setSelectedPlatform] = useState([]);

//   const handleShowTable = (platform) => {
//     setShowTable(true);
//     setSelectedPlatform(platform);
//   };

//   const handleGoBack = () => {
//     setShowTable(false);
//   };

//   return (
//     <div>
//       {showTable ? (
//         <div className="w-full  grid grid-cols-1 ">
//           <PlatformTable
//             jobData={dummyJobData}
//             // uniqueCompanies={["TechOne", "Innovatech"]}
//             uniqueCompanies={uniqueCompanies}
//             uniqueJobTitles={uniqueJobTitles}
//             uniqueResumes={uniqueResumes}
//             selectedCompany={selectedCompany}
//             setSelectedCompany={setSelectedCompany}
//             selectedJobTitle={selectedJobTitle}
//             setSelectedJobTitle={setSelectedJobTitle}
//             selectedResume={selectedResume}
//             setSelectedResume={setSelectedResume}
//             onGoBack={handleGoBack}
//             selectedPlatform={selectedPlatform}
//           />
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
//           {dummyPlatforms.map((platform) => (
//             <PlatformCard
//               key={platform.id}
//               icon={platform.icon}
//               platformName={platform.platformName}
//               totalJobs={platform.totalJobs}
//               linkIcon={platform.linkIcon}
//               onShowTable={() => handleShowTable(platform)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlatFormDiv;

import React, { useState, useEffect } from "react"
import linkedinPic from "../../../assets/dashboardIcons/linkedinImage.svg"
import IndeedPic from "../../../assets/dashboardIcons/indeedImage.svg"
import zipPic from "../../../assets/dashboardIcons/ziprecruiterImage.svg"
import monsterPic from "../../../assets/dashboardIcons/monsterImage.svg"
import SimplyPic from "../../../assets/dashboardIcons/simplyHiredImage.svg"
import glassPic from "../../../assets/dashboardIcons/glassdoorImage.svg"

import UserAccountIcon from "../../../assets/analytics/userAccountIcon.svg"
import ResumeChoosenIcon from "../../../assets/analytics/resumeChoosenIcon.svg"
import SkillSearchIcon from "../../../assets/analytics/skillSearchIcon.svg"
import LinkIcon from "../../../assets/analytics/linkIcon.svg"

import PlatformTable from "../ui/PlatformTable"
import { errorToast } from "../../../components/Toast"
import CircularIndeterminate from "../../../components/loader/circular"
import { analytics } from "@/src/api/functions/analytics"
import ViewCard, { CardData, getCardData } from "../ui/ViewCard"
import ViewTable from "../ui/ViewTable"

const PlatFormDiv = () => {
  const [showTable, setShowTable] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>("")
  const [totalJobs, setTotalJobs] = useState<number>(0)
  const [platformData, setPlatformData] = useState<CardData[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch platform data from API
  const fetchPlatformData = async () => {
    setLoading(true)

    try {
      const result = await analytics.getJobHistoryCount()

      if (!result.success) {
        setLoading(false)
        return errorToast(result.message)
      }

      // const result = await response.json()
      if (result.success && result.jobActivities) {
        const data = getCardData(result.jobActivities)
        setPlatformData(data)
      }
    } catch (error) {
      console.error("Error fetching platform data:", error)
      errorToast("Failed to load platform data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatformData()
  }, [])

  const handleShowTable = (platform: string) => {
    setShowTable(true)
    setSelectedPlatform(platform)
    setTotalJobs(
      platformData.find((item) => item.title.toLowerCase() === platform)
        ?.applyJobsCount || 0
    )
  }

  const handleGoBack = () => {
    setShowTable(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularIndeterminate />
      </div>
    )
  }

  return (
    <div>
      {showTable ? (
        <div className="w-full  grid grid-cols-1 ">
          <ViewTable
            selectedDate={null}
            selectedPlatform={selectedPlatform}
            totalJobs={totalJobs}
            onGoBack={handleGoBack}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {platformData.map((platform, index) => (
            <ViewCard
              key={index}
              title={platform.title}
              icon={platform.icon} // Handle different platform icons dynamically
              applyJobsCount={platform.applyJobsCount}
              onToggleTableVisibility={() =>
                handleShowTable(platform.title.toLowerCase())
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PlatFormDiv
