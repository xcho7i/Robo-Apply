import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import signUPImage from "../../../assets/auth/signUpImage.webp";
import Button from "../../../components/Button";
import { successToast, errorToast } from "../../../components/Toast";
import { FaChevronLeft } from "react-icons/fa";
import authService from "../../../api/auth";

const VerifyOtp = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.includes("")) {
      errorToast("Please enter all six digits of the OTP.");
      return;
    }

    try {
      const enteredOtp = otp.join(""); // Convert OTP array to a string
      const response = await authService.verifyOTP(enteredOtp); // Send the formatted OTP

      if (response.success) {
        setOtp(new Array(6).fill("")); // Clear OTP input fields

        successToast(
          "OTP verified successfully! Redirecting to reset password..."
        );
        localStorage.removeItem("userEmail");
        localStorage.setItem("otp", enteredOtp);
        navigate("/resetPassword"); // Redirect to reset password page
      } else {
        errorToast(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      errorToast("Failed to verify OTP. Try again.");
    }
  };

  const handleResendOtp = async () => {
    const storedEmail = localStorage.getItem("userEmail");

    if (!storedEmail) {
      errorToast("Email not found. Please try again.");
      return;
    }

    try {
      const response = await authService.forgetPassword(storedEmail); // Call API with stored email
      console.log(response);

      if (response.success) {
        successToast(`OTP sent to ${storedEmail}`);
        setOtp(new Array(6).fill("")); // Clear OTP input fields
      } else {
        errorToast(response.message || "Failed to resend OTP. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      errorToast("Something went wrong. Please try again.");
    }
  };

  const handleGoBack = () => {
    localStorage.removeItem("userEmail");
    navigate("/forgetPassword");
  };

  return (
    <>
      <div className="flex justify-center items-center w-screen  h-screen md:h-fit lg:h-screen  md:p-10">
        <div className="block lg:flex bg-almostBlack p-5  gap-14 rounded-2xl w-full h-full lg:max-w-[1050px] lg:max-h-[680px]">
          {" "}
          {/* Text Section */}
          <div className="w-full lg:w-1/2 flex items-center justify-center relative">
            <div className="w-full  lg:max-w-sm">
              {/* Back Button (positioned independently) */}
              <button
                onClick={handleGoBack}
                className="absolute top-0 left-0 mt-4 ml-4 text-primary hover:text-gradientEnd items-center hidden lg:block"
              >
                <FaChevronLeft className="mr-2" />
              </button>

              <div className="text-left mt-10">
                {" "}
                {/* Added some margin-top */}
                <p className="text-primary font-semibold pb-5 text-5xl">
                  OTP Verification
                </p>
                <div className="w-full lg:w-1/2 lg:hidden justify-center items-center">
                  <img
                    src={signUPImage}
                    alt="Sign In"
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="text-primary text-2xl font-medium py-5">
                  Please check your email
                </p>
                <p className="text-primary text-xl font-normal whitespace-nowrap">
                  We’ve sent a code to {email || "your email address"}
                </p>
              </div>

              <div className="mt-6 flex justify-between lg:justify-center space-x-2">
                {/* Six OTP input boxes */}
                {otp.map((_, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className=" w-14 h-14 text-2xl text-center bg-almostBlack text-primary border-customGray rounded-lg focus:outline-none focus:border-gradientEnd"
                  />
                ))}
              </div>

              <div className="mt-6 flex">
                <p>Didn’t get the code? </p>
                <button
                  onClick={handleResendOtp}
                  className="ml-2 text-gradientEnd font-medium underline hover:font-semibold focus:outline-none"
                >
                  click to resend
                </button>
              </div>

              <div className="mt-5 flex justify-center">
                <Button
                  onClick={handleVerifyOtp}
                  className="flex items-center justify-center font-semibold p-3 px-8 w-full min-w-max h-12 text-navbar bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                >
                  Verify & Proceed
                </Button>
              </div>
            </div>
          </div>
          {/* Image Section, hidden on small screens */}
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
    </>
  );
};

export default VerifyOtp;
