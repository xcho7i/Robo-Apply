"use client";

import React, { useState, useEffect } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import FormHeading from "../../../components/common/FormHeading";

import StepNavigation from "../../../components/common/StepNavigation";

interface StepElevenProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const EMPLOYMENT_STATUS_OPTIONS = [
  {
    title: "Tell us what you're looking for",
    description:
      "Set your job preferences so we can match you to the best roles.",
  },
  {
    title: "Apply to jobs with one click",
    description:
      "Instantly apply across LinkedIn, Workday, Dice, Greenhouse, and more.",
  },
  {
    title: "Get a tailored resume and score it fast",
    description:
      "Customize your resume to the role and get a RoboApply Score that shows how well it matches.",
  },
  {
    title: "Generate cover letters in one click",
    description:
      "No writing required — we'll craft role-specific letters instantly.",
  },
  {
    title: "Upload or build your resume",
    description: "Bring your own, or create a fresh one in RoboApply.",
  },
  {
    title: "Track your apps & prep for interviews",
    description:
      "Stay organized, follow up smartly, and get interview-ready with our tools.",
  },
];

type OptionType = {
  title: string;
  description: string;
};

const EmploymentStatusOptionButton = ({
  option,
  selected,
  onSelect,
}: {
  option: OptionType;
  selected: boolean;
  onSelect: (title: string) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.title)}
      className={`flex flex-col gap-1 p-4 rounded-md border-2 transition-all duration-200 text-left font-medium
        ${
          selected
            ? "border-brand-purple bg-brand-purple text-white shadow-md"
            : "border-brand-yellow text-white hover:border-brand-yellow/80"
        }
      `}
    >
      <span className="text-sm font-semibold">{option.title}</span>
      <span className="text-xs">{option.description}</span>
    </button>
  );
};

const StepEleven: React.FC<StepElevenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [selected, setSelected] = useState(onboardingData.selectedOption || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingData.selectedOption) {
      setSelected(onboardingData.selectedOption);
    }
  }, [onboardingData]);

  const handleSelect = (optionTitle: string) => {
    setSelected(optionTitle);
    setError("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!selected) {
      setError("Please select an option to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        selectedOption: selected,
      }));
      onNextStep();
    } catch (err) {
      console.error("Step 11 Error:", err);
      setError("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-center py-2 px-5">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-10 object-contain"
        />
      </div>
      {/* <ProgressBar /> */}
    <div>
      <div className="max-w-5xl mx-auto py-5">
      <FormCardLayout>
        <div className="flex flex-col items-center w-full gap-6 py-6 px-3">
            <img
              src="/images/clock-image.svg"
              alt="Application Traction Over Time"
              className="w-16 h-auto"
            />

            <FormHeading whiteText="Thanks For" yellowText="Sharing" />

            <p className="text-white max-w-sm text-center text-sm">
              Before we dive into your job search setup, here’s a quick look at
              how RoboApply helps you win:
            </p>

          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {EMPLOYMENT_STATUS_OPTIONS.map((option, index) => (
                <EmploymentStatusOptionButton
                  key={index}
                  option={option}
                  selected={selected === option.title}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="w-full flex justify-end mt-6">
            <StepNavigation
              currentStep={11}
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

export default StepEleven; 