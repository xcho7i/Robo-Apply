import React from "react";
import Layout from "../../layout";
import HomeHeader from "./headerSection/homeHeader";
import MidSection from "./midSection";
import FeedBackSection from "./ui/feedBackSection";
import Faqs from "../../components/faq";
import JobSeekersSucceed from "./ui/jobSeekersSucceed";
import ContactForm from "./ui/contactUs";
import HomeHeader2 from "./headerSection/homeHeader2";
import ResumeTemplates from "./resumeTemplates";
import HowToUse from "./HowToUse";
import WhatWeDo from "./WhatWeDo";
import PricingSection from "./ui/pricingSection";

const HomePage = () => {
  return (
    // <>
    //   <Layout>
    //     <div className="max-w-[1800px] mx-auto">
    //       <HomeHeader />
    //       <MidSection />
    //     </div>
    //     <FeedBackSection />
    //     <JobSeekersSucceed />
    //     {/* Contact US */}
    //     <ContactForm/>
    //     <Faqs />
    //   </Layout>
    // </>

    <>
      <Layout>
        <div>
          <HomeHeader2 />
          <ResumeTemplates />
          <HowToUse />
          <WhatWeDo />
          <PricingSection />
          <FeedBackSection />
          <JobSeekersSucceed />
          <ContactForm />
          <Faqs header={true} />
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
