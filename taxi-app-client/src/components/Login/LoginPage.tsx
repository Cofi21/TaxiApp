import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

interface LoginPageProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const LoginPage: React.FC<{ setIsLoggedIn: (isLoggedIn: boolean) => void }> = ({
  setIsLoggedIn,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8152/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      console.log(response);

      if (!response.ok) {
        setError("Login failed. Please check your credentials.");
        return;
      }

      const data = await response.json();
      console.log("Received token:", data.token);
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
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
          {error && <p className="error">{error}</p>}{" "}
          <button type="submit">Login</button>
          <button type="button" onClick={handleRegister}>
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
