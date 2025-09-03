import React from "react";
import Teams from "../ui/team";
import ExtensionInstall from "../ui/extension";
import WorkProcess from "../ui/workProcess";
import OptimizeResume from "../ui/optimizeResume";
import PricingSection from "../ui/pricingSection";
import Platforms from "../ui/platforms";

const MidSection = () => {
  return (
    <div>
      {/* <Teams /> */}
      {/* <Platforms/> */}
      <ExtensionInstall />
      <WorkProcess />
      <OptimizeResume />
      <div id="pricing-section">
        <PricingSection />
      </div>
      
    </div>
  );
};

export default MidSection;
