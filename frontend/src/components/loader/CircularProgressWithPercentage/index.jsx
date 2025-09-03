import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function CircularProgressWithPercentage() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === 99) {
          // Adjusted to stop at 99
          clearInterval(interval);
          return 99;
        }
        return prev + 1;
      });
    }, 100); // Increment progress every 100ms to reach 99% in 9.9 seconds

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        backgroundColor: "none",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        size={75} // Increased size
        thickness={4} // Slightly thicker
        sx={{ color: "rgba(166, 82, 250, 1)" }}
      />
      <Box sx={{ position: "absolute", fontSize: 18, fontWeight: "bold" }}>
        {progress}%
      </Box>
    </Box>
  );
}
