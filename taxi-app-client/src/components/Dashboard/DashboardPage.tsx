import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import Profile from "../Profile/Profile";
import NewRide from "../NewRide/NewRide";
import PreviousRides from "../PreviousRides/PreviousRides";
import Verification from "../Verification/Verification";
import NewRides from "../NewRides/NewRides";
import MyRides from "../MyRides/MyRides";
import AllRides from "../AllRides/AllRides";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"Admin" | "Korisnik" | "Vozač">(
    "Korisnik"
  );
  const [activeTab, setActiveTab] = useState<string>("Profile");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState<boolean>(false);

  const handleLogout = () => {
    navigate("/login");
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prevState) => !prevState);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return <Profile />;
      case "New Ride":
        return <NewRide />;
      case "Previous Rides":
        return <PreviousRides />;
      case "Verification":
        return <Verification />;
      case "New Rides":
        return <NewRides />;
      case "My Rides":
        return <MyRides />;
      case "All Rides":
        return <AllRides />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <ul className="dashboard-menu">
          <li>
            <div className="profile-dropdown">
              <button
                className={activeTab === "Profile" ? "active" : ""}
                onClick={toggleProfileDropdown}
              >
                Profile
              </button>
              <div
                className={`dropdown-content ${
                  isProfileDropdownOpen ? "show" : ""
                }`}
              >
                <button onClick={handleLogout}>Logout</button>
                <button onClick={() => setActiveTab("Profile")}>
                  Edit Profile
                </button>
              </div>
            </div>
          </li>
          {userRole === "Korisnik" && (
            <>
              <li>
                <button
                  className={activeTab === "New Ride" ? "active" : ""}
                  onClick={() => setActiveTab("New Ride")}
                >
                  New Ride
                </button>
              </li>
              <li>
                <button
                  className={activeTab === "Previous Rides" ? "active" : ""}
                  onClick={() => setActiveTab("Previous Rides")}
                >
                  Previous Rides
                </button>
              </li>
            </>
          )}
          {userRole === "Admin" && (
            <>
              <li>
                <button
                  className={activeTab === "Verification" ? "active" : ""}
                  onClick={() => setActiveTab("Verification")}
                >
                  Verification
                </button>
              </li>
              <li>
                <button
                  className={activeTab === "All Rides" ? "active" : ""}
                  onClick={() => setActiveTab("All Rides")}
                >
                  All Rides
                </button>
              </li>
            </>
          )}
          {userRole === "Vozač" && (
            <>
              <li>
                <button
                  className={activeTab === "New Rides" ? "active" : ""}
                  onClick={() => setActiveTab("New Rides")}
                >
                  New Rides
                </button>
              </li>
              <li>
                <button
                  className={activeTab === "My Rides" ? "active" : ""}
                  onClick={() => setActiveTab("My Rides")}
                >
                  My Rides
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
};

export default DashboardPage;
