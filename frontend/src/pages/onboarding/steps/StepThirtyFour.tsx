"use client";

import React, { useState } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import StepNavigation from "../../../components/common/StepNavigation";
import FormHeading from "../../../components/common/FormHeading";
import FormPara from "../../../components/common/FormPara";

interface StepThirtyFourProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const StepThirtyFour: React.FC<StepThirtyFourProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.error("Step 34 Error:", err);
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
      <div className="max-w-3xl mx-auto">
        <FormCardLayout>
          <img
            src="/images/lines.svg"
            alt="lines"
            className="opacity-60 absolute"
          />
          <div className="py-5 flex flex-col items-center justify-center max-w-2xl">
            <div className="w-fit mx-auto flex flex-col gap-8 z-50 rounded-2xl p-5">
              <div className="text-2xl text-center font-bold">
                Text for
                <span className="text-brand-yellow"> RoboApply's</span> Version
              </div>
              <div className="w-full flex flex-col gap-8 items-center justify-center p-10 z-50">
                <div>
                  <img src="/images/rocket.svg" alt="Logo" className="h-40" />
                </div>
                <div className="text-3xl text-center font-bold">
                  You're almost there. Let's supercharge your
                  <span className="text-brand-yellow">job hunt. </span>
                </div>
                <FormPara className="text-center">
                  Based on your answers, we'll recommend powerful tools to help
                  you apply faster, stand out more, and an land interviews. Just
                  a few more questions to go.
                </FormPara>
              </div>
            </div>
          </div>
        </FormCardLayout>

        <div className="w-full flex justify-center mt-4">
          <StepNavigation
            currentStep={34}
            onNext={handleSubmit}
            onPrevious={onPreviousStep}
            isLoading={isSubmitting}
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default StepThirtyFour; 