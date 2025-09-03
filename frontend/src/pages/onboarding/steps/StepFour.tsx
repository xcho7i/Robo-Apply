"use client";

import React, { useEffect, useState } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import FormHeading from "../../../components/common/FormHeading";
import FormPara from "../../../components/common/FormPara";
import StepNavigation from "../../../components/common/StepNavigation";
import { CheckIcon } from "lucide-react";

interface StepFourProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const CHALLENGES = [
  "Want help auto-applying to jobs",
  "Need tailored resume",
  "Managing resume versions",
  "Writing cover letters",
  "Not getting interviews",
  "Can't track applications",
  "Need interview prep",
  "Not sure what's working",
  "Missing job skills",
  "Ghosted by recruiters",
  "Career change help",
  "Other",
];

const ChallengeOptionButton = ({
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
          ? "border-brand-purple bg-brand-purple text-black shadow-lg"
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

const StepFour: React.FC<StepFourProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [selected, setSelected] = useState<string[]>(onboardingData.challenges || []);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelected(onboardingData.challenges || []);
  }, [onboardingData.challenges]);

  const handleSelect = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    setSelected(newSelected);
    setError("");

    setOnboardingData((prev: any) => ({
      ...prev,
      challenges: newSelected,
    }));
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError("Please select at least one challenge.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onNextStep();
    }, 300);
  };

  return (
    <div className="mb-10">
      <FormHeading
        whiteText="What challenges are you facing in your "
        yellowText="Job search?"
        className="mb-4"
      />
      <FormPara className="mb-4 text-lg">Select at least one option</FormPara>

      <FormCardLayout>
        <div className="w-full max-w-3xl p-4 sm:p-8 md:p-12 flex flex-col items-center text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 w-full mb-4">
            {CHALLENGES.map((option) => (
              <ChallengeOptionButton
                key={option}
                option={option}
                selected={selected.includes(option)}
                onSelect={handleSelect}
              />
            ))}
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
        </div>
      </FormCardLayout>

      <div className="flex w-full justify-end">
        <StepNavigation
          currentStep={4}
          onNext={handleSubmit}
          onPrevious={onPreviousStep}
          isLoading={isSubmitting}
          disabled={false}
        />
      </div>
    </div>
  );
};

export default StepFour;
