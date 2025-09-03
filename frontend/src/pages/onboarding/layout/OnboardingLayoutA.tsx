import React from "react"

interface OnboardingLayoutAProps {
  children: React.ReactNode
  currentStep?: number
}

// Array of avatar images with different background colors
const avatarImages = [
  {
    src: "/images/4fa2c921dc3256adf329f8880d4c3f232fb6e7eb.png",
    bgColor: "bg-blue-400"
  },
  {
    src: "/images/06b55b7821f5f67dc387840e0ef280be86c37382.png",
    bgColor: "bg-pink-400"
  },
  {
    src: "/images/c11172d3ad2bf0bd73eefb8f87c5dca41cd18f88.png",
    bgColor: "bg-green-400"
  },
  {
    src: "/images/e02dad193b14375a541b38979f28727a9d3cd223.png",
    bgColor: "bg-orange-400"
  },
  {
    src: "/images/e9c38f8efb09bf2bb63b8bf7ff9f6661679975f0.png",
    bgColor: "bg-red-400"
  }
]

export default function OnboardingLayoutA({
  children,
  currentStep
}: OnboardingLayoutAProps) {
  const isStepFour = currentStep === 4

  return (
    <div
      className={`relative min-h-screen overflow-hidden flex md:flex-row flex-col bg-brand-bgBlue md:p-1 p-0 ${
        isStepFour ? "overflow-y-auto step-four-scrollbar" : "overflow-hidden"
      }`}>
      {/* Left Section - Desktop */}
      <div className="md:flex hidden relative z-20 flex-col xl:w-[500px] lg:w-[400px] min-w-[260px] w-[350px] min-h-full xl:p-8 lg:p-6 p-3 border border-brand-yellow rounded-2xl overflow-hidden bg-brand-bgBlue">
        <div
          className="cursor-pointer"
          onClick={() => window.open("https://roboapply.co/", "_self")}>
          <img src="/images/logo.png" alt="RoboApply" width={160} height={40} />
        </div>
        <div className="flex flex-col translate-y-1/2 items-center justify-center">
          <div className="text-white mb-2 text-xl xl:text-2xl font-bold text-center ">
            <span className="text-brand-purple-dark">TRUSTED</span>

            <span className="">
              <span>
                {" "}
                BY <br />
              </span>
              OVER <span className="text-brand-yellow"> 10k+ </span>
              USERS
            </span>
          </div>
          {/* Testimonial Card */}
          <div className="bg-brand-purple rounded-2xl xl:p-6 p-4 flex flex-col items-center mt-8">
            <div className="flex -space-x-3 mb-3">
              {avatarImages.map((avatar, i) => (
                <div
                  key={i}
                  className={`border-2 border-white w-16 h-16 rounded-full overflow-hidden ${avatar.bgColor}`}>
                  <img
                    src={avatar.src}
                    alt={`User ${i + 1}`}
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
            <span className="text-white text-center text-sm lg:mt-4 mt-2">
              "I got recruiters from Amazon, Wise, and other companies reaching
              out to me already!"
            </span>
          </div>
        </div>
      </div>

      {/* Left Section - Mobile */}
      <div className="md:hidden p-1 relative z-20">
        <div className="md:hidden py-4 px-4 flex w-full flex-col items-center justify-center border border-brand-yellow rounded-2xl overflow-hidden bg-brand-bgBlue">
          <img src="/images/logo.png" alt="RoboApply" width={160} height={40} />
          <div className="flex flex-col items-center justify-center mt-2">
            <div className="mb-2 text-xl xl:text-2xl font-bold text-center lin">
              <span className="text-brand-purple-dark">TRUSTED</span>

              <span className="">
                <span>
                  {" "}
                  BY <br />
                </span>
                OVER <span className="text-brand-yellow"> 10k+ </span>
                USERS
              </span>
            </div>
          </div>
          <div className="bg-brand-purple rounded-2xl xl:p-6 p-4 flex flex-col items-center mt-4">
            <div className="flex -space-x-3 mb-3">
              {avatarImages.map((avatar, i) => (
                <div
                  key={i}
                  className={`border-2 border-white w-16 h-16 rounded-full overflow-hidden ${avatar.bgColor}`}>
                  <img
                    src={avatar.src}
                    alt={`User ${i + 1}`}
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
            <span className="text-white text-center text-sm lg:mt-4 mt-2">
              "I got recruiters from Amazon, Wise, and other companies reaching
              out to me already!"
            </span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-2 mb-16 md:mb-0">
        <div className="w-full max-w-3xl">{children}</div>
      </div>

      <img
        src="/images/bg-grad.png"
        alt=""
        className="absolute bottom-0 md:-right-32 w-full h-full z-10"
      />
    </div>
  )
}
