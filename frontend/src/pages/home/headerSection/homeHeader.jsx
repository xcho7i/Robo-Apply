import React from "react";
import Button from "../../../components/Button";
import play from "../../../assets/playButton.svg";
import VideoShow from "../ui/videoLink";
import Teams from "../ui/team";

const HomeHeader = () => {
  return (
    <>
      <div className=" pt-10">
        <div className="w-full  bg-center ">
          <div className="text-center justify-center pt-14">
            <p className="text-large font-normal text-lightGrey">
              Fast. Safe. Simple.
            </p>
            <p className="text-large text-primary font-bold">
              A New Era Calls for A New Code Tools
            </p>
            <div className="pt-5 flex items-center justify-center">
              <p className="font-normal text-base text-lightGrey w-[45%] ">
                Take control of HTML, CSS, and JavaScript in a visual canvas.
                Reworks generates clean, semantic code that’s ready to publish
                or hand to developers.
              </p>
            </div>
            <div className="flex items-center justify-center gap-10 pt-10">
              <Button className="p-3 px-8 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-gradient-to-b from-gradientStart to-gradientEnd rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                Search Jobs
              </Button>

              <Button
                className="p-3 px-5 h-12 flex items-center justify-center text-navbar bg-transparent border hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                style={{
                  border: "1px solid transparent",
                  borderImageSource:
                    "radial-gradient(55.88% 799.61% at 50% 50%, #4776E6 0%, rgba(142, 84, 233, 0) 100%)",
                  borderImageSlice: 1,
                }}
              >
                <img
                  src={play}
                  alt="Play Logo"
                  className="w-6 h-6 mr-2"
                  loading="lazy"
                />
                Watch Tutorial
              </Button>
            </div>
          </div>
          <VideoShow />
        </div>
      </div>
    </>
  );
};

export default HomeHeader;
