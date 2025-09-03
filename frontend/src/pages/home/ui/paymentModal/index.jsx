import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import CrossIcon from "../../../../assets/PaymentModalCross.svg";
import StripeIcon from "../../../../assets/stripe.svg";
import InputField from "../../../../components/EmailInput";
import ApplyIcon from "../../../../assets/discount_apply.svg";
// import BackgroundImage from "../../../../assets/pricingBcakground.svg";
// import overallBackground from "../../../../assets/dashboardIcons/overallBackground.svg";
import logo from "../../../../assets/logo.svg";
import CardImg from "../../../../assets/cardIcon.svg";

const ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#EAEAEA",
      fontSize: "16px",
      "::placeholder": { color: "white" },
      fontFamily: "Roboto, sans-serif",
      fontWeight: 400,
    },
    invalid: { color: "#FF5252" },
  },
};

const StyledCardElement = ({
  element: Element,
  placeholder,
  options,
  onChange,
  ...props
}) => (
  <div
    className={`max-h-[60px] border border-customGray text-primary bg-inputBackGround rounded-lg p-3 w-full focus-within:border-customPurple focus-within:outline-none`}
  >
    <Element
      options={{ ...options, placeholder }}
      onChange={onChange}
      {...props}
    />
  </div>
);

const PaymentModal = ({ isOpen, onClose, data, type }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [discountCode, setDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCardComplete, setIsCardComplete] = useState({
    cardNumber: false,
    expiry: false,
    cvc: false,
  });

  if (!isOpen) return null;

  // Determine initial price based on type
  const initialPrice =
    type === "enterprise"
      ? parseFloat(data?.monthlyPrice?.replace("$", "")) || 0
      : parseFloat(data?.price?.replace("$", "")) || 0;

  // Calculate totals
  const subtotal = initialPrice * quantity;
  const vat = subtotal * 0.1; // Example VAT rate of 10%
  // const total = subtotal + vat - discountValue;
  const total = subtotal;

  const handleDiscountApply = (event) => {
    event.preventDefault();
    if (discountCode === "DISCOUNT10") {
      setDiscountValue(10); // $10 discount
    } else if (discountCode === "DISCOUNT50") {
      setDiscountValue(50); // $50 discount
    } else {
      setDiscountValue(0);
      alert("Invalid discount code");
    }
  };

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(prev + increment, 1));
  };

  const handleCardElementChange = (event, field) => {
    setIsCardComplete((prev) => ({ ...prev, [field]: event.complete }));
  };

  const handleClose = () => {
    setQuantity(1); // Reset quantity to 1
    onClose(); // Then close the modal
  };

  const handlePayNow = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const cardNumberElement = elements.getElement(CardNumberElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberElement,
    });

    if (error) {
      console.error("Payment validation error:", error);
    } else {
      console.log("Payment Method Created:", paymentMethod);
    }
  };

  const isPayNowDisabled = !(
    isCardComplete.cardNumber &&
    isCardComplete.expiry &&
    isCardComplete.cvc
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cover bg-center bg-fixed backdrop-blur-lg">
      <div className="w-[90%] max-w-5xl bg-[#181820] rounded-lg p-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-purple-400">
            <span className="text-[#A551FA]">Your details</span> &gt; Payment
          </h2>
          <p className="hidden md:block text-xl font-medium text-lightGrey">
            Order Summary
          </p>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition"
          >
            <img
              src={CrossIcon}
              alt="Close"
              className="h-auto w-5"
              loading="lazy"
            />
          </button>
        </div>

        {/* Payment Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Section */}
          <div>
            <div className="mb-6">
              <button className="w-full bg-black border border-gray-600 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-[#f8f5fa] transition">
                <img
                  src={StripeIcon}
                  alt="Stripe"
                  className="h-auto w-20"
                  loading="lazy"
                />
              </button>
            </div>
            <p className="text-center text-gray-400 mb-6">Or pay by card</p>

            <div className="space-y-4">
              {/* Cardholder Name Input */}
              <InputField type="text" placeholder="Cardholder Name" />

              <div className="relative">
                <StyledCardElement
                  element={CardNumberElement}
                  options={ELEMENT_OPTIONS}
                  placeholder="Card Number"
                  onChange={(e) => handleCardElementChange(e, "cardNumber")}
                />
                <img
                  src={CardImg} // Replace with actual icon
                  alt="Card Icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <StyledCardElement
                    element={CardExpiryElement}
                    options={ELEMENT_OPTIONS}
                    placeholder="Expiration Date"
                    onChange={(e) => handleCardElementChange(e, "expiry")}
                  />
                  <img
                    src={CardImg} // Replace with actual icon
                    alt="Calendar Icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  />
                </div>
                {/* Security Code with Icon */}
                <div className="relative">
                  <StyledCardElement
                    element={CardCvcElement}
                    options={ELEMENT_OPTIONS}
                    placeholder="Security Code"
                    onChange={(e) => handleCardElementChange(e, "cvc")}
                  />
                  <img
                    src={CardImg} // Replace with actual icon
                    alt="Lock Icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={isPayNowDisabled}
              className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                isPayNowDisabled
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[#8C20F8] hover:bg-gradient-to-b hover:from-[#AF63FB] hover:to-[#8C20F8]"
              }`}
            >
              Pay Now
            </button>
          </div>

          {/* Right Section */}
          <div className=" items-center px-5 my-auto">
            <h3 className="text-3xl font-semibold text-purple-500">
              <span className="text-[#A551FA]">
                ${(initialPrice * quantity).toFixed(2)}
              </span>
            </h3>
            <img src={logo} className="py-7" />

            {/* <p className="text-gray-300  mb-4">
              {data?.title || "Plan Details"}
            </p> */}

            <div className="flex items-center gap-8 mb-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 bg-black border border-gray-600 text-white rounded-lg flex items-center justify-center hover:border-[#8C20F8]"
              >
                -
              </button>
              <span className="text-lg">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 bg-black border border-gray-600 text-white rounded-lg flex items-center justify-center hover:border-[#8C20F8]"
              >
                +
              </button>
            </div>
            <hr className="my-2 border-gray-600" />
            <div className="space-y-2 text-gray-400">
              <div className="flex justify-between">
                <span className="text-lg">Subtotal</span>
                <span className="text-[#A551FA]">${subtotal.toFixed(2)}</span>
              </div>

              {/* <div className="flex justify-between">
                <span className="text-lg">VAT</span>
                <span className="text-[#A551FA]">${vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg">Add Discount</span>
                <div className="flex items-center gap-2">
                  <InputField
                    type="text"
                    placeholder="Discount Code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <button
                    onClick={handleDiscountApply}
                    className="h-[50px] px-4 py-2 bg-[#8C20F8] text-white rounded-full font-semibold hover:bg-gradient-to-b hover:from-[#AF63FB] hover:to-[#8C20F8]"
                  >
                    <img
                      src={ApplyIcon}
                      alt="apply"
                      className="h-auto w-5"
                      loading="lazy"
                    />
                  </button>
                </div>
              </div> */}
              <hr className="my-2 border-gray-600" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-xl">Due Today</span>
                <span className="text-[#A551FA]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
