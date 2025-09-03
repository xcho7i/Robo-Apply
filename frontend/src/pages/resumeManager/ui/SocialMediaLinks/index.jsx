// src/components/SocialMediaLinks.js
import React from "react";
import githubPic from "../../../../assets/resumeManagerIcons/github-icon.svg";
import linkedinPic from "../../../../assets/resumeManagerIcons/linkedin-icon.svg";
import dribblePic from "../../../../assets/resumeManagerIcons/dribble-icon.png.svg";
import PortfolioPic from "../../../../assets/resumeManagerIcons/portfolio-icon.svg";
import SimpleInputField from "../../../../components/SimpleInputFields";

const SocialMediaLinks = ({
  githubUrl,
  setGithubUrl,
  linkedinUrl,
  setLinkedinUrl,
  dribbleUrl,
  setDribbleUrl,
  portfolioUrl,
  setPortfolioUrl,
  otherUrl,
  setOtherUrl,
}) => {
  return (
    <div>
      <div className="items-center justify-start w-full flex py-7">
        <p className="text-xl font-normal border-b-2 border-purple pb-1">
          Social Media Links
        </p>
      </div>
      <div className="space-y-2 w-[100%] md:w-[80%]">
        <div className="flex gap-8 ">
          <img
            src={githubPic}
            alt="GitHub Icon"
            className="w-10 md:w-14"
            loading="lazy"
          />
          <SimpleInputField
            placeholder="Github Url ( Optional )"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </div>
        <div className="flex gap-8">
          <img
            src={linkedinPic}
            alt="LinkedIn Icon"
            className="w-10 md:w-14"
            loading="lazy"
          />
          <SimpleInputField
            placeholder="Linkedin Url ( Optional )"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>
        <div className="flex gap-8">
          <img
            src={dribblePic}
            alt="Dribbble Icon"
            className="w-10 md:w-14"
            loading="lazy"
          />
          <SimpleInputField
            placeholder="Dribble Url ( Optional )"
            value={dribbleUrl}
            onChange={(e) => setDribbleUrl(e.target.value)}
          />
        </div>
        <div className="flex gap-8">
          <img
            src={PortfolioPic}
            alt="Portfolio Icon"
            className="w-10 md:w-14"
            loading="lazy"
          />
          <SimpleInputField
            placeholder="Portfolio Url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
        </div>
        <div className="flex ml-[70px] md:ml-[80px]">
          <SimpleInputField
            placeholder="Other Url ( Optional )"
            value={otherUrl}
            onChange={(e) => setOtherUrl(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SocialMediaLinks;
