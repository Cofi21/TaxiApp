import React, { useEffect, useState } from "react";
import "./PreviousRides.css"; // Make sure this path is correct

interface Drive {
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

const driveStatusMap: { [key: number]: string } = {
  0: "User Ordered Drive",
  1: "Driver Created Offer",
  2: "User Accepted Drive",
  3: "User Declined Drive",
  4: "Drive Active",
  5: "Drive Completed",
  6: "Invalid",
};

const PreviousRides: React.FC = () => {
  const [rides, setRides] = useState<Drive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
          }/user-drives/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }

        const data: Drive[] = await response.json();
        setRides(data);
      } catch (err) {
        setError("Failed to fetch rides.");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (loading) {
    return <p className="loading-text">Loading...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="previous-rides-container">
      <h2 className="previous-rides-heading">Previous Rides</h2>
      {rides.length === 0 ? (
        <p className="no-rides-text">No rides found.</p>
      ) : (
        <table className="rides-table">
          <thead>
            <tr>
              <th>Driver Username</th>
              <th>Drive Status</th>
              <th>Starting Address</th>
              <th>Ending Address</th>
              <th>Cost</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => (
              <tr key={ride.id}>
                <td>{ride.driverUsername}</td>
                <td>{driveStatusMap[ride.driveStatus]}</td>
                <td>{ride.startingAddress}</td>
                <td>{ride.endingAddress}</td>
                <td>{ride.aproximatedCost} rsd</td>
                <td>{new Date(ride.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PreviousRides;
