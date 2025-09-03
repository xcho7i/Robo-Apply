import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

const FeaturesCard = ({ title, subtitle, description, features, buttonText, onButtonClick }) => {
  return (
    <Box
      sx={{
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        color: "white",
      
      
      }}
    >
      {/* Title */}
      {subtitle && (
        <Typography
          variant="subtitle1"
          sx={{
            color: "#A0A0A0",
            textTransform: "uppercase",
            fontSize: "12px",
            letterSpacing: "1px",
            marginBottom: "8px",
          }}
        >
          {subtitle}
        </Typography>
      )}
      {title && (
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            marginBottom: "16px",
          }}
        >
          {title}
        </Typography>
      )}

      {/* Description */}
      {description && (
        <Typography
          sx={{
            color: "#B3B1B6",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          {description}
        </Typography>
      )}

      {/* Features List */}
      {features && (
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={6} key={index}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IoCheckmarkDoneSharp style={{ color: "#B3B1B6" }} />
                <Typography sx={{ fontSize: "14px", color: "#B3B1B6" }}>
                  {feature}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Button */}
      {buttonText && (
        <div
          className=" font-semibold cursor-pointer mt-5 p-3 px-8 flex items-center space-x-2 max-w-40 min-w-max h-12 text-navbar bg-[#DEA226] rounded-full text-black hover:bg-[#dec226]"
          onClick={onButtonClick}
        >
          {buttonText}
        </div>
      )}
    </Box>
  );
};

export default FeaturesCard;
