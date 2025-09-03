import React, { useState, useEffect, useRef } from "react"
import DashBoardLayout from "../../../dashboardLayout"
import Button from "@/src/components/Button/index"
import { useNavigate } from "react-router-dom"

import {
  PlusOutlined,
  DownOutlined,
  CalendarOutlined,
  CodeOutlined
} from "@ant-design/icons"
import { Select, Dropdown, Pagination, MenuProps } from "antd"
import CircularIndeterminate from "../../../components/loader/circular"
import API_ENDPOINTS from "@/src/api/endpoints"

import SessionLoading from "../SessionLoading"
import InterviewModal from "./modal/InterviewModal"
import Setting from "./setting/index"
import SettingButton from "../SettingButton"
import { errorToast, successToast } from "@/src/components/Toast"
import { VscDebugStart } from "react-icons/vsc"
import { Divide } from "lucide-react"
import ComingSoonModal from '@/src/components/Modals/CommingSoonModal'

// Type definitions for interview session
type InterviewSession = {
  sessionId: string
  status: string
  interview_expected_time?: string
  // Add other properties as needed
}

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const LiveInterview: React.FC = () => {
  const navigate = useNavigate()

  const [loadingLoader, setLoadingLoader] = useState(false)
  const [isFirstTabActive, setFirstTabActive] = useState(true)
  const [isInterviewModalVisible, setInterviewModalVisible] = useState(false)
  const [isSessionLoading, setSessionLoading] = useState(false)
  const [isSettingVisible, setSettingVisible] = useState(false)
  const [interviewType, setInterviewType] = useState<"live-interview" | "mock-interview">("live-interview")
  const [specialization, setSpecialization] = useState("")
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [interviewSessionTemp, setInterviewSessionTemp] = useState<any>()

  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([])

  // Filter sessions based on tab
  const filteredSessions = interviewSessions.filter(
    (session) =>
      (isFirstTabActive && session.status === "upcoming") ||
      (!isFirstTabActive && session.status === "completed") ||
      (isFirstTabActive && session.status === "active")
  )

  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Ant Design Menu items type
  const items: MenuProps['items'] = [
    {
      key: "1",
      label: (
        <div
          className="flex items-center space-x-2"
          onClick={() => handleSpecializationSelect("General")}>
          <CalendarOutlined />
          <span>General</span>
        </div>
      )
    },
    {
      type: "divider"
    },
    {
      key: "2",
      type: "group",
      label: "Specialized Skills"
    },
    {
      key: "3",
      label: (
        <div
          className="flex items-center space-x-2"
          onClick={() => handleSpecializationSelect("Coding Copilot")}>
          <CodeOutlined />
          <span>Coding Copilot</span>
        </div>
      )
    }
  ]
  const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
  const userId = userData?._id

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingLoader(true)
        const res = await fetch(
          `${BASE_URL}${API_ENDPOINTS.GetAllInterviewSessions}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId: userId })
          }
        )

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Failed to fetch: ${text}`)
        }

        const result = await res.json()

        successToast(`${result.msg}`)

        setInterviewSessions(result.sessions)

        // eslint-disable-next-line no-console
        console.log("result => ", result)
      } catch (err: unknown) {
        // Type guard for error
        if (err instanceof Error) {
          // eslint-disable-next-line no-console
          console.error(err)
          // errorToast(err.message || "Failed to load resumes")
        } else {
          // eslint-disable-next-line no-console
          console.error(err)
          // errorToast("Failed to load resumes")
        }
      } finally {
        setLoadingLoader(false)
      }
    }

    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleUpcoming = () => {
    setFirstTabActive(true)
    setCurrentPage(1)
  }

  const handleCompleted = () => {
    setFirstTabActive(false)
    setCurrentPage(1)
  }

  const handleMockupInterview = () => {
    // setInterviewType("mock-interview")
    // setSpecialization("Mock Interview")
    // setInterviewModalVisible(true)
    setIsComingSoonModalOpen(true)
  }

  function handleSpecializationSelect(specialization: string) {
    if (specialization === "General") {
      setInterviewModalVisible(true)
      setSpecialization("General")
    }
    if (specialization === "Coding Copilot") {
      setSessionLoading(true)
    }
  }

  const handleSetting = () => {
    setSettingVisible(true)
  }

  const handleCancel = () => {
    setInterviewModalVisible(false)
  }

  return (
    <>
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
      />
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
                {/*  */}

                {isSettingVisible ? (
                  <Setting setSettingVisible={setSettingVisible}/>
                ) : (
                  <>
                    <p className="font-bold text-3xl mb-3">Interviews</p>
                    <div className="flex justify-between w-full">
                      <div className="text-[#CCCCCC] text-xl flex-1">
                        Create various types of interviews across multiple
                        fields and access professional <br />
                        insights from each one.
                      </div>
                      <div className="flex-3">
                        <SettingButton onClickHandler={handleSetting} />
                      </div>
                    </div>
                    <div className="flex w-fit bg-[#454545] p-2 rounded-lg">
                      <Button
                        onClick={handleUpcoming}
                        className={`p-3 px-5 flex items-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg ${isFirstTabActive
                            ? "bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                            : ""
                          }`}>
                        Upcoming
                      </Button>
                      <Button
                        onClick={handleCompleted}
                        className={`p-3 px-5 flex items-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg ${!isFirstTabActive
                            ? "bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                            : ""
                          }`}>
                        Completed
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Select
                        size="large"
                        className="text-white min-w-[150px]"
                        placeholder="All Types"
                        options={[
                          {
                            label: "All Types",
                            value: "workType",
                            disabled: true
                          },
                          { label: "Live Interview", value: "live" },
                          { label: "Mockup Interview", value: "mock" }
                        ]}
                      />
                      <div className="flex w-fit gap-4 p-2 rounded-lg">
                        <Button
                          onClick={handleMockupInterview}
                          className={`p-3 px-5 flex items-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg ${interviewType === "mock-interview"
                              ? "bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                              : "bg-[#454545] border border-[#404040]"
                            } `}>
                          <PlusOutlined /> <span> Mock Interview </span>
                        </Button>
                        <Dropdown
                          menu={{ items }}
                          trigger={["click"]}
                          placement="bottomRight">
                          <Button
                            className={`p-3 px-5 flex items-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg  ${interviewType === "live-interview"
                                ? "bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                : "bg-[#454545] border border-[#404040]"
                              } `}
                            onClick={() => setInterviewType("live-interview")}>
                            <PlusOutlined /> <span>Live Interview</span>
                            <DownOutlined />
                          </Button>
                        </Dropdown>
                      </div>
                    </div>

                    <div className="w-full rounded-tl-md rounded-tr-md">
                      {/* Table Header */}
                      <div className="grid grid-cols-5 text-white font-semibold text-base border-b-2 border-gray-400">
                        <div className="py-3 px-4">Interview</div>
                        <div className="py-3 px-4">Status</div>
                        <div className="py-3 px-4 flex items-center">Type</div>
                        <div className="py-3 px-4 flex items-center">
                          Appointment
                        </div>
                        <div className="py-3 px-4 flex items-center justify-center">
                          Action
                        </div>
                      </div>

                      {/* Table Rows */}
                      {paginatedSessions.map((session, index) => (
                        <div
                          key={session.sessionId || index}
                          className="grid grid-cols-5 items-center text-white text-base border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200">
                          <div className="py-3 px-4">{`Interview ${(currentPage - 1) * pageSize + index + 1
                            }`}</div>
                          <div className="py-3 px-4 capitalize">
                            {session.status}
                          </div>
                          <div className="py-3 px-4 flex items-center">
                            Live Interview
                          </div>
                          <div className="py-3 px-4 flex items-center">
                            {session.interview_expected_time
                              ? new Date(
                                session.interview_expected_time
                              ).toLocaleString()
                              : "-"}
                          </div>
                          <div className="py-3 px-4 flex justify-center items-center">
                            {session.status !== "completed" ? (
                              <div className="group relative">
                                <Button
                                  className="p-2 flex items-center text-navbar text-yellowColor font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                                  onClick={() =>
                                    navigate(
                                      `/live-interview/${session.sessionId}`
                                    )
                                  }>
                                  <VscDebugStart size={20} />
                                </Button>
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                  Start
                                </span>
                              </div>) : (<div className="flex items-center justify-center">/</div>)}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-center mt-4 mb-4">
                        <Pagination
                          current={currentPage}
                          pageSize={pageSize}
                          total={filteredSessions.length}
                          showSizeChanger
                          pageSizeOptions={["5", "10", "20", "50"]}
                          onChange={(page, size) => {
                            setCurrentPage(page)
                            setPageSize(size)
                          }}
                          className="text-white"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashBoardLayout>

      {isInterviewModalVisible && (
        <InterviewModal
          specialization={specialization}
          handleInterviewModalVisible={(value: boolean) =>
            setInterviewModalVisible(value)
          }
          cancel={handleCancel}
          getTempInterviewSession={(val: any) => setInterviewSessionTemp(val)}
        />
      )}
      {isSessionLoading && <SessionLoading />}
    </>
  )
}

export default LiveInterview
