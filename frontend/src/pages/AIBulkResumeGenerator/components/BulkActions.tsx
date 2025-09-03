import React from "react"
import { Button } from "../components/ui/button"
import { Sparkles, Loader2, Brain } from "lucide-react"

interface BulkActionsProps {
  isProcessing: boolean
  isGeneratingResumes: boolean
  baseResumeContent: string
  onGenerateAllRows: () => void
  onGenerateTailoredResumes: () => void
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  isProcessing,
  isGeneratingResumes,
  baseResumeContent,
  onGenerateAllRows,
  onGenerateTailoredResumes
}) => {
  return (
    <div className="!hidden flex items-center justify-between" >
      <h2 className="text-xl font-semibold text-primary">Job Entries</h2>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="!hidden text-xs text-secondary">Bulk Actions:</span>
        <Button
          onClick={onGenerateAllRows}
          disabled={isProcessing}
          variant="outline"
          size="sm"
          className="!hidden border-purple text-purple hover:bg-gradient-to-r hover:from-gradientStart hover:to-gradientEnd hover:text-white bg-almostBlack/80 transition-all duration-200">
          {isProcessing ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="mr-1 h-3 w-3" />
          )}
          <span className="text-xs">Generate All Rows</span>
        </Button>
        <Button
          onClick={onGenerateTailoredResumes}
          disabled={isGeneratingResumes || !baseResumeContent}
          className="bg-gradient-to-r from-gradientStart to-gradientEnd text-white hover:from-purple hover:to-prupleText transition-all duration-200"
          size="sm">
          {isGeneratingResumes ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Brain className="mr-1 h-3 w-3" />
          )}
          <span className="text-xs">Generate Resumes</span>
        </Button>
      </div>
    </div>
  )
}
