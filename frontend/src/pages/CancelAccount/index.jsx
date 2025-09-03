import React from "react"
import { useNavigate } from "react-router-dom"

import DashBoardLayout from "../../dashboardLayout"
import Help from "../CancelAccount/Help/index"
import Reason from "../CancelAccount/Reason/index"
import Button from "../../components/Button"

const index = () => {
  const navigate = useNavigate()

  return (
    <DashBoardLayout>
      <>
        <div className="text-center text-primary text-2xl border-t border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0 font-semibold py-3">
          Cancel Your Account
        </div>

        <div className="w-full max-w-[40%] border-b-2 border-purple mx-auto mb-6" />

        <p className="text-justify text-primary w-full mx-auto px-4 text-base md:text-lg mb-6">
          <strong>Before you decide to go</strong>, cancelling your account will
          deactivate your login, remove any of your created resume and remove
          any account add-ons at the end of your current billing cycle.
        </p>

        <div className="w-full max-w-[97%] border-b-2 border-white mx-auto mb-6" />

        <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-16 pb-10">
          <div className="w-full lg:w-1/2">
            <Help />
          </div>
          <div className="w-full lg:w-1/2">
            <Reason />
          </div>
        </div>

        <div className="flex  justify-center gap-4 pb-12 whitespace-nowrap">
          <Button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-b from-gradientStart to-gradientEnd text-white font-medium px-6 py-2 rounded-md">
            Don't Cancel
          </Button>
          <Button className="border border-purple hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-md">
            Cancel Account
          </Button>
        </div>
      </>
    </DashBoardLayout>
  )
}

export default index
