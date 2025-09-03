import React from "react"
import PricingSection from "./../home/ui/pricingSection/index"
import DashboardNavbar from "./../../dashboardNavbar/index"

const pricingPlan = () => {
  return (
    <>
      <DashboardNavbar />
      <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-0 border border-r-0 border-b-0">
        <PricingSection />
      </div>
    </>
  )
}

export default pricingPlan
