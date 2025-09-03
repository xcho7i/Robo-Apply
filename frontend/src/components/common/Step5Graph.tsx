"use client";

import { motion } from "framer-motion";

const pathVariants: any = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
};

export default function ApplicationTractionChart() {
  return (
    <div className="max-w-lg p-6 rounded-2xl bg-white shadow-xl border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Your application traction over time
      </h2>

      <div className="relative h-56 w-full">
        <svg
          viewBox="0 0 350 200"
          fill="none"
          strokeWidth="3"
          className="w-full h-full"
        >
          {/* Y-axis */}
          <line
            x1="20"
            y1="10"
            x2="20"
            y2="180"
            stroke="#000"
            strokeWidth="2"
          />
          {/* Y-axis labels */}

          {/* Solid black baseline from Month 1 to Month 6 */}
          <line
            x1="20" // extend 20 units to the left
            y1="180"
            x2="350" // extend 20 units to the right
            y2="180"
            stroke="#000"
            strokeWidth="2"
          />

          {/* Manual Applicants */}
          <motion.path
            d="M0,20 C80,30 150,180 350,180"
            stroke="#223344"
            fill="none"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />

          {/* RoboApply */}
          <motion.path
            d="M0,170 C80,180 150,45 350,5"
            stroke="#FF5E4D"
            fill="none"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
        </svg>

        {/* Labels */}
        <div className="absolute left-2 -bottom-2 text-black text-xl">
          Month 1
        </div>
        <div className="absolute right-2 -bottom-2 text-black text-xl">
          Month 6
        </div>
        <div className="absolute right-10 sm:right-14 top-8 sm:-top-3 md:top-0 lg:-top-3 sm:text-lg text-xs text-gray-800 font-medium">
          RoboApply
        </div>
        <div className="absolute right-0 sm:right-2 bottom-16 sm:bottom-12 text-xs sm:text-lg text-gray-800 font-medium">
          Manual
          <br />
          applicants
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-700">
        85% of <span className="font-semibold">RoboApply</span> users report
        more consistent interview invites after 30 days
      </p>
    </div>
  );
}
