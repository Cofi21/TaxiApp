import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import axios from "axios";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [userType, setUserType] = useState("User");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("Username", username);
    formData.append("Email", email);
    formData.append("Password", password);
    formData.append("ConfirmPassword", passwordConfirm);
    formData.append("FirstName", firstName);
    formData.append("LastName", lastName);
    formData.append("DateOfBirth", dob);
    formData.append("Address", address);
    formData.append("UserType", userType);
    if (imageFile) {
      formData.append("ImageFile", imageFile);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL_AUTH_API}/register`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Registration failed:", errorText);
        alert("Registration failed");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error", error);
      alert("Registration error");
    }
  };
  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (response.credential) {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL_AUTH_API}/google-login`,
          { token: response.credential },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("google response data" + res);
        const { token, imagePath } = res.data;
        localStorage.setItem("token", token);

        // Optionally, save the image path to local storage or context
        localStorage.setItem("userImage", imagePath);
        console.log(`Token: ${token} ImagePath ${imagePath}`);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error during Google login:", error);
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <form onSubmit={handleRegister}>
          <h2>Register</h2>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="userType">User Type</label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <option value="User">User</option>
              <option value="Driver">Driver</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              required
            />
          </div>
          <button type="submit">Register</button>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error("Error with Google OAuth");
              }}
            />
          </GoogleOAuthProvider>
          <button type="button" onClick={() => navigate("/login")}>
            Already have an account? Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
