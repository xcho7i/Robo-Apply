import React from "react"
import { Button } from "../components/ui/button"
import { Plus } from "lucide-react"
import { JobRow } from "../types"
import { JobTableHeader } from "./JobTableHeader"
import { JobTableRow } from "./JobTableRow"


interface JobTableProps {
  jobs: JobRow[]
  isProcessing: boolean
  isSingleGenerationPage?: boolean
  fieldErrors: { [key: string]: string }
  retryReady: { [key: string]: boolean }
  bulkGenerating: string | null
  isGeneratingAllTitles: boolean
  isGeneratingAllDescriptions: boolean
  isGeneratingAllSkills: boolean
  generatingRowAI: Set<string>
  onUpdateJob: (id: string, field: keyof JobRow, value: string) => void
  onGenerateTitles: (job: JobRow) => void
  onGenerateDescriptions: (job: JobRow) => void
  onGenerateSkills: (job: JobRow) => void
  onGenerateRowAI: (job: JobRow) => void
  onRemoveRow: (id: string) => void
  onRetryField: (fieldKey: string, job: JobRow) => void
  onResetRow?: (job: JobRow) => void
  onAddRow: () => void
  onGenerateAllTitles: () => void
  onGenerateAllDescriptions: () => void
  onGenerateAllSkills: () => void
}

export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  isProcessing,
  fieldErrors,
  retryReady,
  bulkGenerating,
  isGeneratingAllTitles,
  isGeneratingAllDescriptions,
  isGeneratingAllSkills,
  generatingRowAI,
  onUpdateJob,
  onGenerateTitles,
  onGenerateDescriptions,
  onGenerateSkills,
  onGenerateRowAI,
  onRemoveRow,
  onRetryField,
  onResetRow,
  onAddRow,
  onGenerateAllTitles,
  onGenerateAllDescriptions,
  onGenerateAllSkills,
  isSingleGenerationPage = false // Default to false if not provided
}) => {
  return (
    <div className="bg-almostBlack border-0 rounded-none lg:rounded-lg lg:border lg:border-customGray overflow-hidden" data-tour="ai-single-techInfo">
      {/* Div-based table structure for better control and mobile responsiveness */}
      <div className="w-full">
        <JobTableHeader
          bulkGenerating={bulkGenerating}
          isGeneratingAllTitles={isGeneratingAllTitles}
          isGeneratingAllDescriptions={isGeneratingAllDescriptions}
          isGeneratingAllSkills={isGeneratingAllSkills}
          onGenerateAllTitles={onGenerateAllTitles}
          onGenerateAllDescriptions={onGenerateAllDescriptions}
          onGenerateAllSkills={onGenerateAllSkills}
        />
        <div className="lg:divide-y lg:divide-customGray">
          {jobs.map((job, index) => (
            <JobTableRow
              key={job.id}
              job={job}
              index={index}
              isProcessing={isProcessing}
              isGeneratingRowAI={generatingRowAI.has(job.id)}
              fieldErrors={fieldErrors}
              retryReady={retryReady}
              onUpdateJob={onUpdateJob}
              onGenerateTitles={onGenerateTitles}
              onGenerateDescriptions={onGenerateDescriptions}
              onGenerateSkills={onGenerateSkills}
              onGenerateRowAI={onGenerateRowAI}
              onRemoveRow={onRemoveRow}
              onRetryField={onRetryField}
              onResetRow={onResetRow}
              totalJobs={jobs.length}
            />
          ))}
        </div>
      </div>

      {/* Add New Row */}
      <div
        className={
          "lg:border-t border-customGray p-3 bg-almostBlack " +
          (isSingleGenerationPage ? " hidden " : "")
        }>
        <Button
          onClick={onAddRow}
          disabled={jobs.length >= 100}
          variant="outline"
          className="h-10 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm  appearance-none w-full  text-primary rounded py-3 px-3  text-sm border-none  transition-colors text-center flex items-center justify-center !bg-dropdownBackground hover:text-white">
          {/* <Plus className="mr-2 h-4 w-4" /> */}
          Add New Job Entry ({jobs.length}/100)
        </Button>
      </div>
    </div>
  )
}
