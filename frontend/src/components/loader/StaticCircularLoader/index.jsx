import * as React from "react"
import CircularProgress from "@mui/material/CircularProgress"
import Box from "@mui/material/Box"

export default function StaticCircularLoader({ size = 24 }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        backgroundColor: "none"
      }}>
      <CircularProgress
        size={size}
        sx={{
          color: "rgba(166, 82, 250, 1)",
          // Remove any bounce or scale animations
          animation: "none !important",
          transform: "none !important"
        }}
      />
    </Box>
  )
}
