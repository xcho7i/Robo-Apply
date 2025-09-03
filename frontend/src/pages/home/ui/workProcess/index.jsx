import React from "react";

const WorkProcess = () => {
  return (
    <>
      <div className="mx-[10%] pt-20">
        <div className="justify-center text-center">
          <p className="text-primary text-4xl font-semibold">How it works</p>
        </div>
        <div className="lg:flex  w-full">
          <div className="w-full ">
            <div className="justify-start">
              <div className="relative mt-28 flex justify-start items-start">
                {/* Circle */}
                <div className="absolute -top-14 bg-purple w-28 h-28 rounded-full z-10 mx-20 lg:mx-24">
                  <p className="relative text-center mt-10 text-white text-xl font-semibold">
                    01
                  </p>
                </div>
                {/* Background Div */}
                <div className="relative w-80 h-48 mt-5 ">
                  <div className="absolute inset-0 bg-glass backdrop-blur-sm z-10 border border-transparent">
                    <div
                      className="flex items-center justify-center h-full text-white border rounded-2xl"
                      style={{
                        borderImageSource:
                          "linear-gradient(114.62deg, rgba(255, 255, 255, 0.6) -1.22%, rgba(255, 255, 255, 0) 51.35%, rgba(255, 255, 255, 0.6) 97.74%)",
                        borderImageSlice: 1,
                      }}
                    >
                      <div className="text-center w-52">
                        <p className="text-2xl font-semibold text-primary">
                          Upload
                        </p>
                        <p className="text-lg font-normal pt-5 text-lightGrey">
                          Upload your Resume or CV
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Blur Effect */}
                  <div className="absolute inset-0 bg-glass backdrop-blur-md z-0"></div>
                </div>
              </div>
            </div>
            <div className="justify-end">
              <div className="relative mt-28 flex justify-end items-end">
                {/* Circle */}
                <div className="absolute -top-14 bg-purple w-28 h-28 rounded-full z-10 mx-20 lg:mx-24">
                  <p className="relative text-center mt-10 text-white text-xl font-semibold">
                    02
                  </p>
                </div>
                {/* Background Div */}
                <div className="relative w-80 h-48 mt-5 ">
                  <div className="absolute inset-0 bg-glass backdrop-blur-sm z-10 border border-transparent">
                    <div
                      className="flex items-center justify-center h-full text-white border rounded-2xl"
                      style={{
                        borderImageSource:
                          "linear-gradient(114.62deg, rgba(255, 255, 255, 0.6) -1.22%, rgba(255, 255, 255, 0) 51.35%, rgba(255, 255, 255, 0.6) 97.74%)",
                        borderImageSlice: 1,
                      }}
                    >
                      <div className="text-center w-52">
                        <p className="text-2xl font-semibold text-primary">
                          Apply
                        </p>
                        <p className="text-lg font-normal pt-5 text-lightGrey">
                          Apply Quickly or manually to the job
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Blur Effect */}
                  <div className="absolute inset-0 bg-glass backdrop-blur-md z-0"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-full">
            <div className="justify-start">
              <div className="relative mt-28 flex justify-start items-start">
                {/* Circle */}
                <div className="absolute -top-14 bg-purple w-28 h-28 rounded-full z-10 mx-20 lg:mx-24">
                  <p className="relative text-center mt-10 text-white text-xl font-semibold">
                    03
                  </p>
                </div>
                {/* Background Div */}
                <div className="relative w-80 h-48 mt-5 ">
                  <div className="absolute inset-0 bg-glass backdrop-blur-sm z-10 border border-transparent">
                    <div
                      className="flex items-center justify-center h-full text-white border rounded-2xl"
                      style={{
                        borderImageSource:
                          "linear-gradient(114.62deg, rgba(255, 255, 255, 0.6) -1.22%, rgba(255, 255, 255, 0) 51.35%, rgba(255, 255, 255, 0.6) 97.74%)",
                        borderImageSlice: 1,
                      }}
                    >
                      <div className="text-center w-52">
                        <p className="text-2xl font-semibold text-primary">
                          Search
                        </p>
                        <p className="text-lg font-normal pt-5 text-lightGrey">
                          Click search to filter out relative Jobs
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Blur Effect */}
                  <div className="absolute inset-0 bg-glass backdrop-blur-md z-0"></div>
                </div>
              </div>
            </div>
            <div className="justify-end">
              <div className="relative mt-28 flex justify-end items-end">
                {/* Circle */}
                <div className="absolute -top-14 bg-purple w-28 h-28 rounded-full z-10 mx-20 lg:mx-24">
                  <p className="relative text-center mt-10 text-white text-xl font-semibold">
                    04
                  </p>
                </div>
                {/* Background Div */}
                <div className="relative w-80 h-48 mt-5 ">
                  <div className="absolute inset-0 bg-glass backdrop-blur-sm z-10 border border-transparent">
                    <div
                      className="flex items-center justify-center h-full text-white border rounded-2xl"
                      style={{
                        borderImageSource:
                          "linear-gradient(114.62deg, rgba(255, 255, 255, 0.6) -1.22%, rgba(255, 255, 255, 0) 51.35%, rgba(255, 255, 255, 0.6) 97.74%)",
                        borderImageSlice: 1,
                      }}
                    >
                      <div className="text-center w-52">
                        <p className="text-2xl font-semibold text-primary">
                          Hired
                        </p>
                        <p className="text-lg font-normal pt-5 text-lightGrey">
                          Get Hired into your dream company
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Blur Effect */}
                  <div className="absolute inset-0 bg-glass backdrop-blur-md z-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkProcess;
