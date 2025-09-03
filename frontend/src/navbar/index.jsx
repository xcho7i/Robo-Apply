import React, { useState } from "react";
import logo from "../assets/logo.svg";
import right_arrow from "../assets/arrow_right_alt.svg";
import { Link, useLocation } from "react-router-dom";
import { FaLongArrowAltRight } from "react-icons/fa";
import { MdArrowRightAlt } from "react-icons/md";

const Navbar = () => {
  const location = useLocation(); // Get the current location
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const scrollToPricing = (e) => {
    e.preventDefault(); // Prevent default link behavior
    const pricingSection = document.getElementById("pricing-section"); // Use the ID added to the section
    if (pricingSection) {
      window.scrollTo({
        top: pricingSection.offsetTop, // Scroll to the top of the pricing section
        behavior: "smooth", // Smooth scrolling
      });
    } else {
      console.error("Pricing section not found!");
    }
  };

  return (
    <>
      <div className="w-full m-0 max-w-[1800px] mx-auto ">
        <div className="">
          <div className=" mx-[5%]">
            <div className="flex items-center justify-between py-4">
              <div>
                <Link href="/">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-36 h-10"
                    loading="lazy"
                  />
                </Link>
              </div>

              <div
                className="hidden md:flex sm:items-center lg:gap-8 md:gap-5 justify-between"
                style={{
                  borderBottom: "1px solid",
                  borderImageSource:
                    "radial-gradient(48.6% 799.61% at 50% 50%, #4776E6 0%, rgba(142, 84, 233, 0) 100%)",
                  borderImageSlice: 1,
                }}
              >
                <Link
                  to="/"
                  className={`${
                    location.pathname === "/" ? "activeLink" : "inactiveLink"
                  } hover:text-purple-600 mr-4`}
                >
                  Home
                </Link>
                <Link
                  to="/features"
                  className={`${
                    location.pathname === "/features"
                      ? "activeLink"
                      : "inactiveLink"
                  } hover:text-purple-600 mr-4`}
                >
                  Features
                </Link>
                <Link
                  to="/how-to-use"
                  className={`${
                    location.pathname === "/how-to-use"
                      ? "activeLink"
                      : "inactiveLink"
                  } hover:text-purple-600 mr-4`}
                >
                  How To Use
                </Link>
                <Link
                  to="https://app.robo-apply.com/faq/"
                  className={`${
                    location.pathname === "https://app.robo-apply.com/faq/"
                      ? "activeLink"
                      : "inactiveLink"
                  } hover:text-purple-600`}
                >
                  FAQ
                </Link>
                {/* <a
                  href="#pricing"
                  onClick={scrollToPricing}
                  className={`${
                    location.pathname === "/pricing"
                      ? "activeLink"
                      : "inactiveLink"
                  } hover:text-purple-600`}
                >
                  Pricing
                </a> */}
                <Link
                  to="/pricing"
                  className={`${
                    location.pathname === "/pricing"
                      ? "activeLink"
                      : "inactiveLink"
                  } hover:text-purple-600`}
                >
                  Pricing
                </Link>
                {/* <a
                  href="#pricing"
                  onClick={scrollToPricing}
                  className="hover:text-purple-600"
                >
                 
                  Pricing
                </a> */}
                {/* <Link
                  to="/contactUs"
                  className={`${
                    location.pathname === "/contactUs"
                      ? "activeLink"
                      : "inactiveLink"
                  } hover:text-purple-600`}
                >
                  Contact Us
                </Link> */}
              </div>

              <div className="hidden md:flex md:items-center justify-end gap-4 px-2">
                <Link
                  to="/signUp"
                  className="px-8 flex items-center space-x-2 max-w-40 min-w-max h-12 text-center  justify-center bg-[#D19732] rounded-full text-black font-bold gap-2 hover:ring-2 hover:ring-white focus:ring-2"
                >
                  Get Started
                  <MdArrowRightAlt fontSize={25} />
                </Link>

                <Link
                  to="/signIn"
                  className="w-40 h-12 text-center items-center font-semibold justify-center flex text-xl bg-primaryBackground border border-purple rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                >
                  Log in
                </Link>
              </div>

              <div className="md:hidden cursor-pointer">
                <button
                  onClick={toggleMenu}
                  className="text-purple-600 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-purple-600"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12.9499909,17 C12.7183558,18.1411202 11.709479,19 10.5,19 C9.29052104,19 8.28164422,18.1411202 8.05000906,17 L3.5,17 C3.22385763,17 3,16.7761424 3,16.5 C3,16.2238576 3.22385763,16 3.5,16 L8.05000906,16 C8.28164422,14.8588798 9.29052104,14 10.5,14 C11.709479,14 12.7183558,14.8588798 12.9499909,16 L20.5,16 C20.7761424,16 21,16.2238576 21,16.5 C21,16.7761424 20.7761424,17 20.5,17 L12.9499909,17 Z M18.9499909,12 C18.7183558,13.1411202 17.709479,14 16.5,14 C15.290521,14 14.2816442,13.1411202 14.0500091,12 L3.5,12 C3.22385763,12 3,11.7761424 3,11.5 C3,11.2238576 3.22385763,11 3.5,11 L14.0500091,11 C14.2816442,9.85887984 15.290521,9 16.5,9 C17.709479,9 18.7183558,9.85887984 18.9499909,11 L20.5,11 C20.7761424,11 21,11.2238576 21,11.5 C21,11.7761424 20.7761424,12 20.5,12 L18.9499909,12 Z M9.94999094,7 C9.71835578,8.14112016 8.70947896,9 7.5,9 C6.29052104,9 5.28164422,8.14112016 5.05000906,7 L3.5,7 C3.22385763,7 3,6.77614237 3,6.5 C3,6.22385763 3.22385763,6 3.5,6 L5.05000906,6 C5.28164422,4.85887984 6.29052104,4 7.5,4 C8.70947896,4 9.71835578,4.85887984 9.94999094,6 L20.5,6 C20.7761424,6 21,6.22385763 21,6.5 C21,6.77614237 20.7761424,7 20.5,7 L9.94999094,7 Z M7.5,8 C8.32842712,8 9,7.32842712 9,6.5 C9,5.67157288 8.32842712,5 7.5,5 C6.67157288,5 6,5.67157288 6,6.5 C6,7.32842712 6.67157288,8 7.5,8 Z M16.5,13 C17.3284271,13 18,12.3284271 18,11.5 C18,10.6715729 17.3284271,10 16.5,10 C15.6715729,10 15,10.6715729 15,11.5 C15,12.3284271 15.6715729,13 16.5,13 Z M10.5,18 C11.3284271,18 12,17.3284271 12,16.5 C12,15.6715729 11.3284271,15 10.5,15 C9.67157288,15 9,15.6715729 9,16.5 C9,17.3284271 9.67157288,18 10.5,18 Z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div
              className={`${
                isOpen ? "block" : "hidden"
              } md:hidden bg-gradient-to-b from-gradientStart to-gradientEnd`}
              style={{
                background: "linear-gradient(180deg, #AF63FB 0%, #8C20F8 100%)",
              }}
            >
              <Link
                to="/"
                className={`${
                  location.pathname === "/" ? "activeLink" : "inactiveLink"
                } hover:text-purple-600 mr-4 py-2 px-4 block`}
              >
                Home
              </Link>

              <Link
                to="/jobs"
                className={`${
                  location.pathname === "/jobs" ? "activeLink" : "inactiveLink "
                } hover:text-purple-600 mr-4 py-2 px-4 block`}
              >
                Jobs
              </Link>
              <Link
                to="/profile"
                className={`${
                  location.pathname === "/profile"
                    ? "activeLink"
                    : "inactiveLink"
                } hover:text-purple-600 mr-4 py-2 px-4 block`}
              >
                Profile
              </Link>
              <Link
                to="/ai-tools"
                className={`${
                  location.pathname === "/ai-tools"
                    ? "activeLink"
                    : "inactiveLink"
                } hover:text-purple-600  mr-4 py-2 px-4 block`}
              >
                AI Tools
              </Link>

              <a
                href="#pricing"
                onClick={scrollToPricing}
                className="hover:text-purple-600  mr-4 py-2 px-4 block"
              >
                Pricing
              </a>
              {/* <Link
                to="/contactUs"
                className={`${
                  location.pathname === "/contactUs"
                    ? "activeLink"
                    : "inactiveLink"
                } hover:text-purple-600  mr-4 py-2 px-4 block`}
              >
                Contact Us
              </Link> */}

              <div className="flex justify-between py-2 px-4 border-t border-white">
                <Link
                  className=" px-7 flex items-center space-x-2 max-w-40 min-w-max h-12 text-center  justify-center border bg-gradient-to-b from-gradientStart to-gradientEnd rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                  to="/signUp"
                >
                  Sign up
                </Link>
                <Link
                  to="/signIn"
                  className=" px-8 flex items-center space-x-2 max-w-40 min-w-max  h-12 text-center  justify-center border bg-gradient-to-b from-gradientStart to-gradientEnd rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
