"use client";

import React, { useState, useEffect } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import FormHeading from "../../../components/common/FormHeading";
import StepNavigation from "../../../components/common/StepNavigation";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { TooltipProvider } from "../../../components/ui/tooltip";
import ProgressBar from "@/src/components/common/ProgressBar";

interface StepFourteenProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: (stepPlus?: number) => void;
  onPreviousStep: () => void;
}

// Custom Slider Component with Tooltip
const Slider = ({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  formatValue = (v: number) => `${v.toLocaleString()}`,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  formatValue?: (value: number) => string;
}) => {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max],
    [value, defaultValue, min, max]
  );

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
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
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
          className="border-primary bg-background ring-ring/50 block size-6 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        >
          <TooltipProvider>
            <Tooltip open>
              <TooltipTrigger asChild>
                <div className="w-full h-full" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                sideOffset={12}
                className="text-sm font-semibold bg-[#A259FF] text-white px-4 py-3 rounded-sm shadow-lg"
              >
                {formatValue(_values[index])}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );
};

type SliderWithLabelProps = {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  minLabel?: React.ReactNode;
  maxLabel?: React.ReactNode;
  midLabel?: React.ReactNode;
  formatValue?: (value: number) => string;
  className?: string;
};

const SliderWithLabel = ({
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
  className,
}: SliderWithLabelProps) => {
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  return (
    <div className={cn("w-full flex flex-col items-center", className)}>
      {/* Current value display */}
      <div className="text-center mb-6">
        <span className="text-white text-3xl font-bold">
          {formatValue(value)}
        </span>
      </div>

      <div className="relative w-full flex items-center" style={{ height: 60 }}>
        <div className="w-full px-2 mt-8">
          <Slider
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={([v]) => {
              setInternalValue(v);
              onChange?.(v);
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
  );
};

const StepFourteen: React.FC<StepFourteenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [yearsOfExperience, setYearsOfExperience] = useState(
    onboardingData.yearsOfExperience || 5
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingData.yearsOfExperience !== undefined) {
      setYearsOfExperience(onboardingData.yearsOfExperience);
    }
  }, [onboardingData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        yearsOfExperience: yearsOfExperience,
      }));
      onNextStep(2);
    } catch (err) {
      console.error("Step 14 Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <ProgressBar step={14} />
      <div className="flex flex-col items-center justify-center">
        <div className="w-full flex justify-center">
          <FormHeading
            whiteText="How many years of experience do you have in your "
            yellowText="desired role?"
            className="mb-10"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <FormCardLayout>
            <div className="w-full flex flex-col items-center p-6 sm:p-10 gap-6">
              <div className="w-full flex flex-col items-center gap-2 mt-4">
                <SliderWithLabel
                  min={0}
                  max={50}
                  step={1}
                  value={yearsOfExperience}
                  onChange={setYearsOfExperience}
                  formatValue={(v) => `${v} Years`}
                  minLabel="0 Years"
                  maxLabel="50 Years"
                  className="w-full max-w-ld"
                />
              </div>
              <div className="w-full flex justify-end mt-4">
                <StepNavigation
                  currentStep={14}
                  onNext={handleSubmit}
                  onPrevious={onPreviousStep}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </FormCardLayout>
        </div>
      </div>
    </>
  );
};

export default StepFourteen;
