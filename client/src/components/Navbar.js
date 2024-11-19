import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";
import './Navbar.css';
import { toast } from 'react-toastify';

const Navbar = ({ showLogoutButton, setAuth }) => {
  const handleLogout = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await signOut(auth);
      setAuth(false);
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Error logging out");
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">ESSPI CALCULATOR</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/Research" className="navbar-link">Research</Link>
          <Link to="/contact" className="navbar-link">Contact</Link>
          <Link to="/projects" className="navbar-link">Dashboard</Link>
          {showLogoutButton && (
            <button className="navbar-link logout-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
