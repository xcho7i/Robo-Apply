import React from "react";
import Card from "./Card";

const JobSeekersSucceed = () => {
  const cardData = [
    { number: "170,000+", description: "Job Seekers" },
    { number: "500%", description: "Return On Investment" },
    { number: "100,000+", description: "Jobs Secured" },
    { number: "GPT-4", description: "Powerful AI Models" },
  ];

  return (
    <>
      <div className="mx-[10%] mt-20">
        <div className="text-center space-y-5">
          <p className="text-4xl font-semibold">We help job seekers succeed</p>
          <p className="text-lg font-normal text-jobSeekersColor">
            Our results speak for themselves.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-10">
          {cardData.map((card, index) => (
            <Card
              key={index}
              number={card.number}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default JobSeekersSucceed;
