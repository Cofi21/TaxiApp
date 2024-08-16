import React, { useEffect, useState } from "react";
import "./AllRides.css";

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
  driverRating?: number; // Added this line for driver rating
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

const driverStatusMap: { [key: number]: string } = {
  0: "Created",
  1: "Verified",
  2: "Rejected",
  3: "Blocked",
};

// Function to fetch the average rating for a driver
const fetchDriverRating = async (driverId: string): Promise<number> => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${
        import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVER_RATING_API
      }/getAverageRating/${driverId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const rating = await response.json();
    return rating !== null ? rating : 0; // Return 0 if rating is null
  } catch (err) {
    console.error("Failed to fetch driver rating:", err);
    return 0; // Return 0 if an error occurs
  }
};

// Function to fetch all users
const fetchUsers = async (): Promise<{ [key: string]: number }> => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_BACKEND_URL_USER_API}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const users = await response.json();
    // Map user IDs to their states (numerical values)
    const userStates: { [key: string]: number } = {};
    users.forEach((user: any) => {
      userStates[user.id] = user.userState;
    });
    return userStates;
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return {};
  }
};

const AllRides: React.FC = () => {
  const [rides, setRides] = useState<Drive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [userStates, setUserStates] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL_DRIVE_API
          }/get-all-drives/`,
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

        // Fetch ratings for each driver
        const driverRatings = await Promise.all(
          data.map(async (ride) => {
            const rating = await fetchDriverRating(ride.driverId);
            return { driverId: ride.driverId, rating };
          })
        );

        const ratingsMap: { [key: string]: number } = {};
        driverRatings.forEach(({ driverId, rating }) => {
          ratingsMap[driverId] = rating;
        });
        setRatings(ratingsMap);

        // Fetch user states
        const states = await fetchUsers();
        setUserStates(states);
      } catch (err) {
        setError("Failed to fetch rides.");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const handleBlockUnblock = async (driverId: string) => {
    try {
      const token = localStorage.getItem("token");
      const currentState = userStates[driverId];
      const endpoint =
        currentState === 1 // Assuming 1 means "Verified"
          ? `${
              import.meta.env.VITE_REACT_APP_BACKEND_URL_VERIFICATION_API
            }/block-driver/${driverId}`
          : `${
              import.meta.env.VITE_REACT_APP_BACKEND_URL_VERIFICATION_API
            }/unblock-driver/${driverId}`;


      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok. " + response);
      }

      const updatedState = await response.json();
      alert(
        `Driver has been ${
          updatedState === 3 ? "blocked" : "unblocked" // Assuming 3 means "Blocked"
        }.`
      );

      // Update local state
      setUserStates((prevStates) => ({
        ...prevStates,
        [driverId]: updatedState,
      }));
    } catch (err) {
      alert("Failed to update driver state.");
    }
  };

  if (loading) {
    return <p className="loading-text">Loading...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="all-rides-container">
      <h2 className="all-rides-heading">All Rides</h2>
      {rides.length === 0 ? (
        <p className="no-rides-text">No rides found.</p>
      ) : (
        <table className="rides-table">
          <thead>
            <tr>
              <th>User Username</th>
              <th>Drive Status</th>
              <th>Driver Username</th>
              <th>Starting Address</th>
              <th>Ending Address</th>
              <th>Cost</th>
              <th>Created At</th>
              <th>Driver Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => (
              <tr key={ride.id}>
                <td>{ride.userUsername}</td>
                <td>{driveStatusMap[ride.driveStatus]}</td>
                <td>{ride.driverUsername}</td>
                <td>{ride.startingAddress}</td>
                <td>{ride.endingAddress}</td>
                <td>{ride.aproximatedCost} rsd</td>
                <td>{new Date(ride.createdAt).toLocaleString()}</td>
                <td>
                  {ratings[ride.driverId] !== undefined
                    ? ratings[ride.driverId].toFixed(1)
                    : "Loading..."}
                </td>
                <td>
                  <button onClick={() => handleBlockUnblock(ride.driverId)}>
                    {userStates[ride.driverId] === 3 ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllRides;
