import React, { useEffect, useState } from "react";
import "./Verification.css";

const Verification: React.FC = () => {
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]); // Replace with actual type

  useEffect(() => {
    const fetchVerificationRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8152/api/Verification/requests",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch verification requests");
        }

        const data = await response.json();
        setVerificationRequests(data);
      } catch (error) {
        console.error("Failed to fetch verification requests", error);
      }
    };

    fetchVerificationRequests();
  }, []);

  const handleApproval = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8152/api/Verification/approve/${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setVerificationRequests((prev) =>
        prev.filter((user) => user.email !== email)
      );
    } catch (error) {
      console.error("Failed to approve user", error);
    }
  };

  const handleRejection = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8152/api/Verification/reject/${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setVerificationRequests((prev) =>
        prev.filter((user) => user.email !== email)
      );
    } catch (error) {
      console.error("Failed to reject user", error);
    }
  };

  return (
    <div className="verification-container">
      <h2 className="verification-title">Verification Requests</h2>
      <ul className="verification-list">
        {verificationRequests.map((request) => (
          <li key={request.email} className="verification-item">
            <span className="verification-name">
              {request.firstName} {request.lastName} ({request.email})
            </span>
            <div className="verification-buttons">
              <button onClick={() => handleApproval(request.email)}>
                Approve
              </button>
              <button onClick={() => handleRejection(request.email)}>
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Verification;
