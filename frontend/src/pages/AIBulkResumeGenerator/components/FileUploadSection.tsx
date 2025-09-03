import React, { useEffect } from "react"
import { Button } from "../components/ui/button"
import { Upload, FileText, X, Loader2, Sparkles, Brain } from "lucide-react"
import { errorToast } from "@/src/components/Toast"
// import { useTour, aiSingleSteps } from "@/src/stores/tours"
import { useTour, aiSingleSteps, aiBulkSteps } from "@/src/stores/tours"



interface FileUploadSectionProps {
  isSingleGenerationPage?: boolean
  baseResume: File | null
  baseResumeContent: string
  isUploadingResume: boolean
  isUploadingExcel: boolean
  isGeneratingResumes: boolean
  onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onExcelUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveResume: () => void
  onGenerateAllRows: () => void
  onGenerateTailoredResumes: () => void
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  baseResume,
  baseResumeContent,
  isUploadingResume,
  isUploadingExcel,
  onResumeUpload,
  onExcelUpload,
  onRemoveResume,
  onGenerateTailoredResumes,
  isGeneratingResumes,
  isSingleGenerationPage = false
}) => {
  const [showRemoveButton, setShowRemoveButton] = React.useState(false)
  // const { startModuleTourIfEligible } = useTour()
// useEffect(() => {
//   startModuleTourIfEligible("ai-tailored", aiDashboardPageSteps, { showWelcome: false })
// }, [startModuleTourIfEligible])

// useEffect(() => {
//   startModuleTourIfEligible("ai-single-resume-generator", aiSingleSteps, { showWelcome: false })
// }, [startModuleTourIfEligible])

const { startModuleTourIfEligible } = useTour()

useEffect(() => {
  if (isSingleGenerationPage) {
    // Single Resume Generator tour
    startModuleTourIfEligible("ai-single-resume-generator", aiSingleSteps, { showWelcome: false })
  } else {
    // Bulk Resume Generator tour
    startModuleTourIfEligible("ai-bulk-resume-generator", aiBulkSteps, { showWelcome: false })
  }
}, [isSingleGenerationPage, startModuleTourIfEligible])
  const [fileKey, setFileKey] = React.useState(`file-upload-${Date.now()}`)
  return (
    <>
      <div className="bg-almostBlack rounded-xl border-customGray" >
        <div className="flex flex-col lg:flex-row items-start justify-between gap-3">
          {/* Left side - Resume Upload */}
          <div className="flex-1 space-y-4">
            <h2 className="!m-0 text-sm font-medium text-primary">
              Upload Base Resume (PDF, DOCX, or TXT)
            </h2>

            <div className="!mt-2">
              <div className="flex items-center gap-3" >
                <input
                  key={fileKey}
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={async (e) => {
                    // add a check here for files greater than 5 mb and revoke
                    const file = e.target.files?.[0]
                    if (file && file.size > 5 * 1024 * 1024) {
                      errorToast("File size exceeds 5MB")
                      e.target.value = ""
                      return
                    }

                    await onResumeUpload(e)
                    setFileKey(`file-upload-${Date.now()}`)
                  }}
                  className="hidden"
                />
                <div data-tour="ai-single-uploadResume">
                <Button
                  onClick={() => {
                    document.getElementById("resume-upload")?.click()
                  }}
                  disabled={isUploadingResume}
                  className="bg-dropdownBackground hover:bg-dropdownBackground text-white border-0 px-2 py-3">
                  {isUploadingResume ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </>
                  )}
                </Button></div>

                {baseResume && (
                  <div
                    className="-mt-1 flex items-center gap-1"
                    onMouseEnter={() => {
                      setShowRemoveButton(true)
                    }}
                    onMouseLeave={() => {
                      setShowRemoveButton(false)
                    }}>
                    <div className="flex !text-xs items-center gap-2 text-white bg-lightPurple px-3 py-1 rounded border border-customGray">
                      <FileText className="!h-3 !w-3" />
                      {baseResume.name}
                    </div>
                    {showRemoveButton && (
                      <Button
                        onClick={onRemoveResume}
                        size="sm"
                        variant="ghost"
                        className="text-danger !px-1 !py-1 hover:text-redColor !bg-transparent">
                        <X className="!h-5 !w-5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs mt-2 text-gray-400">
                Accepted formats: PDF, DOCX, TXT, 5MB
              </p>
            </div>

            {/* Bottom links */}
            <div
              className={
                "flex flex-col lg:flex-row lg:items-center gap-1 pt-6 pb-0 " +
                (isSingleGenerationPage ? " !hidden " : "")
              }>
              <div className="flex  items-center gap-3" >
                <input

                  type="file"
                  id="excel-upload"
                  accept=".xlsx,.xls"
                  onChange={onExcelUpload}
                  className="hidden"
                />
                <div data-tour={ !isSingleGenerationPage ? "ai-bulk-upload":""}>
<button
                  onClick={() =>
                    document.getElementById("excel-upload")?.click()
                  }
                  disabled={isUploadingExcel}
                  className="text-white text-sm px-2 py-3 bg-dropdownBackground !rounded-md hover:bg-dropdownBackground transition-colors flex items-center gap-2 disabled:opacity-50 mr-2">
                  <Upload className="h-4 w-4" />
                  {isUploadingExcel ? "Processing..." : "Upload excel file"}
                </button>
                </div>
                
              </div>

             <div  data-tour={ !isSingleGenerationPage ? "ai-bulk-mapping":""}>
               <a
                href="/assets/sample-jobs.xlsx"
                target="_blank"
                className="text-white text-sm hover:text-white transition-colors">
                Download sample
              </a>
             </div>
            </div>
          </div>

          {/* Right side - Run Button */}
          <div
            className="ml-auto mt-3 lg:mt-0 h-full lg:h-[-webkit-fill-available]"
            style={{
              display: "flex",
              flexDirection: "column-reverse"
            }}>
              <div data-tour={ !isSingleGenerationPage ? "ai-bulk-start":""}>
            <Button
              onClick={
                isGeneratingResumes || !baseResumeContent
                  ? () => null
                  : onGenerateTailoredResumes
              }
              title={
                isGeneratingResumes || !baseResumeContent
                  ? "Please choose a base resume first"
                  : ""
              }
              // disabled={isGeneratingResumes || !baseResumeContent}
              className={
                "bg-dropdownBackground text-white hover:bg-dropdownBackground-700 transition-all duration-200 px-14 py-6 text-lg font-medium " +
                (isGeneratingResumes || !baseResumeContent
                  ? " cursor-not-allowed "
                  : "")
              }
              size="lg">
              {isGeneratingResumes ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                // <Brain className="mr-2 h-4 w-4" />
                <></>
              )}
              Run
            </Button></div>
          </div>
        </div>
      </div>
    </>
  )
}
