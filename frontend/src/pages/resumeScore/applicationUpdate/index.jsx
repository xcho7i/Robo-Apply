// ApplicationUpdate.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineDone } from "react-icons/md";
import { ImCross } from "react-icons/im";
import DashBoardLayout from "../../../dashboardLayout";
import Button from "../../../components/Button";
import fileIcon from "../../../assets/dashboardIcons/resumeScoreIcon.svg";
import CircularProgressBar from "../../../components/CircularProgressBar";
import ProgressBarWithPoints from "../../../components/ProgressBarWithPoints";
import ResumeAnalysisTable from "../../../components/ResumeAnalysisTable";
import resumeFileTypeIcon from "../../../assets/resumeScoreIcons/resumeFileTypeIcon.svg";
import emailAddressIcon from "../../../assets/resumeScoreIcons/emailAddressIcon.svg";
import phoneNumberIcon from "../../../assets/resumeScoreIcons/phoneNumberIcon.svg";
import linkedinProfileIcon from "../../../assets/resumeScoreIcons/linkedinProfileIcon.svg";
import jobTitleMatchIcon from "../../../assets/resumeScoreIcons/jobTitleMatchIcon.svg";
import educationMatchIcon from "../../../assets/resumeScoreIcons/educationMatchIcon.svg";
import sectionHeadingIcon from "../../../assets/resumeScoreIcons/sectionHeadingIcon.svg";
import SkillGapTable from "../../../components/SkillGapTable";
import MinMaxBar from "../../../components/MinMaxBar";
import weakResultIcon from "../../../assets/resumeScoreIcons/weakResultIcon.svg";
import strongResultIcon from "../../../assets/resumeScoreIcons/strongResultIcon.svg";
import MeasurableResults from "../ui/MeasurableResults";
import imageScoreImage from "../../../assets/resumeScoreIcons/checkScoreImage.svg";
import CircularIndeterminate from "../../../components/loader/circular";

