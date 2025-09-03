import React, { useState, useRef, useEffect } from "react";
import DashBoardLayout from "../../../dashboardLayout";
import Button from "@/src/components/Button/index";
import {
  PlusOutlined,
  CalendarOutlined,
  CodeOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import CircularIndeterminate from "../../../components/loader/circular";
import SettingButton from "../SettingButton";
import Setting from "../LiveInterview/setting";
import { MdDelete } from "react-icons/md";
import API_ENDPOINTS from "../../../api/endpoints";
import { successToast } from "@/src/components/Toast";
// Define the type for a position
type Position = {
  id: number;
  position: string;
  company: string;
  companyDetails: string;
  jobDescription: string;
};

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com";

const AddYourPosition: React.FC = () => {
  const [loadingLoader, setLoadingLoader] = useState<boolean>(false);
  const [isFirstTabActive, setFirstTabActive] = useState<boolean>(true);
  const [isLVModalVisible, setLVModalVisible] = useState<boolean>(false);
  const [isAddPositionModalVisible, setAddPositionModalVisible] = useState<boolean>(false);
  const [isSettingVisible, setIsSettingVisible] = useState<boolean>(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [formData, setFormData] = useState<Omit<Position, "id">>({
    position: "",
    company: "",
    companyDetails: "",
    jobDescription: "",
  });

  
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
  const userId = userData?._id

  useEffect(() => {
      const fetchPositions = async () => {
      const res = await fetch( `${BASE_URL}${API_ENDPOINTS.GetPositions}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({userId})
      })
      const data = await res.json()
      console.log(data,"data==================");
      setPositions(data.positions || [])
    }
    fetchPositions()
  }, [])

  const handleUpcoming = () => {
    setFirstTabActive(true);
  };

  const handleCompleted = () => {
    setFirstTabActive(false);
  };

  const handleSetting = () => {
    setIsSettingVisible(true);
  };

  const handleMockupInterview = () => {};

  const handleLiveInterview = () => {
    setLVModalVisible((prev) => !prev);
  };

  const handleAddPosition = () => {
    setAddPositionModalVisible(true);
  };

  const handleCloseModal = () => {
    setAddPositionModalVisible(false);
    setFormData({ position: "", company: "", companyDetails: "", jobDescription: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try{
    setPositions((prev) => [
      ...prev,
      { ...formData, id: Date.now() }, // Unique ID for each entry
    ]);
    const res = await fetch( `${BASE_URL}${API_ENDPOINTS.AddPosition}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({userId, position: formData})
    })
    successToast("Position added successfully")
     console.log(res,"response==================");
    }catch(error){
      console.log(error,"error==================");
    }
    handleCloseModal();
  };

  const handleEdit = (id: string) => {
    const positionToEdit = positions.find((p) => p._id === id);
    if (positionToEdit) {
      // Remove id from formData for editing
      const { id: _, ...rest } = positionToEdit;
      setFormData(rest);
      setAddPositionModalVisible(true);
    }
  };

  const handleDelete = async (id: string) => {
    try{
    const res = await fetch( `${BASE_URL}${API_ENDPOINTS.RemovePosition}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({userId, _id: id})
    })
    console.log(res,"response==================");
    successToast("Position deleted successfully")
    const newPositions = positions.filter((p) => p._id !== id)
    setPositions(newPositions)
    }catch(error){
      console.log(error,"error==================");
    }
  };

  return (
    <>
      {loadingLoader && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <CircularIndeterminate />
        </div>
      )}
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="w-full px-5 md:px-10">
            <div className="pb-10 pt-10 flex justify-between items-center gap-5">
              <div className="flex flex-col w-full gap-8">
                {isSettingVisible ? (
                  <Setting setSettingVisible={setIsSettingVisible} />
                ) : (
                  <>
                    <p className="font-bold text-3xl mb-3">Role</p>
                    <div className="flex justify-between w-full">
                      <div className="text-[#CCCCCC] text-xl flex-1">
                        Helps you clarify your expectations and allows AI to
                        accurately match your needs, <br /> enhancing your
                        professional performance in interviews.
                      </div>
                      <div className="flex-3">
                        <SettingButton onClickHandler={handleSetting} />
                      </div>
                    </div>
                    {/* <Button
                      onClick={handleMockupInterview}
                      className="p-3 px-5 flex w-fit items-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                    >
                      <PlusOutlined /> <span> Create </span>
                    </Button> */}
                    <div className="flex items-center justify-end">
                      <div className="flex w-fit gap-4 p-2 rounded-lg">
                        <Button
                          onClick={handleAddPosition}
                          className="p-3 px-5 flex items-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                        >
                          <PlusOutlined /> <span> Add Your Position </span>
                        </Button>
                      </div>
                    </div>

                    <div className="w-full  rounded-lg">
                      <div className="grid grid-cols-6 text-white font-semibold text-base bg-[#454545] rounded-tl-md rounded-tr-md">
                        <div className="py-3 px-4">Position</div>
                        <div className="py-3 px-4">Company</div>
                        <div className="py-3 px-4">Company Details</div>
                        <div className="py-3 px-4">Job Description</div>
                        <div className="py-3 px-4">Action</div>
                      </div>
                      {positions.map((position) => (
                        <div
                          key={position._id}
                          className="grid grid-cols-6 text-white text-sm border-b border-gray-700"
                        >
                          <div className="py-2 px-4">{position.position}</div>
                          <div className="py-2 px-4">{position.company}</div>
                          <div className="py-2 px-4">
                            {position.companyDetails || "Fill this in"}
                          </div>
                          <div className="py-2 px-4">
                            {position.jobDescription || "Fill this in"}
                          </div>
                          <div className="py-2 px-4 flex space-x-2">

                            <div className="group relative">
                              <Button
                                className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                onClick={() => {
                                  // TODO: Implement proper delete functionality with API call
                                  handleEdit(position._id)
                                }}
                              >
                                <EditOutlined size={20} />
                              </Button>
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                Edit
                              </span>
                            </div>
                            {/* <div className="group relative">
                              <Button
                                className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                onClick={() => {
                                  // TODO: Implement proper delete functionality with API call
                                  handleEdit(position.id);
                                }}
                              >
                                <EyeOutlined size={20} />
                              </Button>
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                View
                              </span>
                            </div> */}
                            <div className="group relative">
                              <Button
                                className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                onClick={() => {
                                  // TODO: Implement proper delete functionality with API call
                                  handleDelete(position._id);
                                }}
                              >
                                <MdDelete size={16} />
                              </Button>
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                Delete
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashBoardLayout>

      {isAddPositionModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#333333] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4 border-b-2 border-[#454545] pb-2">
              <h2 className="text-white text-xl font-bold">Company Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-white text-2xl px-2 rounded-md bg-[#454545]"
              >
                &times;
              </button>
            </div>
            <p className="text-[#CCCCCC] text-sm mb-4">
              Share your job position and company details with the AI to create, intelligent, interview plans.
            </p>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div>
                  <label className="text-white block mb-1 font-bold">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Position Example"
                    className="w-full p-2 bg-[#454545] border-none text-white rounded"
                  />
                </div>
                <div>
                  <label className="text-white block mb-1 font-bold">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company Example"
                    className="w-full p-2 bg-[#454545] border-none text-white rounded"
                  />
                </div>
              </div>
              <div>
                <label className="text-white block mb-1 font-bold">Company Details</label>
                <textarea
                  name="companyDetails"
                  value={formData.companyDetails}
                  onChange={handleInputChange}
                  placeholder="Copy and paste the company description here"
                  className="w-full p-2 bg-[#454545] text-white rounded h-24 border-none"
                  maxLength={3000}
                ></textarea>
                <p className="text-[#CCCCCC] text-sm text-left">
                  3000 characters left
                </p>
              </div>
              <div>
                <label className="text-white block mb-1 font-bold">Job Description</label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Copy and paste the job description here"
                  className="w-full p-2 bg-[#454545] text-white border-none rounded h-24"
                  maxLength={3000}
                ></textarea>
                <p className="text-[#CCCCCC] text-sm text-left">
                  3000 characters left
                </p>
              </div>
            </div>
            <div className="flex justify-between mt-4 space-x-4">
              <Button
                onClick={handleSubmit}
                className="p-2 px-4 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded"
              >
                <PlusOutlined /> <span> Create</span>
              </Button>
              <Button
                onClick={handleCloseModal}
                className="p-2 px-4 text-white rounded hover:bg-[#29292b]"
              >
                <span> Cancel </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddYourPosition;