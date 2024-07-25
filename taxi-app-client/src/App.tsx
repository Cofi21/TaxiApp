import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./components/Login/LoginPage";
import RegisterPage from "./components/Register/RegisterPage";
import DashboardPage from "./components/Dashboard/DashboardPage";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token")
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <DashboardPage setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <LoginPage setIsLoggedIn={setIsLoggedIn} />
          )
        }
      />
      <Route
        path="*"
        element={
          isLoggedIn ? (
            <DashboardPage setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <LoginPage setIsLoggedIn={setIsLoggedIn} />
          )
        }
      />
    </Routes>
  );
};

export default App;
