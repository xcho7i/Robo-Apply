"use client";

import React, { useEffect, useState } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import FormHeading from "../../../components/common/FormHeading";
import StepNavigation from "../../../components/common/StepNavigation";

interface StepSevenProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const EMPLOYMENT_STATUS_OPTIONS = [
  "I’m unemployed and need a job now",
  "I’m unemployed but not in a rush",
  "I have a job but need to leave it",
  "I’m working but open to something better",
];

const EmploymentStatusOptionButton = ({
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
    className={`flex items-center w-full h-20 px-4 rounded-md border-2 transition-all duration-200 text-white text-left font-medium hover:border-brand-yellow/80 focus:outline-none focus:ring-2 focus:ring-brand-yellow/60
      ${
        selected
          ? "border-brand-purple bg-brand-purple text-black shadow-lg"
          : "border-brand-yellow"
      }
    `}
  >
    <span className="ml-2">{option}</span>
  </button>
);

const StepSeven: React.FC<StepSevenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [selected, setSelected] = useState<string>(onboardingData.employmentStatus || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelected(onboardingData.employmentStatus || "");
  }, [onboardingData.employmentStatus]);

  const handleSelect = (option: string) => {
    setSelected(option);
    setError("");

    setOnboardingData((prev: any) => ({
      ...prev,
      employmentStatus: option,
    }));
  };

  const handleSubmit = async () => {
    if (!selected) {
      setError("Please select your current employment status.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onNextStep();
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full px-2">
      <FormHeading
        whiteText="Describe your current "
        yellowText="employment status"
        className="mb-10"
      />

      <FormCardLayout>
        <div className="w-full max-w-2xl p-4 sm:p-8 md:p-8 py-12 flex flex-col h-full justify-between text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-12 mt-12 w-full mb-4">
            {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
              <EmploymentStatusOptionButton
                key={option}
                option={option}
                selected={selected === option}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {error && <div className="text-red-500 mb-2">{error}</div>}

          <div className="flex w-full justify-end mt-8">
            <StepNavigation
              currentStep={7}
              onNext={handleSubmit}
              onPrevious={onPreviousStep}
              isLoading={isSubmitting}
              disabled={false}
            />
          </div>
        </div>
      </FormCardLayout>
    </div>
  );
};

export default StepSeven;
