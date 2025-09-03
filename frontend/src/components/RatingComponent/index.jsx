import React, { useEffect, useState } from "react";

const RatingComponent = ({ onRatingSelected, rating }) => {
  const [currentRating, setCurrentRating] = useState(0);

  useEffect(() => {
    setCurrentRating(rating); // Sync with the parent component's rating prop
  }, [rating]);

  const handleRating = (newRating) => {
    setCurrentRating(newRating); // Update visual rating
    onRatingSelected(newRating); // Call parent handler
  };

  return (
    <div className="flex space-x-2 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleRating(star)}
          className={star <= currentRating ? "text-primary" : ""}
          style={{ fontSize: "28px" }}
        >
          {star <= currentRating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

export default RatingComponent;
