import React from "react";
import Layout from "../../layout";
import PricingSection from "../home/ui/pricingSection";
import Thirty_Day from "../../assets/30days.svg";
import Information from "./ui/Information";

const PricingPage = () => {
  return (
    <Layout>
      <div className="flex justify-center mt-20">
        <div className="flex items-center space-x-4 bg-[#2C283C] px-20 py-4 rounded-lg justify-between w-3/4">
          <div>
            <h3 className="text-xl font-semibold text-white">
              30 DAYS MONEY BACK GURANTEE
            </h3>
            <p className="text-normal text-[#AC5DFA]">
              We guarantee interview. You can have your money back if you go
              without interview in 30 days.
            </p>
          </div>
          <div>
            <img src={Thirty_Day} className="w-24 h-24" loading="lazy"></img>
          </div>
        </div>
      </div>
      <PricingSection />
      <Information />
    </Layout>
  );
};

export default PricingPage;
