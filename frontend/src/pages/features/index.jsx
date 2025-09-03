import React from "react";
import Layout from "../../layout";
import TopBanner from "./ui/TopBanner";
// import MediaCard from './ui/MediaCard';
import FeaturesCard from "./ui/FeaturesCard";
// import BuilderMediaCard from './ui/Builder';
import firstFeture from "../../assets/first feature.png";
import secondFeture from "../../assets/feature second.png";
import thirdFeture from "../../assets/feature third.png";
import fourthFeture from "../../assets/feature fourth.png";
import fifthFeture from "../../assets/feature fifth.png";
import sixthFeture from "../../assets/feature sixth.png";
const FeaturesPage = () => {
  return (
    <Layout>
      <div>
        <TopBanner />
        <div className="flex flex-col justify-center  items-center  w-full gap-[10rem]">
          {" "}
          <div className="flex gap-20">
            {/* <MediaCard /> */}
            <img src={firstFeture} loading="lazy"></img>
            <FeaturesCard
              title="AI-Robo Apply"
              subtitle="Best Features"
              description="Create an optimized resume in minutes with our AI-driven tool that understands industry standards and tailors your resume to stand out."
              features={[
                "Tailored to Job Descriptions",
                "Keywords Auto-Suggestion",
                "Professional Templates",
                "Real-time Feedback",
              ]}
              buttonText="Get Started"
              onButtonClick={() => alert("Button clicked!")}
            />
          </div>
          <div className="flex gap-20">
            <FeaturesCard
              title="AI-Powered Resume Builder"
              subtitle="Best Features"
              description="Craft personalized cover letters effortlessly. Our AI analyzes job descriptions and creates cover letters that resonate with employers."
              features={[
                "Auto-Generated Role",
                "Personalized to Company Culture",
                "Editable Templates",
                "Highlight Relevant Skills",
              ]}
              buttonText="Create Now"
              onButtonClick={() => alert("Create Now button clicked!")}
            />
            {/* <BuilderMediaCard /> */}
            <img src={secondFeture} loading="lazy"></img>
          </div>
          <div className="flex gap-20">
            {/* <MediaCard /> */}
            <img src={thirdFeture} loading="lazy"></img>
            <FeaturesCard
              title="AI-Cover Letter Generator"
              subtitle="New Features"
              description="Identify your strengths and match them with the best job opportunities. Our AI evaluates your skills and recommends jobs that fit your profile."
              features={[
                "Analyze Your Experience",
                "Match Jobs to Skills",
                "Suggest Skill",
                "Certification",
              ]}
              buttonText="Start Generating"
              onButtonClick={() => alert("Start Generating button clicked!")}
            />
          </div>
          <div className="flex gap-20">
            <FeaturesCard
              title="AI-Interview Guide"
              subtitle="New Features"
              description="Identify your strengths and match them with the best job opportunities. Our AI evaluates your skills and recommends jobs that fit your profile."
              features={[
                "Analyze Your Experience",
                "Match Jobs to Skills",
                "Suggest Skill",
                "Certification",
              ]}
              buttonText="Start"
              onButtonClick={() => alert("Start button clicked!")}
            />

            {/* <BuilderMediaCard /> */}
            <img src={fourthFeture} loading="lazy"></img>
          </div>
          <div className="flex gap-20">
            {/* <MediaCard /> */}
            <img src={fifthFeture} loading="lazy"></img>
            <FeaturesCard
              title="AI-Resume Optimization"
              subtitle="Best Features"
              description="Get job recommendations tailored to your profile. Our AI searches the best opportunities based on your skills, location, and preferences."
              features={[
                "Smart Job Matching",
                "Apply Directly",
                "Track Application",
                "AI Assistant",
              ]}
              buttonText="Start"
              onButtonClick={() => alert("Start button clicked!")}
            />
          </div>
          <div className="flex justify-between w-[1200px]">
            <FeaturesCard
              title="Analytics"
              subtitle="New Features"
              description="Identify your strengths and match them with the best job opportunities. Our AI evaluates your skills and recommends jobs that fit your profile."
              features={[
                "Analyze Your Experience",
                "Match Jobs to Skills",
                "Suggest Skill",
                "Certification",
              ]}
              buttonText="Start"
              onButtonClick={() => alert("Start button clicked!")}
            />

            {/* <BuilderMediaCard /> */}
            <img src={sixthFeture} loading="lazy"></img>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeaturesPage;
