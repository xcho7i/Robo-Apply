import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import cubeImage from "../../../assets/purple-composition2 1.png";
import maskBackground from "../../../assets/Mask group.png";

const TopBanner = () => {
  return (
    <div className="flex justify-center items-center p-20">
      <div
        className="flex justify-between  px-8 py-8 rounded-3xl w-[1200px] "
        style={{
          backgroundImage: `url(${maskBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Box className="flex flex-col mt-20 gap-4">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "black",
              padding: "8px",
              borderRadius: "20px",

              boxShadow:
                "0px 0px 12px rgba(255, 255, 255, 0.3), 0px 0px 4px rgba(128, 128, 128, 0.5)",
              width: "400px",
            }}
          >
            <Chip
              label="NEW"
              sx={{
                backgroundColor: "#6F3EBA",
                color: "black",
                fontSize: "0.75rem",
                fontWeight: "bold",
                height: "20px",
                marginRight: "8px",
              }}
            />

            <Typography
              variant="body2"
              sx={{
                color: "#6F3EBA",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
            >
              Latest Features integration just arrived
            </Typography>
          </Box>
          <div className="flex items-center gap-4">
            <p
              style={{
                background: "linear-gradient(90deg ,grey, white)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                fontSize: "3.5rem",
              }}
            >
              Our Best{" "}
            </p>
            <span
              style={{
                color: "#DEA226",
                fontWeight: "bold",
                fontSize: "3.5rem",
              }}
            >
              Features{" "}
            </span>
          </div>
          <p className="text-[#727076] text-normal mt-4 leading-relaxed w-full">
            Elevate your resume visibility effortlessly with AI, where smart
            technology meets user-friendly SEO tools.
          </p>
        </Box>
        {/* Decorative Cubes */}
        <img
          src={cubeImage}
          alt="Cubes"
          width="500px"
          height="570px"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default TopBanner;
