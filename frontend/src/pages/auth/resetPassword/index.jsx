import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signUPImage from "../../../assets/auth/signUpImage.webp";
import Button from "../../../components/Button";
import { successToast, errorToast } from "../../../components/Toast";
import PasswordInput from "../../../components/PasswordInput";
import authService from "../../../api/auth";
import API_ENDPOINTS from "../../../api/endpoints";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // const handleResetPassword = async () => {
  //   console.log({ Password: password, "Confirm password": confirmPassword });

  //   if (!password || !confirmPassword) {
  //     errorToast("Please fill in both fields.");
  //     return;
  //   }

  //   const passwordRegex =
  //     /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*,.])[A-Za-z\d!@#$%^&*,.]{8,}$/;
  //   if (!passwordRegex.test(password)) {
  //     errorToast(
  //       "Password must be at least 8 characters long, containing at least one uppercase letter, one numeric digit, and one special character (e.g., @, #, $, %, &, *, .)."
  //     );
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     errorToast("Passwords do not match.");
  //     return;
  //   }

  //   const otp = localStorage.getItem("otp");
  //   if (!otp) {
  //     errorToast("OTP not found. Please request a new OTP.");
  //     return;
  //   }

  //   // Construct the API URL with OTP as a query parameter
  //   const apiUrl = `${API_ENDPOINTS.ResetNewPassword}?resetPasswordOtp=${otp}`;
  //   const requestBody = { password };

  //   console.log("API URL:", apiUrl);
  //   console.log("Request Body:", requestBody);

  //   try {
  //     const response = await authService.resetPassword(apiUrl, requestBody); // Call the API
  //     if (response.success) {
  //       successToast("Password reset successfully. Please sign in.");
  //       localStorage.removeItem("otp"); // Clear OTP after success
  //       navigate("/signIn");
  //     } else {
  //       errorToast(response.message || "Failed to reset password.");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     errorToast("Something went wrong. Please try again.");
  //   }
  // };

  const handleResetPassword = async () => {
    console.log({ Password: password, "Confirm password": confirmPassword });

    if (!password || !confirmPassword) {
      errorToast("Please fill in both fields.");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*,.])[A-Za-z\d!@#$%^&*,.]{8,}$/;
    if (!passwordRegex.test(password)) {
      errorToast(
        "Password must be at least 8 characters long, containing at least one uppercase letter, one numeric digit, and one special character (e.g., @, #, $, %, &, *, .)."
      );
      return;
    }

    if (password !== confirmPassword) {
      errorToast("Passwords do not match.");
      return;
    }

    const otp = localStorage.getItem("otp");
    if (!otp) {
      errorToast("OTP not found. Please request a new OTP.");
      return;
    }

    // Send OTP and password in the request body
    const requestBody = {
      resetPasswordOtp: otp,
      password: password,
    };

    console.log("Request Body:", requestBody);

    try {
      const response = await authService.resetPassword(requestBody);
      if (response.success) {
        successToast(
          response.msg || "Password reset successfully. Please sign in."
        );
        localStorage.removeItem("otp");
        navigate("/signIn");
      } else {
        errorToast(response.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error:", error);
      errorToast("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div className="flex justify-center items-center w-screen  h-screen md:h-fit lg:h-screen  md:p-10">
        <div className="block lg:flex  bg-almostBlack p-5  gap-14 rounded-2xl w-full h-full lg:max-w-[1050px] lg:max-h-[680px]">
          {/* Text Section */}
          <div className="w-full lg:w-1/2 flex items-center justify-center relative">
            <div className="w-full lg:max-w-sm">
              <div className="text-start">
                <p className="text-4xl lg:text-5xl pb-5 w-44 lg:w-96 text-primary font-semibold">
                  Reset Password
                </p>
              </div>
              <div className="w-full lg:w-1/2 lg:hidden justify-center items-center">
                <img
                  src={signUPImage}
                  alt="Sign In"
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 justify-center">
                <PasswordInput
                  placeholder="Password"
                  className="mt-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordInput
                  placeholder="Confirm Password"
                  className="mt-6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="mt-5 flex justify-center">
                <Button
                  onClick={handleResetPassword}
                  className="flex items-center justify-center font-semibold p-3 px-8 w-full min-w-max h-12 text-navbar bg-gradient-to-b from-gradientStart to-gradientEnd rounded-lg hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                >
                  Reset Password
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

export default ResetPassword;
