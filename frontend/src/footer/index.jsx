import React from "react";
import logo from "../assets/logo.svg";
import mediumLogo from "../assets/socialMedia/Medium.svg";
import stackOverFlowLogo from "../assets/socialMedia/StackOverflow.svg";
import discordLogo from "../assets/socialMedia/Discord.svg";
import redditLogo from "../assets/socialMedia/Reddit.svg";
import slackLogo from "../assets/socialMedia/Slack.svg";
import githubLogo from "../assets/socialMedia/GitHub.svg";

const LINKS = [
  {
    title: "HOME",
    items: [
      "About Us",
      "Jobs",
      "Get Started",
      "Features",
      "How To Use",
      "Customer Stories",
    ],
  },
  {
    title: "PLATFORMS",
    items: [
      "AI RoboApply",
      "AI Resume Optimization",
      "AI Resume Builder",
      "AI Resume Power Edit",
      "AI Interview Guide",
      "AI Resume Manager",
      // 'AI Cover Letter',
      // 'Analytics',
    ],
  },
  {
    title: " ",
    items: [
      // 'AI RoboApply',
      // 'AI Resume Optimization',
      // 'AI Resume Builder',
      // 'AI Resume Power Edit',
      // 'AI Interview Guide',
      // 'AI Resume Manager',
      "AI Cover Letter",
      "Analytics",
    ],
  },
  {
    title: "SUPPORT",
    items: ["Contact Us", "Privacy", "Terms", "Refund Policy", "FAQ"],
  },
];

function splitIntoColumns(items, maxItemsPerColumn) {
  const columns = [];
  for (let i = 0; i < items.length; i += maxItemsPerColumn) {
    columns.push(items.slice(i, i + maxItemsPerColumn));
  }
  return columns;
}

function Footer() {
  return (
    <div className="px-[10%] mt-20 max-w-[1800px] mx-auto">
      <div className="flex flex-wrap gap-8">
        {/* Logo Section */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          <img
            src={logo}
            alt="Logo"
            className="w-[16rem] h-auto"
            loading="lazy"
          />
          <p className="text-gray-400 font-light">
            Experience the Next Generation Of AI Powered Jobs
          </p>
        </div>

        {LINKS.map(({ title, items }) => {
          const maxItemsPerColumn = 6; // Maximum number of items per column
          const columns = splitIntoColumns(items, maxItemsPerColumn);

          return (
            <div key={title} className="flex-1">
              {/* Conditionally render title: if empty, render a placeholder */}
              <h5
                className={`text-white font-bold text-lg mb-4 ${
                  !title.trim() ? "h-[20px]" : ""
                }`}
              >
                {title.trim() || " "} {/* Placeholder for empty title */}
              </h5>
              <div className="flex flex-wrap gap-8">
                {columns.map((column, colIndex) => (
                  <ul key={colIndex} className="flex flex-col gap-2">
                    {column.map((item, index) => (
                      <li key={index}>
                        <a
                          href="#"
                          className="text-gray-400 hover:text-white transition-all duration-300"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div
        className="mt-12 py-6 flex flex-col md:flex-row justify-between items-center"
        style={{
          borderTop: "2px solid",
          borderImageSource:
            "radial-gradient(48.6% 799.61% at 50% 50%, #4776E6 0%, rgba(142, 84, 233, 0) 100%)",
          borderImageSlice: 1,
        }}
      >
        {/* Copyright Text */}
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} AI JOBS. All rights reserved.
        </p>

        {/* Social Media Icons */}
        <div className="flex gap-4 mt-4 md:mt-0">
          {[
            mediumLogo,
            stackOverFlowLogo,
            discordLogo,
            redditLogo,
            slackLogo,
            githubLogo,
          ].map((icon, index) => (
            <a
              key={index}
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gradient-to-r from-[#AF63FB] to-[#8C20F8] transition-all duration-300"
            >
              <img
                src={icon}
                alt={`Icon ${index}`}
                className="w-6 h-6"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Footer;
