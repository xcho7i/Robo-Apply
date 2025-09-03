// import React, { useState } from "react";
// import {
//   HiArrowLeft,
//   HiChevronDown,
//   HiChevronLeft,
//   HiChevronRight,
// } from "react-icons/hi";
// import Button from "../../../../components/Button";
// import LinkedIn from "../../../../assets/resumeManagerIcons/linkedin-icon.svg";

// const SessionTable = ({
//   jobData,
//   uniqueCompanies,
//   uniqueJobTitles,
//   uniqueResumes,
//   selectedCompany,
//   setSelectedCompany,
//   selectedJobTitle,
//   setSelectedJobTitle,
//   selectedResume,
//   setSelectedResume,
//   onGoBack,
//   selectedPlatform,
// }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 50; // Number of rows to display per page

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const filteredData = jobData.filter(
//     (job) =>
//       (selectedCompany ? job.companyName === selectedCompany : true) &&
//       (selectedJobTitle ? job.jobTitle === selectedJobTitle : true) &&
//       (selectedResume ? job.byResume === selectedResume : true)
//   );

//   // Calculate pagination details
//   const totalPages = Math.ceil(filteredData.length / rowsPerPage);
//   const indexOfLastRow = currentPage * rowsPerPage;
//   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
//   const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   return (
//     <>
//       <div className="w-full md:py-5">
//         {/* Export and Go Back Buttons */}
//         <div className="w-full md:flex items-center md:justify-between space-y-5 ">
//           <div className="flex w-full items-center gap-2  text-primary text-xl md:text-2xl font-medium ">
//             <p>Total Applied Jobs:</p>
//             <p>{filteredData.length}</p>
//           </div>
//           <div className="flex w-full items-center justify-end gap-5 ">
//             <div className="relative">
//               <Button
//                 onClick={toggleDropdown}
//                 className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
//               >
//                 Export To <HiChevronDown className="ml-2" />
//               </Button>
//               {isDropdownOpen && (
//                 <div className="absolute right-0 mt-2 w-40 bg-inputBackGround shadow-lg rounded-md border border-formBorders">
//                   <ul className="py-1 text-primary">
//                     <li className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
//                       XLS
//                     </li>
//                     <li className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
//                       TXT
//                     </li>
//                     <li className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
//                       CSV
//                     </li>
//                   </ul>
//                 </div>
//               )}
//             </div>
//             <Button
//               onClick={onGoBack}
//               className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
//             >
//               <HiArrowLeft className="mr-2" />
//               Go Back
//             </Button>
//           </div>
//         </div>

//         <div className="w-full md:flex items-center justify-between space-y-5 md:space-y-0 py-5  md:py-10">
//           <div>
//             <div className="w-full flex items-center  lg:gap-12 text-xs md:text-base lg:text-2xl font-medium">
//               <p className="w-24 md:w-40  whitespace-nowrap">User Account:</p>
//               <p className="text-primary">techoneoutsourcingng@gmail.com</p>
//             </div>
//             <div className="w-full flex items-center lg:gap-12 text-xs md:text-base lg:text-2xl font-medium">
//               <p className="w-24 whitespace-nowrap md:w-40 ">Resume Chosen:</p>
//               <p className="text-primary">Philip Maya</p>
//             </div>
//             <div className="w-full flex items-center  lg:gap-12 text-xs md:text-base lg:text-2xl font-medium">
//               <p className="w-24 md:w-40 whitespace-nowrap">Skill searched :</p>
//               <p className="text-primary">Project Manager</p>
//             </div>
//           </div>
//           <div className="w-full items-center justify-center md:justify-end gap-3 flex">
//             <img src={selectedPlatform.icon} loading="lazy" />
//             <p className="text-2xl font-medium">
//               {selectedPlatform.platformName}
//             </p>
//           </div>
//         </div>

//         {/* Job Details Table */}
//         <div className="overflow-x-auto w-[99%] md:w-full  md:mt-5">
//           <table className="w-full overflow-x-auto text-left border-collapse ">
//             <thead>
//               <tr>
//                 <th className="px-2 py-2">
//                   <div className="bg-none whitespace-nowrap border py-4 text-center rounded-md">
//                     Company Name
//                   </div>
//                 </th>
//                 <th className="px-2 py-2">
//                   <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
//                     Job Title
//                   </div>
//                 </th>
//                 <th className="px-2 py-2">
//                   <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
//                     By Resume
//                   </div>
//                 </th>
//                 <th className="px-2 py-2">
//                   <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
//                     Job Date
//                   </div>
//                 </th>
//                 <th className="px-2 py-2">
//                   <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
//                     Job Link
//                   </div>
//                 </th>
//               </tr>

//               <tr>
//                 <th className="px-2 py-2">
//                   <select
//                     className="w-full p-2 border rounded bg-dropdownBackground"
//                     value={selectedCompany}
//                     onChange={(e) => setSelectedCompany(e.target.value)}
//                   >
//                     <option className="bg-inputBackGround" value="">
//                       All Companies
//                     </option>
//                     {uniqueCompanies.map((company) => (
//                       <option
//                         className="bg-inputBackGround"
//                         key={company}
//                         value={company}
//                       >
//                         {company}
//                       </option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="px-2 py-2">
//                   <select
//                     className="w-full p-2 border rounded bg-dropdownBackground"
//                     value={selectedJobTitle}
//                     onChange={(e) => setSelectedJobTitle(e.target.value)}
//                   >
//                     <option className="bg-inputBackGround" value="">
//                       All Job Titles
//                     </option>
//                     {uniqueJobTitles.map((title) => (
//                       <option
//                         className="bg-inputBackGround"
//                         key={title}
//                         value={title}
//                       >
//                         {title}
//                       </option>
//                     ))}
//                   </select>
//                 </th>
//                 <th className="px-2 py-2">
//                   <select
//                     className="w-full p-2 border rounded bg-dropdownBackground"
//                     value={selectedResume}
//                     onChange={(e) => setSelectedResume(e.target.value)}
//                   >
//                     <option className="bg-inputBackGround" value="">
//                       All Resumes
//                     </option>
//                     {uniqueResumes.map((resume) => (
//                       <option
//                         className="bg-inputBackGround"
//                         key={resume}
//                         value={resume}
//                       >
//                         {resume}
//                       </option>
//                     ))}
//                   </select>
//                 </th>
//                 <th></th>
//                 <th></th>
//               </tr>
//             </thead>

//             <tbody>
//               {currentRows.map((job, index) => (
//                 <tr key={index} className="text-center">
//                   <td className="px-2 py-2">
//                     <div className="px-6 md:px-4 py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
//                       {job.companyName}
//                     </div>
//                   </td>
//                   <td className="px-2 py-2">
//                     <div className="px-6 md:px-4 py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
//                       {job.jobTitle}
//                     </div>
//                   </td>
//                   <td className="px-2 py-2">
//                     <div className="px-6 md:px-4  py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
//                       {job.byResume}
//                     </div>
//                   </td>
//                   <td className="px-2 py-2">
//                     <div className="px-6 md:px-4  py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
//                       {job.jobDate}
//                     </div>
//                   </td>
//                   <td className="px-2 py-2">
//                     <div className="px-6 md:px-4 py-4 bg-gradient-to-b from-gradientStart to-gradientEnd rounded-md whitespace-nowrap">
//                       <a
//                         href={job.jobLink}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-primary"
//                       >
//                         Link
//                       </a>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         <div className="flex items-center gap-5 mt-4 px-3">
//           <div className="flex gap-2">
//             <Button
//               onClick={handlePreviousPage}
//               disabled={currentPage === 1}
//               className="p-3  rounded-md bg-dropdownBackground text-primary border border-customGray cursor-pointer hover:border-purple"
//             >
//               <HiChevronLeft />
//             </Button>
//             <Button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className="p-3  rounded-md bg-dropdownBackground text-primary border border-customGray cursor-pointer hover:border-purple"
//             >
//               <HiChevronRight />
//             </Button>
//           </div>
//           <p className="text-sm">
//             Page {currentPage} of {totalPages} | Rows: {indexOfFirstRow + 1} -{" "}
//             {Math.min(indexOfLastRow, filteredData.length)} of{" "}
//             {filteredData.length}
//           </p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SessionTable;

import React, { useState, useEffect } from "react";
import {
  HiArrowLeft,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import Button from "../../../../components/Button";
import { errorToast } from "../../../../components/Toast";
import API_ENDPOINTS from "../../../../api/endpoints";
import CircularIndeterminate from "../../../../components/loader/circular";
const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com";

const SessionTable = ({
  selectedCompany,
  setSelectedCompany,
  selectedJobTitle,
  setSelectedJobTitle,
  selectedResume,
  setSelectedResume,
  onGoBack,
  selectedPlatform,
  selectedResumeId,
  selectedDate,
  skillSearchKeyword,
  selectedSessionData,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobData, setJobData] = useState([]);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);
  const [uniqueJobTitles, setUniqueJobTitles] = useState([]);
  const [uniqueResumes, setUniqueResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);

  const rowsPerPage = 20; // Number of rows to display per page

  // Fetch job data from API
  const fetchJobData = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      errorToast("You are not authorized.");
      return;
    }

    // Format date to YYYY-MM-DD if selectedDate exists
    const queryParams = new URLSearchParams({
      platformName: selectedPlatform.platformName,
      selectedProfile: selectedResumeId,
      skillSearchKeyword: skillSearchKeyword || "",
    });

    // Only append the date parameter if selectedDate is not empty or null
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      queryParams.append("date", formattedDate);
    }

    const fullUrl = `${BASE_URL}${API_ENDPOINTS.GetAllAnalyticsForTable}?${queryParams}`;
    setLoading(true);

    try {
      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch job data");
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Map API response to match the expected format
        const mappedData = result.data.map((job) => ({
          _id: job._id,
          companyName: job.companyName,
          jobTitle: job.jobTitle,
          byResume: job.resumeChosen, // Map resumeChosen to byResume
          jobDate: new Date(job.jobDate).toLocaleDateString(), // Format date
          jobLink: job.jobLink,
          userAccount: job.userAccount,
        }));

        setJobData(mappedData);
        setTotalJobs(mappedData.length);

        // Generate unique values for filters
        const companies = [
          ...new Set(mappedData.map((job) => job.companyName)),
        ];
        const jobTitles = [...new Set(mappedData.map((job) => job.jobTitle))];
        const resumes = [...new Set(mappedData.map((job) => job.byResume))];

        setUniqueCompanies(companies);
        setUniqueJobTitles(jobTitles);
        setUniqueResumes(resumes);
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
      errorToast("Failed to load job data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or when parameters change
  useEffect(() => {
    if (selectedResumeId && selectedPlatform.platformName) {
      fetchJobData();
    }
  }, [selectedResumeId, selectedPlatform.platformName, selectedDate]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompany, selectedJobTitle, selectedResume]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const filteredData = jobData.filter(
    (job) =>
      (selectedCompany ? job.companyName === selectedCompany : true) &&
      (selectedJobTitle ? job.jobTitle === selectedJobTitle : true) &&
      (selectedResume ? job.byResume === selectedResume : true)
  );

  // Calculate pagination details
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularIndeterminate />
      </div>
    );
  }

  return (
    <>
      <div className="w-full md:py-5">
        {/* Export and Go Back Buttons */}
        <div className="w-full md:flex items-center md:justify-between space-y-5 ">
          <div className="flex w-full items-center gap-2 text-primary text-xl md:text-2xl font-medium ">
            <p>Total Applied Jobs:</p>
            <p>{filteredData.length}</p>
          </div>
          <div className="flex w-full items-center justify-end gap-5 ">
            <div className="relative">
              <Button
                onClick={toggleDropdown}
                className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              >
                Export To <HiChevronDown className="ml-2" />
              </Button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-inputBackGround shadow-lg rounded-md border border-formBorders">
                  <ul className="py-1 text-primary">
                    <li className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
                      XLS
                    </li>
                    <li className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
                      TXT
                    </li>
                    <li className="px-4 py-2 cursor-pointer hover:bg-lightGreyBackground">
                      CSV
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <Button
              onClick={onGoBack}
              className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
            >
              <HiArrowLeft className="mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Job Details Table */}
        <div className="overflow-x-auto w-[99%] md:w-full  md:mt-5">
          <table className="w-full overflow-x-auto text-left border-collapse ">
            <thead>
              <tr>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 text-center rounded-md">
                    Company Name
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    Job Title
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    By Resume
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    Job Date
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="bg-none whitespace-nowrap border py-4 rounded-md text-center">
                    Job Link
                  </div>
                </th>
              </tr>

              <tr>
                <th className="px-2 py-2">
                  <select
                    className="w-full p-2 border rounded bg-dropdownBackground"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                  >
                    <option className="bg-inputBackGround" value="">
                      All Companies
                    </option>
                    {uniqueCompanies.map((company) => (
                      <option
                        className="bg-inputBackGround"
                        key={company}
                        value={company}
                      >
                        {company}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    className="w-full p-2 border rounded bg-dropdownBackground"
                    value={selectedJobTitle}
                    onChange={(e) => setSelectedJobTitle(e.target.value)}
                  >
                    <option className="bg-inputBackGround" value="">
                      All Job Titles
                    </option>
                    {uniqueJobTitles.map((title) => (
                      <option
                        className="bg-inputBackGround"
                        key={title}
                        value={title}
                      >
                        {title}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    className="w-full p-2 border rounded bg-dropdownBackground"
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                  >
                    <option className="bg-inputBackGround" value="">
                      All Resumes
                    </option>
                    {uniqueResumes.map((resume) => (
                      <option
                        className="bg-inputBackGround"
                        key={resume}
                        value={resume}
                      >
                        {resume}
                      </option>
                    ))}
                  </select>
                </th>
                <th></th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((job, index) => (
                  <tr key={job._id || index} className="text-center">
                    <td className="px-2 py-2">
                      <div className="px-6 md:px-4 py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
                        {job.companyName}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="px-6 md:px-4 py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
                        {job.jobTitle}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="px-6 md:px-4  py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
                        {job.byResume}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="px-6 md:px-4  py-4 bg-dropdownBackground rounded-md whitespace-nowrap">
                        {job.jobDate}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <a
                        href={job.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-6 md:px-4 py-4 bg-gradient-to-b from-gradientStart to-gradientEnd rounded-md whitespace-nowrap text-navbar hover:text-white hover:shadow-lg transition-all duration-200"
                      >
                        Link
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <p className="text-primary text-lg">No jobs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-5 mt-4 px-3">
            <div className="flex gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-3  rounded-md bg-dropdownBackground text-primary border border-customGray cursor-pointer hover:border-purple disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronLeft />
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-3  rounded-md bg-dropdownBackground text-primary border border-customGray cursor-pointer hover:border-purple disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronRight />
              </Button>
            </div>
            <p className="text-sm">
              Page {currentPage} of {totalPages} | Rows: {indexOfFirstRow + 1} -{" "}
              {Math.min(indexOfLastRow, filteredData.length)} of{" "}
              {filteredData.length}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SessionTable;
