// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { toast } from 'react-toastify';


const Navbar = ({ showLogoutButton, setAuth }) => {
  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("Token");
    setAuth(false);
    toast.success("Logged out successfully");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          ESSPI CALCULATOR
        </Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/about" className="navbar-link about">About</Link>
          <Link to="/Research" className="navbar-link research">Research</Link>
          <Link to="/contact" className="navbar-link contact">Contact</Link>
          <Link to="/login" className="navbar-link">Login</Link>
          <Link to="/register" className="navbar-link">Register</Link>
          <Link to="/projects" className="navbar-link">Dashboard</Link>
          {showLogoutButton && <button className="navbar-link logout-button" onClick={logout}>Logout</button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
