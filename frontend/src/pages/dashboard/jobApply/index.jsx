import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashBoardLayout from "../../../dashboardLayout";
import Dropdown from "../../../components/dropdown";
import { FaArrowRightLong } from "react-icons/fa6";
import SimpleInputField from "../../../components/SimpleInputFields";
import CircularProgressBar from "../../../components/CircularProgressBar";
import RangeSlider from "../../../components/RangeSlider"; // Import the RangeSlider
import ToggleButton from "../../../components/ToggleButton";
import Button from "../../../components/Button";
import MultipleDropdownSelect from "../../../components/MultipleDropdownSelect";
import FeedbackModal from "../../../components/Modals/FeedbackModal";
import FeedbackSubmittedModal from "../../../components/Modals/FeedbackSubmittedModal";
import AdvanceSearchModal from "../../../components/Modals/AdvanceSearchModal"; // Import the AdvanceSearchModal
import { successToast, errorToast } from "../../../components/Toast";
import API_ENDPOINTS from "../../../api/endpoints";
import SingleDropdownSelect from "../../../components/SingleDropdownSelect";

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com";

const JobApply = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toggleTenState, setToggleTenState] = useState(false);
  const [toggleStateAdvancedSearch, setToggleStateAdvancedSearch] =
    useState(false);
  const [isAdvanceSearchModalOpen, setIsAdvanceSearchModalOpen] =
    useState(false);
  const [keywordsIncludeInJobs, setKeywordsIncludeInJobs] = useState("");
  const [keyworldIncludeInJobs, setKeyworldIncludeInJobs] = useState("");

  const [selectedSearchSetting, setSelectedSearchSetting] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [numberOfJobs, setNumberOfJobs] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubmittedModalOpen, setIsSubmittedModalOpen] = useState(false);

  const [selectedPostedTime, setSelectedPostedTime] = useState("");

  // const [selectedPostedTime, setSelectedPostedTime] = useState([]);

  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedJobLocation, setSelectedJobLocation] = useState([]);
  const [selectedExp, setSelectedExp] = useState([]);
  const [keywordsIncludeInCompany, setKeywordsIncludeInCompany] = useState("");
  const [selectedPay, setSelectedPay] = useState([]);
  const [profileError, setProfileError] = useState(false);
  const [skillsInputError, setSkillsInputError] = useState(false);
  const [numberOfJobsError, setNumberOfJobsError] = useState(false);
  const [joblocationError, setJoblocationError] = useState(false);
  const [postedTimeError, setPostedTimeError] = useState(false);
  const [jobTypeError, setJobTypeError] = useState(false);
  const [payError, setPayError] = useState(false);
  const [searchHistoryKeyword, setSearchHistoryKeyword] = useState("");

  const [searchHistoryOptions, setSearchHistoryOptions] = useState([]); // list of keywords
  const [searchHistoryMap, setSearchHistoryMap] = useState({}); // maps keyword => _id

  const navigate = useNavigate();
  const location = useLocation();
  const { logo, platformName } = location.state || {};

  const postedTimeOptions = ["Past month", "Past week", "Past 24 hours"];

  const jobTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
  ];

  const jobLocationOptions = ["Remote", "Hybrid", "Onsite"];

  const jobLocationCityOptions = ["New York", "San Francisco", "London"];

  const expOptions = [
    "Internship",
    "Entry",
    "Associate",
    "Mid-Senior",
    "Director",
    "Executive",
  ];

  const payOptions = [
    "$40,000+",
    "$60,000+",
    "$100,000+",
    "$120,000+",
    "$140,000+",
    "$160,000+",
    "$180,000+",
    "$200,000+",
  ];

  const handleSliderChange = (event) => {
    setProgress(event.target.value);
  };

  const handleProfileChange = (event) => {
    const selectedName = event.target.value;
    const selectedResume = resumes.find(
      (resume) => resume.name === selectedName
    );

    if (selectedResume) {
      setSelectedProfile(selectedResume._id);
      console.log("Selected Resume ID:", selectedResume._id); // For Debugging
    }
  };

  const handleFetchFiltersClick = () => {
    // Check dropdown and input values
    const profileDropdown = selectedProfile ? selectedProfile.trim() : "";
    const skillsInput = keywordsIncludeInJobs.trim();
    const jobsApplyInput = numberOfJobs.trim();
    const joblocation = jobLocation.trim();

    // Log the values to the console
    console.log("Profile Dropdown Value:", profileDropdown);
    console.log("Skills Input Value:", skillsInput);
    console.log("Jobs Apply Input Value:", jobsApplyInput);
    console.log("Job Location Value:", joblocation);
    console.log("Platform Name:", platformName); // Log the platform name

    let isValid = true;

    // Validation checks for required fields
    if (!profileDropdown) {
      setProfileError(true);
      isValid = false;
    } else {
      setProfileError(false);
    }

    if (!skillsInput) {
      setSkillsInputError(true);
      isValid = false;
    } else {
      setSkillsInputError(false);
    }

    if (!jobsApplyInput) {
      setNumberOfJobsError(true);
      isValid = false;
    } else {
      setNumberOfJobsError(false);
    }

    // If validation passes, send the data to the extension
    if (isValid) {
      const formOneData = {
        skillsInput,
        joblocation,
        roboapplyStep: "step 1",
      };

      localStorage.setItem("roboapplyData", JSON.stringify(formOneData));

      // Send message to extension
      if (typeof chrome !== "undefined" && chrome.runtime) {
        try {
          const EXTENSION_ID = "gpgegodpgjenkfdnalacodlocgcfccef";

          // Create the platform-specific URL
          let platformUrl = "";
          switch (platformName) {
            case "LinkedIn":
              platformUrl = "https://www.linkedin.com/jobs/";
              break;
            case "Indeed":
              platformUrl = "https://www.indeed.com/";
              break;
            case "ZipRecruiter":
              platformUrl = "https://www.ziprecruiter.com/jobs";
              break;
            case "Dice":
              platformUrl = "https://www.dice.com/jobs";
              break;
            case "Monster":
              platformUrl = "https://www.monster.com/jobs";
              break;
            case "SimplyHired":
              platformUrl = "https://www.simplyhired.com/search";
              break;
            default:
              platformUrl = "https://www.linkedin.com/jobs/"; // Default to LinkedIn
          }

          chrome.runtime.sendMessage(
            EXTENSION_ID,
            {
              action: "fetchFilters", // Action for filter fetch
              data: {
                selectedProfile: profileDropdown,
                keywordsIncludeInJobs: skillsInput,
                jobLocation: joblocation,
                numberOfJobs: jobsApplyInput,
                platformName: platformName, // Add platform name
                platformUrl: platformUrl, // Add platform URL
              },
            },
            (response) => {
              if (response && response.success === false) {
                console.log(
                  "Extension rejected - filters could not be fetched"
                );
              } else {
                console.log("Extension executed successfully, filters sent");
              }
            }
          );
        } catch (error) {
          console.error("Extension communication failed:", error);
        }
      }

      setFiltersVisible(true); // Show the filters
    } else {
      errorToast("Please fill out all required fields to proceed."); // Show error toast
    }
  };

  const handleToggleUnderTen = (newState) => {
    console.log("Toggle state changed to:", newState);
    setToggleTenState(newState);
  };

  const handleToggleAdvancedSearch = (newState) => {
    console.log("Advanced Search Toggle state changed to:", newState);
    setIsAdvanceSearchModalOpen(newState);
  };

  const handleSaveAdvancedSearch = () => {
    if (!searchHistoryKeyword.trim()) {
      console.log(
        "Search history keyword is empty, setting toggle state to OFF."
      );
      errorToast("Search history keyword is required!");
      setToggleStateAdvancedSearch(false);
      return;
    }

    if (!keywordsIncludeInJobs.trim()) {
      console.log("Skills/Job Title is empty, setting toggle state to OFF.");
      errorToast("Skills/Job Title is required!");
      setToggleStateAdvancedSearch(false);
      return;
    }

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      console.error("Access token is missing");
      errorToast("User is not authenticated!");
      return;
    }

    const AdvancedSearchData = {
      searchHistoryKeyword,
      keywordsIncludeInJobs,
      jobLocation,
      numberOfJobs,
    };

    const fullUrl = `${BASE_URL}${API_ENDPOINTS.SaveAdvancedSearch}`;
    console.log("Saving Advanced Search Data:", AdvancedSearchData);

    // setLoading(true);

    fetch(fullUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(AdvancedSearchData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save advanced search");
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("Advanced search saved successfully:", responseData);
        successToast("Advanced search filters saved successfully!");
        setToggleStateAdvancedSearch(true);
        setIsAdvanceSearchModalOpen(false);
        // setLoading(false);

        fetchSavedSearchHistory();
      })
      .catch((error) => {
        console.error("Error saving advanced search:", error);
        errorToast("Failed to save advanced search!");
        // setLoading(false);
      });
  };

  const handleSaveFeedback = (feedback) => {
    console.log("Feedback received:", feedback);
    setIsFeedbackModalOpen(false);
    setIsSubmittedModalOpen(true);
  };

  const handleOpenAdvanceSearchModal = () => {
    setIsAdvanceSearchModalOpen(true);
  };

  const handleReset = () => {
    setSelectedPostedTime([]);
    setSelectedJobTypes([]);
    setSelectedJobLocation([]);
    setSelectedExp([]);
    setSelectedPay([]);
  };

  const handleStartApplying = () => {
    setPostedTimeError(false);
    setJobTypeError(false);
    setPayError(false);
    let isValid = true;
    if (!isValid) return;

    const data = {
      progress,
      selectedPostedTime,
      selectedJobTypes,
      selectedJobLocation,
      selectedExp,
      selectedPay,
      toggleTenState,
    };
    console.log("Start Applying Data:", data);
    if (typeof chrome !== "undefined" && chrome.runtime) {
      try {
        const EXTENSION_ID = "gpgegodpgjenkfdnalacodlocgcfccef";
        // Sending a single message with both data and state information
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            action: "startApplying",
            data: data,
            state: true, // You can keep the state as true here, if it should apply both times
          },
          (response) => {
            if (response && response.success === false) {
              console.log("Extension rejected - state was false");
            } else {
              console.log("Extension executed successfully");
            }
          }
        );
      } catch (error) {
        console.error("Extension communication failed:", error);
      }
    }

    // navigate("/dashboard/job-apply/get-feedback", {
    //   state: { logo, platformName },
    // });
  };

  // Fetching Resumes Function
  const fetchResumesFromAPI = async (setResumes, errorToast) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("Access token is missing");
      errorToast("You are not authorized.");
      return;
    }

    const fullUrl = `${BASE_URL}${API_ENDPOINTS.GetAllResumes}`;
    try {
      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resumes");
      }

      const result = await response.json();

      if (result.success && result.resumes?.docs) {
        const formattedResumes = result.resumes.docs.map((doc) => ({
          _id: doc._id,
          name: doc.resumeName,
          status: doc.status === "completed" ? "Completed" : "Not Completed",
        }));
        setResumes(formattedResumes);
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      errorToast("Failed to load resumes");
    }
  };

  const [resumes, setResumes] = useState([]);
  useEffect(() => {
    fetchResumesFromAPI(setResumes, errorToast);
  }, []);

  const fetchSavedSearchHistory = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      errorToast("You are not authorized.");
      return;
    }

    const fullUrl = `${BASE_URL}${API_ENDPOINTS.GetAllAdvancedSeardch}`;

    try {
      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch saved search history");
      }

      const result = await response.json();

      if (result.success && result.history?.docs?.length > 0) {
        const keywords = result.history.docs.map(
          (doc) => doc.searchHistoryKeyword
        );
        const keywordToIdMap = {};
        result.history.docs.forEach((doc) => {
          keywordToIdMap[doc.searchHistoryKeyword] = doc._id;
        });

        setSearchHistoryOptions(keywords);
        setSearchHistoryMap(keywordToIdMap);
      } else {
        // No saved history
        setSearchHistoryOptions(["No saved search history found"]);
        setSearchHistoryMap({});
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
      errorToast("Failed to load saved search history");
    }
  };

  useEffect(() => {
    fetchSavedSearchHistory();
  }, []);

  const handleSearchHistorySelect = async (event) => {
    const selectedKeyword = event.target.value;
    const selectedId = searchHistoryMap[selectedKeyword];

    if (!selectedId) return;

    try {
      const token = localStorage.getItem("access_token");
      const fullUrl = `${BASE_URL}${API_ENDPOINTS.GetAdvancedSeardchSpecific}/${selectedId}`;

      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search history detail");
      }

      const result = await response.json();

      if (result.success && result.history) {
        const { keywordsIncludeInJobs, jobLocation, numberOfJobs } =
          result.history;
        setKeywordsIncludeInJobs(keywordsIncludeInJobs || "");
        setJobLocation(jobLocation || "");
        setNumberOfJobs(numberOfJobs?.toString() || "");
      }
    } catch (error) {
      console.error("Error fetching selected search history:", error);
      errorToast("Could not load selected search history");
    }
  };

  return (
    <>
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full overflow-x-hidden border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div>
            <div className="w-full md:px-16 border-t-0 border-l-0 border border-r-0 border-b-dashboardborderColor">
              <div className="items-center w-full flex space-x-5 py-10 pl-2">
                {logo && (
                  <img
                    src={logo}
                    alt={`${platformName} Logo`}
                    className="w-10 h-10"
                    loading="lazy"
                  />
                )}
                <p className="text-xl md:text-2xl font-normal text-primary">
                  {filtersVisible
                    ? `Start Applying on ${
                        platformName || "No Platform Selected"
                      }`
                    : platformName || "No Platform Selected"}
                </p>
              </div>
            </div>
            <div className="w-full px-1 md:px-8">
              <div className="w-full py-10">
                <p className="text-lg font-normal text-primary  underline decoration-purple underline-offset-8">
                  Saved Search History
                </p>
                <div className="py-4 px-4 bg-darkPurple mt-5 rounded-xl items-center justify-center w-full flex">
                  {/* <Dropdown
                    placeholder={"Select a searched save setting"}
                    options={SearchSetting}
                    onChange={setSelectedSearchSetting}
                  /> */}
                  <Dropdown
                    placeholder="Select a saved search"
                    options={searchHistoryOptions}
                    onChange={(selected) => {
                      if (selected === "No saved search history found") return;
                      handleSearchHistorySelect(selected);
                    }}
                  />
                </div>
                {/* <p className="text-lg font-normal text-primary mt-5">
                  Choose a profile to apply jobs
                </p> */}
                <div className="py-4">
                  <Dropdown
                    label="Choose a profile to apply jobs"
                    placeholder="Select a Resume"
                    options={resumes.map((resume) => resume.name)}
                    onChange={handleProfileChange}
                    className={`w-full ${
                      profileError ? "border-dangerBorder" : ""
                    }`}
                  />
                </div>
                <div className="px-2 flex items-start gap-2">
                  <p className="text-lg font-medium text-primary whitespace-nowrap flex flex-wrap gap-1 items-center">
                    Select Resume to use while Applying on
                    <span className="text-primary ">{platformName}</span>
                    <FaArrowRightLong className="text-extraLightGrey ml-2" />
                  </p>
                </div>

                <div className="py-4 flex flex-col lg:flex-row gap-5">
                  <div className="w-full ">
                    <SimpleInputField
                      label="Enter skills / job title"
                      placeholder="Designer"
                      value={keywordsIncludeInJobs}
                      onChange={(e) => setKeywordsIncludeInJobs(e.target.value)}
                      className={`w-full ${
                        skillsInputError ? "border-dangerBorder" : ""
                      }`}
                    />
                    <p className="pl-3 pr-5 text-primary text-sm font-medium">
                      For example: Enter only one single skill or job title like
                      product designer or marketing.
                    </p>
                  </div>
                  <div className="w-full">
                    <SimpleInputField
                      label="Enter the job location"
                      placeholder="UAE"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      className={"w-full"}
                    />
                    <p className="pl-3 pr-5 text-primary text-sm font-medium">
                      For example: You can enter your job location like UAE or
                      USA or any other place, etc.
                    </p>
                  </div>
                  <div className="w-full">
                    <SimpleInputField
                      label="Number of jobs to apply"
                      placeholder="10"
                      value={numberOfJobs}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Only allow numbers and cap at 20
                        if (/^\d*$/.test(value) && value <= 20) {
                          setNumberOfJobs(value);
                        }
                      }}
                      className={`w-full ${
                        numberOfJobsError ? "border-dangerBorder" : ""
                      }`}
                    />
                    <p className="pl-3 pr-5 text-primary text-sm font-medium">
                      {/* For example: 50 or 100, etc. */}
                      Up to 20
                    </p>
                  </div>
                </div>

                <div className="w-full py-5">
                  <div className="w-full block lg:flex  justify-between items-center">
                    <p className="text-lg font-normal text-primary underline decoration-purple underline-offset-8">
                      Feedback Job Match Score
                    </p>
                    <Button
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className="p-3 px-4 mt-3 flex items-center space-x-2 max-w-40 min-w-max h-12 text-base font-medium rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                    >
                      Feedback Job Match Score
                    </Button>
                  </div>
                  <p className="text-base font-medium text-primary py-5">
                    Set the minimum match score using the slider below. We’ll
                    only apply to jobs that meet or exceed this score based on
                    how well your resume matches the job description and other
                    job parameters.
                  </p>
                </div>
                <div className="py-5 bg-lightPurple  block lg:flex items-center justify-between space-y-10 space-x-10">
                  <div className="w-full lg:w-1/4 items-center justify-center flex">
                    <CircularProgressBar
                      progress={progress}
                      size={200}
                      strokeWidth={25}
                    />
                  </div>
                  <div className="w-full lg:w-3/4 pr-20 space-y-10">
                    <RangeSlider
                      value={progress}
                      onChange={handleSliderChange}
                    />
                  </div>
                </div>
                <div className="my-5 ">
                  <p className="text-primary text-sm font-bold">
                    Will only apply to jobs with a score greater than 60
                    percent.
                  </p>
                </div>
                <div className="py-3 px-3 bg-darkPurple mt-7 rounded-xl  w-full">
                  <div className="flex items-center justify-between w-full rounded-xl p-2 bg-dropdownBackground">
                    <p className="text-white text-base font-medium">
                      Job Title Filters - Advance Search
                    </p>
                    <ToggleButton
                      isOn={toggleStateAdvancedSearch}
                      onToggle={handleToggleAdvancedSearch}
                    />
                  </div>
                </div>
                {!filtersVisible && (
                  <div className="w-full bordr items-center justify-between block lg:flex py-10">
                    <Button
                      onClick={handleFetchFiltersClick}
                      className="p-3 px-4 space-x-3 flex gap-2 text-base items-center rounded-lg bg-gradient-to-b w-full  md:max-w-40 md:min-w-max from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                    >
                      Click To Fetch Filters First
                      <FaArrowRightLong className="text-extraLightGrey" />
                    </Button>
                    <Button
                      onClick={handleOpenAdvanceSearchModal}
                      className="p-3 px-4 flex items-center space-x-2 w-full mt-4  md:max-w-40 md:min-w-max text-base font-medium rounded-lg border-2 border-purpleBorder hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                    >
                      Save Search Configuration
                    </Button>
                  </div>
                )}
                {filtersVisible && (
                  <div>
                    <div className="w-full bordr items-center justify-between flex py-5">
                      <div className="w-full flex justify-between items-center">
                        <p className="text-lg font-normal text-primary mx-4 underline decoration-purple underline-offset-8">
                          Choose any one filter only (optional)
                        </p>
                        <Button
                          onClick={handleReset}
                          className="p-3 px-4 flex items-center  text-lg font-bold rounded-lg text-purpleColor hover:decoration-purple underline-offset-8"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    {platformName === "LinkedIn" ? (
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 py-5">
                        {/* Dropdown for Job Posted Time */}
                        {/* <div className="w-full">
                          <MultipleDropdownSelect
                            label="Date Posted"
                            options={postedTimeOptions}
                            selectedOptions={selectedPostedTime}
                            onChange={setSelectedPostedTime}
                            className={`w-full ${
                              postedTimeError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div> */}
                        <div className="w-full">
                          <SingleDropdownSelect
                            label="Date Posted"
                            options={postedTimeOptions}
                            selectedOption={selectedPostedTime}
                            onChange={setSelectedPostedTime}
                            className={`w-full ${
                              postedTimeError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>

                        {/* Dropdown for Job Type */}
                        <div className="w-full">
                          <MultipleDropdownSelect
                            label="Select Job Type"
                            options={jobTypeOptions}
                            selectedOptions={selectedJobTypes}
                            onChange={setSelectedJobTypes}
                            className={`w-full ${
                              jobTypeError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>

                        <div className="w-full">
                          <MultipleDropdownSelect
                            label="Job Location"
                            options={jobLocationOptions}
                            selectedOptions={selectedJobLocation}
                            onChange={setSelectedJobLocation}
                            className={`w-full ${
                              jobTypeError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>

                        {/* Dropdown for Experience */}
                        <div className="w-full">
                          <MultipleDropdownSelect
                            label="Select Experience Level"
                            options={expOptions}
                            selectedOptions={selectedExp}
                            onChange={setSelectedExp}
                            className={`w-full ${
                              payError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>

                        <div className="w-full ">
                          <SimpleInputField
                            placeholder="Enter Company Name"
                            value={keywordsIncludeInCompany}
                            onChange={(e) =>
                              setKeywordsIncludeInCompany(e.target.value)
                            }
                            className={`w-full ${
                              skillsInputError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>
                      </div>
                    ) : platformName === "Indeed" ? (
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 py-5">
                        {/* Dropdown for Job Posted Time */}
                        <div className="w-full">
                          <MultipleDropdownSelect
                            label="Date Posted"
                            options={postedTimeOptions}
                            selectedOptions={selectedPostedTime}
                            onChange={setSelectedPostedTime}
                            className={`w-full ${
                              postedTimeError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>

                        <div className="w-full">
                          <MultipleDropdownSelect
                            label="Select Salery Range"
                            options={payOptions}
                            selectedOptions={selectedPay}
                            onChange={setSelectedPay}
                            className={`w-full ${
                              payError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>

                        {/* Dropdown for Job Type */}
                        <div className="w-full">
                          <MultipleDropdownSelect
                            label="Select Job Type"
                            options={jobTypeOptions}
                            selectedOptions={selectedJobTypes}
                            onChange={setSelectedJobTypes}
                            className={`w-full ${
                              jobTypeError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>

                        <div className="w-full">
                          <MultipleDropdownSelect
                            label="Job Location"
                            options={jobLocationCityOptions}
                            selectedOptions={selectedJobLocation}
                            onChange={setSelectedJobLocation}
                            className={`w-full ${
                              jobTypeError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>

                        <div className="w-full h-full">
                          <SimpleInputField
                            placeholder="Enter Company Name"
                            value={keywordsIncludeInCompany}
                            onChange={(e) =>
                              setKeywordsIncludeInCompany(e.target.value)
                            }
                            className={`w-full mb-0 rounded-lg ${
                              skillsInputError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 py-5">
                        {/* Dropdown for Job Posted Time */}
                        <div className="w-full">
                          <MultipleDropdownSelect
                            label="Date Posted"
                            options={postedTimeOptions}
                            selectedOptions={selectedPostedTime}
                            onChange={setSelectedPostedTime}
                            className={`w-full ${
                              postedTimeError ? "border-dangerBorder" : ""
                            }`}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center w-full rounded-xl p-2 bg-dropdownBackground gap-3">
                      {/* <ToggleButton /> */}
                      <ToggleButton
                        isOn={toggleTenState}
                        onToggle={handleToggleUnderTen}
                      />
                      <p className="text-white text-base font-medium">
                        Job Under 10 Applicants
                      </p>
                    </div>
                    <div className="w-full bordr items-center justify-between flex py-10">
                      <Button
                        onClick={handleStartApplying}
                        className="p-3 px-4 space-x-3 whitespace-nowrap   flex items-center text-base font-medium  max-w-40 min-w-max h-12 text-primary rounded-lg by-none border-purpleBorder  border-2  hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                      >
                        <span>Start Applying</span>
                        <span>
                          <FaArrowRightLong />
                        </span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AdvanceSearchModal
            isOpen={isAdvanceSearchModalOpen}
            onClose={() => setIsAdvanceSearchModalOpen(false)}
            searchHistoryKeyword={searchHistoryKeyword}
            setSearchHistoryKeyword={setSearchHistoryKeyword}
            onSave={handleSaveAdvancedSearch}
          />
          <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            onSave={handleSaveFeedback}
          />
          <FeedbackSubmittedModal
            isOpen={isSubmittedModalOpen}
            onClose={() => setIsSubmittedModalOpen(false)}
          />
        </div>
      </DashBoardLayout>
    </>
  );
};

export default JobApply;
