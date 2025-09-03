"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import FormCardLayout from "../../../components/common/FormCardLayout";
import FormHeading from "../../../components/common/FormHeading";
import StepNavigation from "../../../components/common/StepNavigation";
import { ShieldCheckIcon } from "lucide-react";

interface StepTwoProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const StepTwo: React.FC<StepTwoProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate async validation if needed
    setTimeout(() => {
      setIsSubmitting(false);
      onNextStep(); // move to step 3
    }, 500);
  };

  return (
    <FormCardLayout>
      <div className="px-2 flex flex-col">
        <div className="p-4 sm:p-8 md:p-8  w-full max-w-2xl flex flex-col items-center text-center">
          <div className="text-3xl md:text-4xl xl:text-5xl font-semibold mb-8 flex gap-1">
            <span className="text-5xl w-fit">👋</span>
            <span className="font-light text-white">
              Welcome,{" "}
              <span className="text-yellow-400 font-[520]">
                {onboardingData.firstName || "Idris"}
              </span>
            </span>
          </div>
          <FormHeading
            whiteText="Let’s get to know you better!"
            className="mb-4"
          />

          <div className="flex flex-col items-center mb-4 md:mb-10">
            <div className="mb-2">
              <ShieldCheckIcon
                className="w-32  h-32 text-brand-purple"
                strokeWidth={1}
              />
            </div>
            <div className="text-2xl md:text-3xl text-white">
              Your data is{" "}
              <span className="text-yellow-400 font-semibold">protected</span>{" "}
              with us.
            </div>
          </div>
          <div className="relative w-full overflow-hidden h-6">
            <motion.div
              className="flex absolute whitespace-nowrap text-sm text-gray-300 ml-8"
              animate={{ x: ["0%", "-100%"] }}
              transition={{
                repeat: Infinity,
                duration: 20, // Adjust speed
                ease: "linear",
              }}
            >
              <span className="mr-16">
                We do not share your data with any third‑party vendors and
                comply with GDPR and CCPA using secure, encrypted storage
              </span>
              <span>
                We do not share your data with any third‑party vendors and
                comply with GDPR and CCPA using secure, encrypted storage
              </span>
            </motion.div>
          </div>
        </div>
        <div className="w-full flex justify-between items-start flex-row sm:items-center mb-12">
          <StepNavigation
            currentStep={2}
            onNext={handleSubmit}
            onPrevious={onPreviousStep}
            isLoading={false}
          />
          <button
            className="mt-6 bg-brand-yellow hover:bg-brand-yellow/80 text-black font-semibold py-2 px-3 sm:px-6 rounded-full text-xs sm:text-sm md:text-base transition-colors duration-200"
            onClick={() => handleSubmit()}
          >
            Start Onboarding (&lt; 2 mins)
          </button>
        </div>
      </div>
    </FormCardLayout>
  );
};

export default StepTwo;
