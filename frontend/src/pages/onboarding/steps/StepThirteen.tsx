"use client";

import React, { useState, useEffect } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import FormHeading from "../../../components/common/FormHeading";
import StepNavigation from "../../../components/common/StepNavigation";
import { CheckIcon } from "lucide-react";
import ProgressBar from "@/src/components/common/ProgressBar";

interface StepThirteenProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: (stepPlus?: number) => void;
  onPreviousStep: (stepMinus?: number) => void;
}

const EDUCATION_LEVEL_OPTIONS = [
  "High School / GED",
  "Some college",
  "Certificate or diploma",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctorate",
  "Other",
];

const EducationLevelOptionButton = ({
  option,
  selected,
  onSelect,
}: {
  option: string;
  selected: boolean;
  onSelect: (option: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(option)}
    className={`flex w-full items-center h-16 px-4 rounded-xl border-2 hover:bg-brand-purple transition-all duration-200 text-white text-left font-medium hover:border-brand-purple/80 focus:outline-none focus:ring-2 focus:ring-brand-yellow/60
      ${
        selected
          ? "border-brand-purple bg-brand-purple text-white shadow-lg"
          : "border-brand-yellow"
      }
    `}
  >
    <div
      className={`flex items-center justify-center h-4 w-4 rounded border-2 border-brand-yellow mr-2 ${
        selected ? "bg-brand-purple" : "bg-transparent"
      }`}
    >
      {selected && <CheckIcon className="w-4 h-4 text-white" />}
    </div>
    <span className="ml-2">{option}</span>
  </button>
);

const StepThirteen: React.FC<StepThirteenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [selected, setSelected] = useState(onboardingData.educationLevel || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingData.educationLevel) {
      setSelected(onboardingData.educationLevel);
    }
  }, [onboardingData]);

  const handleSelect = (option: string) => {
    setSelected(option);
    setError("");
    setIsSubmitting(true);

    setOnboardingData((prev: any) => ({
      ...prev,
      educationLevel: option,
    }));
    setTimeout(() => {
      setIsSubmitting(false);
      onNextStep(1);
    }, 300);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!selected) {
      setError("Please select your education level");
      return;
    }

    setIsSubmitting(true);

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        educationLevel: selected,
      }));
      onNextStep();
    } catch (err) {
      console.error("Step 13 Error:", err);
      setError("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <ProgressBar step={13} />
      <div className="flex flex-col items-center justify-center">
        <div className="w-full flex justify-center">
          <FormHeading
            whiteText="What is your Hightest Level of"
            yellowText="Education?"
            className="mb-4"
          />
        </div>
        <div className="max-w-5xl mx-auto w-full">
          <FormCardLayout>
            <div className="flex w-full  flex-col gap-2 py-5">
              <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 md:px-12 md:py-5 flex flex-col items-center text-center gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 w-full mb-4">
                  {EDUCATION_LEVEL_OPTIONS.map((option) => (
                    <EducationLevelOptionButton
                      key={option}
                      option={option}
                      selected={selected === option}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
                {error && <div className="text-red-500 mb-2">{error}</div>}
              </div>
              <div className="flex w-full justify-center">
                <StepNavigation
                  currentStep={13}
                  isLoading={isSubmitting}
                  onNext={handleSubmit}
                  onPrevious={() => onPreviousStep(3)}
                />
              </div>
            </div>
          </FormCardLayout>
        </div>
      </div>
    </>
  );
};

export default StepThirteen;
