import React from "react";
import Slider from "react-slick";
import google from "../../../../assets/teamLogos/google.svg";
import microsoft from "../../../../assets/teamLogos/microsoft.svg";
import nordVPN from "../../../../assets/teamLogos/nordVPN.svg";
import rokt from "../../../../assets/teamLogos/rokt.svg";
import guardian from "../../../../assets/teamLogos/guardian.svg";
import trivago from "../../../../assets/teamLogos/trivago.svg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const logos = [google, microsoft, nordVPN, rokt, guardian, trivago];

const Teams = () => {
  const settings = {
    dots: false, // Show navigation dots
    infinite: true, // Infinite looping
    slidesToShow: 6, // Number of logos to show at a time
    slidesToScroll: 1, // Number of logos to scroll
    autoplay: true, // Enable autoplay
    speed: 2000, // Speed of transition
    autoplaySpeed: 2000, // Delay between slides
    cssEase: "linear", // Smooth transition
    pauseOnHover: false, // Pause on hover
    arrows: false, // Disable arrows
  };

  return (
    <div className="pt-24">
      <div className="flex justify-center">
        <p className="text-center text-2xl font-medium">
          Used by the best developers and teams around the world:
        </p>
      </div>
      <div className="pt-24 mx-[10%]">
        <Slider {...settings}>
          {logos.map((logo, index) => (
            <div key={index} className="flex justify-center">
              <img
                src={logo}
                alt={`Team logo ${index}`}
                className="h-12 w-auto pr-20"
                loading="lazy"
              />
            </div>
          ))}
        </Slider>
      </div>
      <div
        className="pt-10"
        style={{
          borderBottom: "1px solid",
          borderImageSource:
            "radial-gradient(48.6% 799.61% at 50% 50%, #4776E6 0%, rgba(142, 84, 233, 0) 100%)",
          borderImageSlice: 1,
        }}
      ></div>
    </div>
  );
};

export default Teams;
