import { Spin } from "antd"

const SessionLoading = () => {

    return(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          role="alert"
          aria-live="polite">
          <div className="flex flex-col items-center gap-6 bg-[#333333] rounded-xl p-8 w-full max-w-sm shadow-lg ">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              </div>
              {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold animate-pulse">
                ⏳
              </div> */}
            </div>
            <p className="text-white font-bold text-xl text-center">
              Session Loading...
            </p>
            <div className="flex flex-col items-center gap-2">
              <label
                htmlFor="alert"
                className="bg-[#4B555F] text-white p-3 rounded-md text-sm text-center animate-fade transform transition-all duration-300 animate-pulse" >
                Connecting to Copilot Server
              </label>
            </div>
          </div>
        </div>
    )

}

export default SessionLoading;