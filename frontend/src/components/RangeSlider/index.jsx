import React from "react";

const RangeSlider = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={onChange}
        className="w-full h-5 appearance-none cursor-pointer rounded-full"
        style={{
          background: `linear-gradient(to right, rgba(166, 82, 250, 1) ${value}%, rgba(212, 212, 212, 1) ${value}%)`, // Background gradient
        }}
      />
      <div className="flex justify-between text-white mt-2">
        <span></span>
        <span>20</span>
        <span>40</span>
        <span>60</span>
        <span>80</span>
        <span></span>
      </div>
      <style jsx>{`
        /* Customize the range thumb */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 30px; /* Increased width */
          height: 30px; /* Increased height */
          border-radius: 50%;
          background: white; /* Thumb color */
          cursor: pointer; /* Cursor style */
        }
        input[type="range"]::-moz-range-thumb {
          width: 30px; /* Increased width */
          height: 30px; /* Increased height */
          border-radius: 50%;
          background: white; /* Thumb color */
          cursor: pointer; /* Cursor style */
        }
        input[type="range"]::-ms-thumb {
          width: 30px; /* Increased width */
          height: 30px; /* Increased height */
          border-radius: 50%;
          background: white; /* Thumb color */
          cursor: pointer; /* Cursor style */
        }
      `}</style>
    </div>
  );
};

export default RangeSlider;
