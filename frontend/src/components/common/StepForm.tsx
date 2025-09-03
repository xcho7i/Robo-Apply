import { motion, AnimatePresence } from "motion/react";
import { useRef, useEffect } from "react";
// import { makeSelectStepFormData } from "@/redux/selectors/onboardingSelectors";
import StepOne from "@/components/OnBording/forms/StepOne";
import StepTwo from "@/components/OnBording/forms/StepTwo";
import StepThree from "@/components/OnBording/forms/StepThree";
import StepFour from "@/components/OnBording/forms/StepFour";
import StepFive from "@/components/OnBording/forms/StepFive";
import StepSix from "@/components/OnBording/forms/StepSix";
import StepSeven from "@/components/OnBording/forms/StepSeven";
import StepEight from "@/components/OnBording/forms/StepEight";
import StepNine from "@/components/OnBording/forms/StepNine";
import StepTen from "@/components/OnBording/forms/StepTen";
import StepEleven from "@/components/OnBording/forms/StepEleven";
import StepTwelve from "@/components/OnBording/forms/StepTwelve";
import StepThirteen from "@/components/OnBording/forms/StepThirteen";
import StepFourteen from "@/components/OnBording/forms/StepFourteen";
import StepFifteen from "@/components/OnBording/forms/StepFifteen";
import StepSixteen from "@/components/OnBording/forms/StepSixteen";
import StepSeventeen from "@/components/OnBording/forms/StepSeventeen-a";
// import StepEightteen from "@/components/OnBording/forms/StepSeventeen-b";
import StepEightteen from "@/components/OnBording/forms/StepEightTeen";
import StepNineteen from "@/components/OnBording/forms/StepNineteen";
import StepTwenty from "@/components/OnBording/forms/StepTwenty";
import StepTwentyOne from "@/components/OnBording/forms/StepTwentyOne";
import StepTwentyTwo from "@/components/OnBording/forms/StepTwentyTwo";
import StepTwentyThree from "@/components/OnBording/forms/StepTwentyThree";
import StepTwentyFour from "@/components/OnBording/forms/StepTwentyFour";
import StepTwentyFive from "@/components/OnBording/forms/StepTwentyFive";
import StepTwentySix from "@/components/OnBording/forms/StepTwentySix";
import StepTwentySeven from "@/components/OnBording/forms/StepTwentySeven";
import StepTwentyEight from "@/components/OnBording/forms/StepTwentyEight";
import StepTwentyNine from "@/components/OnBording/forms/StepTwentyNine";
import StepThirty from "@/components/OnBording/forms/StepThirty";
import StepThirtyOne from "@/components/OnBording/forms/StepThirtyOne";
import StepThirtyTwo from "@/components/OnBording/forms/StepThirtyTwo";
import StepThirtyThree from "@/components/OnBording/forms/StepThirtyThree";
import StepThirtyFour from "@/components/OnBording/forms/StepThirtyFour";
import StepThirtyFive from "@/components/OnBording/forms/StepThirtyfive";
import StepThirtySix from "@/components/OnBording/forms/StepThirtySix";
import StepThirtySeven from "@/components/OnBording/forms/StepThirtySeven";
import StepThirtyEight from "@/components/OnBording/forms/StepThirtyEight";
import StepThirtyNine from "@/components/OnBording/forms/StepThirtyNine";
// ... other steps

export default function StepForm({ step }: { step: number }) {
  const prevStepRef = useRef(step);
  useEffect(() => {
    prevStepRef.current = step;
  }, [step]);

  // Animation variants for slide effect - always enter from left, exit to right
  const slideVariants = {
    enter: {
      x: "-100%",
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: "100%",
      opacity: 0,
    },
  };

  

  // Render the step component
  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepOne />;
      case 2:
        return <StepTwo />;
      case 3:
        return <StepThree />;
      case 4:
        return <StepFour />;
      case 5:
        return <StepFive />;
      case 6:
        return <StepSix />;
      case 7:
        return <StepSeven />;
      case 8:
        return <StepEight />;
      case 9:
        return <StepNine />;
      case 10:
        return <StepTen />;
      case 11:
        return <StepEleven />;
      case 12:
        return <StepTwelve />;
      case 13:
        return <StepThirteen />;
      case 14:
        return <StepFourteen />;
      case 15:
        return <StepFifteen />;
      case 16:
        return <StepSixteen />;
      case 17:
        return <StepSeventeen />;
      case 18:
        return <StepEightteen />;
      case 19:
        return <StepNineteen />;
      case 20:
        return <StepTwenty />;
      case 21:
        return <StepTwentyOne />;
      case 22:
        return <StepTwentyTwo />;
      case 23:
        return <StepTwentyThree />;
      case 24:
        return <StepTwentyFour />;
      case 25:
        return <StepTwentyFive />;
      case 26:
        return <StepTwentySix />;
      case 27:
        return <StepTwentySeven />;
      case 28:
        return <StepTwentyEight />;
      case 29:
        return <StepTwentyNine />;
      case 30:
        return <StepThirty />;
      case 31:
        return <StepThirtyOne />;
      case 32:
        return <StepThirtyTwo />;
      case 33:
        return <StepThirtyThree />;
      case 34:
        return <StepThirtyFour />;
      case 35:
        return <StepThirtyFive />;
      case 36:
        return <StepThirtySix />;
      case 37:
        return <StepThirtySeven />;
      case 38:
        return <StepThirtyEight />;
      case 39:
        return <StepThirtyNine />;
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1], // Custom easing for smoother animation
          }}
          className="w-full"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
