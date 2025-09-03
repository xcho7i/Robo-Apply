"use client";

import React, { useState, useEffect } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import FormHeading from "../../../components/common/FormHeading";
import FormPara from "../../../components/common/FormPara";
import StepNavigation from "../../../components/common/StepNavigation";
import ProgressBar from "@/src/components/common/ProgressBar";

interface StepSixteenProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: (stepPlus?: number) => void;
  onPreviousStep: (stepMinus?: number) => void;
}

const goals = [
  { id: "a", label: "Land a job fast" },
  { id: "b", label: "Explore new roles" },
  { id: "c", label: "Level up my Career" },
];

const StepSixteen: React.FC<StepSixteenProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(
    onboardingData.jobSearchGoal || null
  );
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingData.jobSearchGoal) {
      setSelectedGoal(onboardingData.jobSearchGoal);
    }
  }, [onboardingData]);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setError("");
    const selectedGoalData = goals.find((goal) => goal.id === goalId);

    setOnboardingData((prev: any) => ({
      ...prev,
      jobSearchGoal: goalId,
      jobSearchGoalLabel: selectedGoalData?.label || "",
    }));
    onNextStep();
  };

  const handleSubmit = async () => {
    // if (isSubmitting) return;

    if (!selectedGoal) {
      setError("Please select your job search goal to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the selected goal details
      const selectedGoalData = goals.find((goal) => goal.id === selectedGoal);

      setOnboardingData((prev: any) => ({
        ...prev,
        jobSearchGoal: selectedGoal,
        jobSearchGoalLabel: selectedGoalData?.label || "",
      }));
      onNextStep();
    } catch (err) {
      console.error("Step 16 Error:", err);
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
      <ProgressBar step={16} />
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <FormCardLayout>
            <div className="w-full flex flex-col items-center justify-between px-6 py-10">
              <div className="w-full flex flex-col items-center">
                <FormHeading
                  whiteText="What's your job search"
                  yellowText="goal?"
                  className="text-center mb-4"
                />
                <FormPara className="text-center max-w-md mt-2 mb-8">
                  This helps us tailor your experience and recommend the right
                  tools.
                </FormPara>
              </div>
              {/* Goal Options */}
              <div className="w-full mt-8 space-y-4">
                {goals.map((goal: any) => {
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <div
                      key={goal.id}
                      className={`flex items-center justify-start gap-4 px-6 py-4 rounded-md border cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand-yellow bg-brand-yellow text-black shadow-lg"
                          : "border-brand-yellow text-white hover:bg-brand-yellow hover:text-black"
                      }`}
                      onClick={() => handleGoalSelect(goal.id)}
                    >
                      <div
                        className={`text-xs font-bold rounded px-2 py-1 uppercase transition-all
                       ${
                         isSelected
                           ? "border border-black bg-brand-yellow text-black"
                           : "bg-brand-yellow text-black"
                       }`}
                      >
                        {goal.id}
                      </div>
                      <span className="text-base font-medium">
                        {goal.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Error message */}
              {error && (
                <div className="text-red-500 text-sm mt-4 text-center">
                  {error}
                </div>
              )}

              {/* Step navigation */}
              <div className="w-full flex justify-center mt-6">
                <StepNavigation
                  currentStep={16}
                  onNext={handleSubmit}
                  onPrevious={() => onPreviousStep(2)}
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

export default StepSixteen;
