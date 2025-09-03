import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signUPImage from "../../../assets/auth/signUpImage.webp";
import InputField from "../../../components/EmailInput";
import Button from "../../../components/Button";
import { successToast, errorToast } from "../../../components/Toast";
import { FaChevronLeft } from "react-icons/fa";
import authService from "../../../api/auth";

// Function to validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};
``
const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      errorToast("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      errorToast("Invalid email format.");
      return;
    }

    try {
      const response = await authService.forgetPassword(email);
      console.log(response);

      if (response.success) {
        localStorage.setItem("userEmail", email); // Store email in localStorage
        setEmail(""); // Clear input field

        successToast("Check your email for password reset instructions.");
        navigate("/verifyOtp"); // Navigate to OTP verification page
      } else {
        errorToast(response.message || "Something went wrong.");
      }
    } catch (error) {
      // console.log("errror in forget", error)
      console.error("Error:", error);
      errorToast(error?.response?.data?.msg);
    }
  };

  const handleGoBack = () => {
    navigate("/signIn");
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen md:h-fit lg:h-screen md:p-10">
      <div className="block lg:flex bg-almostBlack p-5 gap-14 rounded-2xl w-full h-full lg:max-w-[1050px] lg:max-h-[680px]">
        {/* Text Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative">
          <div className="w-full lg:max-w-sm">
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="absolute top-0 left-0 mt-4 ml-4 text-primary hidden hover:text-gradientEnd lg:flex items-center"
            >
              <FaChevronLeft className="mr-2" />
            </button>

            <div className="flex items-center text-start">
              <p className="text-4xl lg:text-5xl text-primary font-semibold w-44 sm:w-96">
                Forget Password
              </p>
            </div>

            <div className="w-full justify-center items-center">
              <img
                src={signUPImage}
                alt="Sign In"
                className="lg:hidden w-full max-h-full mt-5 object-contain"
                loading="lazy"
              />
            </div>

            <form onSubmit={handleForgetPassword}>
              <div className="mt-6 flex justify-center">
                <InputField
                  type="email"
                  placeholder="Enter your email"
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mt-5 flex justify-center">
                <Button
                  type="submit"
                  className="flex items-center font-semibold justify-center p-3 px-8 w-full min-w-max h-12 text-navbar bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                >
                  Forget Password
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 hidden lg:flex justify-center items-center">
          <img
            src={signUPImage}
            alt="Sign In"
            className="max-w-full max-h-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
