import React from "react"
import { Button } from "../components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import "./JobTableHeader.css"

interface JobTableHeaderProps {
  bulkGenerating: string | null
  isGeneratingAllTitles: boolean
  isGeneratingAllDescriptions: boolean
  isGeneratingAllSkills: boolean
  onGenerateAllTitles: () => void
  onGenerateAllDescriptions: () => void
  onGenerateAllSkills: () => void
}

export const JobTableHeader: React.FC<JobTableHeaderProps> = ({
  bulkGenerating,
  isGeneratingAllTitles,
  isGeneratingAllDescriptions,
  isGeneratingAllSkills,
  onGenerateAllTitles,
  onGenerateAllDescriptions,
  onGenerateAllSkills
}) => {
  return (
    <div className="border-b-0 lg:border-b lg:border-customGray bg-almostBlack">
      {/* Mobile/Tablet bulk generation buttons */}
      <div className="block lg:hidden p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            onClick={onGenerateAllTitles}
            disabled={isGeneratingAllTitles}
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 !bg-dropdownBackground text-white border-none hover:text-white transition-all duration-200">
            {isGeneratingAllTitles ? (
              <Loader2 className="h-3 w-3 mr-2 animate-spin text-white" />
            ) : (
              <Sparkles className="h-3 w-3 mr-2" />
            )}
            Generate All Titles
          </Button>
          <Button
            onClick={onGenerateAllDescriptions}
            disabled={isGeneratingAllDescriptions}
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 !bg-dropdownBackground text-white border-none hover:text-white transition-all duration-200">
            {isGeneratingAllDescriptions ? (
              <Loader2 className="h-3 w-3 mr-2 animate-spin text-white" />
            ) : (
              <Sparkles className="h-3 w-3 mr-2" />
            )}
            Generate All Descriptions
          </Button>
          <Button
            onClick={onGenerateAllSkills}
            disabled={isGeneratingAllSkills}
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 !bg-dropdownBackground text-white border-none hover:text-white transition-all duration-200">
            {isGeneratingAllSkills ? (
              <Loader2 className="h-3 w-3 mr-2 animate-spin text-white" />
            ) : (
              <Sparkles className="h-3 w-3 mr-2" />
            )}
            Generate All Skills
          </Button>
        </div>
      </div>

      {/* Header only visible on larger screens - hidden on mobile and tablet */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-4 p-3">
          {/* Company URL */}
          <div className="text-left text-primary font-medium text-sm">
            <div className="h-full flex items-center justify-between">
              <span className="ml-[20px]">Company URL*</span>
            </div>
          </div>

          {/* Job Title */}
          <div className="text-left text-primary font-medium text-sm">
            <div className="flex items-center justify-between  __custom-heading-wrapper __allow-margin">
              <span className="lg:ml-3">Job Title</span>
              <Button
                onClick={onGenerateAllTitles}
                disabled={isGeneratingAllTitles}
                variant="outline"
                size="sm"
                className="!h-8 !px-4 !py-2 text-xs !border-none !bg-dropdownBackground text-white hover:text-white ml-2 transition-all duration-200">
                {isGeneratingAllTitles ? (
                  <>
                    Generating Titles
                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                  </>
                ) : (
                  "Generate Titles"
                )}
              </Button>
            </div>
          </div>

          {/* Job Description */}
          <div className="text-left text-primary font-medium text-sm">
            <div className="flex items-center justify-between __custom-heading-wrapper __allow-margin-desc">
              <span className="lg:ml-[4px]">Job Description</span>
              <Button
                onClick={onGenerateAllDescriptions}
                disabled={isGeneratingAllDescriptions}
                variant="outline"
                size="sm"
                className="!mr-[10px] !h-8 !px-4 !py-2 text-xs !border-none !bg-dropdownBackground text-white hover:text-white ml-2 transition-all duration-200">
                {isGeneratingAllDescriptions ? (
                  <span className="flex flex-col lg:flex-row items-center gap-1">
                    <span>
                      Generating{" "}
                      <span className="inline-block xl:inline-block">
                        Descriptions
                      </span>
                    </span>
                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                  </span>
                ) : (
                  "Generate Descriptions"
                )}
              </Button>
            </div>
          </div>

          {/* Skills */}
          <div className="text-left text-primary font-medium text-sm">
            <div className="flex items-center justify-between max-w-[calc(100%-65px)]  __custom-heading-wrapper __allow-margin-skills">
              <span className="lg:ml-[-6px]">Skills</span>
              <Button
                onClick={onGenerateAllSkills}
                disabled={isGeneratingAllSkills}
                variant="outline"
                size="sm"
                className="!h-8 !px-4 !py-2 text-xs !border-none !bg-dropdownBackground text-white hover:text-white ml-2 transition-all duration-200">
                {isGeneratingAllSkills ? (
                  <>
                    Generating Skills
                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                  </>
                ) : (
                  "Generate Skills"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
