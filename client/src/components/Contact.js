// Contact.js
import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <h2 className="contact-title">Contact Us</h2>
      <div className="contact-info">
        <div className="contact-item">
          <strong>Email:</strong> <a href="mailto:eduardo.ortiz7@upr.edu" className="contact-link">eduardo.ortiz7@upr.edu</a>
        </div>
        <div className="contact-item">
          <strong>Phone:</strong> <span className="contact-info-highlight">+1 (xxx) xxx-xxxx</span>
        </div>
        <div className="contact-item">
          <strong>Address:</strong> University of Puerto Rico at Mayagüez. <br /> <span className="contact-info-highlight">259 Av. Alfonso Valdés Cobián, Mayagüez, 00680</span>
        </div>
      </div>
    </div>
  );
};

export default Contact;
