import React from 'react';
import Layout from '../../layout';

import Header from './ui/Header';
import HowToUse from '../home/HowToUse';

const HowToUsePage = () => {
  return (
    <Layout>
      {/* <div className="flex justify-center mt-20">
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
            <img src={Thirty_Day} className="w-24 h-24"></img>
          </div>
        </div>
       
      </div>
      <PricingSection/>
      <Information/> */}
      <Header/>
      <HowToUse/>
    </Layout>
  );
};

export default HowToUsePage;
