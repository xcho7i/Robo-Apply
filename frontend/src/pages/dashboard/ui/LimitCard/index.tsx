import { Progress } from "antd"
import clsx from "clsx"

const LimitCard = ({
  jobLimit,
  jobsLeft,
  progressValue,
  title,
  jobsLeftLabel,
  label,
  className
}) => {
  return (
    <>
      <div
        className={`bg-inputBackGround  h-full py-3 px-5 rounded-lg ${className}`}>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between  items-center ">
            <p className="text-white text-base md:text-lg  whitespace-nowrap font-semibold">
              {title}
            </p>
            <p
              className={clsx(
                "  text-sm md:text-sm font-semibold  text-center rounded-full text-nowrap",
                title.includes("Daily")
                  ? "bg-yellow py-1 px-1.5 text-gray-900"
                  : title.includes("Plan")
                  ? "bg-greenColor py-1 px-2 text-white"
                  : "bg-purpleBackground p-1.5 py-1 text-gray-900"
              )}>
              {jobLimit}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between w-full pb-2 items-center">
              <p className="text-white text-xs lg:text-sm font-normal">
                {label}
              </p>
              <p className="px-1.5 text-sm font-semibold text-white">
                {progressValue}%
              </p>
            </div>
            <Progress
              size={{ height: 10 }}
              showInfo={false}
              strokeLinecap="round"
              trailColor="#fff5ff"
              strokeColor={"linear-gradient(180deg, #AF63FB 0%, #8C20F8 100%)"}
              aria-label="progress"
              percent={progressValue}
            />
          </div>

          <div className="flex gap-2 text-sm font-semibold text-white">
            <p className={jobsLeftLabel ? "visible" : "invisible"}>
              {jobsLeftLabel || "-"}{" "}
            </p>
            <p>{jobsLeft}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LimitCard
