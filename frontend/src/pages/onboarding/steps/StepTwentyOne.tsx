"use client"

import React, { useState, useEffect } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import StepNavigation from "../../../components/common/StepNavigation"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "../../../lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "../../../components/ui/tooltip"
import ProgressBar from "@/src/components/common/ProgressBar"

// Slider Component
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  formatValue = (v: number) => `${v.toLocaleString()}`,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  formatValue?: (value: number) => string
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}>
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}>
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-6 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50">
          <Tooltip open>
            <TooltipTrigger asChild>
              <div className="w-full h-full" />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              sideOffset={12}
              className="text-xs sm:text-sm font-semibold bg-[#A259FF] text-white px-2 sm:px-4 py-1 sm:py-2 rounded-sm shadow-lg">
              {formatValue(_values[index])}
            </TooltipContent>
          </Tooltip>
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

// Slider with Labels Component
type SliderWithLabelProps = {
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  value?: number
  onChange?: (value: number) => void
  minLabel?: React.ReactNode
  maxLabel?: React.ReactNode
  midLabel?: React.ReactNode
  formatValue?: (value: number) => string
  className?: string
}

function SliderWithLabel({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = min,
  value: controlledValue,
  onChange,
  minLabel,
  maxLabel,
  midLabel,
  formatValue = (v) => `${v.toLocaleString()}`,
  className
}: SliderWithLabelProps) {
  const [internalValue, setInternalValue] = useState<number>(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internalValue

  return (
    <TooltipProvider>
      <div className={cn("w-full flex flex-col items-center", className)}>
        <div
          className="relative w-full flex items-center"
          style={{ height: 60 }}>
          <div className="w-full px-2 mt-12">
            <Slider
              min={min}
              max={max}
              step={step}
              value={[value]}
              onValueChange={([v]) => {
                setInternalValue(v)
                onChange?.(v)
              }}
              className="[&_[data-slot=slider-track]]:bg-[#8B6B1B] [&_[data-slot=slider-range]]:bg-[#FFC700] [&_[data-slot=slider-thumb]]:bg-[#FFC700] [&_[data-slot=slider-thumb]]:border-none [&_[data-slot=slider-thumb]]:shadow-lg h-10"
              formatValue={formatValue}
            />
          </div>
        </div>
        {/* Min/Max labels */}
        <div className="flex justify-between w-full px-2 mt-2">
          <span className="text-white text-lg font-normal">
            {minLabel ?? min.toString().padStart(2, "0")}
          </span>
          {midLabel && (
            <span className="text-white text-lg font-normal">{midLabel}</span>
          )}
          <span className="text-white text-lg font-normal">
            {maxLabel ?? formatValue(max)}
          </span>
        </div>
      </div>
    </TooltipProvider>
  )
}

const JobsPerWeekSlider = ({
  value,
  onChange,
  min = 5,
  max = 50,
  step = 5,
  formatValue
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  formatValue: (value: number) => string
}) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center text-xs sm:text-sm">
        <div className="flex flex-col">
          <span className="text-white text-sm sm:text-base font-bold">
            Slow and Steady
          </span>
          <span className="text-white text-xs sm:text-sm font-bold">
            5 Jobs/ Week
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white text-sm sm:text-base font-bold">
            Balanced
          </span>
          <span className="text-white text-xs sm:text-sm font-bold">
            20 Jobs/Week
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white text-sm sm:text-base font-bold">
            Fast Track
          </span>
          <span className="text-white text-xs sm:text-sm font-bold">
            50+ Jobs/ Week
          </span>
        </div>
      </div>
      <SliderWithLabel
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        formatValue={formatValue}
        className="mt-4"
      />
      {/* <div className="text-center mt-4">
        <span className="text-white text-2xl font-bold">
          {formatValue(value)}
        </span>
      </div> */}
    </div>
  )
}

interface StepTwentyOneProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: (stepPlus?: number) => void
  onPreviousStep: (stepMinus?: number) => void
}

const StepTwentyOne: React.FC<StepTwentyOneProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [jobsPerWeek, setJobsPerWeek] = useState(
    onboardingData.jobsPerWeek || 5
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (onboardingData.jobsPerWeek) {
      setJobsPerWeek(onboardingData.jobsPerWeek)
    }
  }, [onboardingData])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        jobsPerWeek: jobsPerWeek
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 21 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <ProgressBar step={21} />
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full flex justify-center">
          <FormHeading
            whiteText="How Fast do you want to reach"
            yellowText="your goal?"
            className="text-center mb-4"
          />
        </div>
        <div className="text-xs text-white text-center">
          Application pace per week
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-7xl">
          <FormCardLayout>
            <div className="w-full flex flex-col items-center p-6 sm:p-10 gap-6">
              <div className="max-w-3xl w-full flex flex-col items-center gap-2 mt-4">
                <div className="text-2xl text-white font-bold">
                  {jobsPerWeek} Jobs / Week
                </div>
                <div className="bg-purple-600 rounded-full py-1 px-2">
                  Recommended
                </div>
                <JobsPerWeekSlider
                  min={5}
                  max={50}
                  step={5}
                  value={jobsPerWeek}
                  onChange={setJobsPerWeek}
                  formatValue={(v) => `${v.toLocaleString()} Jobs/Week`}
                />
              </div>
              <div className="w-full flex justify-center mt-4">
                <StepNavigation
                  currentStep={21}
                  onNext={handleSubmit}
                  onPrevious={() => onPreviousStep(4)}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </FormCardLayout>
        </div>
      </div>
    </>
  )
}

export default StepTwentyOne
