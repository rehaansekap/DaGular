import React from 'react';
import linkedinIcon from '../assets/images/photo/linkedin.jpg';
import instagramIcon from '../assets/images/photo/instagram.jpg';
import gmailIcon from '../assets/images/photo/gmail.jpg';

import '../style/Contact.css';

function Contact() {
  return (
    <div className="contact">
      <h2>Contact</h2>
      <ul className="contact-list">
        <li>
          <img src={linkedinIcon} alt="LinkedIn" />
          <a href="https://www.linkedin.com/in/davina-nazwa-0465a6298">LinkedIn</a>
        </li>
        <li>
          <img src={instagramIcon} alt="Instagram" />
          <a href="https://www.instagram.com/davinanazwa_/">Instagram</a>
        </li>
        <li>
          <img src={gmailIcon} alt="Gmail" />
          <a href="mailto:davinanau@upi.edu">Email</a>
        </li>
      </ul>
    </div>
  );
}

export default Contact;
