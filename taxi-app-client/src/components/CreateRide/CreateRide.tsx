import React, { useState, useEffect } from "react";
import axios from "axios";
import RideOfferDisplay from "../RideOffer/RideOfferDisplay";
import CountdownDisplay from "../CountdownDisplay/CountdownDisplay";
import DriverRating from "../DriverRating/DriverRating";
import "./CreateRide.css";

interface CreateRideProps {
  userUsername: string;
  setIsMenuDisabled: (value: boolean) => void;
}

interface RideOffer {
  id: string;
  userId: string;
  userUsername: string;
  driverId: string;
  driverUsername: string;
  aproximatedTime: number;
  aproximatedCost: number;
  createdAt: Date;
  startingAddress: string;
  endingAddress: string;
  isDeleted: string;
  driveStatus: number;
}

const CreateRide: React.FC<CreateRideProps> = ({
  userUsername,
  setIsMenuDisabled,
}) => {
  const [startingAddress, setStartingAddress] = useState("");
  const [endingAddress, setEndingAddress] = useState("");
  const [rideOffer, setRideOffer] = useState<RideOffer | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showDriverRating, setShowDriverRating] = useState(false); // Changed to false initially
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showRideOffer, setShowRideOffer] = useState<boolean>(false);

  useEffect(() => {
    const fetchRideOffer = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
          }/current-user-drive`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data: RideOffer = await response.json();
          if (data) setRideOffer(data);
        } else {
          setRideOffer(null);
        }
      } catch (error) {
        console.error("Failed to fetch current ride offer:", error);
      }
    };

    fetchRideOffer();
  }, []);

  const handleCreateRide = async () => {
    if (!startingAddress || !endingAddress) {
      setFormError("Both starting and ending addresses are required.");
      return;
    }

    setFormError(null);

    const createDriveDto = {
      startingAddress,
      endingAddress,
      userUsername,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in.");

      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
        }/create-drive`,
        createDriveDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        const rideOfferData: RideOffer = response.data;
        setRideOffer(rideOfferData);
        setShowRideOffer(true);
        localStorage.setItem("rideOffer", JSON.stringify(rideOfferData));
      }
    } catch (error) {
      console.error("Error creating ride:", error);
      setError("Failed to create ride");
    }
  };

  const handleOfferAccepted = async () => {
    if (rideOffer) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
          }/accept-drive/${rideOffer.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          setShowRideOffer(false);
          setShowCountdown(true);
        } else {
          console.error("Failed to accept offer");
        }
      } catch (error) {
        console.error("Error accepting offer:", error);
        setError("Failed to accept offer");
      }
    }
  };

  const handleOfferDeclined = async () => {
    if (rideOffer) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
          }/decline-drive/${rideOffer.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          setRideOffer(null);
          setShowRideOffer(false);
          localStorage.removeItem("rideOffer");
        } else {
          console.error("Failed to decline offer");
        }
      } catch (error) {
        console.error("Error declining offer:", error);
        setError("Failed to decline offer");
      }
    }
  };

  const handleDriveStart = async () => {
    if (rideOffer) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
          }/drive-arrived/${rideOffer.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error notifying drive start:", error);
      }
    }
  };

  const handleDriveEnd = async () => {
    if (rideOffer) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
          }/drive-completed/${rideOffer.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error notifying drive end:", error);
      }
    }
  };

  const handleCountdownComplete = async () => {
    setShowCountdown(false);
    setShowRideOffer(false);
    setShowDriverRating(true);
    //setRideOffer(null);
    //localStorage.removeItem("rideOffer");
  };

  useEffect(() => {
    if (rideOffer) {
      setShowCountdown(false); // Ensure countdown is not shown if a ride offer is present
      setShowRideOffer(true);
    }
  }, [rideOffer]);

  return (
    <div className="create-ride-container">
      {!rideOffer ? (
        <>
          {/* Form za kreiranje nove vožnje */}
          <h2>Create a New Ride</h2>
          <label>
            Starting Address:
            <input
              type="text"
              value={startingAddress}
              onChange={(e) => setStartingAddress(e.target.value)}
            />
          </label>
          <label>
            Ending Address:
            <input
              type="text"
              value={endingAddress}
              onChange={(e) => setEndingAddress(e.target.value)}
            />
          </label>
          <button onClick={handleCreateRide}>Create Ride</button>
          {formError && <p className="form-error">{formError}</p>}
          {error && <p className="api-error">{error}</p>}
        </>
      ) : showCountdown ? (
        <CountdownDisplay
          initialPhase={1}
          waitingDuration={rideOffer.aproximatedTime}
          progressDuration={10}
          onCountdownComplete={handleCountdownComplete}
          onDriveStart={handleDriveStart}
          onDriveEnd={handleDriveEnd}
          setIsMenuDisabled={setIsMenuDisabled}
        />
      ) : showRideOffer ? (
        <RideOfferDisplay
          rideOffer={rideOffer}
          onAccept={handleOfferAccepted}
          onDecline={handleOfferDeclined}
        />
      ) : (
        <DriverRating
          driveId={rideOffer.id}
          onClose={() => {
            setShowDriverRating(false);
            setRideOffer(null); // Clear the ride offer after rating
          }}
        />
      )}
    </div>
  );
};

export default CreateRide;
