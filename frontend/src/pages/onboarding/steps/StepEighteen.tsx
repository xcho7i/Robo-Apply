"use client";

import React, { useState, useEffect } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import StepNavigation from "../../../components/common/StepNavigation";
import FormHeading from "../../../components/common/FormHeading";

interface StepEighteenProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const blockers = [
  "Not getting interviews",
  "No time to apply",
  "Weak or outdated resume",
  "Too many platforms",
  "Interview anxiety",
  "Not sure what roles fit me",
];

const StepEighteen: React.FC<StepEighteenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [selectedBlockers, setSelectedBlockers] = useState<string[]>(
    onboardingData.selectedBlockers || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingData.selectedBlockers) {
      setSelectedBlockers(onboardingData.selectedBlockers);
    }
  }, [onboardingData]);

  const toggleBlocker = (blocker: string) => {
    setSelectedBlockers((prev) =>
      prev.includes(blocker)
        ? prev.filter((b) => b !== blocker)
        : [...prev, blocker]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (selectedBlockers.length === 0) {
      return; // Require at least one selection
    }

    setIsSubmitting(true);

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        selectedBlockers: selectedBlockers,
      }));
      onNextStep();
    } catch (err) {
      console.error("Step 18 Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <FormCardLayout>
            <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-10">
              <div className="w-full flex flex-col items-center mb-6">
                <FormHeading
                  whiteText="What's stopping you from"
                  yellowText="landing a job?"
                  className="text-center mb-4"
                />
                <p className="text-center text-white/80 mb-4 sm:mb-6">
                  Select all that apply.
                </p>
                            </div>

          {/* Blocker Buttons */}
          <div className="w-full space-y-3 sm:space-y-4 max-w-2xl mx-auto">
            {blockers.map((blocker, index) => {
              const isSelected = selectedBlockers.includes(blocker);
              return (
                <button
                  key={index}
                  onClick={() => toggleBlocker(blocker)}
                  className={`w-full border rounded-md px-3 sm:px-4 py-2.5 sm:py-3 text-center text-sm font-medium transition-all ${
                    isSelected
                      ? "text-brand-white border-brand-purple bg-brand-purple"
                      : "text-white border-brand-yellow hover:text-brand-yellow"
                  }`}
                >
                  {blocker}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="w-full flex justify-center mt-6">
            <StepNavigation
              currentStep={18}
              onNext={handleSubmit}
              onPrevious={onPreviousStep}
              isLoading={isSubmitting}
              disabled={selectedBlockers.length === 0}
            />
          </div>
        </div>
      </FormCardLayout>
        </div>
      </div>
    </>
  );
};

export default StepEighteen; 