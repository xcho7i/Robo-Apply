import * as React from "react";
import PropTypes from "prop-types";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function CircularProgressWithLabel(props) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer Circle - White Background */}
      <Box
        sx={{
          position: "absolute",
          width: props.size,
          height: props.size,
          borderRadius: "50%",
          backgroundColor: "white",
        
        }}
      ></Box>

     
      <CircularProgress
        variant="determinate"
        {...props}
        sx={{
          color: props.color,
          circle: {
            strokeWidth: props.thickness, // Adjust stroke thickness dynamically
          },
        }}
        size={props.size}
      />

      {/* Center Percentage */}
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h3"
          component="div"
          sx={{ fontWeight: "bold", color: "#3B4959" }}
        >
          {`${Math.round(props.value)}`}
        </Typography>
      </Box>
    </Box>
  );
}



export default CircularProgressWithLabel;

