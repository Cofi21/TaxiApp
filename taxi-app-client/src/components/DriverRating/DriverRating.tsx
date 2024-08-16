import React, { useState } from "react";
import axios from "axios";
import "./DriverRating.css";

interface DriverRatingProps {
  driveId: string; // The ID of the drive that just completed
  onClose: () => void; // Function to hide the rating component
}

const DriverRating: React.FC<DriverRatingProps> = ({ driveId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = async () => {
    if (rating > 0) {
      try {
        const token = localStorage.getItem("token"); // Assume JWT is stored in local storage

        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVER_RATING_API
          }/createDriverRating`,
          {
            DriveId: driveId,
            Rating: rating,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        onClose(); // Close the rating component after successful submission
      } catch (error) {
        console.error("Error creating rating:", error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  return (
    <div className="driver-rating-overlay">
      <div className="driver-rating">
        <h3>Rate Your Driver</h3>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${
                star <= (hoverRating || rating) ? "filled" : ""
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              &#9733;
            </span>
          ))}
        </div>
        <button
          className="btnSubmit"
          onClick={handleRating}
          disabled={rating === 0}
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
};

export default DriverRating;
