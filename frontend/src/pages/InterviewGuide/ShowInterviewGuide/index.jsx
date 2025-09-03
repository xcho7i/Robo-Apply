import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FaChevronLeft, FaDownload, FaPrint } from "react-icons/fa"
import { formatDistanceToNow } from "date-fns"

import aiIcon from "../../../assets/generateAiCoverLetterIcons/aiIcon.svg"
import userIcon from "../../../assets/generateAiCoverLetterIcons/youIcon.svg"
import { successToast } from "../../../components/Toast"
import DOMPurify from "dompurify"
import DashBoardLayout from "../../../dashboardLayout"
import Button from "../../../components/Button"

const ShowInterviewGuide = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const interviewData = location.state?.interviewData

  // If no data is passed, redirect back
  if (!interviewData) {
    navigate("/main-interview-Guide")
    return null
  }

  const handleBackClick = () => {
    navigate("/main-interview-Guide")
  }

  const handleDownloadPDF = () => {
    // PDF download logic can be implemented here
    successToast("PDF download feature coming soon!")
  }

  const handlePrint = () => {
    window.print()
  }

  // Extract position from job description
  const extractPositionFromJobDesc = (jobDescription) => {
    if (!jobDescription) return "N/A"
    const titleMatch = jobDescription.match(
      /<strong>Job Title<\/strong>[:\s]*([^<\n]+)/i
    )
    if (titleMatch) return titleMatch[1].trim()
    const fallbackMatch = jobDescription.match(/Job Title[:\s]*([^<\n]+)/i)
    return fallbackMatch ? fallbackMatch[1].trim() : "N/A"
  }

  return (
    <DashBoardLayout>
      <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
        <div className="w-full px-5 md:px-10">
          {/* Header Section */}
          <div className="pb-10 pt-10 flex justify-between items-center gap-5">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackClick}
                className="p-2 flex items-center justify-center text-primary hover:inputBackGround rounded-lg transition-colors">
                <FaChevronLeft size={20} />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-primary">
                  Interview Guide Details
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Position:{" "}
                  {extractPositionFromJobDesc(interviewData.jobDescription)}
                </p>
              </div>
            </div>
          </div>

          {/* Interview Info Section */}
          <div className="inputBackGround rounded-lg p-6 mb-6 overflow-x-auto">
            <table className="min-w-full text-left border border-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-gray-300 font-semibold border-b border-gray-700">
                    Resume Used
                  </th>
                  <th className="px-4 py-2 text-gray-300 font-semibold border-b border-gray-700">
                    Total Questions
                  </th>
                  <th className="px-4 py-2 text-gray-300 font-semibold border-b border-gray-700">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-800">
                  <td className="px-4 py-2 text-primary border-b border-gray-700">
                    {interviewData.resumeUsed || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-primary border-b border-gray-700">
                    {interviewData.totalQuestions || 0}
                  </td>
                  <td className="px-4 py-2 text-primary border-b border-gray-700">
                    {interviewData.createdAt
                      ? formatDistanceToNow(new Date(interviewData.createdAt), {
                          addSuffix: true
                        })
                      : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Job Description Section */}
          <div className="inputBackGround rounded-lg p-6 border mb-6">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Job Description
            </h2>
            <div
              className="text-gray-300 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(interviewData.jobDescription)
              }}
            />
          </div>

          {/* Interview Questions and Answers */}
          <div className="bg-inputBackGround rounded-lg p-6 mb-10">
            {/* Initial AI Interview Guide */}
            <div className="mb-8">
              <div className="flex gap-4 mb-6">
                <img src={aiIcon} alt="AI" className="w-6 h-6" loading="lazy" />
                <h2 className="text-xl font-semibold text-primary">
                  AI Interview Guide
                </h2>
              </div>

              {Array.isArray(interviewData.initialInterviewGuide) &&
              interviewData.initialInterviewGuide.length > 0 ? (
                interviewData.initialInterviewGuide.map((item, index) => (
                  <div
                    key={index}
                    className="mb-6 p-4 inputBackGround rounded-lg">
                    <p className="text-primary font-semibold mb-3">
                      Q{index + 1}: {item.Question}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      <span className="font-semibold text-primary">
                        Answer:
                      </span>{" "}
                      {item.Answer}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No initial interview questions found.
                </p>
              )}
            </div>

            {/* Conversation History */}
            {Array.isArray(interviewData.conversationHistory) &&
              interviewData.conversationHistory.length > 0 && (
                <div>
                  <div className="flex gap-4 mb-6 pt-6 border-t border-gray-600">
                    <img
                      src={userIcon}
                      alt="User"
                      className="w-6 h-6"
                      loading="lazy"
                    />
                    <h2 className="text-xl font-semibold text-primary">
                      Follow-up Conversation
                    </h2>
                  </div>

                  {interviewData.conversationHistory.map(
                    (conversation, index) => (
                      <div key={`conversation-${index}`} className="mb-6">
                        {/* User Question */}
                        <div className="mb-4 p-4 bg-blue-900 bg-opacity-30 rounded-lg border-l-4 border-blue-500">
                          <div className="flex gap-4 mb-2">
                            <img
                              src={userIcon}
                              alt="User"
                              className="w-5 h-5"
                              loading="lazy"
                            />
                            {/* <p className="text-blue-300 font-medium text-sm">
                              You asked:
                            </p> */}
                            <p className="text-primary font-semibold ml-9">
                              {conversation.Question}
                            </p>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="p-4 inputBackGround rounded-lg border-l-4 border-green-500">
                          <div className="flex gap-4 mb-2">
                            <img
                              src={aiIcon}
                              alt="AI"
                              className="w-5 h-5"
                              loading="lazy"
                            />
                            <p className="text-green-300 font-medium text-sm">
                              AI Response:
                            </p>
                          </div>
                          <p className="text-gray-300 leading-relaxed ml-9">
                            {conversation.Answer}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </DashBoardLayout>
  )
}

export default ShowInterviewGuide
