import React, { useState, useEffect } from "react";
import "./EditProfile.css";

interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  userType: number;
  imageName: string;
}

const userTypeMap: { [key: number]: string } = {
  0: "Admin",
  1: "Driver",
  2: "User",
};

const EditProfile: React.FC<{ userData: UserData }> = ({ userData }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [userType, setUserType] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8152/api/User/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setEmail(data.email);
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setDob(data.dateOfBirth.split("T")[0]);
          setAddress(data.address);
          setUserType(userTypeMap[data.userType]);
          // setImagePreview(
          //    `http://localhost:8152/api/User/get-image/${data.imageName}`
          //  );
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    if (!userData) return;

    const formData = new FormData();
    formData.append("Id", userData.id);
    formData.append("Username", username);
    formData.append("Email", email);
    formData.append("Password", password);
    formData.append("ConfirmPassword", passwordConfirm);
    formData.append("FirstName", firstName);
    formData.append("LastName", lastName);
    formData.append("DateOfBirth", dob);
    formData.append("Address", address);
    formData.append(
      "UserType",
      String(
        Object.keys(userTypeMap).find(
          (key) => userTypeMap[Number(key)] === userType
        )
      )
    );
    if (imageFile) {
      formData.append("ImageFile", imageFile);
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:8152/api/User/edit-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed:", errorText);
        alert("Update failed");
        return;
      }

      alert("Profile updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Update error", error);
      alert("Update error");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  return (
    <div className="edit-profile-page">
      <div className="edit-profile-box">
        <h2>Edit Profile</h2>
        <div className="left-column">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="userType">User Type</label>
            <input type="text" id="userType" value={userType} readOnly />
          </div>
        </div>
        <div className="right-column">
          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <input
              type="file"
              id="imageFile"
              accept="iage/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className="input-group full-width">
          <button type="submit" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
