import React from 'react';
import './About.css';
import { Link } from 'react-router-dom';


const About = () => {
  return (
    <div className="about-container">
      <h2 className="about-title">Powering Your Peace of Mind: About ESPPI Calculator</h2>
      <div className="about-content">
        <div className="about-details">
          <h3>Our Story</h3>
          <p>
            Our story began with the frustration of navigating the complex world of energy storage options. We saw a need for a user-friendly tool that empowers individuals and businesses to make informed decisions about backup power. That's how ESPPI, the Energy Storage System Priority Index, was born.
          </p>
          <h3>What We Offer</h3>
          <p>
            ESSPI Calculator is more than just a software platform. It's a comprehensive solution that guides you through every step of the process, from analyzing your energy needs to prioritizing the ideal storage system. With ESPPI, you gain valuable insights into:
          </p>
          <ul>
            <li>Load requirements: Understand your baseline and peak energy consumption.</li>
            <li>Power usage patterns: Identify critical loads and optimize backup strategy.</li>
            <li>Recovery time objectives: Determine the acceptable downtime for your needs.</li>
          </ul>
          <h3>Benefits of Using ESPPI Calculator</h3>
          <p>
            We believe in the power of knowledge. By equipping you with the right information, ESPPI Calculator empowers you to:
          </p>
          <ul>
            <li>Make cost-effective decisions: Choose the storage solution that best fits your budget and requirements.</li>
            <li>Design a future-proof system: Ensure your backup power can handle evolving needs.</li>
            <li>Gain peace of mind: Know that your critical systems are protected from unexpected outages.</li>
          </ul>
        </div>
      </div>
      <div className="cta-container">
        <Link to="/login" className="cta-button">Explore ESSPI Calculator</Link>
        <p>Join the ESPPI community and unlock the confidence of a reliable energy future.</p>
      </div>
    </div>
  );
};

export default About;
