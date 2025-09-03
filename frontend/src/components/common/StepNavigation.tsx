"use client"

import { ArrowLeftIcon, ArrowRightIcon, Loader2 } from "lucide-react"
import { Button } from "../ui/button"

interface StepNavigationProps {
  currentStep: number
  isLoading?: boolean
  onNext?: (e: React.FormEvent) => void | Promise<void>
  onPrevious?: () => void
  disabled?: boolean
}

export default function StepNavigation({
  currentStep,
  isLoading = false,
  onNext,
  onPrevious,
  disabled = false
}: StepNavigationProps) {
  const handleBack = () => {
    if (onPrevious) onPrevious()
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    if (onNext) await onNext(e)
  }

  return (
    <div className="mt-6 flex justify-end gap-3">
      {/* Error display */}

      {currentStep !== 1 && (
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isLoading}
          type="button"
          className="rounded-full w-28">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Button>
      )}

      {currentStep !== 2 && (
        <Button
          variant="default"
          onClick={handleNext}
          disabled={isLoading || disabled}
          type="submit"
          className="rounded-full !px-6 w-28">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {currentStep === 39 ? "Complete" : "Next"}
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}
