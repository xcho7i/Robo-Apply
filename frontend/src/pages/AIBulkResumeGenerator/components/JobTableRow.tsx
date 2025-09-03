import React, { useRef, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Sparkles, X, Loader2, RotateCcw } from "lucide-react"
import { JobRow } from "../types"

interface JobTableRowProps {
  job: JobRow
  index: number
  isProcessing: boolean
  isGeneratingRowAI: boolean
  fieldErrors: { [key: string]: string }
  retryReady: { [key: string]: boolean }
  onUpdateJob: (id: string, field: keyof JobRow, value: string) => void
  onGenerateTitles: (job: JobRow) => void
  onGenerateDescriptions: (job: JobRow) => void
  onGenerateSkills: (job: JobRow) => void
  onGenerateRowAI: (job: JobRow) => void
  onRemoveRow: (id: string) => void
  onRetryField: (fieldKey: string, job: JobRow) => void
  onResetRow?: (job: JobRow) => void
  totalJobs: number
}

export const JobTableRow: React.FC<JobTableRowProps> = ({
  job,
  index,
  isProcessing,
  isGeneratingRowAI,
  fieldErrors,
  retryReady,
  onUpdateJob,
  onGenerateTitles,
  onGenerateDescriptions,
  onGenerateSkills,
  onGenerateRowAI,
  onRemoveRow,
  onRetryField,
  onResetRow,
  totalJobs
}) => {
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const skillsTextareaRef = useRef<HTMLTextAreaElement>(null)

  const titleFieldKey = `${job.id}-jobTitle`
  const descriptionFieldKey = `${job.id}-description`
  const skillsFieldKey = `${job.id}-skills`

  // Auto-resize textareas independently
  const resizeTextarea = useCallback((textarea: HTMLTextAreaElement) => {
    if (textarea && textarea.isConnected) {
      // Reset height to auto to get the scroll height
      textarea.style.height = "auto"

      // Get the actual scroll height needed for content
      const scrollHeight = textarea.scrollHeight
      const maxHeight = 200
      const minHeight = 53
      const constrainedHeight = Math.max(
        minHeight,
        Math.min(maxHeight, scrollHeight)
      )

      // Apply height to the textarea
      textarea.style.height = `${constrainedHeight}px`

      // Only allow scroll when content exceeds max height
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = "auto"
      } else {
        textarea.style.overflowY = "hidden"
      }
    }
  }, [])

  const resizeDescriptionTextarea = useCallback(() => {
    if (descriptionRef.current) {
      resizeTextarea(descriptionRef.current)
    }
  }, [resizeTextarea])

  const resizeSkillsTextarea = useCallback(() => {
    if (skillsTextareaRef.current) {
      resizeTextarea(skillsTextareaRef.current)
    }
  }, [resizeTextarea])

  // Auto-resize when job description or skills values change (programmatically)
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      resizeDescriptionTextarea()
    })
  }, [job.description, resizeDescriptionTextarea])

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      resizeSkillsTextarea()
    })
  }, [job.skills, resizeSkillsTextarea])

  // Also resize on component mount and when job changes
  useEffect(() => {
    // Use multiple attempts to ensure resizing happens
    const resizeWithRetry = () => {
      resizeDescriptionTextarea()
      resizeSkillsTextarea()

      // Retry after a short delay in case the first attempt was too early
      setTimeout(() => {
        resizeDescriptionTextarea()
        resizeSkillsTextarea()
      }, 50)
    }

    // Initial attempt
    const timer = setTimeout(() => {
      requestAnimationFrame(resizeWithRetry)
    }, 0)

    return () => clearTimeout(timer)
  }, [job.id, resizeDescriptionTextarea, resizeSkillsTextarea])

  return (
    <div
      className={`relative group px-0 py-0 lg:px-4 lg:py-3 border-l-4 border-purple my-[25px] lg:my-0 rounded-[10px] lg:rounded-none lg:border-l-0 transition-colors ${
        index % 2 === 0 ? "lg:bg-almostBlack/50" : "lg:bg-almostBlack/30"
      }`}>
      {/* Hover buttons - positioned absolutely */}
      <div className="hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1 z-50">
        {onResetRow && (
          <Button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log("Reset button clicked for job:", job.id)
              console.log("onResetRow function exists:", !!onResetRow)
              onResetRow(job)
            }}
            size="sm"
            variant="outline"
            type="button"
            className="h-5 w-5 p-0 bg-dropdownBackground border-customGray rounded-full text-primary  transition-all shadow-lg"
            title="Reset row data">
            <RotateCcw className="!h-3 !w-3" />
          </Button>
        )}
      </div>
      <div className="hidden lg:flex absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1 z-50">
        <Button
          onClick={() =>
            totalJobs > 1
              ? onRemoveRow(job.id)
              : job && onResetRow && onResetRow(job)
          }
          size="sm"
          variant="outline"
          className="h-5 w-5 p-0 bg-dropdownBackground border-customGray text-danger transition-all shadow-lg rounded-full"
          title="Delete row">
          <X className="!h-3 !w-3" />
        </Button>
      </div>

      {/* Grid Layout for Table Columns - Responsive */}
      <div className="grid grid-cols-1 gap-3 items-start p-4 lg:p-0 lg:mx-3 lg:grid-cols-4 lg:gap-4">
        {/* Mobile/Tablet Job Header - Job Number and Actions */}
        <div className="block lg:hidden col-span-full mb-2">
          <div className="flex items-center justify-between">
            <div className="text-left text-primary font-medium text-sm">
              Job {index + 1}
            </div>
            <div className="flex gap-2">
              {onResetRow && (
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onResetRow(job)
                  }}
                  size="sm"
                  variant="outline"
                  type="button"
                  className="h-8 w-8 p-0 bg-almostBlack/90 border-customGray text-primary hover:text-purple hover:border-purple transition-all shadow-lg rounded-full"
                  title="Reset row data">
                  <RotateCcw className="!h-4 !w-4" />
                </Button>
              )}
              <Button
                onClick={() =>
                  totalJobs > 1
                    ? onRemoveRow(job.id)
                    : job && onResetRow && onResetRow(job)
                }
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-almostBlack/90 border-customGray text-danger transition-all shadow-lg rounded-full"
                title="Delete row">
                <X className="!h-4 !w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Company URL */}
        <div className="group relative lg:col-span-1">
          <div className="block lg:hidden text-left text-primary font-medium text-sm mb-2">
            Company URL*
          </div>
          <Input
            value={job.companyUrl}
            onChange={(e) => onUpdateJob(job.id, "companyUrl", e.target.value)}
            placeholder="google.com"
            className="placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none block w-full bg-dropdownBackground text-primary rounded py-4 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors"
          />
        </div>

        {/* Job Title */}
        <div className="group relative lg:col-span-1">
          <div className="block lg:hidden text-left text-primary font-medium text-sm mb-2">
            Job Title
          </div>
          <Input
            value={job.jobTitle}
            onChange={(e) => onUpdateJob(job.id, "jobTitle", e.target.value)}
            placeholder="Software Engineer"
            className="placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none block w-full bg-dropdownBackground text-primary rounded py-4 px-3 pr-10 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors"
          />
          <Button
            onClick={() => onGenerateTitles(job)}
            disabled={isProcessing}
            size="sm"
            variant="ghost"
            className="hidden absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-purple hover:text-primary hover:bg-gradient-to-r hover:from-gradientStart hover:to-gradientEnd transition-all disabled:opacity-50 items-center justify-center rounded opacity-30 group-hover:opacity-100 lg:top-[70%]">
            <Sparkles className="h-3 w-3" />
          </Button>
        </div>

        {/* Job Description */}
        <div className="group relative lg:col-span-1">
          <div className="block lg:hidden text-left text-primary font-medium text-sm mb-2">
            Job Description
          </div>
          <Textarea
            ref={descriptionRef}
            value={job.description}
            onChange={(e) => {
              onUpdateJob(job.id, "description", e.target.value)
              requestAnimationFrame(() => {
                resizeDescriptionTextarea()
              })
            }}
            onInput={resizeDescriptionTextarea}
            placeholder="Job Description"
            className="placeholder:text-gray-500 placeholder-shown:!h-[39px] focus:bg-[rgba(69,69,69,1)] appearance-none block w-full bg-dropdownBackground text-primary rounded py-4 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors resize-none __custom-scoll-class auto-resize-textarea"
            style={{
              minHeight: "53px",
              maxHeight: "200px"
            }}
            rows={1}
          />
          <Button
            onClick={() => onGenerateDescriptions(job)}
            disabled={isProcessing}
            size="sm"
            variant="ghost"
            className="hidden absolute right-1 top-1 h-8 w-8 text-purple hover:text-primary hover:bg-gradient-to-r hover:from-gradientStart hover:to-gradientEnd transition-all disabled:opacity-50 items-center justify-center rounded opacity-30 group-hover:opacity-100 lg:top-8">
            <Sparkles className="h-3 w-3" />
          </Button>
        </div>

        {/* Skills */}
        <div className="group relative lg:col-span-1">
          <div className="block lg:hidden text-left text-primary font-medium text-sm mb-2">
            Skills
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-2">
            <div className="flex-1 lg:w-auto w-full">
              <Textarea
                ref={skillsTextareaRef}
                value={job.skills}
                onChange={(e) => {
                  onUpdateJob(job.id, "skills", e.target.value)
                  requestAnimationFrame(() => {
                    resizeSkillsTextarea()
                  })
                }}
                onInput={resizeSkillsTextarea}
                placeholder="Skills"
                className="placeholder:text-gray-500 placeholder-shown:!h-[39px] focus:bg-[rgba(69,69,69,1)] appearance-none block w-full bg-dropdownBackground text-primary rounded py-4 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors resize-none __custom-scoll-class auto-resize-textarea"
                style={{
                  minHeight: "53px",
                  maxHeight: "200px"
                }}
                rows={1}
              />
              <Button
                onClick={() => onGenerateSkills(job)}
                disabled={isProcessing}
                size="sm"
                variant="ghost"
                className="hidden absolute right-1 top-1 h-8 w-8 text-purple hover:text-primary hover:bg-gradient-to-r hover:from-gradientStart hover:to-gradientEnd transition-all disabled:opacity-50 items-center justify-center rounded opacity-30 group-hover:opacity-100 lg:top-8">
                <Sparkles className="h-3 w-3" />
              </Button>
            </div>

            <Button
              onClick={() => onGenerateRowAI(job)}
              disabled={isGeneratingRowAI}
              size="sm"
              className="bg-dropdownBackground hover:bg-dropdownBackground text-white transition-all duration-200 w-full lg:w-auto lg:mt-0 lg:self-end"
              title="Generate all AI content for this row">
              {isGeneratingRowAI ? (
                <Loader2 className="h-3 w-3 animate-spin text-white" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              <span className="ml-2 lg:hidden">Generate Row Data</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error/Retry Messages - Responsive */}
      <div className="grid grid-cols-1 gap-1 px-4 mt-1 lg:px-0 lg:mx-3 lg:grid-cols-4 lg:gap-4">
        <div className="lg:hidden"></div>{" "}
        {/* Company URL - no errors, hidden on mobile */}
        {/* Job Title Errors */}
        <div>
          {retryReady[titleFieldKey] ? (
            <Button
              onClick={() => onRetryField(titleFieldKey, job)}
              variant="link"
              size="sm"
              className="text-purple hover:text-primary underline text-xs p-0 h-auto">
              Retry?
            </Button>
          ) : fieldErrors[titleFieldKey] ? (
            <p className="text-danger text-xs">{fieldErrors[titleFieldKey]}</p>
          ) : null}
        </div>
        {/* Job Description Errors */}
        <div>
          {retryReady[descriptionFieldKey] ? (
            <Button
              onClick={() => onRetryField(descriptionFieldKey, job)}
              variant="link"
              size="sm"
              className="text-purple hover:text-primary underline text-xs p-0 h-auto">
              Retry?
            </Button>
          ) : fieldErrors[descriptionFieldKey] ? (
            <p className="text-danger text-xs">
              {fieldErrors[descriptionFieldKey]}
            </p>
          ) : null}
        </div>
        {/* Skills Errors */}
        <div>
          {retryReady[skillsFieldKey] ? (
            <Button
              onClick={() => onRetryField(skillsFieldKey, job)}
              variant="link"
              size="sm"
              className="text-purple hover:text-primary underline text-xs p-0 h-auto">
              Retry?
            </Button>
          ) : fieldErrors[skillsFieldKey] ? (
            <p className="text-danger text-xs">{fieldErrors[skillsFieldKey]}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
