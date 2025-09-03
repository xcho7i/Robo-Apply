import React from "react";

const Card = ({ number, description }) => {
  return (
    <div
      className="w-full p-12 mx-auto rounded-xl text-center bg-cardBgColor"
      style={{
        backgroundColor: "rgba(27, 21, 37, 1)",
        border: "1px solid transparent",
        borderImage:
          "radial-gradient(circle at 50% 50%, #4776E6 0%, rgba(142, 84, 233, 0) 100%)",
        borderImageSlice: 1,
        boxShadow: "12px 12px 25px 0px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="space-y-2 items-center justify-center text-center">
        <p
          className="text-3xl font-semibold text-primary mx-auto"
          style={{
            background:
              "linear-gradient(90deg, #DEA224 27.75%, #8E54E9 76.33%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
          }}
        >
          {number}
        </p>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Card;
