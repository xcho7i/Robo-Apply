import React from "react";
import Button from "../../../components/Button";

const WaysWeCanHelp = () => {
  return (
    <div className="max-w-2xl  p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">Ways we can help</h1>

      <p className="text-base mb-6">
        We're here to help! You can manage your cancellation through your
        account settings or contact our support team for assistance. Let us know
        if there's anything we can do to improve your experience.
      </p>

      <div className="mb-6 whitespace-nowrap ">
        <div className="flex flex-col items-center space-y-3">
          <Button className="w-full max-w-[75%] lg:max-w-[85%]  py-3 px-4 border border-purple rounded-lg text-white  text-center">
            RSVP FOR COACHING CALL
          </Button>
          <Button className="w-full max-w-[75%] lg:max-w-[85%]  py-3 px-4 border border-purple  text-white rounded-lg text-center">
            WATCH THE WEBINAR
          </Button>
          <Button className="w-full max-w-[75%] lg:max-w-[85%]  py-3 px-4 border border-purple rounded-lg text-center">
            CONTACT SUPPORT
          </Button>
        </div>
      </div>

      <p className="text-base">
        We're here to help! You can manage your cancellation through your
        account settings or contact our support team for assistance. Let us know
        if there's anything we can do to improve your experience.
      </p>
    </div>
  );
};

export default WaysWeCanHelp;
