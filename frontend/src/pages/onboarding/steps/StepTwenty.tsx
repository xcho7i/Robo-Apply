"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  PhoneCall,
  FileText,
  ArrowUpRight,
  Smile,
} from "lucide-react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import StepNavigation from "../../../components/common/StepNavigation";
import FormHeading from "../../../components/common/FormHeading";

interface StepTwentyProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const goals = [
  { label: "Land a job ASAP", icon: <Briefcase size={18} /> },
  { label: "Get more interview call backs", icon: <PhoneCall size={18} /> },
  { label: "Improve my resume and applications", icon: <FileText size={18} /> },
  { label: "Stay consistent with applying", icon: <ArrowUpRight size={18} /> },
  { label: "Feel confident in interviews", icon: <Smile size={18} /> },
];

const StepTwenty: React.FC<StepTwentyProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(
    onboardingData.selectedGoal || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingData.selectedGoal) {
      setSelectedGoal(onboardingData.selectedGoal);
    }
  }, [onboardingData]);

  const handleSelect = (goal: string) => {
    setSelectedGoal(goal);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!selectedGoal) {
      return; // Require a selection
    }

    setIsSubmitting(true);

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        selectedGoal: selectedGoal,
      }));
      onNextStep();
    } catch (err) {
      console.error("Step 20 Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
            <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full flex justify-center">
          <FormHeading
            whiteText="What would like to "
            yellowText="accomplish?"
            className="text-center mb-4"
          />
        </div>
        <p className="text-center text-white/80">
          Choose the one that fits best.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <FormCardLayout>
            <div className="w-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-10">

          {/* Goal Buttons */}
          <div className="w-full space-y-3 sm:space-y-4 max-w-2xl mx-auto">
            {goals.map((goal, index) => {
              const isSelected = selectedGoal === goal.label;
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(goal.label)}
                  className={`w-full border rounded-md px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 text-sm font-medium transition-all ${
                    isSelected
                      ? "text-white border-brand-purple bg-brand-purple"
                      : "text-white border-brand-yellow hover:text-brand-yellow"
                  }`}
                >
                  {goal.icon}
                  {goal.label}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="w-full flex justify-center mt-6">
            <StepNavigation
              currentStep={20}
              onNext={handleSubmit}
              onPrevious={onPreviousStep}
              isLoading={isSubmitting}
              disabled={!selectedGoal}
            />
          </div>
        </div>
      </FormCardLayout>
        </div>
      </div>
    </>
  );
};

export default StepTwenty; 