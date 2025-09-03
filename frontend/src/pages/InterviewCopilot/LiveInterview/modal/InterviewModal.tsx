import Button from "@/src/components/Button/index";
import { Select, DatePicker } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Upgrade from "@/src/assets/upgradeIcon.svg";
import { useYourResume } from "@/src/contexts/YourResumeContext";

import moment, { Moment } from "moment";
import { errorToast, successToast } from "@/src/components/Toast";
import API_ENDPOINTS from "@/src/api/endpoints";

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com";

interface InterviewModalProps {
  specialization: string;
  handleInterviewModalVisible: (visible: boolean) => void;
  cancel: () => void;
  getTempInterviewSession: (val: any) => void;
}

const InterviewModal = ({
  specialization,
  handleInterviewModalVisible,
  cancel,
  getTempInterviewSession,
}: InterviewModalProps) => {
  const navigate = useNavigate();

  const [loadingLoader, setLoadingLoader] = useState<boolean>(false);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>(specialization);
  const [scheduleType, setScheduleType] = useState<string>("immediately");
  const [scheduleDateTime, setScheduleDateTime] = useState<Moment | null>(null);
  const [timeZone, setTimeZone] = useState<string>("UTC-07:00 America/Los_Angeles");
  const [additionalContext, setAdditionalContext] = useState<string>("");

  const { uploadedFiles, addUploadedFiles } = useYourResume();

  const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
  const userId = userData?._id

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoadingLoader(true);
        const res = await fetch(`${BASE_URL}${API_ENDPOINTS.GetResumes}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch: ${text}`);
        }

        const result = await res.json();

        if (result.success && Array.isArray(result.uploadedFiles)) {
          // eslint-disable-next-line no-console
          console.log("result.uploadedFiles => ", result.uploadedFiles);
          addUploadedFiles(result.uploadedFiles);
        } else {
          throw new Error(result.msg || "Invalid server response");
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
            ? String((err as any).message)
            : "Failed to load resumes";
        // errorToast(message);
      } finally {
        setLoadingLoader(false);
      }
    };

    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLaunch = async () => {
    // if (!selectedRole) {
    //   errorToast("Please select a role before launching the session.");
    //   return;
    // }

    setLoadingLoader(true);

    const selectedResumeObj = uploadedFiles.find(
      (file: any) => file.name === selectedResume
    );
    // eslint-disable-next-line no-console
    console.log("selectedResumeObj => ", selectedResumeObj?.id);

    try {
      const payload = {
        userId: userId,
        resume_name: selectedResume || null,
        resume_id: selectedResumeObj?.id || null,
        role: selectedRole,
        specialization: selectedSpecialization,
        scheduleType,
        interview_expected_time:
          scheduleType === "datetime"
            ? scheduleDateTime
              ? moment(scheduleDateTime).toISOString()
              : null
            : new Date(),
        timeZone,
        context: additionalContext,
      };

      const res = await fetch(
        `${BASE_URL}${API_ENDPOINTS.AddInterviewSession}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to add session: ${text}`);
      }

      const result = await res.json();
      if (result.success) {
        handleInterviewModalVisible(false);
        successToast("Session created successfully");

        const sessionId = result.sessionId;
        if (sessionId && scheduleType === "immediately") {
          navigate(`/live-interview/${sessionId}`);
        }

        getTempInterviewSession(result.session);
      } else {
        throw new Error(result.msg || "Failed to create session");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as any).message)
          : "Failed to launch session";
      errorToast(message);
    } finally {
      setLoadingLoader(false);
    }
  };

  const handleSaveForLater = () => {
    // Handle save for later logic here
    handleInterviewModalVisible(false);

    // eslint-disable-next-line no-console
    console.log("setSelectedResume => ", selectedResume);
    // eslint-disable-next-line no-console
    console.log("setSelectedRole => ", selectedRole);
    // eslint-disable-next-line no-console
    console.log("setSelectedSpecialization => ", selectedSpecialization);
    // eslint-disable-next-line no-console
    console.log("setScheduleType => ", scheduleType);
    // eslint-disable-next-line no-console
    console.log("setScheduleDateTime => ", scheduleDateTime);
  };

  const handleScheduleTypeChange = (type: string) => {
    setScheduleType(type);
    if (type === "datetime") {
      setScheduleDateTime(moment()); // Default to current time
    } else {
      setScheduleDateTime(null);
    }
  };

  const handleModalCancel = () => {
    cancel();
    setSelectedResume("");
    setSelectedRole("");
    setAdditionalContext("");
    setScheduleType("immediately");
    setScheduleDateTime(null);
    setTimeZone("UTC-07:00 America/Los_Angeles");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#333333] rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">
            Start Your Next Interview
          </h2>
          <button onClick={handleModalCancel} className="text-white text-2xl">
            &times;
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[#CCCCCC] block mb-3">
              {" "}
              <b>Resume</b> <span className="text-sm">optional</span>
            </label>
            <Select
              size="large"
              className="w-full text-white bg-[#454545] rounded"
              placeholder="Resume (optional)"
              value={selectedResume}
              onChange={setSelectedResume}
              options={uploadedFiles.map((file: any) => ({
                label: file.name,
                value: file.name,
              }))}
            />
          </div>
          <div>
            <label className="text-[#CCCCCC] block mb-3">
              <b>Role</b> <span className="text-sm">optional</span>
            </label>
            <Select
              size="large"
              className="w-full text-white bg-[#454545] rounded"
              placeholder="Role (optional)"
              value={selectedRole}
              onChange={setSelectedRole}
              options={[
                {
                  label: "Position Example @ Company Example",
                  value: "PositionExample@CompanyExample",
                },
                {
                  label: "Position Example2 @ Company Example2",
                  value: "PositionExample2@CompanyExample2",
                },
              ]}
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-center mb-3">
              <label className="text-[#CCCCCC] block mb-1">
                <b>Specialization (S)</b>
                <span className="text-sm"> optional</span>
              </label>
              <p className="text-white text-sm flex items-center">
                <span>Upgrade Now</span>
                <img src={Upgrade} alt="" />
              </p>
            </div>

            <Select
              size="large"
              className="w-full text-white bg-[#454545] rounded"
              value={selectedSpecialization}
              onChange={setSelectedSpecialization}
              options={[
                { label: "General", value: "General" },
                { label: "Coding Copilot", value: "CodingCopilot" },
              ]}
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-center mb-3">
              <label className="text-white block mb-1">
                <b>Additional Context</b>
              </label>
              <p className="text-white text-sm flex items-center">
                <span>Upgrade Saved Context</span>
                <img src={Upgrade} alt="" />
              </p>
            </div>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Enter additional context here..."
              className="w-full p-2 bg-[#454545] text-white rounded h-24 resize-none custom-scrollbar"
            />
          </div>
          <div>
            <div className="flex space-x-4 bg-[#454545] p-2 rounded-md">
              <Button
                onClick={() => handleScheduleTypeChange("immediately")}
                className={`p-3 px-5 flex-1 text-white rounded ${
                  scheduleType === "immediately"
                    ? "bg-gradient-to-b from-gradientStart to-gradientEnd"
                    : "bg-[#454545]"
                }`}
              >
                Immediately
              </Button>
              <Button
                onClick={() => handleScheduleTypeChange("datetime")}
                className={`p-3 px-5 flex-1 text-white rounded ${
                  scheduleType === "datetime"
                    ? "bg-gradient-to-b from-gradientStart to-gradientEnd"
                    : "bg-[#454545]"
                }`}
              >
                Set Date and Time
              </Button>
            </div>

            {scheduleType === "datetime" && (
              <div className="mt-2 space-y-2">
                <p className="my-4 font-bold">When</p>
                <div className="flex space-x-4">
                  <DatePicker
                    value={scheduleDateTime}
                    onChange={(date) => setScheduleDateTime(date)}
                    className="w-full text-white bg-[#454545] rounded"
                    placeholder="Pick a date"
                  />
                  <Select
                    value={
                      scheduleDateTime
                        ? moment(scheduleDateTime).format("LT")
                        : ""
                    }
                    // onChange={
                    //   (time) =>
                    //   setScheduleDateTime(
                    //     moment(
                    //       `${moment(scheduleDateTime).format(
                    //         "YYYY-MM-DD"
                    //       )} ${time}`,
                    //       "YYYY-MM-DD LT"
                    //     )
                    //   )
                    // }
                    className="w-full text-white bg-[#454545] rounded"
                    placeholder="Select your time"
                    options={[
                      { label: "12:00 AM", value: "12:00 AM" },
                      { label: "1:00 AM", value: "1:00 AM" },
                      // Add more time options as needed
                    ]}
                  />
                </div>
                <p className="my-4 font-bold">Timezone</p>
                <Select
                  value={timeZone}
                  onChange={setTimeZone}
                  className="w-full text-white bg-[#454545] rounded"
                  placeholder="Time Zone"
                  options={[
                    {
                      label: "UTC-07:00 America/Los_Angeles",
                      value: "UTC-07:00 America/Los_Angeles",
                    },
                    {
                      label: "UTC+09:00 Asia/Tokyo",
                      value: "UTC+09:00 Asia/Tokyo",
                    },
                  ]}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-4 space-x-4">
          <div className="flex gap-4">
            <Button
              onClick={handleLaunch}
              className="p-2 px-4 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded"
            >
              Launch
            </Button>
            <Button
              onClick={handleSaveForLater}
              className="p-2 px-4 bg-[#454545] text-white rounded"
            >
              Save for Later
            </Button>
          </div>
          <Button
            onClick={handleModalCancel}
            className="p-2 px-4 bg-[#454545] text-white rounded"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
