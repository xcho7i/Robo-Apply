import React, { useState } from "react";
import faqImage from "../../assets/faqImage.svg";

const Arcadian = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="py-10 my-16 "
      onClick={() => setIsOpen(!isOpen)}
      style={{
        backgroundImage: `url(${faqImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center">
        <p className="text-2xl font-semibold text-primary">{question}</p>
      </div>

      {isOpen && (
        <div className="w-full flex justify-center">  <p className=" w-[80%] mt-5 text-faqAnsColor text-lg font-normal text-center ">
        {answer}
      </p></div>
       
      )}
    </div>
  );
};

export default Arcadian;
