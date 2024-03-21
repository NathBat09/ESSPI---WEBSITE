// Home.js
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';


const Home = ({ setAuth }) => {
  return (
    <Fragment>
      <header className="home-header">
        <div className="header-content">
          <h1 className="company-name">ESSPI CALCULATOR</h1>
          <p className="slogan">Energy Storage System Priority Index</p>
        </div>
      </header>

      <section className="featured-section">
        <div className="featured-content">
          <h2>Welcome to ESSPI CALCULATOR</h2>
          <p>
            Our tool analyzes each load by its ranking, power consumption, and recovery time, returning a prioritization index and computing a cost analysis. This provides you with a guideline for constructing a backup system efficiently.
          </p>
          </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to create your backup system?</h2>
          <p>Sign up now to access our powerful tool!</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-button">
              Register
            </Link>
            <Link to="/login" className="cta-button">
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} ESSPI CALCULATOR. All rights reserved.</p>
          <div className="social-icons">
            <a href="#" className="social-icon">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </Fragment>
  );
};

export default Home;
