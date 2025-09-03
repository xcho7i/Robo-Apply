import React from "react";
import { TextField } from "@mui/material";
import { styled } from "@mui/system";

// Custom Styled TextField
const CustomTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#2C2C2C", // Dark background color
    borderRadius: "6px",
    color: "#E0E0E0", // Light text color
    "& fieldset": {
      border: "1px solid #424242", // Border color
    },
    "&:hover fieldset": {
      borderColor: "#616161", // Border color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#9A3CF9", // Border color when focused
    },
  },
  "& .MuiInputLabel-root": {
    color: "#E0E0E0", // Label color
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#9A3CF9", // Label color when focused
  },
});

const InputField = ({ label, value, onChange }) => {
  return (
    <CustomTextField
      fullWidth
    //   label={label}
      variant="outlined"
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default InputField;