const ApplicationUpdate = () => {
  const [resumeFileName, setResumeFileName] = useState("");
  const [showKeywords, setShowKeywords] = useState(false);

  // State to manage visibility of additional skills
  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const wordCount = 650;

  const hardSkillMatch = [
    {
      icon: null,
      label: "Your Score",
      description: (
        <>
          This Scanners (ATS) and hiring managers are looking for keywords to
          see that you're a good match for the role. If you mirror the skill
          keywords in the job description in your resume, they'll know you’ve
          got what it takes.
          <span className="mt-10 block">
            Did we miss any key skills in the description?
          </span>
        </>
      ),
      status: true,
    },
  ];

  const analysisData = [
    {
      label: "Your Score",
      description:
        "This is all about beating the bots. To get to the hiring manager, you have to get past their applicant tracking system first. This software automatically organizes and filters resumes.",
      status: true,
    },
    {
      icon: resumeFileTypeIcon,
      label: "Resume File Type",
      description: (
        <>
          Your resume is a <span className="text-purple font-bold">pdf</span>,
          which can easily be scanned by ATS systems.
        </>
      ),
      status: true,
    },
    {
      icon: emailAddressIcon,
      label: "Email Address",
      description: (
        <>
          Your email{" "}
          <span className="text-purple font-bold">roberthalf987@gmail.com</span>{" "}
          is on your resume, nice work!
        </>
      ),
      status: true,
    },
    {
      icon: phoneNumberIcon,
      label: "Phone Number",
      description: (
        <>
          Your phone number{" "}
          <span className="text-purple font-bold">+924175951279</span> is on
          your resume, good job!
        </>
      ),
      status: true,
    },
    {
      icon: linkedinProfileIcon,
      label: "LinkedIn Profile",
      description: (
        <>
          Your resume appears to have a{" "}
          <span className="text-purple font-bold">LinkedIn profile</span> on it,
          data shows that including a LinkedIn profile gives you a higher chance
          of hearing back!
        </>
      ),
      status: true,
    },
    {
      icon: jobTitleMatchIcon,
      label: "Job Title Match",
      description: (
        <>
          The job title
          <span className="text-purple font-bold">Product designer</span> was
          found on your resume, perfect!
        </>
      ),
      status: true,
    },
    {
      icon: educationMatchIcon,
      label: "Education Match",
      description:
        "The job description requires a(n) B.S. degree, your resume shows that you have a(n) B.S.",
      status: true,
    },
    {
      icon: sectionHeadingIcon,
      label: "Section Headings",
      description:
        "We found the Experience and Education sections on your resume, nice work!",
      status: true,
    },
  ];

  const skillData = [
    { skill: "Design", resume: 20, jobDescription: 2, skillGap: true },
    { skill: "B2B", resume: 1, jobDescription: 1, skillGap: true },
    { skill: "Design Tools", resume: 1, jobDescription: 1, skillGap: true },
    { skill: "Excel", resume: 1, jobDescription: 1, skillGap: true },
    { skill: "Product", resume: 9, jobDescription: 1, skillGap: true },
    { skill: "Communication", resume: 3, jobDescription: 2, skillGap: false },
    {
      skill: "Project Management",
      resume: 4,
      jobDescription: 2,
      skillGap: true,
    },
    { skill: "UX Research", resume: 5, jobDescription: 3, skillGap: false },
    {
      skill: "Agile Methodologies",
      resume: 6,
      jobDescription: 4,
      skillGap: true,
    },
    { skill: "Data Analysis", resume: 7, jobDescription: 3, skillGap: false },
  ];

  const softSkillData = [
    { skill: "Design", resume: 20, jobDescription: 2, skillGap: true },
  ];

  const resultData = [
    {
      sectionTitle: "Measurable Results",
      resultIcon: weakResultIcon,
      metrics: ["40%", "70%", "Undefined", "Undefined", "Undefined"],
      description:
        "Your resume contains measurable metrics, such as '40%' and '70%', but lacks the recommended 5+ instances of quantified results. Include more results to better showcase your achievements.",
      status: "incomplete",
    },
    {
      sectionTitle: "Action Verbs",
      resultIcon: strongResultIcon,
      metrics: ["Improved", "Optimized", "Led", "Enhanced", "Executed"],
      description:
        "Your resume has a strong mix of action/power words, including 'Improved,' 'Enhanced,' and 'Executed.' These words emphasize your impact and leadership in various roles.",
      status: "complete",
    },
  ];

  // Click handler for the New Scan button
  const handleNewScanClick = () => {
    localStorage.removeItem("resumeFileName");

    navigate("/scan-resume");
  };

  // Click handler for the button
  const handleReScoreClick = () => {
    const storedFileName = localStorage.getItem("resumeFileName");
    console.log(storedFileName);
  };

  // Toggle function to show/hide skills
  const toggleSkills = () => {
    setShowMore(!showMore);
  };

  const toggleAtsVisibility = () => {
    setShowKeywords((prev) => !prev);
  };
  useEffect(() => {
    const storedFileName = localStorage.getItem("resumeFileName");

    if (!storedFileName) {
      navigate("/scan-resume");
    } else {
      setResumeFileName(storedFileName);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (isLoading) {
    return (
      <DashBoardLayout>
        <div className="flex items-center justify-center h-full w-full bg-almostBlack">
          <CircularIndeterminate />
        </div>
      </DashBoardLayout>
    );
  }

  return (
    <>
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full border-b-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-t-0 pb-10">
            <div className="text-center space-y-3 pt-10">
              <p className="text-3xl font-normal text-primary">
                Upload Successful!
              </p>
              <p className="text-base font-normal text-primary">
                Create your personalized cover letter for job applications,
                powered by AI technology—fast and free!
              </p>
            </div>
            <hr className="border-t-2 border-simplePurple mt-5 w-[40%] mx-auto" />
          </div>
          <div className="mx-[10%] my-10 space-y-10">
            <div className="w-full p-10 border-formBorders bg-dropdownBackground">
              <div className="flex gap-3 items-center justify-left">
                <div>
                  <img src={fileIcon} alt="File Icon" loading="lazy" />
                </div>
                <div>
                  <p>{resumeFileName ? resumeFileName : "Resume"}</p>
                  <p>Data Added</p>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <p className="text-primary text-3xl font-medium">
                Resume Match Score
              </p>
              <p className="text-primary text-2xl font-medium">
                Your Resume Analysis
              </p>
            </div>
            <div className="p-5 bg-lightPurple flex flex-col lg:flex-row items-center justify-between space-y-5 lg:space-y-0 lg:space-x-10">
              {/* Progress Circle */}
              <div className="w-full lg:w-1/3 flex items-center justify-center">
                <CircularProgressBar
                  progress={80}
                  size={250}
                  strokeWidth={35}
                />
              </div>

              {/* Text Content */}
              <div className="w-full lg:w-2/3 lg:p-5 p-3 space-y-5">
                <p className="text-2xl lg:text-3xl font-medium text-purple">
                  Great Start!
                </p>
                <div className="space-y-5">
                  <p className="text-lg lg:text-xl font-medium text-primary">
                    You’ll be a good candidate for this position if you update
                    your resume.
                  </p>
                  <p className="text-lg lg:text-xl font-medium text-primary">
                    Review the recommendations below for the formatting,
                    keywords, and best practices you need to land the interview.
                  </p>
                  <p className="text-lg lg:text-xl font-medium text-primary">
                    Then scan your updated resume to make sure you score 75% or
                    higher.
                  </p>
                  <p className="text-lg lg:text-xl font-medium text-primary">
                    You have 3 recommended updates.
                  </p>
                </div>
                <Button className="p-3 px-6 flex items-center space-x-2 max-w-40 min-w-max h-12 text-lg lg:text-xl font-semibold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                  Start See Your Recommendations
                </Button>
              </div>
            </div>
            {/* double point Progress Bar */}
            <div className="w-full text-center items-center justify-center">
              <p className="text-primary text-3xl font-medium">
                ATS Best Practices
              </p>
              <div className="w-full flex items-center justify-center h-36">
                <ProgressBarWithPoints
                  topLabel="Average Score"
                  topValue={25}
                  bottomLabel="Your Score"
                  bottomValue={87}
                />
              </div>
            </div>
            <div className="w-full items-center justify-center">
              <ResumeAnalysisTable analysisData={analysisData} />
            </div>
            <div className="w-full items-center justify-center flex">
              <Button className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max h-12 text-lg lg:text-xl font-semibold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                Click Here To View Individual Score
              </Button>
            </div>
            {/* Hard Skills */}
            <div className="w-full text-center items-center justify-center pt-10">
              <p className="text-primary text-3xl font-medium">
                Hard Skills Match
              </p>
              <div className="w-full flex items-center justify-center h-36 ">
                <ProgressBarWithPoints
                  topLabel="Average Score"
                  topValue={25}
                  bottomLabel="Your Score"
                  bottomValue={87}
                />
              </div>
              <div className="w-full items-center justify-center">
                <ResumeAnalysisTable analysisData={hardSkillMatch} />
              </div>
              <div className="w-full items-center justify-center">
                <SkillGapTable
                  skillData={showMore ? skillData : skillData.slice(0, 5)}
                />
                <div className="flex justify-left mt-5 ml-5">
                  <Button
                    onClick={toggleSkills}
                    className="h-12 w-48 text-center text-lg lg:text-xl font-normal rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  >
                    {showMore ? "Hide" : "Show More Skills"}
                  </Button>
                </div>
              </div>
            </div>
            {/* Soft Skills */}
            <div className="w-full text-center items-center justify-center pt-10">
              <p className="text-primary text-3xl font-medium">
                Soft Skills Match
              </p>
              <div className="w-full flex items-center justify-center h-36 ">
                <ProgressBarWithPoints
                  topLabel="Average Score"
                  topValue={25}
                  bottomLabel="Your Score"
                  bottomValue={87}
                />
              </div>
              <div className="w-full items-center justify-center">
                <ResumeAnalysisTable analysisData={hardSkillMatch} />
              </div>
              <div className="w-full items-center justify-center">
                <SkillGapTable skillData={softSkillData} />
                <div className="flex justify-center mt-3">
                  <Button
                    onClick={toggleAtsVisibility}
                    className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max h-12 text-lg lg:text-xl font-semibold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  >
                    Click Here To View ATS And General Keywords To Add
                  </Button>
                </div>
              </div>
            </div>
            {/* hide this div and show on the click of ats to generel kerwods btn */}
            {showKeywords && (
              <div className="w-full text-center items-center justify-center ">
                <div className="w-full text-left">
                  <p className="text-primary text-3xl font-medium">
                    Word Count
                  </p>
                </div>
                <div className="flex w-full items-center justify-center mt-10 py-2 ">
                  <div className="w-2/6 items-center justify-center flex mr-1">
                    <MinMaxBar
                      value={wordCount}
                      min={400}
                      max={1000}
                      totalMin={0}
                      totalMax={1500}
                    />
                  </div>
                  <div className="text-primary text-lg font-medium w-3/6 items-center  justify-center mr-1 ">
                    Your resume is {wordCount} words, which is a good length.
                  </div>
                  <div className="w-1/6 items-center justify-center text-4xl text-center mr-2  flex">
                    {wordCount >= 400 && wordCount <= 1000 ? (
                      <MdOutlineDone className="text-purple" />
                    ) : (
                      <ImCross className="text-danger" />
                    )}
                  </div>
                </div>
                <div className="w-full items-center justify-center">
                  {resultData.map((data, index) => (
                    <MeasurableResults
                      key={index}
                      resultData={data}
                      sectionTitle={data.sectionTitle}
                      actionVerbTitle={data.actionVerbTitle}
                    />
                  ))}
                </div>
                <div className="w-full items-center justify-center mt-10 py-2  space-y-8">
                  <p className="w-full text-left text-3xl font-medium">
                    Cliches & Buzzwords
                  </p>
                  <div className="w-full px-36 space-y-10 ">
                    <p className="w-full text-center text-5xl font-bold text-purple">
                      4
                    </p>
                    <p className="w-full items-center justify-center flex text-primary text-lg font-normal text-justify">
                      Your resume has 4 cliches, fluffy buzzwords, and/or
                      personal pronouns including "Dynamic," "I," and "i." You
                      got what it takes. should consider removing them as it's
                      not a best practice to use these when writing your resume.
                      If your pronouns are on your resume to help clarify your
                      gender identity, click the button below to re-score your
                      resume
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-center mt-3 ">
              <Button
                onClick={handleReScoreClick}
                className="p-3 px-3 flex items-center space-x-2 max-w-40 min-w-max h-12 text-lg lg:text-xl font-semibold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              >
                Re- Score Your Resume
              </Button>
            </div>
            <div className="flex items-center justify-center mt-3 ml-5 ">
              <img src={imageScoreImage} className="w-full" loading="lazy" />
            </div>
            <div className="flex justify-center mt-3 ">
              <Button
                onClick={handleNewScanClick}
                className="p-3 px-3 flex items-center space-x-2 justify-center min-w-48 h-12 text-lg lg:text-xl font-semibold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              >
                New Scan
              </Button>
            </div>
          </div>
        </div>
      </DashBoardLayout>
    </>
  );
};

export default ApplicationUpdate;
