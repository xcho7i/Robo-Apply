import React from "react";
import InputField from "../../../../components/EmailInput";
import SelectField from "../../../../components/SelectField";
import contactImg from "../../../../assets/ContactImg.svg";

const options = [
  { value: "account", label: "Account Issues" },
  { value: "support", label: "Support" },
  { value: "billing", label: "Billing" },
];

const ContactForm = () => {
  const handleChange = (value) => {
    console.log("Selected Value:", value);
  };

  return (
    <div className="mx-[10%] mt-20">
      {/* Header */}
      <div className="text-center space-y-5">
        <p className="text-4xl font-semibold">Contact Us</p>
        <p className="text-lg font-normal text-jobSeekersColor">
          Any question or remarks? Just write us a message!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2  bg-[#1D1B33] p-4 rounded-lg mt-10">
        {/* Contact Image Section - 50% width */}
        <div className="flex items-center justify-center p-10 rounded-lg">
          <img
            src={contactImg}
            alt="Contact Us"
            className="max-w-full h-auto"
            loading="lazy"
          />
        </div>

        {/* Form Section - 50% width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-10 mr-10 ">
          <InputField type="text" placeholder="First Name" className="mt-4" />
          <InputField type="text" placeholder="Last Name" className="mt-4" />
          <InputField type="email" placeholder="Email" className="mt-4" />
          <InputField type="text" placeholder="Phone No." className="mt-4" />

          {/* SelectField Full Width */}
          <div className="col-span-2">
            <SelectField
              options={options}
              onChange={handleChange}
              placeholder="Select Subject?"
              className="text-white"
            />
          </div>

          {/* Textarea Full Width */}
          <textarea
            placeholder="Write a message..."
            rows="4"
            className="col-span-2 p-3 border border-gray-600 rounded-lg bg-[#454545] text-white focus:outline-none focus:border-customPurple placeholder:text-white"
          />

          {/* Send Message Button */}
          <div className="col-span-2 flex justify-center pt-5">
            <button className="w-[250px] h-[50px] bg-[#DFA325] text-white py-3 rounded-full font-semibold transition-all duration-300 hover:bg-gradient-to-b hover:from-[#DFA325] hover:to-[#8C20F8]">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
