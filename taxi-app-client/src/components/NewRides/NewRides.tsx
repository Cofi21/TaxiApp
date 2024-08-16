import React, { useState, useEffect } from "react";
import "./NewRides.css";
import CountdownDisplay from "../CountdownDisplay/CountdownDisplay";

interface RideRequest {
  id: string;
  userUsername: string; // Client Name
  startingAddress: string; // Pickup Location
  endingAddress: string; // Dropoff Location
  driveStatus: number; // Status
}

interface Driver {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  userType: number;
  imageName: string;
  userState: number;
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
interface NewRidesProps {
  setIsMenuDisabled: (value: boolean) => void;
}

const VERIFIED_USER_STATE = 1; // Update this value based on your actual verification status

const getStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return "User Ordered Drive";
    case 1:
      return "Driver Created Offer";
    case 2:
      return "User Accepted Drive";
    case 3:
      return "User Declined Drive";
    case 4:
      return "Drive Active";
    case 5:
      return "Drive Completed";
    case 6:
      return "Invalid";
    default:
      return "Unknown Status";
  }
};

const NewRides: React.FC<NewRidesProps> = ({ setIsMenuDisabled }) => {
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [driver, setDriver] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drivePhase, setDrivePhase] = useState(0);
  const [aproximatedTime, setAproximatedTime] = useState(0);
  const [doFetchDrive, setDoFetchDrive] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [driverId, setDriverId] = useState("");

  useEffect(() => {
    const fetchCurrentDriver = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL_USER_API}/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch current driver");
        }

        const driverData: Driver = await response.json();
        setDriver(`${driverData.firstName} ${driverData.lastName}`);
        setIsVerified(driverData.userState === VERIFIED_USER_STATE);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch current driver");
      }
    };

    const fetchRideRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
          }/new-driver-drives`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch ride requests");
        }

        const data: RideRequest[] = await response.json();
        setRideRequests(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch ride requests");
        setLoading(false);
      }
    };

    fetchCurrentDriver();
    fetchRideRequests();
  }, []);

  useEffect(() => {
    if (doFetchDrive) {
      const fetchDrive = async () => {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
            }/current-driver-drive`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              (await response.json()).message || "An error occurred"
            );
          }

          const data: RideOffer = await response.json();
          if (data.driveStatus === 2) {
            setDrivePhase(data.driveStatus);
            setShowCountdown(true);
            setDoFetchDrive(false);
            setAproximatedTime(data.aproximatedTime);
            setDriverId(data.driverId);
            return;
          }
        } catch (err: any) {}
      };

      // Fetch the drive status every 500ms
      const intervalId = setInterval(fetchDrive, 500);

      // Clean up the interval when the component is unmounted
      return () => clearInterval(intervalId);
    }
  }, []);

  const handleDriveEnd = async () => {
    setDoFetchDrive(true);
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      if (!isVerified) {
        throw new Error("Driver is not verified and cannot accept rides");
      }

      const token = localStorage.getItem("token");
      const driverUsername = driver;

      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
        }/create-offer/${rideId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            driverUsername: driverUsername, // Include DriverUsername in the request body
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to accept ride: ${errorText}`);
      }

      // Update the rideRequests state to reflect the change
      setRideRequests((prevRequests) =>
        prevRequests.filter((ride) => ride.id !== rideId)
      );
    } catch (error) {
      console.error(error);
    }
  };
  const handleCountdownComplete = async () => {
    setShowCountdown(false);
  };

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }
  return (
    <div className="new-rides-container">
      <h2>New Rides</h2>
      {showCountdown && (
        <CountdownDisplay
          initialPhase={1}
          waitingDuration={aproximatedTime}
          progressDuration={10}
          onCountdownComplete={handleCountdownComplete}
          onDriveStart={() => {}}
          onDriveEnd={handleDriveEnd}
          setIsMenuDisabled={setIsMenuDisabled}
        />
      )}
      {rideRequests.length === 0 ? (
        <p>No new ride requests available.</p>
      ) : (
        <ul>
          {rideRequests.map((ride) => (
            <li key={ride.id}>
              <p>Client: {ride.userUsername}</p>
              <p>Pickup Location: {ride.startingAddress}</p>
              <p>Dropoff Location: {ride.endingAddress}</p>
              <p>Status: {getStatusLabel(ride.driveStatus)}</p>
              <button
                onClick={() => handleAcceptRide(ride.id)}
                className={isVerified ? "button-active" : "button-disabled"}
                disabled={!isVerified}
              >
                {isVerified
                  ? "Create Offer"
                  : "Cannot Accept Rides (Unverified)"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewRides;
