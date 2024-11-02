import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ setAuth }) => {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="company-name">ESSPI CALCULATOR</h1>
          <p className="slogan">Energy Storage System Priority Index</p>
        </div>
      </header>

      <section className="featured-section">
        <div className="featured-content">
          <h1>Welcome to ESSPI CALCULATOR</h1>
          <h3>
            Our tool analyzes each load by its ranking, power consumption, and recovery time, returning a prioritization index and computing a cost analysis. This provides you with a guideline for constructing a backup system efficiently.
          </h3>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to create your backup system?</h2>
          <h3>Sign up now to access our powerful tool!</h3>
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

      <section className="benefits-section">
        <div className="benefits-content">
          <h2>Benefits of ESSPI CALCULATOR</h2>
          <div className="benefits-list">
            <div className="benefit">
              <i className="fas fa-chart-line"></i>
              <h3>Efficient Prioritization Index</h3>
              <p>Our algorithm ensures optimal prioritization of energy needs.</p>
            </div>
            <div className="benefit">
              <i className="fas fa-calculator"></i>
              <h3>Cost Analysis</h3>
              <p>Accurate cost breakdown to help you make informed decisions.</p>
            </div>
            <div className="benefit">
              <i className="fas fa-cogs"></i>
              <h3>Customizable Backup System</h3>
              <p>Adjust parameters to tailor the backup system to your requirements.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
