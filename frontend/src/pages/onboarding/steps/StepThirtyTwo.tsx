"use client";

import React, { useState, useEffect } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import StepNavigation from "../../../components/common/StepNavigation";
import AnimatedCircularProgress from "../../../components/common/AnimatedCircularProgress";

interface StepThirtyTwoProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const StepThirtyTwo: React.FC<StepThirtyTwoProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const points = [
    "Tailored resumes",
    "Cover letters",
    "Saved searches",
    "Auto-applies",
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Calculate how many points to show based on percentage
  const getVisiblePointsCount = (percentage: number) => {
    if (percentage <= 0) return 0;
    if (percentage <= 25) return 1;
    if (percentage <= 50) return 2;
    if (percentage >= 75) return 4; // Show all 4 points at 75%
    if (percentage <= 75) return 3;
    return 0;
  };

  // Start animation after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle progress updates from the circular progress component
  const handleProgressUpdate = (progress: number) => {
    setCurrentProgress(progress);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        // Add any step-specific data here if needed
      }));
      onNextStep();
    } catch (err) {
      console.error("Step 32 Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex w-full justify-start">
        <img src="/images/logo.png" alt="" className="mb-5" />
      </div>
      <div className="w-full">
      <div className="flex flex-col items-center justify-center bg-brand-bgBlue-form max-w-3xl mx-auto p-5 mb-5 rounded-2xl shadow-2xl border border-black">
        <div>
          {/* Progress bar placeholder */}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <FormCardLayout>
          <img
            src="/images/lines.svg"
            alt="lines"
            className="opacity-60 absolute"
          />
          <div className="w-full flex flex-col items-center justify-center p-10 gap-8 z-50">
            <div className="w-full flex items-center justify-center">
              {animationStarted ? (
                <AnimatedCircularProgress
                  percentage={75}
                  duration={2000}
                  onProgressUpdate={handleProgressUpdate}
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center">
                  <div className="text-2xl font-bold text-gray-400">0%</div>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold">
              Generating your{" "}
              <span className="text-brand-yellow">custom plan.....</span>
            </div>

            <div className="flex flex-wrap max-w-xl gap-4 items-center justify-center">
              {points
                .slice(0, getVisiblePointsCount(currentProgress))
                .map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <img src="/images/check.svg" alt="Check" className="h-5" />
                    <span className="text-lg">{point}</span>
                  </div>
                ))}
            </div>

            <div className="w-full flex justify-center mt-4">
              <StepNavigation
                currentStep={32}
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

export default StepThirtyTwo; 