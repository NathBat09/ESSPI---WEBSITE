// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          ESSPI CALCULATOR
        </Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/about" className="navbar-link about">About</Link>
          <Link to="/contact" className="navbar-link contact">Contact</Link>
          <Link to="/login" className="navbar-link">Login</Link>
          <Link to="/register" className="navbar-link">Register</Link>
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
