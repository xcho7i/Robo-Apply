// Faqs.js
import React from "react";
import Arcadian from "../faqArcadian/index";

const Faqs = ({ header }) => {
  // Data for questions and answers
  const faqsData = [
    {
      question: "What exactly is AI in job searching?",
      answer:
        "AI in job searching refers to the use of artificial intelligence technologies to streamline and enhance the process of finding and applying for jobs. AI tools can analyze your resume, match your skills with job postings, personalize job recommendations, and even optimize your application.",
    },
    {
      question: "How do I create an account?",
      answer:
        "To create an account, click on the 'Sign Up' button on the homepage, and fill in your details. You will receive a confirmation email shortly after.",
    },
    {
      question: "Can I use this product on mobile devices?",
      answer:
        "Yes, our product is fully responsive and works well on both mobile and desktop devices.",
    },
    {
      question: "Is customer support available 24/7?",
      answer:
        "Yes, we offer 24/7 customer support via live chat and email to assist with any issues or questions you may have.",
    },
  ];

  return (
    <>
      <div className="mx-[10%] mt-28 px-20">
        {header && (
          <div className="text-center">
            <p className="text-4xl font-semibold">
              Frequently Asked Questions With{" "}
              <span className="text-[#A047F9]">Robo</span>
              <span className="text-[#DFA325]">Apply</span>{" "}
            </p>
          </div>
        )}

        <div className="mt-20">
          {faqsData.map((faq, index) => (
            <Arcadian key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Faqs;
