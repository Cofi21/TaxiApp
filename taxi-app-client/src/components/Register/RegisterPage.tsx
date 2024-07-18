import React from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    // Implement your register logic here
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <form onSubmit={handleRegister}>
          <h2>Register</h2>
          <div className="input-group">
            <label htmlFor="username">Korisničko ime</label>
            <input type="text" id="username" required />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Lozinka</label>
            <input type="password" id="password" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Potvrda lozinke</label>
            <input type="password" id="passwordConfirm" required />
          </div>
          <div className="input-group">
            <label htmlFor="fullName">Ime i prezime</label>
            <input type="text" id="fullName" required />
          </div>
          <div className="input-group">
            <label htmlFor="dob">Datum rođenja</label>
            <input type="date" id="dob" required />
          </div>
          <div className="input-group">
            <label htmlFor="address">Adresa</label>
            <input type="text" id="address" required />
          </div>
          <div className="input-group">
            <label htmlFor="userType">Tip korisnika</label>
            <select id="userType" required>
              <option value="Administrator">Administrator</option>
              <option value="Korisnik">Korisnik</option>
              <option value="Vozač">Vozač</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="profilePicture">Slika korisnika</label>
            <input type="file" id="profilePicture" accept="image/*" required />
          </div>
          <button type="submit">Register</button>
          <button type="button" onClick={handleLogin}>
            Već imate nalog? Prijavite se
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
