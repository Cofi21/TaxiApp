import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import Profile from "../Profile/Profile";
import NewRide from "../NewRide/NewRide";
import PreviousRides from "../PreviousRides/PreviousRides";
import Verification from "../Verification/Verification";
import NewRides from "../NewRides/NewRides";
import MyRides from "../MyRides/MyRides";
import AllRides from "../AllRides/AllRides";
import EditProfile from "../EditProfile/EditProfile";

enum UserRole {
  Admin = 0,
  Driver = 1,
  User = 2,
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>(UserRole.User);
  const [activeTab, setActiveTab] = useState<string>("Profile");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");
  const [showEditProfilePage, setShowEditProfilePage] =
    useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8152/api/User/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to fetch user data:", errorText);
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserName(`${data.firstName} ${data.lastName}`);
        setUserRole(data.userType);
        setUserData(data);

        const imageUrl = `http://localhost:8152/api/User/get-image/${data.imageName}`;
        setUserImage(imageUrl);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch("http://localhost:8152/api/Auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prevState) => !prevState);
  };

  const showEditProfile = () => {
    setShowEditProfilePage(true);
    setIsProfileDropdownOpen(false);
  };

  const handleMenuClick = (tab: string) => {
    if (tab === "Edit Profile") {
      setShowEditProfilePage(true);
    } else {
      setActiveTab(tab);
      setShowEditProfilePage(false);
    }
    setIsProfileDropdownOpen(false);
  };

  const renderContent = () => {
    if (showEditProfilePage) {
      return <EditProfile userData={userData} />;
    }

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
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="profile-info">
                <img
                  src={userImage}
                  alt="User"
                  className="profile-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "http://localhost:8152/api/User/get-image/default-profile.png";
                  }}
                />
                <button
                  className="profile-button"
                  onClick={toggleProfileDropdown}
                >
                  {userName}
                </button>
              </div>
              <div
                className={`dropdown-content ${
                  isProfileDropdownOpen ? "show" : ""
                }`}
              >
                <button onClick={handleLogout}>Logout</button>
                <button onClick={() => handleMenuClick("Edit Profile")}>
                  Edit Profile
                </button>
              </div>
            </div>
          </li>
          {userRole === UserRole.User && (
            <>
              <li>
                <button onClick={() => handleMenuClick("New Ride")}>
                  New Ride
                </button>
              </li>
              <li>
                <button onClick={() => handleMenuClick("Previous Rides")}>
                  Previous Rides
                </button>
              </li>
            </>
          )}
          {userRole === UserRole.Admin && (
            <>
              <li>
                <button onClick={() => handleMenuClick("Verification")}>
                  Verification
                </button>
              </li>
              <li>
                <button onClick={() => handleMenuClick("All Rides")}>
                  All Rides
                </button>
              </li>
            </>
          )}
          {userRole === UserRole.Driver && (
            <>
              <li>
                <button onClick={() => handleMenuClick("New Rides")}>
                  New Rides
                </button>
              </li>
              <li>
                <button onClick={() => handleMenuClick("My Rides")}>
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
