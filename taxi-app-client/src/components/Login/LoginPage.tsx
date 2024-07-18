import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // Implement your login logic here
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
            <input type="email" id="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required />
          </div>
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
