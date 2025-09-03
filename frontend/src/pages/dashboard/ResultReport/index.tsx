import buttonIcon from "../../../assets/dashboardIcons/startApplyingBtn.svg"
import Heading from "@/src/components/Heading"
import GradientButton from "@/src/components/GradientButton"

import { Divider, Input, Progress } from "antd"
import { useDashboardStore } from "@/src/stores/dashboard"
import Feedback from "./Feedback"

function ResultReport() {
  const applyResults = useDashboardStore((state) => state.applyResults)
  const startNewSearch = useDashboardStore((state) => state.startNewSearch)
  const loading = useDashboardStore((state) => state.loading)

  const total = applyResults.filter(
    (job) => job.status == "applied" || job.status == "skipped"
  ).length

  const applied = applyResults.filter((job) => job.status == "applied").length
  const skipped = applyResults.filter((job) => job.status == "skipped").length

  const appliedPercentage = Math.round((applied / total) * 100)
  const skippedPercentage = Math.round((skipped / total) * 100)

  return (
    <>
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <Heading type="h1">Application Results</Heading>
        <GradientButton
          style={{ borderRadius: "60px" }}
          icon={<img src={buttonIcon} />}
          onClick={startNewSearch}>
          Start New Search
        </GradientButton>
      </div>

      {/* status and total jobs applied */}
      <div className="flex gap-4 mt-2">
        <div className="flex flex-col gap-2 rounded-md bg-inputBackGround p-2 pl-4 pr-8">
          <span className="text-white text-base font-semibold">Status</span>
          <span className="">{loading ? "Applying" : "Completed"}</span>
        </div>
        <div className="flex flex-col gap-2 rounded-md bg-inputBackGround p-2 pl-4 pr-8">
          <span className="text-white text-base font-semibold">
            Total Jobs Applied
          </span>
          <span>
            {applied}/{total}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row  justify-between gap-5">
        <div className="flex-1 max-w-2xl flex flex-col  items-center  md:flex-row gap-5 lg:justify-between sm:pl-4">
          {/** Result Chart */}
          <Progress
            percent={100}
            strokeWidth={15}
            size={180}
            success={{ percent: appliedPercentage, strokeColor: "#FFC107" }}
            format={(percent) => (
              <div className="text-white text-sm font-semibold flex flex-col items-center ">
                {isFinite(appliedPercentage) ? appliedPercentage : 0}%
                <span>{"Succes Rate"}</span>
              </div>
            )}
            strokeColor={"#ff7f7f"}
            type="circle"
          />

          <div className=" flex flex-col items-start justify-center font-semibold gap-2   p-4">
            <Progress
              strokeColor="#FFC107"
              type="line"
              size={[300, 25]}
              percent={appliedPercentage}
              format={(percent) => (
                <div className="text-white  flex flex-col items-center">
                  <span>Successful ({applied})</span>
                </div>
              )}
            />
            <Progress
              strokeColor="#ff7f7f"
              type="line"
              size={[270, 25]}
              percent={skippedPercentage}
              format={(percent) => (
                <div className="text-white  flex flex-col items-center">
                  <span>Failed ({skipped})</span>
                </div>
              )}
            />
          </div>
        </div>
        <Divider
          size="large"
          type="vertical"
          className="h-full hidden sm:block"
        />
        <Feedback />
      </div>
    </>
  )
}

export default ResultReport
