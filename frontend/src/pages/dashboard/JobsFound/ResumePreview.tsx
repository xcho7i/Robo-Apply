import { Modal } from "antd"
import DocumentRenderer from "../../AIBulkResumeGenerator/components/DocumentRenderer"
import Heading from "@/src/components/Heading"

export interface PreviewData {
  jobTitle: string
  company: string
  jobId: string
  jobDescription: string
  arrayBuffer?: ArrayBuffer
  base64?: string
}

interface Props {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function ResumePreview({ isOpen, setIsOpen }: Props) {
  return (
    <Modal
      centered
      className="!w-[600px] lg:!w-[800px] !h-2/3 overflow-auto"
      title={
        <Heading type="h2" className="text-white">
          Resume Preview
        </Heading>
      }
      destroyOnHidden
      styles={{
        content: {
          backgroundColor: "rgba(26, 26, 26, 1)"
        },
        header: {
          backgroundColor: "rgba(26, 26, 26, 1)"
        }
      }}
      forceRender
      open={isOpen}
      footer={null}
      onCancel={() => setIsOpen(false)}>
      <div
        id="new-resume-preview"
        className="w-full h-full rounded  min-h-[400px] bg-white overflow-auto [&>section.docx-content:not(:has(>_.document-content))]:!w-auto [&>section.docx-content:has(>_article)]:!p-4"
      />
      {/* <DocumentRenderer title="Resume Preview" url={url} /> */}
      {/* <div className="flex flex-col order-2 md:order-2">
        <div className="flex items-center gap-2 mb-2 md:mb-3 pb-2 border-b border-customGray">
          <h3 className="font-semibold text-primary text-sm md:text-base">
            Tailored Resume
          </h3>
        </div>
        <div className="flex-1 border border-customGray rounded-lg overflow-hidden bg-almostBlack/80 min-h-[200px] md:min-h-[300px]">
          {previewData.tailoredResumeFile &&
          previewData.tailoredResumeFile.startsWith(
            "data:application/vnd.openxmlformats"
          ) ? (
            // Show DOCX file preview with download option
            <div className="w-full h-full relative">
              <div className="absolute inset-0 flex flex-col">
                <div className="p-2 bg-almostBlack/80 border-b border-customGray text-xs text-primary">
                  <span>DOCX Generated - </span>
                  <button
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = previewData.tailoredResumeFile!
                      link.download = `${previewData.jobTitle}_${previewData.company}_Resume.docx`
                      link.click()
                    }}
                    className="underline hover:text-purple text-lightGrey">
                    Download DOCX
                  </button>
                </div>
                <div className="flex-1 p-2 md:p-4 overflow-auto">
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-lightGrey">
                    {previewData.tailoredResume}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            // Fallback to text content
            <div className="p-2 md:p-4 overflow-auto h-full">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-lightGrey">
                {previewData.tailoredResume}
              </pre>
            </div>
          )}
        </div>
      </div> */}
    </Modal>
  )
}
export default ResumePreview
