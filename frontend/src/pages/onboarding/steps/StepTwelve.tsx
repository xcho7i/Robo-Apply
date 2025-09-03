"use client";

import React, { useState, useEffect } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import FormHeading from "../../../components/common/FormHeading";
import StepNavigation from "../../../components/common/StepNavigation";
import { CheckIcon } from "lucide-react";
import ProgressBar from "@/src/components/common/ProgressBar";

interface StepTwelveProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const EXPERIENCE_LEVEL_OPTIONS = [
  "Intern",
  "Entry-level (0–2 years)",
  "Junior Associate (2–3 years)",
  "Mid-level (3–5 years)",
  "Senior-level (5+ years)",
  "Executive (9+ years)",
];

const ExperienceLevelOptionButton = ({
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
    className={`flex items-center w-full h-16 px-4 rounded-xl border-2 transition-all duration-200 text-white text-left font-medium hover:border-brand-yellow/80 focus:outline-none focus:ring-2 focus:ring-brand-yellow/60
      ${
        selected
          ? "border-brand-purple bg-brand-purple text-white shadow-lg"
          : "border-brand-yellow"
      }
    `}
  >
    <div
      className={`flex items-center justify-center h-4 w-4 rounded border border-white mr-2 ${
        selected ? "bg-brand-purple" : "bg-transparent"
      }`}
    >
      {selected && <CheckIcon className="w-4 h-4 text-black" />}
    </div>
    <span className="ml-2">{option}</span>
  </button>
);

const StepTwelve: React.FC<StepTwelveProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [selected, setSelected] = useState<string[]>(onboardingData.selectedExperienceLevels || []);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingData.selectedExperienceLevels) {
      setSelected(onboardingData.selectedExperienceLevels);
    }
  }, [onboardingData]);

  const handleSelect = (option: string) => {
    setSelected((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      }
      return [...prev, option];
    });
    setError("");
  };

  const handleSelectAll = () => {
    if (selected.length === EXPERIENCE_LEVEL_OPTIONS.length) {
      setSelected([]);
    } else {
      setSelected([...EXPERIENCE_LEVEL_OPTIONS]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (selected.length === 0) {
      setError("Please select at least one experience level");
      return;
    }

    setIsSubmitting(true);

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        selectedExperienceLevels: selected,
      }));
      onNextStep();
    } catch (err) {
      console.error("Step 12 Error:", err);
      setError("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllSelected = selected.length === EXPERIENCE_LEVEL_OPTIONS.length;

  return (
    <>
     <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      {/* <ProgressBar /> */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-full flex justify-center">
          <FormHeading
            whiteText="What is Your Target"
            yellowText="Experience Level?"
            className="mb-4"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <FormCardLayout>
            <div className="flex flex-col gap-2 py-5">
              <div className="w-full p-4 sm:p-8 md:px-12 md:py-5 flex flex-col items-center text-center gap-3">
            <button
              onClick={handleSelectAll}
              className={`flex items-center justify-center w-full h-16 px-4 rounded-xl border-2 transition-all duration-200 text-white text-left font-medium hover:border-brand-yellow/80 focus:outline-none focus:ring-2 focus:ring-brand-yellow/60 ${
                isAllSelected
                  ? "border-brand-purple bg-brand-yellow text-black"
                  : "border-brand-yellow"
              }`}
            >
              <span className="ml-2">Any (Select All)</span>
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
              {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <ExperienceLevelOptionButton
                  key={option}
                  option={option}
                  selected={selected.includes(option)}
                  onSelect={handleSelect}
                />
              ))}
            </div>
            
            {error && <div className="text-red-500 mb-2">{error}</div>}
          </div>
          
          <div className="flex w-full justify-center">
            <StepNavigation
              currentStep={12}
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

export default StepTwelve; 