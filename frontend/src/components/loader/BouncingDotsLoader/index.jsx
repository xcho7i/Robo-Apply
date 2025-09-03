import * as React from "react"
import Box from "@mui/material/Box"

export default function BouncingDotsLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        backgroundColor: "none",
        gap: "8px"
      }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            animation: "bounce 1.4s infinite ease-in-out",
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}

      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            } 
            40% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </Box>
  )
}
