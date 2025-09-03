import React, { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import DashBoardLayout from "../../../dashboardLayout";
import Button from "@/src/components/Button/index";
import Upload from "@/src/assets/upload.svg";
import { PlusOutlined, FilePdfOutlined } from "@ant-design/icons";
import CircularIndeterminate from "../../../components/loader/circular";
import { errorToast, successToast } from "@/src/components/Toast";
import SettingButton from "../SettingButton";
import Setting from "../LiveInterview/setting";
import API_ENDPOINTS from "@/src/api/endpoints";
import { useYourResume } from "@/src/contexts/YourResumeContext";
import { MdDelete, MdOutlineRemoveRedEye } from "react-icons/md";

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com";

type UploadFile = {
  name: string;
  date: string;
  file: File;
};

type UploadedFile = {
  name: string;
  date: string;
  // ...other fields as needed
};

const AddYourResume: React.FC = () => {
  const [loadingLoader, setLoadingLoader] = useState<boolean>(false);
  const [isFirstTabActive, setFirstTabActive] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isSettingVisible, setIsSettingVisible] = useState<boolean>(false);
  const { uploadedFiles, addUploadedFiles } = useYourResume();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          // Normalize the backend response to match frontend expectations
          const normalizedFiles = result.uploadedFiles.map((file: any) => ({
            name: file.name || file.fileName || file.filename || "Unknown File",
            date: file.date || file.uploadDate || file.upload_date || new Date().toLocaleDateString(),
            // Preserve other fields that might be useful
            id: file.id,
            fileSize: file.fileSize,
            fileType: file.fileType
          }));
          addUploadedFiles(normalizedFiles);
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
        console.log(message)
      } finally {
        setLoadingLoader(false);
      }
    };

    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResumeUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    selectedFiles.forEach((file) => {
      // Accept PDF, TXT, and Word documents
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword", // .doc
        "application/vnd.ms-word", // .doc
        "text/rtf", // .rtf
      ];

      if (allowedTypes.includes(file.type)) {
        const newFile: UploadFile = {
          name: file.name,
          date: new Date().toLocaleDateString(),
          file: file,
        };
        setFiles((prev) => [...prev, newFile]);
      } else {
        errorToast("Only PDF, TXT, DOC, DOCX, and RTF files are allowed!");
      }
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSetting = () => {
    setIsSettingVisible(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files ?? []);
    droppedFiles.forEach((file) => {
      // Accept PDF, TXT, and Word documents
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword", // .doc
        "application/vnd.ms-word", // .doc
        "text/rtf", // .rtf
      ];

      if (allowedTypes.includes(file.type)) {
        const newFile: UploadFile = {
          name: file.name,
          date: new Date().toLocaleDateString(),
          file: file,
        };
        setFiles((prev) => [...prev, newFile]);
      } else {
        errorToast("Only PDF, TXT, DOC, DOCX, and RTF files are allowed!");
      }
    });
  };

  const handleAddResume = async () => {
    if (files.length === 0) {
      // eslint-disable-next-line no-alert
      alert("No files selected");
      return;
    }
    setLoadingLoader(true);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("resume", f.file));
      formData.append("userId", userId);

      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.UploadNewResume}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await res.json();

      // Assume backend returns uploaded file info array
      if (!result || !Array.isArray(result.uploadedFiles)) {
        throw new Error("Invalid server response");
      }

      // Normalize the backend response to match frontend expectations
      const normalizedFiles = result.uploadedFiles.map((file: any) => ({
        name: file.name || file.fileName || file.filename || "Unknown File",
        date: file.date || file.uploadDate || file.upload_date || new Date().toLocaleDateString(),
        // Preserve other fields that might be useful
        id: file.id,
        fileSize: file.fileSize,
        fileType: file.fileType
      }));

      // Update uploadedFiles table with new uploaded files
      addUploadedFiles(normalizedFiles);

      // eslint-disable-next-line no-console
      console.log("result.uploadedFiles => ", result.uploadedFiles);
      console.log("normalizedFiles => ", normalizedFiles);

      // Clear files ready for upload
      setFiles([]);

      successToast("Resume uploaded successfully!");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as any).message)
          : "Upload failed";

      console.log(message)
      // errorToast(message);
    } finally {
      setLoadingLoader(false);
    }
  };


  const handleRemoveResume = async (id: string) => {
    console.log("id => ", id);
    const res = await fetch(`${BASE_URL}${API_ENDPOINTS.RemoveResume}`, {
      method: "POST",
      body: JSON.stringify({ userId: userId, _id: id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Remove failed: ${errorText}`);
    }
    const result = await res.json();
    console.log("result => ", result);
    successToast("Resume removed successfully!");
  };

  return (
    <>
      {loadingLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <CircularIndeterminate />
        </div>
      )}
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full px-5 md:px-10">
            <div className="pb-10 pt-10 flex flex-col gap-8">
              {isSettingVisible ? (
                <Setting setSettingVisible={setIsSettingVisible} />
              ) : (
                <>
                  <p className="font-bold text-3xl mb-3">Resumes & Others</p>

                  {/* Info + Setting */}
                  <div className="flex justify-between w-full">
                    <div className="text-[#CCCCCC] text-xl flex-1">
                      Upload your resume and cover letters, and AI will extract key
                      content and remind <br /> you during the interview.
                    </div>
                    <div className="flex-3">
                      <SettingButton onClickHandler={handleSetting} />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex w-fit bg-[#454545] p-2 rounded-lg">
                    <Button
                      className={`p-3 px-5 flex items-center whitespace-nowrap font-bold rounded-lg ${isFirstTabActive
                        ? "bg-gradient-to-b from-gradientStart to-gradientEnd"
                        : "text-primary"
                        }`}
                      onClick={() => setFirstTabActive(true)}
                    >
                      Resumes
                    </Button>
                    <Button
                      className={`p-3 px-5 flex items-center whitespace-nowrap font-bold rounded-lg ${!isFirstTabActive
                        ? "bg-gradient-to-b from-gradientStart to-gradientEnd"
                        : "text-primary"
                        }`}
                      onClick={() => setFirstTabActive(false)}
                    >
                      Others
                    </Button>
                  </div>

                  {/* Upload area */}
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`flex w-fit gap-4 p-2 rounded-lg border ${
                        isDragging ? "border-white" : "border-[#454545]"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      {!files.length ? (
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="py-1 flex items-center space-x-2 w-fit justify-center text-xs md:text-xl font-semibold rounded-lg bg-none text-primary px-2"
                        >
                          <img src={Upload} alt="Upload" />
                          <span>Drag to Upload</span>
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2 bg-[#2c2c2c] px-4 py-2 rounded">
                          <FilePdfOutlined />
                          <span className="text-white">
                            {files.length > 1 ? `${files.length} files selected` : files[files.length - 1]?.name}
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept=".pdf,.txt,.doc,.docx,.rtf,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.ms-word,text/rtf"
                        className="hidden"
                        onChange={handleResumeUpload}
                      />
                    </div>

                    <Button
                      onClick={handleAddResume}
                      className="p-3 px-5 flex items-center space-x-2 rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd font-bold"
                    >
                      <PlusOutlined />
                      <span>Add Your Resume</span>
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="mt-5">
                    <div className="grid grid-cols-3 text-white font-semibold text-base border-b-2 border-gray-400 rounded-tl-md rounded-tr-md">
                      <div className="py-3 px-4">File Name</div>
                      <div className="py-3 px-4">Upload Date</div>
                      <div className="py-3 px-4 flex justify-end pr-32">Actions</div>
                    </div>
                    {uploadedFiles.map(
                      (
                        file: { name: string; date: string; id: string },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 text-white font-normal text-base border-b border-[#454545] items-center"
                        >
                          <div className="py-3 px-4">{file.name}</div>
                          <div className="py-3 px-4">{file.date}</div>
                          <div className="py-3 px-4 flex gap-2 justify-end pr-28">
                            <div className="group relative">
                              <Button
                                className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                onClick={() => {
                                  console.log("View functionality coming soon!");
                                  // TODO: Implement file viewing functionality
                                }}
                              >
                                <MdOutlineRemoveRedEye size={20} />
                              </Button>
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                View
                              </span>
                            </div>
                            <div className="group relative">
                              <Button
                                className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                onClick={() => {
                                  console.log(file,"file==================");
                                  // TODO: Implement proper delete functionality with API call
                                  handleRemoveResume(file.id);
                                }}
                              >
                                <MdDelete size={20} />
                              </Button>
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                Delete
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DashBoardLayout>
    </>
  );
};

export default AddYourResume;
