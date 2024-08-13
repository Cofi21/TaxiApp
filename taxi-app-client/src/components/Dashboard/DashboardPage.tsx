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
enum DriverStatus {
  RequestCreated = 0,
  RequestApproved = 1,
  RequestRejected = 2,
  NoStatus = 3,
}

interface DashboardPageProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setIsLoggedIn }) => {
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
  const [driverStatus, setDriverStatus] = useState<DriverStatus>(
    DriverStatus.NoStatus
  );
  const [isMenuDisabled, setIsMenuDisabled] = useState(false);

  const menuClass = isMenuDisabled
    ? "disabled-menu dashboard-menu"
    : "dashboard-menu";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

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
        console.log("data " + data.userState);

        if (data.userType === UserRole.Driver) {
          setDriverStatus(data.userState);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
        setIsLoggedIn(false);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate, setIsLoggedIn]);

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
      setIsLoggedIn(false);
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
        return (
          <NewRide
            userUsername={userName}
            setIsMenuDisabled={setIsMenuDisabled}
          />
        );
      case "Previous Rides":
        return <PreviousRides />;
      case "Verification":
        return <Verification />;
      case "New Rides":
        return (
          <NewRides
            setIsMenuDisabled={setIsMenuDisabled}
          />
        );
      case "My Rides":
        return <MyRides />;
      case "All Rides":
        return <AllRides />;
      default:
        return <Profile />;
    }
  };
  const getStatusText = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.RequestCreated:
        return "Request Processing";
      case DriverStatus.RequestApproved:
        return "Request Approved";
      case DriverStatus.RequestRejected:
        return "Request Rejected";
      default:
        return "No Status";
    }
  };
  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.RequestCreated:
        return "orange";
      case DriverStatus.RequestApproved:
        return "green";
      case DriverStatus.RequestRejected:
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <ul className={menuClass}>
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
              <li>
                <div
                  className="driver-status"
                  style={{
                    background: getStatusColor(driverStatus),
                    color: "black",
                  }}
                >
                  {getStatusText(driverStatus)}
                </div>
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
