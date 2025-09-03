import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashBoardLayout from "../../../dashboardLayout";
import Dropdown from "../../../components/dropdown";
import FileUploader from "../../../components/fileUploader";
import Button from "../../../components/Button";
import { successToast, errorToast } from "../../../components/Toast";
const ScanResume = () => {
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const navigate = useNavigate();

  const jobTitles = [
    "CEO",
    "CTO",
    "CIO/Chief Digital Officer/Chief Innovation Officer",
    "VP of Product Management/Head of Product",
    "Product Manager",
    "VP of Marketing",
    "VP of Engineering/Director of Engineering",
    "Chief Architect",
    "Software Architect",
    "Engineering Project Manager/Engineering Manager",
    "Technical Lead/Engineering Lead/Team Lead",
    "Principal Software Engineer",
    "Senior Software Engineer/Senior Software Developer",
    "Software Engineer",
    "Software Developer",
    "Junior Software Developer",
    "Intern Software Developer",
  ];

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    if (file && file.name) {
      localStorage.setItem("resumeFileName", file.name);
    }
  };

  const handleJobTitleChange = (event) => {
    setSelectedJobTitle(event.target.value);
  };

  const handleResumeScan = () => {
    if (!selectedJobTitle || !uploadedFile) {
      errorToast("Please select a job title and upload a file");
      return;
    }

    console.log("Job Title:", selectedJobTitle);
    console.log("Uploaded File:", uploadedFile.name);

    setSelectedJobTitle("");
    setUploadedFile(null);

    successToast("Resume scan initiated successfully!");
    navigate("/scan-resume/application-update");
  };

  return (
    <>
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full">
            <div className="text-center space-y-3 pt-10">
              <p className="text-3xl font-normal text-primary">
                Scan Your Resume With AI
              </p>
              <p className="text-base font-normal text-primary">
                Create your personalized cover letter for job applications,
                powered by AI technology—fast and free!
              </p>
            </div>
            <hr className="border-t-2 border-simplePurple mt-5 w-[40%] mx-auto" />

            <div className="w-full px-20 lg:px-28 py-5">
              <Dropdown
                className="border-formBorders bg-dropdownBackground"
                label="Select Job Title"
                placeholder="Product Designer"
                options={jobTitles}
                onChange={handleJobTitleChange}
              />
            </div>

            <div className="px-20 lg:px-28">
              <FileUploader onFileUpload={handleFileUpload} />
            </div>

            <div className="flex justify-center py-10">
              <Button
                onClick={handleResumeScan}
                className="p-3 px-20 flex items-center space-x-2 max-w-40 min-w-max h-12 text-xl font-semibold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              >
                Start Resume Scan
              </Button>
            </div>
          </div>
          <hr className="my-5 border-dashboardborderColor" />
        </div>
      </DashBoardLayout>
    </>
  );
};

export default ScanResume;
