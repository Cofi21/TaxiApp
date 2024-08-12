import React, { useState, useEffect } from "react";
import axios from "axios";
import RideOfferDisplay from "../RideOffer/RideOfferDisplay";
import CountdownDisplay from "../CountdownDisplay/CountdownDisplay";
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
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRideOffer = async () => {
      try {
        const response = await fetch(
          "http://localhost:9035/api/Drive/current-user-drive",
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

    setFormError(null); // Clear previous form errors

    const createDriveDto = {
      startingAddress,
      endingAddress,
      userUsername,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in.");

      const response = await axios.post(
        "http://localhost:9035/api/Drive/create-drive",
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
          `http://localhost:9035/api/Drive/accept-drive/${rideOffer.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
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
          `http://localhost:9035/api/Drive/decline-drive/${rideOffer.id}`,
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
          `http://localhost:9035/api/Drive/drive-arrived/${rideOffer.id}`,
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
          `http://localhost:9035/api/Drive/drive-completed/${rideOffer.id}`,
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
    setRideOffer(null);
    localStorage.removeItem("rideOffer");
  };

  useEffect(() => {
    if (rideOffer) {
      setShowCountdown(false); // Ensure countdown is not shown if a ride offer is present
    }
  }, [rideOffer]);

  return (
    <div className="create-ride-container">
      {!rideOffer ? (
        <>
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
      ) : (
        <RideOfferDisplay
          rideOffer={rideOffer}
          onAccept={handleOfferAccepted}
          onDecline={handleOfferDeclined}
        />
      )}
    </div>
  );
};

export default CreateRide;
